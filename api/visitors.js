import { list } from '@vercel/blob';
import { timingSafeEqual } from 'node:crypto';
function authorized(attempt) {
 const secret=process.env.GENIE_OWNER_PASSWORD;
 if(typeof secret!=='string'||!secret||typeof attempt!=='string')return false;
 const a=Buffer.from(attempt),b=Buffer.from(secret);
 return a.length===b.length&&timingSafeEqual(a,b);
}
function dayKey() {
 const x=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/Phoenix',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(x=>[x.type,x.value]));
 return x.year+'-'+x.month+'-'+x.day;
}
export default async function handler(req,res) {
 res.setHeader('Cache-Control','private, no-store, max-age=0');
 res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='GET')return res.status(405).json({error:'method_not_allowed'});
 if(!authorized(req.headers['x-genie-owner']))return res.status(401).json({error:'unauthorized'});
 if(!process.env.BLOB_READ_WRITE_TOKEN)return res.status(503).json({error:'tracking_not_configured'});
 let cursor,all=0,pages=0;const days={};
 try{
  do{
   const result=await list({prefix:'traffic/',limit:1000,...(cursor?{cursor}:{})});
   for(const blob of result.blobs){const date=/^traffic\/(\d{4}-\d{2}-\d{2})\//.exec(blob.pathname)?.[1];if(date){days[date]=(days[date]||0)+1;all++;}}
   cursor=result.hasMore?result.cursor:undefined;pages++;
  }while(cursor&&pages<50);
  const today=dayKey();
  const recent=Object.entries(days).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,30).map(([date,visitors])=>({date,visitors}));
  return res.status(200).json({today,visitorsToday:days[today]||0,visitorsRecorded:all,days:recent,complete:!cursor,method:'Approximate visitors (one count per browser per Phoenix calendar day; bots and Do Not Track excluded).',since:'counter installation'});
 }catch(e){console.error('Owner traffic unavailable',e?.message);return res.status(503).json({error:'tracking_unavailable'});}
}
