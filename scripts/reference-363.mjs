import fs from 'node:fs/promises';
const root='research/363';
const origin='https://363sudbury.com';
await fs.mkdir(root,{recursive:true});
const html=await fs.readFile(`${root}/home.html`,'utf8');
const initial=[...new Set([...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css)[^" ]*)"/g)].map(m=>m[1]).filter(u=>u.startsWith('/_astro/')))];
const inline=[...html.matchAll(/(?:import\s+[\s\S]*?from\s*|import\s*)["']([^"']+\.(?:js|css))["']/g)].map(m=>m[1]);
const queue=[...initial,...inline];const seen=new Set();
while(queue.length&&seen.size<18){
 const raw=queue.shift();const url=new URL(raw,origin+'/_astro/').href;if(seen.has(url))continue;seen.add(url);
 const res=await fetch(url);if(!res.ok)continue;const text=await res.text();const name=new URL(url).pathname.split('/').pop();
 await fs.writeFile(`${root}/${name}`,text);
 console.log(name,text.length);
 for(const m of text.matchAll(/from\s*["']([^"']+\.js)["']/g))queue.push(new URL(m[1],url).href);
}
await fs.writeFile(`${root}/manifest.json`,JSON.stringify([...seen],null,2));
for(const [repo,file]of [['anthropics/skills','skills/frontend-design/SKILL.md'],['Leonxlnx/taste-skill','skills/redesign-skill/SKILL.md']]){
 const text=await(await fetch(`https://raw.githubusercontent.com/${repo}/main/${file}`)).text();
 const dest=`research/${repo.startsWith('anthropics')?'frontend-design':'redesign'}-SKILL.md`;await fs.writeFile(dest,text);
}
console.log('modules',html.match(/<script type="module"[\s\S]*?<\/script>/g)?.map(s=>s.slice(0,900)));
