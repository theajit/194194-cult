import fs from 'node:fs/promises';
import pg from 'pg';

const {Client}=pg;
const connectionString=process.env.DATABASE_URL;
if(!connectionString)throw new Error('DATABASE_URL is required');

const ssl=process.env.DATABASE_SSL==='true'
  ? {rejectUnauthorized:process.env.DATABASE_SSL_REJECT_UNAUTHORIZED!=='false'}
  : undefined;

const sql=await fs.readFile(new URL('../db/schema.sql',import.meta.url),'utf8');
const client=new Client({connectionString,ssl});
await client.connect();
try{
  await client.query(sql);
  console.log('Database schema is ready.');
}finally{
  await client.end();
}
