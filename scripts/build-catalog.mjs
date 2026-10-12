import fs from 'node:fs/promises';
const raw=JSON.parse(await fs.readFile('catalog-source.json','utf8'));
const source='https://www.bmw.com.cn/zh/ssl/model-finder.html';
const manifest=[];
await fs.mkdir('dist/assets',{recursive:true});
const catalog=[];
for(let i=0;i<raw.length;i++){
 const c=raw[i];
 const price=c.priceText?Number(c.priceText.match(/￥\s*([\d,]+)/)?.[1].replaceAll(',','')):null;
 const electric=/纯电动|新世代/.test(c.name);
 const hybrid=/XM|M5$|M760Le/.test(c.name);
 const body=/X[1-7]|iX|XM/.test(c.name)?'suv':/旅行/.test(c.name)?'wagon':/敞篷/.test(c.name)?'convertible':/双门/.test(c.name)?'coupe':'sedan';
 const performance=/\/m-series\//.test(c.href);
 const luxury=/5系|i5|7系|8系|i7|iX\b|X5|X6|X7|XM|M5$/.test(c.name);
 const practical=['suv','wagon'].includes(body)&&!/X2|X6/.test(c.name);
 const compact=/2系|X1|X2|iX1|M235|M240|M2/.test(c.name);
 const family=body==='sedan'||practical;
 const sport=performance||body==='coupe'||body==='convertible'||/3系|i3|i4|4系/.test(c.name);
 const seats=body==='coupe'||body==='convertible'?4:/X7 M60i/.test(c.name)?6:/BMW X7$/.test(c.name)?7:5;
 const status=c.action==='预约试驾'?'on_sale':c.action==='立即咨询'?'consult':'upcoming';
 const useTags=[...family?['family']:[],...!performance?['commute']:[],...family&&!compact?['long']:[],...practical||sport?['weekend']:[]];
 const priorityTags=[...sport?['drive']:[],...(luxury||/BMW X3$/.test(c.name))&&!performance?['comfort']:[],...practical?['space']:[],...electric&&!luxury?['cost']:[],...body==='coupe'||body==='convertible'||/X2|X6|i4/.test(c.name)?['design']:[]];
 const id=`bmw-${String(i).padStart(2,'0')}`;
 const image=`assets/${id}.png`;
 if(process.argv.includes('--metadata-only'))await fs.access(`dist/${image}`);
 else{const res=await fetch(c.image);if(!res.ok)throw new Error(`Image ${c.name}: ${res.status}`);await fs.writeFile(`dist/${image}`,Buffer.from(await res.arrayBuffer()));}
 manifest.push({file:image,url:c.image,page:source,credit:'BMW 中国官网，参赛原型展示'});
 catalog.push({id,name:c.name.replace(/^纯电动BMW /,'BMW ').replace(/^新纯电动BMW /,'BMW ').replace(/^新BMW /,'BMW ').replace(/^全新BMW /,'BMW '),originalName:c.name,price,priceIsFrom:c.priceText?.includes('起')??false,energy:electric?'bev':hybrid?'phev':'gasoline',body,performance,seats,status,useTags,priorityTags,image,source:c.href,priceSource:source,checkedAt:'2026-10-12',compact,luxury,family,group:c.name.match(/(M235L|M240i|i[3457]|iX[13]?|X[1-7]|[234578]系|M[2345]|XM|M760)/)?.[1]||id});
}
const media=[
 ['hero.jpg','/content/dam/bmw/marketCN/common/all-models/4-series/coupe/2024/20240422/inspire/4-series-inspire-exterior-1-1920_1102.jpg'],
 ['detail.jpg','/content/dam/bmw/marketCN/common/all-models/3-series/sedan/2024/20240923/inspire/inspire_01-1-PC.jpg'],
 ['interior.jpg','/content/dam/bmw/marketCN/common/all-models/3-series/sedan/2024/20240923/inform/inform_02.jpg.asset.1727312449146.jpg'],
];
for(const [file,url]of media){const full='https://www.bmw.com.cn'+url;if(process.argv.includes('--metadata-only'))await fs.access('dist/assets/'+file);else{const res=await fetch(full);if(!res.ok)throw new Error(`Media ${res.status}`);await fs.writeFile('dist/assets/'+file,Buffer.from(await res.arrayBuffer()));}manifest.push({file:'assets/'+file,url:full,credit:'BMW 中国官网，参赛原型展示'});}
await fs.writeFile('dist/catalog.js',`export const catalog = ${JSON.stringify(catalog,null,2)};\n`);
await fs.writeFile('research/assets.json',JSON.stringify(manifest,null,2));
console.log(JSON.stringify({total:catalog.length,onSale:catalog.filter(c=>c.status==='on_sale').length,other:catalog.filter(c=>c.status!=='on_sale').length}));
