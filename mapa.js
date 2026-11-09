// ================= DOSE · v7.6 — Pontos de treino do Rio no mapa (aprovado no DOSE Studio em 09/11/2026) =================
// Mapa inclinado com prédios em grafite, sem brilho, laranja só nos pontos (exceção ao 3D aprovada pelo Tiago em 09/11).
// Mapa grátis: MapLibre + OpenFreeMap (sem chave; crédito ao OpenStreetMap). A biblioteca só carrega quando a tela abre.
// Comentário do Tiago no Studio: sem horário sugerido; mostrar se está aberto ou fechado agora, como no Google.
// Horários: Parque Nacional da Tijuca 08:00-17:00 (OpenStreetMap); praias, orla, Lagoa e Aterro são áreas públicas sem horário de fechamento.
(function(){
const V=window.VIEWS, A=window.AFTER;
const reduz=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const PONTOS=window.DOSE_PONTOS=[
 {id:'aterro',nome:'Aterro do Flamengo',m:'7,6 km · plano · sombra',d:'Do MAM ao Monumento Estácio de Sá, com vista do Pão de Açúcar.',c:[-43.17283,-22.91400],h:'24h',hf:'área pública'},
 {id:'lagoa',nome:'Lagoa Rodrigo de Freitas',m:'quase 8 km · plano',d:'Volta completa. Encontro no Parque dos Patins.',c:[-43.21664,-22.97124],h:'24h',hf:'área pública'},
 {id:'orla',nome:'Orla do Leme ao Leblon',m:'9 km · beira-mar',d:'Brisa do mar e mergulho no fim. Encontro no Leme.',c:[-43.16986,-22.96445],h:'24h',hf:'área pública'},
 {id:'paineiras',nome:'Paineiras',m:'8 km · subida',d:'Dentro do Parque Nacional da Tijuca, mistura subida e trecho leve.',c:[-43.21743,-22.94660],h:'08:00-17:00',hf:'Parque Nacional da Tijuca, OpenStreetMap'},
 {id:'chinesa',nome:'Vista Chinesa',m:'subida forte',d:'Subida pela floresta até o mirante.',c:[-43.24947,-22.97326],h:'08:00-17:00',hf:'Parque Nacional da Tijuca, OpenStreetMap'},
 {id:'quinta',nome:'Quinta da Boa Vista',m:'cerca de 3,5 km · terra e grama',d:'Lagos e palmeiras. Bom para quem está começando.',c:[-43.22631,-22.90547],h:null,hf:null},
 {id:'grumari',nome:'Grumari ao Pontal',m:'8 km · beira-mar',d:'Longão de fim de semana com mar no fim.',c:[-43.53419,-23.05015],h:'24h',hf:'área pública'}
];
// ---------- aberto ou fechado agora (hora do Rio) ----------
function agoraRio(){ try{ const p=new Intl.DateTimeFormat('en-GB',{timeZone:'America/Sao_Paulo',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date()); const g=t=>+(p.find(x=>x.type===t)||{}).value; return g('hour')*60+g('minute'); }catch(e){ const d=new Date(); return d.getHours()*60+d.getMinutes(); } }
const hm=s=>{ const [a,b]=s.split(':').map(Number); return a*60+b; };
const fmtH=m=>{ const h=Math.floor(m/60), mi=m%60; return mi?`${h}h${String(mi).padStart(2,'0')}`:`${h}h`; };
window.statusHorario=function(h){ if(!h) return {cls:'nd',txt:'Horário não informado'}; if(h==='24h') return {cls:'ab',txt:'Aberto 24 horas'};
  const m=h.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/); if(!m) return {cls:'nd',txt:'Horário não informado'}; const ab=hm(m[1]), fe=hm(m[2]), n=agoraRio();
  return n>=ab&&n<fe?{cls:'ab',txt:`Aberto · fecha às ${fmtH(fe)}`}:{cls:'fe',txt:`Fechado · abre às ${fmtH(ab)}`}; };
const comoChegar=p=>`https://www.google.com/maps/dir/?api=1&destination=${p.c[1]},${p.c[0]}`;

// ---------- tela ----------
V.comunidade_mapa=()=>{ setTitle('Pontos de treino'); const st=p=>window.statusHorario(p.h);
  return `<div class="mp4"><div id="mp4mapa" class="mp4-mapa" aria-label="Mapa dos pontos de treino no Rio"></div><div class="mp4-aviso" id="mp4aviso">Carregando o mapa…</div>
   <div class="mp4-topo"><button class="btn sm ghost" style="width:auto" onclick="go('comunidade')">‹ Comunidade</button><div class="eyebrow">Comunidade DOSE · Rio</div><h1>Pontos de<br>treino<i>.</i></h1></div>
   <div class="mp4-lista"><div class="mp4-trilho" id="mp4tri">${PONTOS.map((p,i)=>{ const s=st(p); return `<div class="mp4-cartao" data-i="${i}" tabindex="0" role="button" aria-label="${esc(p.nome)}"><b>${esc(p.nome)}</b><div class="m">${esc(p.m)}</div><p>${esc(p.d)}</p><div class="mp4-st ${s.cls}"><i></i>${s.txt}</div>${p.hf?`<div class="tiny">Fonte do horário: ${esc(p.hf)}</div>`:''}<a class="lk" href="${comoChegar(p)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">Como chegar ›</a></div>`; }).join('')}</div></div></div>`; };

let lib=null, mapa=null;
function carregar(){ if(window.maplibregl) return Promise.resolve(window.maplibregl); if(lib) return lib;
  // Plano B: cópia da biblioteca no próprio site (vendor/); a CDN só entra se a cópia falhar.
  const tenta=(js,css)=>new Promise((ok,erro)=>{ const l=document.createElement('link'); l.rel='stylesheet'; l.href=css; document.head.appendChild(l);
    const s=document.createElement('script'); s.src=js; s.onload=()=>window.maplibregl?ok(window.maplibregl):erro(new Error('vazio')); s.onerror=()=>erro(new Error('falhou')); document.head.appendChild(s); });
  lib=tenta('vendor/maplibre-gl-4.7.1.js','vendor/maplibre-gl-4.7.1.css').catch(()=>tenta('https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.js','https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.css')).catch(e=>{ lib=null; throw e; }); return lib; }
function pintar(map){ const st=map.getStyle(); st.layers.forEach(l=>{ const id=l.id, t=l.type; try{
  if(t==='background') map.setPaintProperty(id,'background-color','#0F1012');
  else if(t==='fill'&&/water/.test(id)) map.setPaintProperty(id,'fill-color','#17181B');
  else if(t==='fill'&&/park|wood|grass|landcover|landuse/.test(id)) map.setPaintProperty(id,'fill-color','#14161A');
  else if(t==='fill') map.setPaintProperty(id,'fill-color','#121316');
  else if(t==='line'&&/water|river/.test(id)) map.setPaintProperty(id,'line-color','#17181B');
  else if(t==='line'&&/boundary|admin/.test(id)) map.setLayoutProperty(id,'visibility','none');
  else if(t==='line') map.setPaintProperty(id,'line-color','#272A2F');
  else if(t==='symbol'){ if(/poi|housenum|transit|aeroway|shield/.test(id)||(l.layout&&l.layout['icon-image'])) map.setLayoutProperty(id,'visibility','none'); else { map.setPaintProperty(id,'text-color','#73767B'); map.setPaintProperty(id,'text-halo-color','#0F1012'); if(l.layout&&l.layout['text-field']) map.setLayoutProperty(id,'text-field',['coalesce',['get','name:pt'],['get','name']]); } }
  else if(t==='fill-extrusion') map.removeLayer(id);
 }catch(e){} });
 const src=Object.keys(st.sources).find(k=>st.sources[k].type==='vector');
 if(src) map.addLayer({id:'predios-dose',type:'fill-extrusion',source:src,'source-layer':'building',minzoom:13,paint:{'fill-extrusion-color':'#1E2024','fill-extrusion-height':['coalesce',['get','render_height'],8],'fill-extrusion-base':['coalesce',['get','render_min_height'],0],'fill-extrusion-opacity':.92}}); }
function ir(i){ const p=PONTOS[i]; document.querySelectorAll('.mp4-cartao').forEach(c=>c.classList.toggle('ativo',+c.dataset.i===i));
  const c=document.querySelector(`.mp4-cartao[data-i="${i}"]`); if(c) c.scrollIntoView({behavior:reduz()?'auto':'smooth',inline:'start',block:'nearest'});
  if(mapa) mapa.flyTo({center:p.c,zoom:14.6,pitch:60,bearing:-30,duration:reduz()?0:1800,essential:true}); }
A.comunidade_mapa=()=>{ if(mapa){ try{ mapa.remove(); }catch(e){} mapa=null; }
  const tri=document.getElementById('mp4tri'); if(tri){ tri.addEventListener('click',e=>{ const c=e.target.closest('.mp4-cartao'); if(c) ir(+c.dataset.i); }); tri.addEventListener('keydown',e=>{ if(e.key==='Enter'){ const c=e.target.closest('.mp4-cartao'); if(c) ir(+c.dataset.i); } }); }
  carregar().then(ml=>{ const el=document.getElementById('mp4mapa'); if(!el) return;
    mapa=new ml.Map({container:el,style:'https://tiles.openfreemap.org/styles/positron',center:[-43.30,-22.97],zoom:10,attributionControl:{compact:true}});
    mapa.on('load',()=>{ const av=document.getElementById('mp4aviso'); if(av) av.remove(); pintar(mapa);
      const mk=PONTOS.map((p,i)=>{ const d=document.createElement('div'); d.className='mp4-pt'; d.title=p.nome; d.onclick=()=>ir(i); new ml.Marker({element:d}).setLngLat(p.c).addTo(mapa); return d; });
      const cair=()=>mk.forEach((d,i)=>setTimeout(()=>d.classList.add('on'),reduz()?0:250+i*140));
      if(reduz()){ mapa.jumpTo({center:[-43.215,-22.955],zoom:11.7,pitch:50,bearing:-18}); cair(); }
      else { mapa.flyTo({center:[-43.215,-22.955],zoom:11.7,pitch:55,bearing:-18,duration:2600,essential:true}); mapa.once('moveend',cair); } });
  }).catch(()=>{ const av=document.getElementById('mp4aviso'); if(av) av.textContent='Sem internet para abrir o mapa agora. Os pontos estão na lista abaixo.'; }); };

// ---------- entrada na aba Comunidade ----------
const _c=V.comunidade; V.comunidade=(p)=>{ const h=_c(p); const abertos=PONTOS.filter(x=>window.statusHorario(x.h).cls==='ab').length;
  const card=`<button class="card mp4-entra" onclick="go('comunidade_mapa')"><div><div class="eyebrow" style="text-align:left">Rio de Janeiro</div><b>Pontos de treino</b><span class="tiny">${PONTOS.length} pontos · ${abertos} abertos agora</span></div><span class="mp4-mini" aria-hidden="true">${PONTOS.map(()=>'<i></i>').join('')}</span></button>`;
  const i=h.indexOf('</h1>'); return i>=0?h.slice(0,i+5)+card+h.slice(i+5):card+h; };
})();
