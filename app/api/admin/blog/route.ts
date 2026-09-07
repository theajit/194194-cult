import {NextResponse} from 'next/server';
import {isAdminAuthorized} from '../../../../lib/admin-auth';
import {hasDatabase} from '../../../../lib/db';
import {createPost,listAllPosts} from '../../../../lib/blog-db';

export const runtime='nodejs';
export const dynamic='force-dynamic';

export async function GET(request:Request){
  if(!isAdminAuthorized(request))return NextResponse.json({error:'Unauthorized'},{status:401});
  if(!hasDatabase())return NextResponse.json({error:'DATABASE_URL is not configured'},{status:503});
  try{return NextResponse.json({items:await listAllPosts()})}catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Unable to load posts'},{status:500})}
}

export async function POST(request:Request){
  if(!isAdminAuthorized(request))return NextResponse.json({error:'Unauthorized'},{status:401});
  if(!hasDatabase())return NextResponse.json({error:'DATABASE_URL is not configured'},{status:503});
  try{
    const body=await request.json();
    if(!body.title||typeof body.title!=='string')return NextResponse.json({error:'Title is required'},{status:400});
    const post=await createPost({slug:body.slug,title:body.title,excerpt:body.excerpt,contentMarkdown:body.contentMarkdown,authorName:body.authorName,status:body.status,coverKind:body.coverKind});
    return NextResponse.json({post},{status:201});
  }catch(error:any){
    const message=error instanceof Error?error.message:'Unable to create post';
    return NextResponse.json({error:message},{status:message.includes('duplicate')?409:500});
  }
}
