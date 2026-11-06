import { put } from '@vercel/blob';
import { randomUUID } from 'node:crypto';
const zone = 'America/Phoenix';
function dayKey() {
  const x=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(x=>[x.type,x.value]));
  return x.year+'-'+x.month+'-'+x.day;
}
export default async function handler(req,res) {
 res.setHeader('Cache-Control','no-store, max-age=0');
 if(req.method!=='POST')return res.status(405).json({error:'method_not_allowed'});
 const host=(req.headers.host||'').toLowerCase().split(':')[0];
 const origin=req.headers.origin||'';
 if(origin) {try {if(new URL(origin).host!==host)return res.status(403).json({error:'origin'});}catch {return res.status(403).end();}}
 if(req.headers.dnt==='1'||/bot|crawler|spider|preview|lighthouse|headless/i.test(req.headers['user-agent']||''))return res.status(204).end();
 const day=dayKey();const cookieName='genie_visit_'+day.replace(/-/g,'');
 if((req.headers.cookie||'').split(';').some(x=>x.trim().startsWith(cookieName+'=')))return res.status(204).end();
 if(!process.env.BLOB_READ_WRITE_TOKEN)return res.status(503).json({error:'tracking_not_configured'});
 try {
  await put('traffic/'+day+'/'+randomUUID()+'.txt','1',{access:'private',addRandomSuffix:false,contentType:'text/plain'});
  res.setHeader('Set-Cookie',cookieName+'=1; Path=/; Max-Age=86400; SameSite=Lax; Secure; HttpOnly');
  return res.status(204).end();
 }catch(e){console.error('Visitor counting unavailable',e?.message);return res.status(503).json({error:'tracking_unavailable'});}
}
