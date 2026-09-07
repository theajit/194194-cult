import type {ReactNode} from 'react';
import {COFFEE_GUIDE_IMAGE} from './coffee-guide-image';

function inline(text:string):ReactNode[]{
  const nodes:ReactNode[]=[];
  const pattern=/(\*\*[^*]+\*\*|\[[^\]]+\]\([^\)]+\))/g;
  let last=0;let match:RegExpExecArray|null;
  while((match=pattern.exec(text))){
    if(match.index>last)nodes.push(text.slice(last,match.index));
    const token=match[0];
    if(token.startsWith('**'))nodes.push(<strong key={`${match.index}-b`}>{token.slice(2,-2)}</strong>);
    else{
      const link=token.match(/^\[([^\]]+)\]\(([^\)]+)\)$/);
      if(link)nodes.push(<a key={`${match.index}-a`} href={link[2]} target="_blank" rel="noreferrer">{link[1]}</a>);
    }
    last=pattern.lastIndex;
  }
  if(last<text.length)nodes.push(text.slice(last));
  return nodes;
}

function CaffeineStructure(){
  return <figure className="chemFigure">
    <svg viewBox="0 0 620 330" role="img" aria-label="Simplified skeletal structure of caffeine">
      <g fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M170 80 L270 45 L355 100 L345 205 L255 255 L165 205 Z"/>
        <path d="M355 100 L440 75 L495 145 L445 215 L345 205"/>
        <path d="M170 80 L120 35"/><path d="M165 205 L110 255"/><path d="M445 215 L500 270"/>
        <path d="M270 45 L270 8"/><path d="M284 48 L284 12"/>
        <path d="M255 255 L255 300"/><path d="M270 252 L270 297"/>
      </g>
      <g fontFamily="Arial, sans-serif" fontWeight="800" fontSize="28" fill="currentColor">
        <text x="245" y="92">N</text><text x="330" y="156">N</text><text x="430" y="128">N</text><text x="400" y="226">N</text>
        <text x="263" y="28">O</text><text x="246" y="325">O</text>
        <text x="52" y="36">CH₃</text><text x="42" y="284">CH₃</text><text x="505" y="294">CH₃</text>
      </g>
    </svg>
    <figcaption><b>Caffeine</b><span>C₈H₁₀N₄O₂ · molar mass ≈ 194.19 g/mol</span></figcaption>
  </figure>;
}

function CoffeeGuideInfographic(){
  return <figure className="coffeeGuideInfographic">
    <img src={COFFEE_GUIDE_IMAGE} alt="Coffee Guide showing espresso, doppio, macchiato, ristretto, long black, latte, cappuccino, flat white, piccolo, mocha and affogato"/>
    <figcaption>Know your cup — a visual guide to common espresso-based drinks.</figcaption>
  </figure>;
}

const coffeeSpec:Record<string,{title:string;layers:Array<{label:string;height:number;kind:string}>;note?:string}>={
  espresso:{title:'Espresso',layers:[{label:'Espresso',height:38,kind:'espresso'}]},
  doppio:{title:'Doppio',layers:[{label:'Double espresso',height:58,kind:'espresso'}]},
  'short-macchiato':{title:'Short Macchiato',layers:[{label:'Foam',height:18,kind:'foam'},{label:'Milk',height:16,kind:'milk'},{label:'Espresso',height:38,kind:'espresso'}]},
  'long-macchiato':{title:'Long Macchiato',layers:[{label:'Foam',height:18,kind:'foam'},{label:'Milk',height:16,kind:'milk'},{label:'Double espresso',height:54,kind:'espresso'}]},
  ristretto:{title:'Ristretto',layers:[{label:'Short extraction',height:28,kind:'espresso'}]},
  americano:{title:'Long Black / Americano',layers:[{label:'Espresso',height:30,kind:'espresso'},{label:'Hot water',height:72,kind:'water'}]},
  latte:{title:'Café Latte',layers:[{label:'Microfoam',height:18,kind:'foam'},{label:'Steamed milk',height:90,kind:'milk'},{label:'Espresso',height:28,kind:'espresso'}]},
  cappuccino:{title:'Cappuccino',layers:[{label:'Foam',height:42,kind:'foam'},{label:'Steamed milk',height:58,kind:'milk'},{label:'Espresso',height:28,kind:'espresso'}]},
  'flat-white':{title:'Flat White',layers:[{label:'Fine microfoam + milk',height:88,kind:'milk'},{label:'Espresso',height:34,kind:'espresso'}]},
  piccolo:{title:'Piccolo Latte',layers:[{label:'Microfoam',height:14,kind:'foam'},{label:'Steamed milk',height:48,kind:'milk'},{label:'Espresso / ristretto',height:32,kind:'espresso'}]},
  mocha:{title:'Mocha',layers:[{label:'Foam',height:28,kind:'foam'},{label:'Steamed milk',height:62,kind:'milk'},{label:'Chocolate + espresso',height:38,kind:'mocha'}]},
  affogato:{title:'Affogato',layers:[{label:'Vanilla ice cream',height:60,kind:'icecream'},{label:'Espresso',height:32,kind:'espresso'}]},
  magic:{title:'Magic',layers:[{label:'Steamed milk + little foam',height:70,kind:'milk'},{label:'Double ristretto',height:48,kind:'espresso'}]}
};

function CoffeeDiagram({kind}:{kind:string}){
  const spec=coffeeSpec[kind]||coffeeSpec.espresso;
  let y=250;
  return <figure className="coffeeFigure">
    <svg viewBox="0 0 420 300" role="img" aria-label={`${spec.title} composition diagram`}>
      <path className="cupOutline" d="M110 35 H310 L290 255 H130 Z"/>
      {spec.layers.slice().reverse().map((layer,i)=>{const h=layer.height;y-=h;return <g key={`${layer.label}-${i}`}><rect x="132" y={y} width="156" height={h} className={`coffeeLayer ${layer.kind}`}/><text x="210" y={y+h/2+5} textAnchor="middle">{layer.label}</text></g>})}
      <path className="cupOutline" d="M310 85 C370 85 370 175 302 180"/>
    </svg>
    <figcaption>{spec.title}</figcaption>
  </figure>;
}

function shortcode(line:string){
  const trimmed=line.trim();
  if(trimmed==='[[caffeine-structure]]')return <CaffeineStructure/>;
  if(trimmed==='[[coffee-guide-image]]')return <CoffeeGuideInfographic/>;
  const coffee=trimmed.match(/^\[\[coffee:([^\]]+)\]\]$/);
  if(coffee)return <CoffeeDiagram kind={coffee[1]}/>;
  return null;
}

export default function BlogContent({markdown}:{markdown:string}){
  const lines=markdown.replace(/\r/g,'').split('\n');
  const out:ReactNode[]=[];
  const isCoffeeGuide=/\[\[coffee:[^\]]+\]\]/.test(markdown);
  if(isCoffeeGuide)out.push(<CoffeeGuideInfographic key="coffee-guide-lead"/>);
  let i=0;
  while(i<lines.length){
    const line=lines[i];
    if(!line.trim()){i++;continue;}
    const special=shortcode(line);if(special){out.push(<div key={`s-${i}`}>{special}</div>);i++;continue;}
    const heading=line.match(/^(#{2,4})\s+(.+)$/);
    if(heading){const level=heading[1].length;const text=heading[2];out.push(level===2?<h2 key={`h-${i}`}>{inline(text)}</h2>:level===3?<h3 key={`h-${i}`}>{inline(text)}</h3>:<h4 key={`h-${i}`}>{inline(text)}</h4>);i++;continue;}
    if(/^[-*]\s+/.test(line)){
      const items:string[]=[];while(i<lines.length&&/^[-*]\s+/.test(lines[i])){items.push(lines[i].replace(/^[-*]\s+/,''));i++;}
      out.push(<ul key={`ul-${i}`}>{items.map((x,j)=><li key={j}>{inline(x)}</li>)}</ul>);continue;
    }
    if(/^\d+\.\s+/.test(line)){
      const items:string[]=[];while(i<lines.length&&/^\d+\.\s+/.test(lines[i])){items.push(lines[i].replace(/^\d+\.\s+/,''));i++;}
      out.push(<ol key={`ol-${i}`}>{items.map((x,j)=><li key={j}>{inline(x)}</li>)}</ol>);continue;
    }
    const paragraph=[line.trim()];i++;
    while(i<lines.length&&lines[i].trim()&&!/^(#{2,4})\s+/.test(lines[i])&&!/^[-*]\s+/.test(lines[i])&&!/^\d+\.\s+/.test(lines[i])&&!shortcode(lines[i])){paragraph.push(lines[i].trim());i++;}
    out.push(<p key={`p-${i}`}>{inline(paragraph.join(' '))}</p>);
  }
  return <div className="blogContent">{out}</div>;
}
