// DOSE · gerador de posts para Instagram (1080×1350) com Playwright. Fontes locais, zero rede.
const { chromium } = require('playwright'); const fs=require('fs');
const OUT='/home/claude/insta/posts'; fs.mkdirSync(OUT,{recursive:true});
const F='/home/claude/assets/fonts';
const CSS=`
@font-face{font-family:'Archivo';font-weight:100 900;src:url(file://${F}/Archivo-normal.woff2) format('woff2')}
@font-face{font-family:'Archivo Narrow';font-weight:400 700;src:url(file://${F}/ArchivoNarrow-normal.woff2) format('woff2')}
@font-face{font-family:'Instrument Serif';font-style:normal;src:url(file://${F}/InstrumentSerif-normal.woff2) format('woff2')}
@font-face{font-family:'Instrument Serif';font-style:italic;src:url(file://${F}/InstrumentSerif-italic.woff2) format('woff2')}
:root{--g:#0F1012;--s1:#17181B;--s2:#1F2024;--ink:#F2F1EC;--bone:#D8D2C2;--mute:#8E8B84;--em:#E4572E;--ok:#6FAE8A;--warn:#D9A066}
*{box-sizing:border-box;margin:0}
html,body{width:1080px;height:1350px;background:var(--g);color:var(--ink);font-family:Archivo,sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased}
.sq body,.sq html{height:1080px}
.post{position:relative;width:1080px;height:1350px;padding:84px 84px 76px;display:flex;flex-direction:column}
.sq .post{height:1080px}
.wm{font-weight:900;font-size:44px;letter-spacing:-0.02em;line-height:1}.wm i{color:var(--em);font-style:normal}
.eyebrow{font-family:'Archivo Narrow';font-weight:700;letter-spacing:.18em;text-transform:uppercase;font-size:24px;color:var(--em)}
h1{font-weight:900;text-transform:uppercase;letter-spacing:-0.025em;line-height:.92}
.serif{font-family:'Instrument Serif';font-style:italic;color:var(--bone);line-height:1.15}
.foot{display:flex;justify-content:space-between;align-items:flex-end;color:var(--mute);font-family:'Archivo Narrow';font-size:24px;letter-spacing:.06em;text-transform:uppercase}
.grain{position:absolute;inset:0;pointer-events:none;background:radial-gradient(120% 80% at 80% 0%,rgba(228,87,46,.16),transparent 60%)}
.rule{height:6px;width:140px;background:var(--em);border-radius:3px}
/* phone */
.phone{position:relative;border-radius:58px;background:#000;padding:16px;box-shadow:0 60px 120px rgba(0,0,0,.6),0 0 0 2px #2a2b30 inset}
.phone img{display:block;width:100%;border-radius:44px}

.num{font-family:'Archivo Narrow';font-weight:700;letter-spacing:-0.02em}
.chip{display:inline-block;border:2px solid #2a2b30;border-radius:999px;padding:12px 24px;font-family:'Archivo Narrow';font-size:26px;letter-spacing:.04em;text-transform:uppercase;color:var(--bone)}
.chip.on{background:var(--ink);color:var(--g);border-color:var(--ink)}
`;
const head=(cls='')=>`<!doctype html><html class="${cls}"><head><meta charset="utf-8"><style>${CSS}</style></head><body>`;
const foot=(r='@dose.app')=>`<div class="foot"><span>${r}</span><span>tgovellinvest.github.io/dose</span></div>`;
const shot=n=>'data:image/png;base64,'+fs.readFileSync(`/home/claude/insta/shots/${n}.png`).toString('base64');

// ---------- POSICIONAMENTO ----------
const POS=[
 {id:'p01-dose-certa',html:`<div class="post"><div class="grain"></div><div class="wm">DOSE<i>.</i></div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:40px"><div class="rule"></div><h1 style="font-size:168px">A dose<br>certa.</h1>
  <p class="serif" style="font-size:52px;max-width:860px">O corpo responde ao estímulo certo, na quantidade certa, repetido por tempo suficiente.</p></div>
  <div class="eyebrow" style="margin-bottom:28px">Treino · nutrição · progresso — com fonte</div>${foot()}</div>`},
 {id:'p02-mais-nao-e-melhor',html:`<div class="post"><div class="grain"></div><div class="wm">DOSE<i>.</i></div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:44px"><h1 style="font-size:140px;color:var(--mute)">Mais não<br>é melhor.</h1><h1 style="font-size:140px">Melhor é<br><span style="color:var(--em)">melhor.</span></h1></div>
  <p class="serif" style="font-size:40px;margin-bottom:36px;max-width:900px">Volume acima do teto vira fadiga, não músculo. O DOSE avisa quando você passou do ponto.</p>${foot()}</div>`},
 {id:'p03-sem-outdoor',html:`<div class="post"><div class="grain"></div><div class="wm">DOSE<i>.</i></div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:28px">
   ${['Sem motivação de outdoor.','Sem culpa.','Sem feed.','Sem login obrigatório.'].map((t,i)=>`<h1 style="font-size:92px;color:${i===3?'var(--em)':'var(--ink)'}">${t}</h1>`).join('')}
   <p class="serif" style="font-size:44px;margin-top:40px;max-width:900px">Só a dose de hoje, registrada sem fricção, ajustada pela semana.</p></div>${foot()}</div>`},
 {id:'p04-com-fonte',html:`<div class="post"><div class="grain"></div><div class="wm">DOSE<i>.</i></div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:36px"><div class="eyebrow">Ciência, não achismo</div>
   <div style="display:flex;align-items:baseline;gap:24px"><span class="num" style="font-size:300px;line-height:.85">44</span><span style="font-size:48px;font-weight:700;line-height:1.05;max-width:420px">referências<br>lidas e<br>conferidas</span></div>
   <p class="serif" style="font-size:46px;max-width:900px">Cada regra do coach aponta para a fonte. Se não tem fonte, não entra no app.</p>
   <div style="display:flex;gap:16px;flex-wrap:wrap"><span class="chip">Hipertrofia</span><span class="chip">Nutrição</span><span class="chip">Recuperação</span><span class="chip">Esportes</span><span class="chip">Feminino</span></div></div>${foot()}</div>`},
 {id:'p05-gratis',html:`<div class="post"><div class="grain"></div><div class="wm">DOSE<i>.</i></div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:40px"><h1 style="font-size:150px">Grátis.<br>De verdade.</h1>
   <div style="display:grid;grid-template-columns:1fr 1fr;gap:22px 40px;font-size:36px;line-height:1.25;color:var(--bone)">
   ${['Funciona no navegador, sem loja','Instala na tela de início do celular','Seus dados ficam no seu aparelho','Conta só se você quiser sincronizar','Sem venda de dados. Nunca.','Feito por quem treina'].map(t=>`<div style="display:flex;gap:16px"><span style="color:var(--ok);font-weight:900">✓</span><span>${t}</span></div>`).join('')}</div></div>${foot()}</div>`},
 {id:'p06-como-funciona',html:`<div class="post"><div class="grain"></div><div class="wm">DOSE<i>.</i></div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:40px"><div class="eyebrow">O método</div><h1 style="font-size:120px">Revisar.<br>Treinar.<br>Registrar.<br>Ajustar.</h1>
   <p class="serif" style="font-size:44px;max-width:900px">Um sistema operacional para o seu treino: a semana fecha, o coach lê, a próxima começa ajustada.</p></div>${foot()}</div>`},
];

// ---------- FUNCIONALIDADES (print + texto) ----------
const FEAT=[
 {id:'f01-hoje',shot:'01-hoje',eyebrow:'Hoje',h:'A dose<br>de hoje.',p:'Um número de 0 a 100 com os motivos: sono, dor, carga da semana. Treinar ou descansar deixa de ser culpa e vira decisão.'},
 {id:'f02-treino-dose',shot:'02-treino',eyebrow:'Treino DOSE',h:'Montado<br>para você.',p:'Você diz objetivo, dias, equipamento e esportes. O Método DOSE monta o programa e a rotação — e refaz quando a vida muda.'},
 {id:'f03-sessao',shot:'03-sessao',eyebrow:'Sessão guiada',h:'Série por<br>série.',p:'Carga anterior já preenchida, RIR, timer que se adapta ao esforço e ficha do exercício com vídeo. Zero planilha.'},
 {id:'f04-nutricao',shot:'04-nutricao',eyebrow:'Nutrição',h:'Metas<br>que não<br>mentem.',p:'Calculadora conservadora: três fórmulas, a menor TMB, fator de atividade com desconto. Macros editáveis, proteína por refeição.'},
 {id:'f05-progresso',shot:'05d-progresso-graficos',eyebrow:'Progresso',h:'O que<br>mudou.',p:'Peso, cintura, sessões, volume por grupo versus o teto da ciência, cardio por tipo. Onze gráficos, nenhum enfeite.'},
 {id:'f06-medalhas',shot:'06-medalhas',eyebrow:'Medalhas',h:'Quem<br>aparece,<br>ganha.',p:'Nove famílias, três níveis. Ganha quem aparece — não quem posta.'},
 {id:'f07-calendario',shot:'07-calendario',eyebrow:'Calendário',h:'A semana<br>inteira.',p:'Musculação, esporte e cardio no mesmo mês. Deload marcado. Dias ativos contados.'},
 {id:'f08-esportes',shot:'08-esportes',eyebrow:'Esportes',h:'Força para<br>o seu jogo.',p:'Jiu-Jitsu, corrida, Hyrox, boxe, futebol, natação, CrossFit, bike, tênis, vôlei: o que cada um exige, o que a ciência sustenta e como encaixar sem roubar da musculação.'},
 {id:'f09-ciencia',shot:'10-ciencia',eyebrow:'Ciência',h:'Toda regra<br>com fonte.',p:'Autor, periódico, ano, link e o que isso vira dentro do app. "Verificado" só depois de conferido.'},
 {id:'f10-peso',shot:'12-peso',eyebrow:'Peso',h:'Tendência,<br>não o dia.',p:'Média móvel de 7 dias, ajuste semanal sugerido pelo coach — uma variável de cada vez.'},
 {id:'f11-conta',shot:'13-conta',eyebrow:'Conta e apps',h:'Seus dados,<br>com você.',p:'Conta opcional sincroniza celular e computador. Strava e Saúde do iPhone entram; nada sai.'},
 {id:'f12-onboard',shot:'15-onboard-esportes',eyebrow:'Começar',h:'Dois<br>minutos.',p:'Quem você é, aonde quer chegar, sua semana. O DOSE monta treino e metas na hora.'},
];
const featHTML=f=>`<div class="post"><div class="grain"></div>
 <div style="display:flex;justify-content:space-between;align-items:flex-start"><div class="wm">DOSE<i>.</i></div><div class="eyebrow" style="margin-top:12px">${f.eyebrow}</div></div>
 <div style="flex:1;display:grid;grid-template-columns:minmax(0,1fr) 400px;gap:40px;align-items:center;margin-top:30px">
  <div style="display:flex;flex-direction:column;gap:34px"><h1 style="font-size:78px">${f.h}</h1><p class="serif" style="font-size:36px">${f.p}</p></div>
  <div class="phone"><img src="${shot(f.shot)}"></div></div>
 <div style="margin-top:28px">${foot()}</div></div>`;

// ---------- AVATAR + CAPAS DE DESTAQUE (1080×1080) ----------
const SQ=[
 {id:'avatar',html:`<div class="post" style="align-items:center;justify-content:center;padding:0"><div class="grain"></div><div class="wm" style="font-size:300px">DOSE<i>.</i></div></div>`},
 ...['Treino','Nutrição','Progresso','Esportes','Ciência','Como usar'].map(t=>({id:'capa-'+t.normalize('NFD').replace(/[^a-zA-Z ]/g,'').toLowerCase().replace(' ','-'),html:`<div class="post" style="align-items:center;justify-content:center;padding:0;gap:30px"><div class="grain"></div><div class="rule"></div><h1 style="font-size:150px;text-align:center">${t}</h1><div class="eyebrow" style="font-size:30px">DOSE</div></div>`})),
];

(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1080,height:1350},deviceScaleFactor:1});
 for(const it of POS){ await pg.setContent(head()+it.html+'</body></html>'); await pg.waitForTimeout(150); await pg.screenshot({path:`${OUT}/${it.id}.png`}); console.log('✓',it.id); }
 for(const f of FEAT){ await pg.setContent(head()+featHTML(f)+'</body></html>'); await pg.waitForTimeout(250); await pg.screenshot({path:`${OUT}/${f.id}.png`}); console.log('✓',f.id); }
 await pg.setViewportSize({width:1080,height:1080});
 for(const it of SQ){ await pg.setContent(head('sq')+it.html+'</body></html>'); await pg.waitForTimeout(150); await pg.screenshot({path:`${OUT}/${it.id}.png`}); console.log('✓',it.id); }
 await b.close(); })();
