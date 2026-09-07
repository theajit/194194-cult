import Link from 'next/link';
import type {Metadata} from 'next';
import {listPublishedPosts} from '../../lib/blog-db';

export const dynamic='force-dynamic';
export const metadata:Metadata={title:'194.194 Cult Blog',description:'Stories, coffee guides and ideas from 194.194 Cult.'};

export default async function BlogIndex(){
  const posts=await listPublishedPosts();
  return <main>
    <nav><Link href="/" className="brand"><b>194.194</b><span>CULT</span></Link><Link href="/" className="back">← BACK HOME</Link></nav>
    <section className="blogShell">
      <header className="blogHero"><div className="blogEyebrow">194.194 CULT · JOURNAL</div><h1>Ideas worth<br/><i>brewing.</i></h1><p>Coffee, place, community, digital identity and the experiments behind 194.194 Cult.</p></header>
      <div className="blogGrid">{posts.map(post=><Link className="blogCard" key={post.slug} href={`/blog/${post.slug}`}><span>{post.coverKind==='coffee-guide'?'COFFEE GUIDE':post.coverKind==='caffeine'?'194.194 CULT':'JOURNAL'}</span><h2>{post.title}</h2><p>{post.excerpt}</p><b>READ STORY →</b></Link>)}</div>
    </section>
    <footer><b>194.194 CULT</b><span>PIN CODE · DIGIPIN · COMMUNITY</span><span>JOURNAL</span></footer>
  </main>;
}
