/* Genie of Benefits accessible reading controls — browser-local preferences. */
(()=>{'use strict';
const root=document.documentElement,key='genie-reading-preferences-v1';
let prefs={large:false,contrast:false,calm:false};
try{const value=JSON.parse(localStorage.getItem(key)||'{}');if(value&&typeof value==='object')prefs={large:!!value.large,contrast:!!value.contrast,calm:!!value.calm}}catch(_){}
const style=document.createElement('style');style.textContent=`
html.genie-large{font-size:120%!important}
html.genie-large body{font-size:1.1rem!important;line-height:1.75!important}
html.genie-contrast{background:#fff!important;color:#000!important}
html.genie-contrast body,html.genie-contrast main,html.genie-contrast .panel,html.genie-contrast .card{background:#fff!important;color:#000!important;box-shadow:none!important}
html.genie-contrast .muted,html.genie-contrast p,html.genie-contrast h1,html.genie-contrast h2,html.genie-contrast h3{color:#111!important;text-shadow:none!important}
html.genie-contrast .hero{background:#fff!important;border:2px solid #000!important;color:#000!important}
html.genie-contrast .hero *{color:#000!important}
html.genie-contrast a:not(.btn){color:#003c98!important;text-decoration:underline!important}
html.genie-contrast header a,html.genie-contrast footer a{color:#fff!important}
html.genie-calm *,html.genie-calm *::before,html.genie-calm *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}
.genie-accessible-tools{display:flex;gap:7px;align-items:center;flex-wrap:wrap;font:14px/1.3 system-ui;color:#fff}
.genie-accessible-tools button{font:700 13px/1.25 system-ui;letter-spacing:0;border:2px solid #e9e4c8;border-radius:9px;background:#fff;color:#152e4a;padding:9px 11px;margin:2px;min-height:40px;cursor:pointer;white-space:normal}
.genie-accessible-tools button[aria-pressed=true]{background:#ffe091;border-color:#ffe091;color:#101e39}
.genie-accessible-tools button:focus-visible{outline:3px solid #ffdf89;outline-offset:3px}
@media(max-width:700px){.genie-accessible-tools{width:100%;justify-content:center}}
`;document.head.appendChild(style);
function apply(){root.classList.toggle('genie-large',prefs.large);root.classList.toggle('genie-contrast',prefs.contrast);root.classList.toggle('genie-calm',prefs.calm);for(const [k,btn]of Object.entries(buttons))btn.setAttribute('aria-pressed',String(prefs[k]))}
const buttons={};
function mount(){const head=document.querySelector('header');if(!head)return;const bar=document.createElement('div');bar.className='genie-accessible-tools';bar.setAttribute('role','group');bar.setAttribute('aria-label','Reading and accessibility preferences');
[['large','A+ Text'],['contrast','High contrast'],['calm','Pause motion']].forEach(([k,label])=>{const btn=document.createElement('button');btn.type='button';btn.textContent=label;btn.setAttribute('aria-label',label);btn.addEventListener('click',()=>{prefs[k]=!prefs[k];try{localStorage.setItem(key,JSON.stringify(prefs))}catch(_){}apply()});buttons[k]=btn;bar.append(btn)});head.append(bar);apply()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();