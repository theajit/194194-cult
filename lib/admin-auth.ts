import {timingSafeEqual} from 'node:crypto';

export function isAdminAuthorized(request:Request){
  const expected=process.env.ADMIN_TOKEN;
  if(!expected)return false;
  const auth=request.headers.get('authorization')||'';
  const supplied=auth.startsWith('Bearer ')?auth.slice(7):'';
  const a=Buffer.from(supplied);const b=Buffer.from(expected);
  return a.length===b.length&&timingSafeEqual(a,b);
}
