#!/usr/bin/env node
// compile.js — Fetches all 花间集 volumes and compiles into poems.json
const https = require('https');
const fs = require('fs');

const BASE = 'https://raw.githubusercontent.com/chinese-poetry/chinese-poetry/master/五代诗词/huajianji';
const VOLUMES = [
  'huajianji-1-juan.json',
  'huajianji-2-juan.json',
  'huajianji-3-juan.json',
  'huajianji-4-juan.json',
  'huajianji-5-juan.json',
  'huajianji-6-juan.json',
  'huajianji-7-juan.json',
  'huajianji-8-juan.json',
  'huajianji-9-juan.json',
  'huajianji-x-juan.json',
];

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function main() {
  let allPoems = [];
  let id = 1;
  const authors = new Set();

  for (const vol of VOLUMES) {
    const url = `${BASE}/${vol}`;
    console.log(`Fetching ${url}...`);
    const poems = await fetchJSON(url);
    for (const p of poems) {
      authors.add(p.author);
      // Split author if multiple (e.g., "尹鹗 六首" -> "尹鹗")
      const cleanAuthor = p.author.replace(/[。\s]*\d+[首\s]*$/, '').trim();
      allPoems.push({
        id: id++,
        title: p.title || '',
        author: cleanAuthor || p.author,
        rhythmic: p.rhythmic || '',
        content: p.paragraphs || [],
        period: '五代',
        tags: [],
      });
    }
  }

  // Simple tag classification based on keywords in title and content
  const keywordTags = {
    '春': 'spring',
    '秋': 'autumn',
    '花': 'flower',
    '月': 'moon',
    '柳': 'willow',
    '雨': 'rain',
    '雪': 'snow',
    '莲': 'lotus',
    '梅': 'plum',
    '梦': 'dream',
    '愁': 'sorrow',
    '恨': 'regret',
    '泪': 'tears',
    '相思': 'longing',
    '离别': 'parting',
    '忆': 'memory',
    '归': 'return',
    '闺': 'boudoir',
    '妆': 'adornment',
  };

  for (const poem of allPoems) {
    const text = (poem.title + poem.content.join('')).toLowerCase();
    for (const [kw, tag] of Object.entries(keywordTags)) {
      if (text.includes(kw) && !poem.tags.includes(tag)) {
        poem.tags.push(tag);
      }
    }
  }

  const output = { meta: { title: '花间集', period: '五代', total: allPoems.length, authors: [...authors].sort() }, poems: allPoems };
  fs.writeFileSync('poems.json', JSON.stringify(output, null, 2), 'utf8');
  console.log(`Done! Compiled ${allPoems.length} poems by ${authors.size} authors → poems.json`);
}

main().catch(console.error);
