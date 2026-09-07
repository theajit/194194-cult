import {NextResponse} from 'next/server';
import {isAdminAuthorized} from '../../../../../lib/admin-auth';
import {hasDatabase} from '../../../../../lib/db';
import {deletePost,getAnyPost,updatePost} from '../../../../../lib/blog-db';

export const runtime='nodejs';
export const dynamic='force-dynamic';

export async function GET(request:Request,{params}:{params:{slug:string}}){
  if(!isAdminAuthorized(request))return NextResponse.json({error:'Unauthorized'},{status:401});
  if(!hasDatabase())return NextResponse.json({error:'DATABASE_URL is not configured'},{status:503});
  const post=await getAnyPost(params.slug);return post?NextResponse.json({post}):NextResponse.json({error:'Not found'},{status:404});
}

export async function PATCH(request:Request,{params}:{params:{slug:string}}){
  if(!isAdminAuthorized(request))return NextResponse.json({error:'Unauthorized'},{status:401});
  if(!hasDatabase())return NextResponse.json({error:'DATABASE_URL is not configured'},{status:503});
  try{return NextResponse.json({post:await updatePost(params.slug,await request.json())})}catch(error:any){const message=error instanceof Error?error.message:'Unable to update post';return NextResponse.json({error:message},{status:message==='Post not found'?404:500})}
}

export async function DELETE(request:Request,{params}:{params:{slug:string}}){
  if(!isAdminAuthorized(request))return NextResponse.json({error:'Unauthorized'},{status:401});
  if(!hasDatabase())return NextResponse.json({error:'DATABASE_URL is not configured'},{status:503});
  try{return (await deletePost(params.slug))?NextResponse.json({ok:true}):NextResponse.json({error:'Not found'},{status:404})}catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Unable to delete post'},{status:500})}
}
