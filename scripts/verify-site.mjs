#!/usr/bin/env node
// Lightweight static production-readiness audit for Genie of Benefits.
// Uses only Node built-ins. Run: node scripts/verify-site.mjs
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const files = fs.readdirSync(root).filter(f=>f.endsWith('.html'));
const issues = []; let linksChecked=0; let externalCount=0;
const check=(condition,msg)=>{if(!condition)issues.push(msg);};
for(const file of files){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 check(/<title\b[^>]*>[^<]+<\/title>/i.test(html),file+': missing title');
 check(/<html\b[^>]*lang=/i.test(html),file+': missing HTML language');
 for(const match of html.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)){
  const ref=match[1].trim(); if(!ref||ref.startsWith('#')||/^(mailto:|tel:|data:|javascript:)/i.test(ref))continue;
  if(/^https?:\/\//i.test(ref)){externalCount++;continue;}
  if(ref.startsWith('//')){externalCount++;continue;}
  const clean=ref.split(/[?#]/)[0]; if(!clean)continue;
  const p=path.resolve(root,decodeURIComponent(clean).replace(/^\//,''));
  linksChecked++;
  check(p.startsWith(root+path.sep)||p===root,file+': unsafe reference '+ref);
  if(p.startsWith(root))check(fs.existsSync(p),file+': missing '+ref);
 }
}
if(fs.existsSync('sitemap.xml')){
 const xml=fs.readFileSync('sitemap.xml','utf8');
 for(const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)){
  const u=new URL(m[1]); const filename=u.pathname==='/'?'index.html':u.pathname.slice(1);
  check(fs.existsSync(filename),'Sitemap points to missing file: '+filename);
 }
}else issues.push('Missing sitemap.xml');
if(!fs.existsSync('robots.txt'))issues.push('Missing robots.txt');
console.log('Static audit: '+files.length+' pages, '+linksChecked+' local references, '+externalCount+' external references (not live-checked).');
if(issues.length){for(const i of issues)console.error('FAIL '+i);process.exitCode=1;}
else console.log('PASS: static page structure, local links/assets and sitemap references.');
