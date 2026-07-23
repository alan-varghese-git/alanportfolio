const fs = require('fs');
const text = fs.readFileSync(String.raw`C:\Users\alanv\.gemini\antigravity-ide\brain\60090ee1-0a25-4cfd-a4ef-8adfe7eef485\.system_generated\logs\transcript.jsonl`, 'utf8');
const urls = text.match(/https:\/\/[^\"]+\.(?:png|jpg|jpeg)/gi) || [];
const fb = text.match(/https:\/\/firebasestorage[^\"]+/gi) || [];
const un = text.match(/https:\/\/images.unsplash.com[^\"]+/gi) || [];
console.log([...new Set([...urls, ...fb, ...un])].join('\n'));
