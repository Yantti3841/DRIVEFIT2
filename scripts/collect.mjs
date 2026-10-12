import fs from 'node:fs/promises';
const origin = 'https://www.bmw.com.cn';
const source = await fs.readFile('bmw-source.html', 'utf8');
const cards = [...source.matchAll(/<div data-href="([^"]+)" class="ds2-car-item"([^>]+)>([\s\S]*?)<\/button><\/a><\/div><\/div>/g)].map(m => ({
  href: origin + m[1],
  name: m[3].match(/ds2-car-item-brief-name">([^<]+)/)?.[1].trim(),
  priceText: m[3].match(/<p class="text-price">([^<]+)/)?.[1].trim() || null,
  image: origin + m[3].match(/<img src="([^"]+)/)?.[1],
  action: m[3].match(/<button>([^<]+)/)?.[1],
}));
const unique = [...new Map(cards.map(c => [c.name, c])).values()];
await fs.writeFile('catalog-source.json', JSON.stringify(unique, null, 2));
console.log(JSON.stringify(unique.map(({image, ...c}) => c), null, 2));
