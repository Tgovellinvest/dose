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
