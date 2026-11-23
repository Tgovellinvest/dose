// Simulações do modelo de estimativa por foto do prato (DOSE v8.21).
// ATENÇÃO: o erro por porção é uma SUPOSIÇÃO (MAE de 25% a 35%, da revisão consultada em 23/11/2026).
// Estas simulações testam o método (faixa, calibração, ordem de gargalos), não medem pessoas reais.
// Uso: node tools/sim_foto.js
let s=20261123; const rnd=()=>{ s=(s*1664525+1013904223)%4294967296; return s/4294967296; };
const nrm=()=>{ let u=0; while(!u)u=rnd(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*rnd()); };
const SD=mae=>mae*Math.sqrt(Math.PI/2);              // desvio de uma normal com erro médio absoluto = mae
const pct=x=>(100*x).toFixed(1)+'%';
const N=100000;
const prato=()=>{ const n=2+Math.floor(rnd()*4); return Array.from({length:n},()=>80+rnd()*320); }; // kcal por item

// S1. Cobertura da faixa linear conforme a faixa e a correlação do erro entre itens
console.log('\nS1. Cobertura da faixa (valor real dentro da faixa), erro por item MAE 30%');
for(const rho of [0,0.5,1]){ const sd=SD(0.30); const row={};
  for(const b of [0.25,0.35,0.45]){ let c=0; for(let t=0;t<N;t++){ const p=prato(), cm=nrm(); let est=0,real=0; p.forEach(k=>{ est+=k; real+=k*Math.max(0.1,1+sd*(Math.sqrt(rho)*cm+Math.sqrt(1-rho)*nrm())); }); if(real>=est*(1-b)&&real<=est*(1+b)) c++; } row['±'+b*100+'%']=pct(c/N); }
  console.log(' correlação',rho,JSON.stringify(row)); }

// S2. Gargalo: quanto cada item pesado reduz o erro do total (pesar o MAIOR item x um item qualquer)
console.log('\nS2. Erro médio do total (MAE 30%, correlação 0): nada pesado, pesando o maior item, pesando um qualquer');
{ const sd=SD(0.30); const acc={nenhum:0,maior:0,qualquer:0}; let n0=0;
  for(let t=0;t<N;t++){ const p=prato(); const err=p.map(k=>k*sd*nrm()); const tot=p.reduce((a,b)=>a+b,0);
    const soma=(skip)=>Math.abs(err.reduce((a,e,i)=>a+(i===skip?0:e),0))/tot;
    const imax=p.indexOf(Math.max(...p)); acc.nenhum+=soma(-1); acc.maior+=soma(imax); acc.qualquer+=soma(Math.floor(rnd()*p.length)); n0++; }
  console.log(' ',Object.fromEntries(Object.entries(acc).map(([k,v])=>[k,pct(v/n0)]))); }

// S3. Calibração pessoal: a pessoa pesa itens que antes estimou a olho; o app aprende viés e dispersão.
// Regra v8.21: precisa de n >= 8 pares; só corrige o viés se ele for significativo (|ln mediana| > 1,96 * dp / raiz(n)),
// com correção limitada a [0,7; 1,3]; a faixa só estreita (1,28 * dp, entre 20% e 35%) a partir de n >= 20.
console.log('\nS3. Calibração pessoal (viés b, MAE 25%): itens novos, SEM calibração x COM a regra v8.21');
{ const med=a=>{ const x=[...a].sort((p,q)=>p-q); return x[Math.floor(x.length/2)]; };
  for(const b of [0.75,1,1.25]) for(const n of [0,4,8,16,30]){ const sd=SD(0.25); let cSem=0,cCom=0,wCom=0,eSem=0,eCom=0; const T=20000;
    for(let t=0;t<T;t++){ const razoes=Array.from({length:n},()=>Math.max(0.1,b*(1+sd*nrm())));
      let bias=1,band=0.35; if(n>=8){ const lr=razoes.map(Math.log); const m=lr.reduce((a,x)=>a+x,0)/n; const dp=Math.sqrt(lr.reduce((a,x)=>a+(x-m)*(x-m),0)/(n-1));
        const md=med(razoes); if(Math.abs(Math.log(md))>1.96*dp/Math.sqrt(n)) bias=Math.min(1.3,Math.max(0.7,md)); if(n>=20) band=Math.min(0.35,Math.max(0.20,1.28*dp)); }
      const k=200, real=k*Math.max(0.1,b*(1+sd*nrm()));
      if(Math.abs(real-k)<=0.35*k) cSem++; if(Math.abs(real-k*bias)<=band*k*bias) cCom++; wCom+=band; eSem+=Math.abs(real-k)/real; eCom+=Math.abs(real-k*bias)/real; }
    console.log(` viés ${b} n=${String(n).padStart(2)}  sem: cobre ${pct(cSem/T)} erro ${pct(eSem/T)} faixa ±35%  | com: cobre ${pct(cCom/T)} erro ${pct(eCom/T)} faixa ±${pct(wCom/T)}`); } }

// S4. Calorias que a foto não mostra (óleo, azeite, manteiga, molho). Valores da base: azeite 1 colher sopa = 72 kcal.
console.log('\nS4. Óleo/azeite/molho fora do prato: viés do total sem lembrete e com lembrete (adesão ao lembrete 50%)');
{ for(const prev of [0.2,0.4,0.6]){ let vSem=0,vCom=0; const T=N; for(let t=0;t<T;t++){ const p=prato(); const tot=p.reduce((a,b)=>a+b,0); const colheres=rnd()<prev?(1+Math.floor(rnd()*2)):0; const inv=colheres*72;
      vSem+=-inv/(tot+inv); const lembrou=rnd()<0.5; vCom+=-(lembrou?0:inv)/(tot+inv); }
    console.log(` presença do óleo em ${pct(prev)} dos pratos: subestimativa média sem lembrete ${pct(vSem/T)}, com lembrete ${pct(vCom/T)}`); } }

// S5. Como combinar as faixas dos itens: soma linear (conservadora) x raiz da soma dos quadrados
console.log('\nS5. Soma linear x raiz-soma-quadrados, faixa 35% por item, MAE 30%');
for(const rho of [0,0.5,1]){ const sd=SD(0.30); let cL=0,cQ=0,wL=0,wQ=0; for(let t=0;t<N;t++){ const p=prato(), cm=nrm(); let est=0,real=0,q=0; p.forEach(k=>{ est+=k; q+=(0.35*k)**2; real+=k*Math.max(0.1,1+sd*(Math.sqrt(rho)*cm+Math.sqrt(1-rho)*nrm())); });
    const l=0.35*est, r=Math.sqrt(q); if(Math.abs(real-est)<=l) cL++; if(Math.abs(real-est)<=r) cQ++; wL+=l/est; wQ+=r/est; }
  console.log(' correlação',rho,'linear: cobre',pct(cL/N),'faixa ±'+pct(wL/N),'| RSS: cobre',pct(cQ/N),'faixa ±'+pct(wQ/N)); }

// S6. Dia inteiro: erro do total do dia por estratégia (3 a 5 refeições, erro independente entre refeições)
// Estratégias: olho (MAE 30%, suposto), modelo Nutrition5k só RGB (MAE 26,1% das kcal do prato), modelo com volume (16,5%),
// pesar o maior item de cada prato (olho nos demais). Números do Nutrition5k: arXiv 2103.03375, pratos de refeitório, um único cenário.
console.log('\nS6. Erro médio do TOTAL DO DIA e chance de ficar dentro de ±10% (critério do estudo ACETADA)');
{ const estr={ 'a olho (30%)':{mae:0.30}, 'modelo só RGB (26,1%)':{mae:0.261}, 'modelo com volume (16,5%)':{mae:0.165}, 'a olho + pesar o maior item':{mae:0.30,pesaMaior:true} };
  for(const [nome,{mae,pesaMaior}] of Object.entries(estr)){ const sd=SD(mae); let e=0,dentro=0; const T=60000;
    for(let t=0;t<T;t++){ const refs=3+Math.floor(rnd()*3); let est=0,real=0; for(let r=0;r<refs;r++){ const p=prato(); const imax=p.indexOf(Math.max(...p));
        p.forEach((k,i)=>{ est+=k; real+=(pesaMaior&&i===imax)?k:k*Math.max(0.1,1+sd*nrm()); }); }
      const er=Math.abs(real-est)/est; e+=er; if(er<=0.10) dentro++; }
    console.log(' ',nome.padEnd(32),'erro médio do dia',pct(e/T),'| dentro de ±10%:',pct(dentro/T)); } }

// S7. Quanto tempo até a calibração ligar: quem pesa W itens por semana (estimando a olho antes) chega a 8 pesagens em quantas semanas
console.log('\nS7. Semanas até 8 pesagens (chegada de pesagens como Poisson, W por semana)');
{ const pois=l=>{ let L=Math.exp(-l),k=0,p=1; do{ k++; p*=rnd(); }while(p>L); return k-1; };
  for(const W of [1,2,4,7]){ const T=20000; const sem=[]; for(let t=0;t<T;t++){ let n=0,w=0; while(n<8&&w<52){ n+=pois(W); w++; } sem.push(w); } sem.sort((a,b)=>a-b);
    console.log(`  ${W} pesagens/semana: mediana ${sem[T>>1]} sem., 90% chegam em até ${sem[Math.floor(T*0.9)]} sem.`); } }

// S8. Robustez: e se o viés depende do tamanho da porção (hipótese: quem estima a olho erra mais nas porções grandes)?
// Comparação: calibração global (v8.21) com viés crescente com o tamanho. Itens de 50 a 400 kcal; viés = 1 + 0,0007*(kcal-200).
console.log('\nS8. Viés que cresce com a porção (hipótese): calibração global ajuda ou atrapalha?');
{ const med=a=>{ const x=[...a].sort((p,q)=>p-q); return x[Math.floor(x.length/2)]; }; const sd=SD(0.25); const T=20000;
  for(const slope of [0,0.0007,0.0015]) for(const n of [12,30]){ let eS=0,eC=0,eGrandeS=0,eGrandeC=0,nG=0;
    for(let t=0;t<T;t++){ const bv=k=>Math.max(0.3,1+slope*(k-200));
      const razoes=Array.from({length:n},()=>{ const k=50+rnd()*350; return Math.max(0.1,bv(k)*(1+sd*nrm())); });
      const lr=razoes.map(Math.log), m=lr.reduce((a,x)=>a+x,0)/n, dp=Math.sqrt(lr.reduce((a,x)=>a+(x-m)*(x-m),0)/(n-1)); const md=med(razoes);
      const bias=Math.abs(Math.log(md))>1.96*dp/Math.sqrt(n)?Math.min(1.3,Math.max(0.7,md)):1;
      const k=50+rnd()*350, real=k*Math.max(0.1,bv(k)*(1+sd*nrm()));
      const a=Math.abs(real-k)/real, c=Math.abs(real-k*bias)/real; eS+=a; eC+=c; if(k>300){ eGrandeS+=a; eGrandeC+=c; nG++; } }
    console.log(`  inclinação ${slope} n=${n}: erro geral sem ${pct(eS/T)} com ${pct(eC/T)} | porções >300 kcal sem ${pct(eGrandeS/nG)} com ${pct(eGrandeC/nG)}`); } }

// S9. Semana inteira com viés de dia a dia (mesma pessoa tende a errar para o mesmo lado): quanto do erro sobra na média da semana
console.log('\nS9. Erro da média semanal (7 dias, 3 refeições/dia, MAE 30% por item) conforme o viés comum entre dias');
{ const sd=SD(0.30); for(const rhoDia of [0,0.3,0.6,1]){ let e=0; const T=20000; for(let t=0;t<T;t++){ const sem=nrm(); let est=0,real=0;
    for(let d=0;d<7;d++){ const dia=nrm(); for(let r=0;r<3;r++){ const p=prato(); p.forEach(k=>{ const z=Math.sqrt(rhoDia)*sem+Math.sqrt(1-rhoDia)*(0.5*dia+Math.sqrt(0.75)*nrm()); est+=k; real+=k*Math.max(0.1,1+sd*z); }); } }
    e+=Math.abs(real-est)/est; }
    console.log(`  viés comum entre dias ${rhoDia}: erro médio da semana ${pct(e/T)}`); } }

// Nota sobre S8 (teste extra, não incluído acima): calibrar em dois grupos (porção pequena e grande) não resolveu.
// Com viés que cresce com o tamanho, a calibração global custa de 0,7 a 1,5 ponto de erro e a em dois grupos custa um pouco mais.
// Conclusão: a calibração é uma aposta em viés constante; o custo quando a aposta falha é pequeno, então foi mantida simples.
