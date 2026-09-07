import {Pool} from 'pg';

declare global{
  // eslint-disable-next-line no-var
  var __cultPostgresPool:Pool|undefined;
}

export function hasDatabase(){return Boolean(process.env.DATABASE_URL)}

export function getDb(){
  if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is not configured');
  if(global.__cultPostgresPool)return global.__cultPostgresPool;
  const ssl=process.env.DATABASE_SSL==='true'
    ? {rejectUnauthorized:process.env.DATABASE_SSL_REJECT_UNAUTHORIZED!=='false'}
    : undefined;
  const pool=new Pool({connectionString:process.env.DATABASE_URL,ssl,max:10,idleTimeoutMillis:30000,connectionTimeoutMillis:5000});
  if(process.env.NODE_ENV!=='production')global.__cultPostgresPool=pool;
  return pool;
}
