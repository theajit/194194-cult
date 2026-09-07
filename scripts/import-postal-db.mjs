import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import pg from 'pg';

const {Client}=pg;
const connectionString=process.env.DATABASE_URL;
if(!connectionString)throw new Error('DATABASE_URL is required');
const DEFAULT_CSV_PATH=path.join(process.cwd(),'data','postal','all-india-pincode-directory.csv');
const csvPath=process.argv[2]||process.env.POSTAL_CSV_PATH||DEFAULT_CSV_PATH;
if(!fs.existsSync(csvPath))throw new Error(`Postal CSV not found: ${csvPath}`);

const ssl=process.env.DATABASE_SSL==='true'
  ? {rejectUnauthorized:process.env.DATABASE_SSL_REJECT_UNAUTHORIZED!=='false'}
  : undefined;
const sourceDataset=process.env.POSTAL_SOURCE_DATASET||'Department of Posts / data.gov.in';
const sourceUpdatedAt=process.env.POSTAL_SOURCE_UPDATED_AT||null;
const batchSize=500;

function parseCsvLine(line){
  const out=[];let current='';let quoted=false;
  for(let i=0;i<line.length;i++){
    const ch=line[i];
    if(ch==='"'){
      if(quoted&&line[i+1]==='"'){current+='"';i++}else quoted=!quoted;
    }else if(ch===','&&!quoted){out.push(current);current=''}else current+=ch;
  }
  out.push(current);
  return out.map(v=>v.trim());
}
const normalize=v=>v.toLowerCase().replace(/[^a-z0-9]/g,'');
const numberOrNull=v=>{const n=Number.parseFloat(v);return Number.isFinite(n)?n:null};

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

  const input=readline.createInterface({input:fs.createReadStream(csvPath),crlfDelay:Infinity});
  let headers=null,indexes=null,batch=[],acceptedRows=0,skippedRows=0;

  const flush=async()=>{
    if(!batch.length)return;
    const fields=13;
    const values=[];
    const placeholders=batch.map((row,rowIndex)=>{
      values.push(...row);
      return `(${Array.from({length:fields},(_,i)=>`$${rowIndex*fields+i+1}`).join(',')})`;
    }).join(',');
    await client.query(`INSERT INTO postal_stage
      (pincode,circle_name,region_name,division_name,office_name,office_type,delivery_status,district,state,latitude,longitude,source_dataset,source_updated_at)
      VALUES ${placeholders}`,values);
    batch=[];
  };

  for await (const rawLine of input){
    const line=rawLine.replace(/^\uFEFF/,'');
    if(!line.trim())continue;
    if(!headers){
      headers=parseCsvLine(line).map(normalize);
      const find=(...names)=>headers.findIndex(h=>names.map(normalize).includes(h));
      indexes={
        pin:find('pincode','pin code','pin'),circle:find('circlename','circle name','circle'),region:find('regionname','region name','region'),division:find('divisionname','division name','division'),
        office:find('officename','office name','office'),type:find('officetype','office type'),delivery:find('delivery','deliverystatus','delivery status'),district:find('district','districtname','district name'),state:find('statename','state name','state'),latitude:find('latitude','lat'),longitude:find('longitude','lng','lon')
      };
      if(indexes.pin<0||indexes.office<0||indexes.district<0||indexes.state<0)throw new Error('CSV must contain pincode, office name, district and state columns');
      continue;
    }
    const cols=parseCsvLine(line);
    const value=i=>i>=0?(cols[i]||'').trim():'';
    const pincode=value(indexes.pin),office=value(indexes.office),district=value(indexes.district),state=value(indexes.state);
    if(!/^\d{6}$/.test(pincode)||!office||!district||!state){skippedRows++;continue;}
    batch.push([
      pincode,value(indexes.circle)||null,value(indexes.region)||null,value(indexes.division)||null,office,value(indexes.type)||null,value(indexes.delivery)||null,district,state,
      numberOrNull(value(indexes.latitude)),numberOrNull(value(indexes.longitude)),sourceDataset,sourceUpdatedAt
    ]);
    acceptedRows++;
    if(batch.length>=batchSize)await flush();
  }
  await flush();
  if(!acceptedRows)throw new Error('No valid postal rows found in the CSV');

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
    await client.query('INSERT INTO postal_imports (source_file,source_dataset,office_rows,unique_pins) VALUES ($1,$2,$3,$4)',[path.basename(csvPath),sourceDataset,counts.offices,counts.pins]);
    await client.query('COMMIT');
    console.log(`Imported ${counts.offices} post offices across ${counts.pins} unique PIN codes from ${acceptedRows} accepted rows (${skippedRows} skipped). Scope: All India.`);
  }catch(error){
    await client.query('ROLLBACK');
    throw error;
  }
}finally{
  await client.end();
}
