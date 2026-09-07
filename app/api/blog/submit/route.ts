import {NextResponse} from 'next/server';
import {hasDatabase} from '../../../../lib/db';
import {submitCommunityPost} from '../../../../lib/blog-db';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function POST(request:Request){
  if(!hasDatabase())return NextResponse.json({error:'Blog submissions are temporarily unavailable.'},{status:503});
  try{
    const body=await request.json();
    if(body.website)return NextResponse.json({ok:true});
    const title=String(body.title||'').trim(),authorName=String(body.authorName||'').trim(),authorEmail=String(body.authorEmail||'').trim(),excerpt=String(body.excerpt||'').trim(),contentMarkdown=String(body.contentMarkdown||'').trim();
    if(title.length<5||title.length>160)return NextResponse.json({error:'Title must be 5–160 characters.'},{status:400});
    if(authorName.length<2||authorName.length>80)return NextResponse.json({error:'Please enter your name.'},{status:400});
    if(authorEmail&&(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorEmail)||authorEmail.length>200))return NextResponse.json({error:'Please enter a valid email.'},{status:400});
    if(excerpt.length<20||excerpt.length>400)return NextResponse.json({error:'Summary must be 20–400 characters.'},{status:400});
    if(contentMarkdown.length<150||contentMarkdown.length>30000)return NextResponse.json({error:'Article must be 150–30,000 characters.'},{status:400});
    const post=await submitCommunityPost({title,authorName,authorEmail:authorEmail||null,excerpt,contentMarkdown});
    return NextResponse.json({ok:true,submissionId:post.id,message:'Submitted for moderation.'},{status:201});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Unable to submit article.'},{status:500})}
}
