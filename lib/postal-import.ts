import pg from 'pg';

const {Client}=pg;
const MAX_CSV_BYTES=35*1024*1024;
const BATCH_SIZE=500;

export type PostalImportResult={acceptedRows:number;officeRows:number;uniquePins:number;sourceFile:string;sourceDataset:string};

type ImportOptions={
  bytes:Uint8Array;
  sourceFile:string;
  sourceDataset?:string;
  sourceUpdatedAt?:string|null;
};

function parseCsvLine(line:string):string[]{
  const out:string[]=[];let current='';let quoted=false;
  for(let i=0;i<line.length;i++){
    const ch=line[i];
    if(ch==='"'){
      if(quoted&&line[i+1]==='"'){current+='"';i++}else quoted=!quoted;
    }else if(ch===','&&!quoted){out.push(current);current=''}else current+=ch;
  }
  out.push(current);
  return out.map(v=>v.trim());
}

const normalize=(v:string)=>v.toLowerCase().replace(/[^a-z0-9]/g,'');
const numberOrNull=(v:string)=>{const n=Number.parseFloat(v);return Number.isFinite(n)?n:null};

export async function importPostalCsvToDatabase(options:ImportOptions):Promise<PostalImportResult>{
  const connectionString=process.env.DATABASE_URL;
  if(!connectionString)throw new Error('DATABASE_URL is required');
  if(options.bytes.byteLength===0)throw new Error('CSV file is empty');
  if(options.bytes.byteLength>MAX_CSV_BYTES)throw new Error(`CSV exceeds ${Math.floor(MAX_CSV_BYTES/1024/1024)} MB limit`);

  const text=new TextDecoder('utf-8',{fatal:true}).decode(options.bytes).replace(/^\uFEFF/,'');
  const lines=text.split(/\r?\n/);
  const sourceDataset=options.sourceDataset||'Department of Posts / data.gov.in';
  const sourceUpdatedAt=options.sourceUpdatedAt||null;
  const ssl=process.env.DATABASE_SSL==='true'?{rejectUnauthorized:process.env.DATABASE_SSL_REJECT_UNAUTHORIZED!=='false'}:undefined;
  const client=new Client({connectionString,ssl});
  await client.connect();

  try{
    await client.query(`CREATE TEMP TABLE postal_stage (
      pincode CHAR(6) NOT NULL,
      circle_name TEXT,
      region_name TEXT,
      division_name TEXT,
      office_name TEXT NOT NULL,
      office_type TEXT,
      delivery_status TEXT,
      district TEXT NOT NULL,
      state TEXT NOT NULL,
      latitude DOUBLE PRECISION,
      longitude DOUBLE PRECISION,
      source_dataset TEXT,
      source_updated_at TIMESTAMPTZ
    ) ON COMMIT PRESERVE ROWS`);

    let headers:string[]|null=null;
    let indexes:Record<string,number>|null=null;
    let batch:Array<Array<string|number|null>>=[];
    let acceptedRows=0;

    const flush=async()=>{
      if(!batch.length)return;
      const fields=13;
      const values:Array<string|number|null>=[];
      const placeholders=batch.map((row,rowIndex)=>{
        values.push(...row);
        return `(${Array.from({length:fields},(_,i)=>`$${rowIndex*fields+i+1}`).join(',')})`;
      }).join(',');
      await client.query(`INSERT INTO postal_stage
        (pincode,circle_name,region_name,division_name,office_name,office_type,delivery_status,district,state,latitude,longitude,source_dataset,source_updated_at)
        VALUES ${placeholders}`,values);
      batch=[];
    };

    for(const rawLine of lines){
      const line=rawLine.replace(/^\uFEFF/,'');
      if(!line.trim())continue;
      if(!headers){
        headers=parseCsvLine(line).map(normalize);
        const find=(...names:string[])=>headers!.findIndex(h=>names.map(normalize).includes(h));
        indexes={
          pin:find('pincode','pin code','pin'),circle:find('circlename','circle name','circle'),region:find('regionname','region name','region'),division:find('divisionname','division name','division'),
          office:find('officename','office name','office'),type:find('officetype','office type'),delivery:find('delivery','deliverystatus','delivery status'),district:find('district','districtname','district name'),state:find('statename','state name','state'),latitude:find('latitude','lat'),longitude:find('longitude','lng','lon')
        };
        if(indexes.pin<0||indexes.office<0||indexes.district<0||indexes.state<0)throw new Error('CSV must contain pincode, office name, district and state columns');
        continue;
      }
      const cols=parseCsvLine(line);
      const value=(i:number)=>i>=0?(cols[i]||'').trim():'';
      const pincode=value(indexes!.pin),office=value(indexes!.office),district=value(indexes!.district),state=value(indexes!.state);
      if(!/^\d{6}$/.test(pincode)||!office||!district||!state)continue;
      batch.push([
        pincode,value(indexes!.circle)||null,value(indexes!.region)||null,value(indexes!.division)||null,office,value(indexes!.type)||null,value(indexes!.delivery)||null,district,state,
        numberOrNull(value(indexes!.latitude)),numberOrNull(value(indexes!.longitude)),sourceDataset,sourceUpdatedAt
      ]);
      acceptedRows++;
      if(batch.length>=BATCH_SIZE)await flush();
    }
    await flush();
    if(!acceptedRows)throw new Error('No valid postal rows found in CSV');

    await client.query('BEGIN');
    try{
      await client.query('TRUNCATE TABLE postal_post_offices RESTART IDENTITY');
      await client.query(`INSERT INTO postal_post_offices
        (pincode,circle_name,region_name,division_name,office_name,office_type,delivery_status,district,state,latitude,longitude,source_dataset,source_updated_at)
        SELECT DISTINCT ON (pincode,office_name,district,state)
          pincode,circle_name,region_name,division_name,office_name,office_type,delivery_status,district,state,latitude,longitude,source_dataset,source_updated_at
        FROM postal_stage
        ORDER BY pincode,office_name,district,state`);
      const counts=(await client.query('SELECT COUNT(*)::int AS offices, COUNT(DISTINCT pincode)::int AS pins FROM postal_post_offices')).rows[0];
      await client.query('INSERT INTO postal_imports (source_file,source_dataset,office_rows,unique_pins) VALUES ($1,$2,$3,$4)',[options.sourceFile,sourceDataset,counts.offices,counts.pins]);
      await client.query('COMMIT');
      return {acceptedRows,officeRows:Number(counts.offices),uniquePins:Number(counts.pins),sourceFile:options.sourceFile,sourceDataset};
    }catch(error){
      await client.query('ROLLBACK');
      throw error;
    }
  }finally{
    await client.end();
  }
}
