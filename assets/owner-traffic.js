/* Owner-only traffic access. Server checks an environment-stored password; never put the secret here. */
(function(){
  if(!/^(genieofbenefits\.com|www\.genieofbenefits\.com|benefitbeyond\.vercel\.app)$/.test(location.hostname))return;
  if(!/\/api\//.test(location.pathname))fetch('/api/visit',{method:'POST',credentials:'same-origin',keepalive:true}).catch(()=>{});
  const secret=new URLSearchParams(location.hash.slice(1)).get('owner'); if(!secret)return;
  const panel=document.createElement('section');
  panel.id='genie-owner-traffic';panel.setAttribute('aria-label','Private owner visitor dashboard');
  Object.assign(panel.style,{position:'fixed',right:'12px',bottom:'12px',zIndex:'999999',width:'min(340px,calc(100vw - 24px))',maxHeight:'80vh',overflow:'auto',background:'#101a42',color:'#fff',padding:'18px',borderRadius:'18px',boxShadow:'0 12px 45px #0007',font:'15px/1.5 system-ui'});
  panel.innerHTML='<strong style="font-size:18px">🔒 Owner visitor counter</strong><p style="margin:8px 0">Private totals, available only after owner authentication.</p><label style="display:block">Owner password<input type="password" autocomplete="off" style="display:block;width:100%;padding:10px;border-radius:8px;margin-top:6px;color:#111;background:white"></label><button type="button" style="margin-top:10px;padding:10px 14px;border:0;border-radius:9px;background:#ffcf5b;color:#16203e;font-weight:750">View counts</button><p data-status role="status" style="margin-top:12px"></p><button data-close type="button" aria-label="Close private counter" style="position:absolute;top:8px;right:8px;background:transparent;color:white;border:0;font-size:20px">×</button>';
  document.body.append(panel);
  const field=panel.querySelector('input'),status=panel.querySelector('[data-status]'),button=panel.querySelector('button:not([data-close])');
  panel.querySelector('[data-close]').onclick=()=>panel.remove();
  field.onkeydown=e=>{if(e.key==='Enter')button.click();};
  button.onclick=async()=>{
   status.textContent='Checking…';
   try{
    const r=await fetch('/api/visitors',{headers:{'x-genie-owner':field.value},cache:'no-store'});
    field.value='';const data=await r.json();
    if(!r.ok){status.textContent=r.status===401?'Incorrect password.':'Counter unavailable; check deployment setup.';return;}
    status.replaceChildren();
    const line=document.createElement('p');line.textContent='Today: '+data.visitorsToday+' • Recorded since launch: '+data.visitorsRecorded;status.append(line);
    const desc=document.createElement('small');desc.textContent=data.method+(data.complete?'':' Partial historical count (large dataset).');status.append(desc);
    const details=document.createElement('details');const summary=document.createElement('summary');summary.textContent='Daily breakdown';details.append(summary);
    (data.days||[]).slice(0,14).forEach(x=>{const row=document.createElement('div');row.textContent=x.date+': '+x.visitors;details.append(row);});status.append(details);
   }catch(e){field.value='';status.textContent='Cannot reach the private counter right now.';}
  };
})();
