// DOSE · Nema Padaria. Fonte: FatSecret Brasil, marca NEMA (fatsecret.com.br/calorias-nutrição/nema), consultado em 27/10/2026.
// Valores por porção como aparecem lá (tabela da marca). Itens sem tabela publicada (sonho, croque, brioche) ficam de fora até ter fonte.
(function(){ const C="Padaria · Nema", Lj="Nema"; const L=[
 ["Pão de queijo canastra (Nema)","1 unid (20 g)",58,1,6.4,3],
 ["Pão de queijo canastra 100 g (Nema)","100 g",282,5,32,15],
 ["Pão sourdough clássico (Nema)","2 fatias (50 g)",141,5,29,0.5],
 ["Pão multigrãos (Nema)","50 g",149,4.9,29,1.6],
 ["Pão de forma integral (Nema)","2 fatias (50 g)",136,5,27,0.6],
 ["Baguete rústica (Nema)","50 g",175,4.8,37,0],
 ["Focaccia (Nema)","1/4 da unid (50 g)",124,4.1,26,0.3],
 ["Bisnaguinha (Nema)","50 g",172,4.2,23,7],
 ["Pizza marguerita (Nema)","1 porção (83 g)",160,7.9,22,5],
 ["Bolo de aipim (Nema)","1 fatia (60 g)",108,2.1,19,2.7],
 ["Bolo de banana (Nema)","1 fatia (60 g)",197,2.6,35,8.3],
 ["Brownie de chocolate (Nema)","1 unid (50 g)",207,2.8,28,9.7],
 ["Goiabada cascão (Nema)","100 g",128,0,32,0],
 ["Ricota fresca de búfala (Nema)","100 g",133,7,2.7,11]
].map(([n,u,k,p,c,g])=>({n,u,k,p,c,g,cat:C,loja:Lj}));
 const ex=new Set(window.FOODS.map(f=>f.n.toLowerCase())); L.forEach(f=>{ if(!ex.has(f.n.toLowerCase())) window.FOODS.push(f); }); window.FOOD_CATS=[...new Set(window.FOODS.map(f=>f.cat))]; })();
