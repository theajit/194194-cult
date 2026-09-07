import {getDb,hasDatabase} from './db';

export type BlogStatus='DRAFT'|'PUBLISHED';
export type BlogPost={
  id:number;slug:string;title:string;excerpt:string;contentMarkdown:string;authorName:string;status:BlogStatus;coverKind:string|null;publishedAt:string|null;createdAt:string;updatedAt:string;
};

const mapPost=(r:any):BlogPost=>({
  id:Number(r.id),slug:r.slug,title:r.title,excerpt:r.excerpt||'',contentMarkdown:r.content_markdown||'',authorName:r.author_name||'194.194 Cult',status:r.status,coverKind:r.cover_kind||null,
  publishedAt:r.published_at?new Date(r.published_at).toISOString():null,createdAt:new Date(r.created_at).toISOString(),updatedAt:new Date(r.updated_at).toISOString()
});

export const blogSlug=(value:string)=>value.toLowerCase().trim().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,120);

export async function listPublishedPosts(limit=50):Promise<BlogPost[]>{
  if(!hasDatabase())return [];
  const result=await getDb().query(`SELECT * FROM blog_posts WHERE status='PUBLISHED' AND (published_at IS NULL OR published_at<=NOW()) ORDER BY published_at DESC NULLS LAST,created_at DESC LIMIT $1`,[Math.min(Math.max(limit,1),100)]);
  return result.rows.map(mapPost);
}

export async function getPublishedPost(slug:string):Promise<BlogPost|null>{
  if(!hasDatabase())return null;
  const result=await getDb().query(`SELECT * FROM blog_posts WHERE slug=$1 AND status='PUBLISHED' AND (published_at IS NULL OR published_at<=NOW()) LIMIT 1`,[slug]);
  return result.rowCount?mapPost(result.rows[0]):null;
}

export async function listAllPosts():Promise<BlogPost[]>{
  if(!hasDatabase())return [];
  const result=await getDb().query(`SELECT * FROM blog_posts ORDER BY updated_at DESC`);
  return result.rows.map(mapPost);
}

export async function getAnyPost(slug:string):Promise<BlogPost|null>{
  if(!hasDatabase())return null;
  const result=await getDb().query(`SELECT * FROM blog_posts WHERE slug=$1 LIMIT 1`,[slug]);
  return result.rowCount?mapPost(result.rows[0]):null;
}

export async function createPost(input:{slug?:string;title:string;excerpt?:string;contentMarkdown?:string;authorName?:string;status?:BlogStatus;coverKind?:string|null}){
  const slug=blogSlug(input.slug||input.title);if(!slug)throw new Error('A valid slug is required');
  const status=input.status||'DRAFT';
  const result=await getDb().query(`INSERT INTO blog_posts (slug,title,excerpt,content_markdown,author_name,status,cover_kind,published_at,updated_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,CASE WHEN $6='PUBLISHED' THEN NOW() ELSE NULL END,NOW()) RETURNING *`,[
      slug,input.title.trim(),input.excerpt?.trim()||'',input.contentMarkdown||'',input.authorName?.trim()||'194.194 Cult',status,input.coverKind||null
    ]);
  return mapPost(result.rows[0]);
}

export async function updatePost(slug:string,input:Partial<{slug:string;title:string;excerpt:string;contentMarkdown:string;authorName:string;status:BlogStatus;coverKind:string|null}>){
  const current=await getAnyPost(slug);if(!current)throw new Error('Post not found');
  const nextSlug=blogSlug(input.slug??current.slug);if(!nextSlug)throw new Error('A valid slug is required');
  const nextStatus=input.status??current.status;
  const publishNow=nextStatus==='PUBLISHED'&&current.status!=='PUBLISHED';
  const result=await getDb().query(`UPDATE blog_posts SET slug=$2,title=$3,excerpt=$4,content_markdown=$5,author_name=$6,status=$7,cover_kind=$8,
    published_at=CASE WHEN $9 THEN NOW() WHEN $7='DRAFT' THEN NULL ELSE published_at END,updated_at=NOW() WHERE slug=$1 RETURNING *`,[
      slug,nextSlug,(input.title??current.title).trim(),input.excerpt??current.excerpt,input.contentMarkdown??current.contentMarkdown,(input.authorName??current.authorName).trim(),nextStatus,input.coverKind===undefined?current.coverKind:input.coverKind,publishNow
    ]);
  return mapPost(result.rows[0]);
}

export async function deletePost(slug:string){
  const result=await getDb().query(`DELETE FROM blog_posts WHERE slug=$1 RETURNING id`,[slug]);
  return Boolean(result.rowCount);
}
