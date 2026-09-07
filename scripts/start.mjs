import {spawn} from 'node:child_process';

function run(command,args){
  return new Promise((resolve,reject)=>{
    const child=spawn(command,args,{stdio:'inherit',env:process.env});
    child.on('error',reject);
    child.on('exit',code=>code===0?resolve():reject(new Error(`${command} exited with code ${code}`)));
  });
}

if(process.env.DATABASE_URL){
  console.log('DATABASE_URL detected; applying idempotent schema migration...');
  await run(process.execPath,['scripts/migrate-db.mjs']);
}else{
  console.warn('DATABASE_URL is not configured; starting without PostgreSQL.');
}

const next=spawn(process.execPath,['node_modules/next/dist/bin/next','start'],{stdio:'inherit',env:process.env});
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>next.kill(signal));
next.on('exit',code=>process.exit(code??0));
next.on('error',error=>{console.error(error);process.exit(1)});
