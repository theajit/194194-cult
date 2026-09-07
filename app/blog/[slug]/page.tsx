import Link from 'next/link';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getPublishedPost} from '../../../lib/blog-db';
import BlogContent from '../BlogContent';

export const dynamic='force-dynamic';

export async function generateMetadata({params}:{params:{slug:string}}):Promise<Metadata>{
  const post=await getPublishedPost(params.slug);if(!post)return {title:'Post not found'};
  return {title:post.title,description:post.excerpt,alternates:{canonical:`/blog/${post.slug}`},openGraph:{title:post.title,description:post.excerpt,type:'article',url:`/blog/${post.slug}`}};
}

export default async function BlogPostPage({params}:{params:{slug:string}}){
  const post=await getPublishedPost(params.slug);if(!post)notFound();
  return <main>
    <nav><Link href="/" className="brand"><b>194.194</b><span>CULT</span></Link><Link href="/blog" className="back">← ALL STORIES</Link></nav>
    <article className="blogArticle">
      <header className="blogArticleHeader"><div className="blogEyebrow">194.194 CULT · JOURNAL</div><h1>{post.title}</h1><p>{post.excerpt}</p><div className="blogMeta"><span>{post.authorName}</span>{post.publishedAt&&<span>{new Date(post.publishedAt).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</span>}</div></header>
      <BlogContent markdown={post.contentMarkdown}/>
    </article>
    <footer><b>194.194 CULT</b><span>PIN CODE · DIGIPIN · COMMUNITY</span><span>JOURNAL</span></footer>
  </main>;
}
