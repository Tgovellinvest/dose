// DOSE · monta design-system/components.html com HTML real capturado do Overview aprovado.
// Uso: node tools/ds_components.js   (precisa do Playwright instalado e de tools/ds_build.py já rodado)
const {chromium,devices}=require('playwright'); const fs=require('fs'); const path=require('path');
const DS=path.join(__dirname,'..','design-system');
(async()=>{const b=await chromium.launch();try{const c=await b.newContext({...devices['iPhone 15 Pro Max'],timezoneId:'America/Sao_Paulo'});const p=await c.newPage();
await p.goto('file://'+path.join(DS,'overview.html'));await p.waitForTimeout(1500);
const S={};
const cap=async(scr,pa,map)=>{ await p.evaluate(([s,a])=>go(s,a||{}),[scr,pa]); await p.waitForTimeout(1300);
  for(const [k,sel] of Object.entries(map)) S[k]=await p.evaluate(sel=>{ const e=document.querySelector(sel); return e?e.outerHTML:''; },sel); };
await cap('hoje',null,{top:'.top',tabbar:'.tabbar',nadose:'.view .hero4.nadose',heroTreino:'.view > .ficha4',sres:'.view > .sem4-res',quick:'.view > .quick',semana:'.view > .semana4',corpo:'.view .card:has(.corpos)'});
await cap('treino',null,{seg:'.view > .seg',fichas:'.view > .fichas',ltiles:'.view > .ltiles'});
await cap('progresso',null,{coach:'.view > p.serif.coach',grid3:'.view > .grid3'});
await cap('comunidade',null,{meuhero:'.view > .card.hero.meuhero',hscroll:'.view .hscroll'});
await cap('esportes',{id:'corrida'},{evol:'.view .barras'});
await cap('mais',null,{maisList:'.view > .list'});
await cap('meuperfil',null,{perfilCard:'.view > .card:nth-of-type(2)'});
await p.evaluate(()=>sheet('<h2>Título do sheet</h2><p class="small">Texto de apoio do sheet.</p><label>Campo</label><input placeholder="Digite"><div class="chips" style="margin-top:8px"><button class="chip on">Ativo</button><button class="chip">Inativo</button></div><button class="btn em" style="margin-top:10px">Ação principal</button>')); await p.waitForTimeout(500);
S.sheet=await p.evaluate(()=>{ const e=document.querySelector('#sheet'); return e?e.outerHTML:''; });
const limpa=h=>h.replace(/\s(on[a-z]+)="[^"]*"/g,'').replace(/\sid="[^"]*"/g,'');
S.top=S.top.replace('class="top"','class="top demo"'); S.tabbar=S.tabbar.replace('class="tabbar"','class="tabbar demo"'); S.sheet=S.sheet.replace('class="sheet"','class="sheet nav-sheet"');
let html=fs.readFileSync(path.join(DS,'components.template.html'),'utf8');
html=html.replace(/\{\{(\w+)\}\}/g,(m,k)=>`<div class="view">${limpa(S[k]||'')}</div>`);
fs.writeFileSync(path.join(DS,'components.html'),html); console.log('components.html',html.length, Object.entries(S).filter(([k,v])=>!v).map(([k])=>k).join(',')||'tudo capturado');
}finally{await b.close();}})();
