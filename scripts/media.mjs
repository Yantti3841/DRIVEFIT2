import fs from 'node:fs/promises';
const cars=JSON.parse(await fs.readFile('catalog-source.json','utf8'));
await fs.mkdir('research',{recursive:true});
for (const id of [11,15,24,27,12]) {
 const c=cars[id];const html=await (await fetch(c.href)).text();
 await fs.writeFile(`research/page-${id}.html`,html);
 const urls=[...new Set([...html.matchAll(/(?:src|data-src|srcset|data-desktop-src)="([^"]+)"/g)].map(m=>m[1]).filter(u=>/content\/dam/.test(u)&&/\.(jpg|png|webp)/i.test(u)))];
 console.log(c.name,JSON.stringify(urls.slice(0,18)));
}
