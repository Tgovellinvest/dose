// Programas, sessões, esportes, feminino, ciência e nutrição — Guia de Treino
// Cargas pessoais NÃO ficam aqui (o app guarda no aparelho). Aqui só a estrutura.
window.PROGRAMS = {
  // ---------- PPL 2.0 (vigente desde 2026-10-11) ----------
  ppl2: {
    id:"ppl2", nome:"PPL 2.0 — Hipertrofia + Força + BJJ", origem:"Vault · 01 - Treino Atual - PPL 2.0 (2026-10-13)", rotacao:["push","pull","legs"],
    principios:["Prioridade estética V-shape: deltoide lateral/posterior, latíssimo, peito superior, cintura.","Compostos RIR 1–3, isoladores RIR 0–2; falha técnica seletiva, não obrigatória.","Descanso: compostos 2–3 min, isoladores 90–150 s, isometrias 60–120 s.","Progredir primeiro em repetições dentro da faixa, depois em carga (double progression).","BJJ gera fadiga: cortar acessórios antes dos compostos quando a semana pesar.","Deload a cada 4–6 semanas: volume −40–50%, carga −10–15%, RIR 3–4."],
    sessoes:{
      push:{nome:"PUSH", cor:"#8a3b31", slots:[
        {ex:"supino_reto_smith", sets:3, reps:"5–8", rir:"2→1", rest:"2,5–3 min", nota:"Exposição de força. Feeder: 40% × 6, 60% × 4."},
        {ex:"supino_inclinado_smith", sets:2, reps:"8–12", rir:"1–2", rest:"2 min"},
        {ex:"elevacao_lateral_polia", sets:4, reps:"10–20", rir:"0–1", rest:"90 s", nota:"Última série até falha técnica."},
        {ex:"crossover", sets:2, reps:"10–15", rir:"0–1", rest:"90 s"},
        {ex:"triceps_overhead_polia", sets:2, reps:"8–15", rir:"0–1", rest:"90 s"},
        {ex:"pressdown", sets:2, reps:"10–15", rir:"0–1", rest:"90 s"}
      ], isometria:[{ex:"pallof_hold", sets:2, tempo:"20–30 s/lado"}], cardio:"15–20 min Z2 opcional"},
      pull:{nome:"PULL", cor:"#315E8A", slots:[
        {ex:"puxada_unilateral", sets:3, reps:"6–10", rir:"1–2", rest:"2–3 min", nota:"Pesado e primeiro: força é específica."},
        {ex:"remada_apoiada", sets:3, reps:"6–10", rir:"1–2", rest:"2–3 min"},
        {ex:"pullover_polia", sets:2, reps:"10–15", rir:"0–1", rest:"90 s"},
        {ex:"crucifixo_inverso_polia", sets:2, reps:"12–20", rir:"0–1", rest:"90 s"},
        {ex:"elevacao_lateral_polia", sets:2, reps:"12–20", rir:"0–1", rest:"90 s", nota:"Segundo estímulo de deltoide lateral na semana."},
        {ex:"encolhimento_smith", sets:2, reps:"8–12", rir:"1", rest:"90 s"},
        {ex:"rosca_inclinada", sets:2, reps:"8–12", rir:"0–1", rest:"90 s", nota:"Rosca martelo fora enquanto o cotovelo doer."}
      ], isometria:[{ex:"remada_isometrica", sets:2, tempo:"15–30 s"}], cardio:"15–20 min Z2 ou bloco HYROX leve (modo Hyrox)"},
      legs:{nome:"LEGS", cor:"#4f6b3a", slots:[
        {ex:"agachamento_smith", sets:3, reps:"5–8", rir:"2→1", rest:"3 min", nota:"Feeder: 40% × 5, 60% × 5."},
        {ex:"bulgarian_smith", sets:2, reps:"8–12/lado", rir:"1–2", rest:"2 min"},
        {ex:"extensora", sets:2, reps:"10–15", rir:"0–1", rest:"90 s"},
        {ex:"flexora", sets:3, reps:"8–12", rir:"0–1", rest:"90 s"},
        {ex:"rdl_smith", sets:2, reps:"6–10", rir:"1–2", rest:"2–3 min"},
        {ex:"panturrilha_smith", sets:2, reps:"8–15", rir:"0–1", rest:"90 s"},
        {ex:"soleo", sets:2, reps:"10–20", rir:"0–1", rest:"60 s"}
      ], isometria:[{ex:"split_squat_hold", sets:2, tempo:"20–30 s/perna"},{ex:"aducao_isometrica", sets:2, tempo:"20–30 s"}], cardio:"15–20 min Z2 antes ou depois"}
    },
    semana:{seg:{bjj:true,musc:null}, ter:{bjj:true,musc:"push"}, qua:{bjj:"opcional",musc:"legs"}, qui:{bjj:true,musc:null}, sex:{bjj:true,musc:"pull"}, sab:{bjj:"opcional",musc:"rotação"}, dom:{bjj:false,musc:null}},
    regras:["O PPL é contínuo: o sábado não é sempre Push, é o próximo da rotação.","BJJ forte na quarta → não fazer Legs pesado normal.","BJJ no sábado → o quarto treino de musculação vira opcional.","5–6 BJJ na semana → aceitar menos volume de musculação.","Domingo: recuperação real."],
    volumeAlvo:{"Peitoral":"9–11","Latíssimo/dorsal":"11–15","Deltoide lateral":"8–10","Deltoide posterior":"6–9","Bíceps":"7–10","Tríceps":"8–11","Quadríceps":"9–12","Posteriores":"7–10","Glúteos":"7–10","Panturrilhas":"5–8"}
  },
  // ---------- Programa Definitivo — Prédio (biblioteca A/B) ----------
  predio: {
    id:"predio", nome:"Programa Definitivo — Prédio (A/B)", origem:"Vault · Treino prédio .txt (mai–jun/2026)", rotacao:["pushA","pullA","legsA","pushB","pullB","legsB"],
    principios:["Barra do Smith pesa 22 kg.","Feeder sets nos compostos; 2 working sets.","Só uma polia: tudo unilateral.","Halteres até 12 kg: priorizar Smith e polia."],
    sessoes:{
      pushA:{nome:"PUSH A — tensão", cor:"#8a3b31", slots:[
        {ex:"supino_inclinado_smith", sets:2, reps:"6–10", rir:"1", rest:"2,5 min", nota:"Feeder 1 e 2."},
        {ex:"supino_reto_smith", sets:2, reps:"6–10", rir:"1", rest:"2,5 min"},
        {ex:"desenvolvimento_smith", sets:2, reps:"6–10", rir:"1–2", rest:"2 min"},
        {ex:"crossover", sets:3, reps:"6–12/lado", rir:"0–1", rest:"90 s"},
        {ex:"elevacao_lateral_polia", sets:4, reps:"10–15/lado", rir:"0", rest:"90 s"},
        {ex:"crucifixo_inverso_polia", sets:3, reps:"8–12/lado", rir:"0–1", rest:"90 s"},
        {ex:"pressdown", sets:3, reps:"10–15", rir:"0", rest:"90 s"}], cardio:"15–20 min Z2"},
      pullA:{nome:"PULL A — largura", cor:"#315E8A", slots:[
        {ex:"puxada_unilateral", sets:3, reps:"8–12/lado", rir:"1", rest:"2 min"},
        {ex:"remada_unilateral_polia", sets:3, reps:"8–12/lado", rir:"1", rest:"2 min"},
        {ex:"pullover_polia", sets:3, reps:"8–15", rir:"0–1", rest:"90 s"},
        {ex:"remada_smith", sets:2, reps:"8–10", rir:"1", rest:"2 min"},
        {ex:"rosca_direta_smith", sets:3, reps:"8–12", rir:"0–1", rest:"90 s"},
        {ex:"reverse_crunch", sets:3, reps:"12–20", rir:"0–1", rest:"60 s"}], cardio:"15–20 min Z2"},
      legsA:{nome:"LEGS A — tensão", cor:"#4f6b3a", slots:[
        {ex:"agachamento_smith", sets:2, reps:"6–8", rir:"1", rest:"3 min", nota:"Feeder 1 e 2."},
        {ex:"bulgarian_smith", sets:2, reps:"6–10/lado", rir:"1–2", rest:"2 min"},
        {ex:"extensora", sets:3, reps:"12–15", rir:"0–1", rest:"90 s"},
        {ex:"rdl_smith", sets:2, reps:"8–10", rir:"1", rest:"2 min"},
        {ex:"flexora", sets:3, reps:"10–12", rir:"0–1", rest:"90 s"},
        {ex:"hip_thrust_smith", sets:3, reps:"8–12", rir:"1", rest:"2 min"},
        {ex:"panturrilha_smith", sets:4, reps:"12–20", rir:"0–1", rest:"60 s"}], cardio:"15–20 min Z2 antes"},
      pushB:{nome:"PUSH B — metabólico", cor:"#8a3b31", slots:[
        {ex:"elevacao_lateral_polia", sets:4, reps:"15–20/lado", rir:"0", rest:"60 s"},
        {ex:"desenvolvimento_smith", sets:2, reps:"10–12", rir:"2", rest:"90 s"},
        {ex:"supino_inclinado_smith", sets:2, reps:"8–10", rir:"1", rest:"2 min"},
        {ex:"crossover", sets:2, reps:"12–15/lado", rir:"0–1", rest:"60 s"},
        {ex:"triceps_overhead_polia", sets:2, reps:"12–15", rir:"0–1", rest:"60 s"},
        {ex:"pressdown", sets:2, reps:"12–15", rir:"0–1", rest:"60 s"}], cardio:"25–35 min Z2"},
      pullB:{nome:"PULL B — espessura", cor:"#315E8A", slots:[
        {ex:"puxada_unilateral", sets:3, reps:"8–12/lado", rir:"1", rest:"2 min", nota:"Pegada supinada/semipronada."},
        {ex:"remada_unilateral_polia", sets:3, reps:"10–12/lado", rir:"1", rest:"90 s"},
        {ex:"crucifixo_inverso_polia", sets:2, reps:"12–15/lado", rir:"0–1", rest:"60 s"},
        {ex:"rosca_inclinada", sets:3, reps:"8–12", rir:"0–1", rest:"90 s"},
        {ex:"crunch_polia", sets:3, reps:"10–15", rir:"0–1", rest:"60 s"}], cardio:"15–30 min Z2"},
      legsB:{nome:"LEGS B — metabólico", cor:"#4f6b3a", slots:[
        {ex:"hip_thrust_smith", sets:3, reps:"10–12", rir:"1", rest:"2 min"},
        {ex:"agachamento_smith", sets:2, reps:"8–10", rir:"1", rest:"2,5 min"},
        {ex:"agachamento_smith", sets:2, reps:"10–12", rir:"1", rest:"2 min", nota:"Pés mais à frente, mais sentado."},
        {ex:"extensora", sets:3, reps:"12–15", rir:"0–1", rest:"90 s"},
        {ex:"abducao_polia", sets:3, reps:"15–20/lado", rir:"0–1", rest:"60 s"},
        {ex:"panturrilha_smith", sets:4, reps:"12–20", rir:"0", rest:"60 s"}], cardio:"15–30 min Z2 antes"}
    }
  }
};

// ---------- Cardio base ----------
window.CARDIO = {
  zonas:[{z:"Z1 leve",fc:"120–130",rpe:"2–3",vel:"4,5–5,5 km/h"},{z:"Z2 base",fc:"130–145",rpe:"3–4, dá para conversar",vel:"5,5–7 km/h"},{z:"Z3 moderado",fc:"145–155",rpe:"5–6",vel:"7–8 km/h"},{z:"Z4 forte",fc:">155",rpe:"7–8",vel:"9–10 km/h"},{z:"Sprint",fc:"máx",rpe:"9–10",vel:">12 km/h, não usar como rotina"}],
  nota:"As faixas de FC vieram das conversas (120–140 bpm como referência inicial de Z2) e não de teste fisiológico. Trate como ponto de partida e ajuste pelo teste da fala: em Z2 você fala frases inteiras.",
  sessoes:[
    {id:"z2_base", nome:"A · Base aeróbica Z2", dur:"35–45 min", passos:["5 min a 4–5 km/h","25–35 min contínuo confortável (~120–140 bpm)","5 min volta à calma"]},
    {id:"intervalado", nome:"B · Caminhada/trote intervalado", dur:"25–30 min", passos:["5 min aquecimento","6 ciclos: 1–2 min trote 7–8 km/h + 1–2 min caminhada 5–5,5 km/h","5 min volta à calma"], progressao:["Sem 1–2: 1 min trote / 2 min caminhada × 6","Sem 3–4: 90 s / 90 s × 6","Sem 5–6: 2 min / 1 min × 6","Sem 7–8: 3 min / 1 min × 5–6"]},
    {id:"esteira_leve", nome:"Esteira 30 min · leve (120–130)", dur:"30 min", passos:["5 min 4,5","10 min 5,5","10 min 4,5","5 min 4,5"]},
    {id:"esteira_levemod", nome:"Esteira 30 min · leve-moderado (135–145)", dur:"30 min", passos:["3 min 4,5","2 min 5,5","5× (3 min 5,5 + 1 min 7,0)","3 min 5,5","2 min 4,5"]},
    {id:"esteira_mod", nome:"Esteira 30 min · moderado (145–155)", dur:"30 min", passos:["2 min 4,5","2 min 5,5","1 min 7,0","5× (2 min 5,5 + 2 min 7,5–8,0)","3 min 5,5","2 min 4,5"]},
    {id:"esteira_forte", nome:"Esteira 30 min · forte (>155)", dur:"30 min", passos:["2 min 4,5","2 min 5,5","1 min 7,0","5× (2 min 5,5 + 2 min 9–10)","3 min 5,5","2 min 4,5"], nota:"Só quando joelho e recuperação permitirem; não encaixar antes de BJJ duro."}
  ],
  regras:["Frequência base: 1 Z2 + 1 intervalado por semana, mais passos 7–10 mil/dia.","Se o cardio derrubar o treino de perna, aumentar fome demais ou piorar recuperação, reduzir dose antes de mexer na musculação.","Corrida interfere mais que bike na fibra tipo I; separar cardio e musculação ≥3 h quando possível (Schumann 2022)."]
};

// ---------- Esportes ----------
window.SPORTS = [
 {id:"bjj", nome:"Jiu-Jitsu", emoji:"🥋", status:"vigente",
  resumo:"Esporte intermitente: esforços de alta intensidade de 5–30 s intercalados com pausas, por 5–10 min. Sucesso associa-se a força máxima, força isométrica (pegada, controle) e endurance muscular; VO₂max (42–52 ml/kg/min) não discrimina nível competitivo.",
  fonte:"Andreato et al. 2017, Sports Med Open (revisão sistemática de 58 estudos)",
  demandas:[{q:"Força máxima",onde:"queda, body lock, pressão, sair de posição ruim",treino:"Compostos pesados do PPL 2.0 (supino, agachamento, puxada, remada)"},{q:"Força isométrica",onde:"pegada, underhook, over-under, 100 kg, montada",treino:"Bloco de isometrias (remada isométrica, Pallof, adução, split-squat hold)"},{q:"Anti-rotação",onde:"impedir raspagem, manter base, body lock",treino:"Pallof press hold"},{q:"Adução de quadril",onde:"guarda, meia, controle de pernas, ashi",treino:"Adução isométrica, adutor magno no agachamento"},{q:"Resistência muscular",onde:"manter pressão sem morrer em 40 s",treino:"Séries de 12–20 em isoladores, bloco Hyrox leve"},{q:"Capacidade de repetir esforços",onde:"rola de 6 min, torneio com várias lutas",treino:"Intervalado 1–2 min + Z2 base"}],
  semana:"BJJ seg/ter/qui/sex (quarta e sábado opcionais). Lower pesado longe das sessões mais duras de queda. Reduzir acessórios antes dos compostos quando acumular 5–6 BJJ.",
  regras:["Academia não pode roubar o jiu-jitsu: musculação é ferramenta, não outro campeonato.","Cotovelo sintomático: sem pegada em toalha, sem rosca martelo, sem dead hang, sem farmer carry pesado; kimura e guilhotina forçadas fora do rola.","Antes de BJJ duro: não caçar falha na musculação.","Dor bilateral recorrente no cotovelo merece ortopedista do esporte ou fisioterapeuta."],
  blocos:[{nome:"Isometrias para performance (2 por sessão, 30–50% da força, sem prender a respiração)", itens:["Remada isométrica 2×15–30 s (cotovelo 70–100°)","Split-squat hold 2×20–30 s por perna","Pallof press hold 2×20–30 s por lado","Adução isométrica 2×20–30 s","Pegada em toalha/Gi 2×20–30 s — suspensa enquanto o cotovelo doer"], progressao:"1) tolerância à posição → 2) duração → 3) resistência."}],
  aquecimento:["5 min de corrida leve ou pular corda","Mobilidade de quadril (90/90, cossack) 2 min","Ponte de glúteo e rotação externa de ombro com elástico 2×12","Rolamentos, quedas e shrimp 3 min"], prevencao:["Pescoço: isometria 4 direções 2×10 s","Cotovelo: evitar pegadas máximas com tendão sintomático; descarregar após campeonatos","Joelho: adução e abdução com elástico 2×15","Dedos: abrir e fechar com elástico 2×20"],
  link:"O jogo técnico (guardas, passagens, finalizações, vídeos) vive no BJJ Lab e em 04 - Hobbies/02 - BJJ do vault."},
 {id:"hyrox", nome:"Hyrox", emoji:"🏃", status:"novo (out/2026)",
  resumo:"Prova padronizada: 8 × 1 km de corrida intercalados com 8 estações, sempre na mesma ordem. A corrida é quase metade do tempo final, por isso ritmo e capacidade aeróbica decidem mais que força bruta. Primeira prova típica: 90–120 min.",
  fonte:"Formato oficial Hyrox (hyrox.com); Brandt et al. 2025 (primeiro estudo revisado por pares, mediana 86,5 min em prova simulada)",
  estacoes:[{n:1,nome:"SkiErg",dose:"1.000 m",open:"—"},{n:2,nome:"Sled push",dose:"50 m",open:"152 kg (M Open, inclui sled)"},{n:3,nome:"Sled pull",dose:"50 m",open:"103 kg (M Open)"},{n:4,nome:"Burpee broad jump",dose:"80 m",open:"—"},{n:5,nome:"Remo",dose:"1.000 m",open:"—"},{n:6,nome:"Farmer carry",dose:"200 m",open:"2 × 24 kg"},{n:7,nome:"Sandbag lunges",dose:"100 m",open:"20 kg"},{n:8,nome:"Wall balls",dose:"100 reps",open:"6 kg, alvo 3 m"}],
  demandas:[{q:"Base aeróbica (Z2)",onde:"os 8 km",treino:"2–3 sessões Z2 de 30–45 min"},{q:"Limiar / ritmo de 1 km",onde:"cada corrida sob fadiga",treino:"Intervalados de 400–1.000 m em Z3–Z4"},{q:"Resistência de força",onde:"sled, lunges, wall balls",treino:"Séries de 15–25 e circuitos"},{q:"Transição corrida→estação",onde:"'pernas pesadas'",treino:"Simulações: corrida + estação + corrida"}],
  programa:{nome:"HYROX 1.0 — prédio (Smith, 1 polia, banco, esteira sem inclinação)", fases:[
   {fase:"Fase 1 · Base (sem 1–4)", obj:"Tolerância e volume. 1 bloco leve por semana (pós-Pull ou sessão própria) + 1 Z2.", sessao:["Aquecimento 5–7 min caminhando 4,5–5,5 km/h","3 voltas: esteira 500 m a 6,5–7,5 · step-up 10/perna · goblet squat 12 · esteira 400 m a 6–7 · afundo reverso 8/perna · Pallof hold 20 s/lado","Descanso 60–90 s entre voltas · RPE 6/10"], progressao:"Sem 3–4: 500 + 300 m → 4 voltas"},
   {fase:"Fase 2 · Capacidade (sem 5–8)", obj:"2 blocos por semana. Entram estações adaptadas.", sessao:["3–4 voltas: esteira 600 m Z3 · wall ball adaptado (goblet + press) 15 · esteira 400 m · afundo com halteres 20 m · pullover cíclico (SkiErg adaptado) 40 reps · step-up 12/perna","Descanso 60 s · RPE 7/10"], progressao:"Adicionar farmer carry moderado 20–30 m quando o cotovelo permitir."},
   {fase:"Fase 3 · Específica (sem 9–12)", obj:"Meia-simulação quinzenal: 4 × (1 km + estação).", sessao:["4 × 1 km a ritmo-alvo + estação adaptada (step-up 20 / goblet 20 / afundo 40 m / wall ball adaptado 25)","Semana alternada: só Z2 longo 45–60 min"], progressao:"Em academia completa, substituir pelas estações reais (ver biblioteca, grupo Hyrox)."}
  ]},
  aquecimento:["5 min caminhada rápida → trote","Agachamento corporal 10, afundo 6/perna, ponte 10","Pull-apart 15 e rotação de ombro 10","2 × 200 m progressivos"], prevencao:["Panturrilha e sóleo 2×15 (impacto)","Nordic curl 2×4","Prancha lateral 2×30 s","Volume de corrida sobe no máximo 10% por semana"],
  regras:["Hyrox fica separado da musculação: não vira terceiro treino de perna no mesmo dia do Legs.","Com cotovelo sintomático: sem burpee com flexão, sem farmer carry pesado, sem sled pull.","Primeiro volume, depois velocidade.","Peso corporal alto → progressão de corrida conservadora; se doer joelho, esteira inclinada (fora de casa) ou bike substituem corridas."]},
 {id:"corrida", nome:"Corrida", emoji:"👟", status:"base",
  resumo:"Objetivo atual: condicionamento aeróbico e preparação para Hyrox sem comprometer musculação e BJJ. Com peso elevado, a progressão é de caminhada/trote para corrida contínua, volume antes de velocidade, aumento de ~10% por semana como teto prático (regra de bolso, evidência fraca, mas conservadora).",
  fonte:"OMS 2020 (150–300 min/sem moderado); Schumann 2022 e Lundberg 2022 (interferência menor com bike que corrida)",
  demandas:[{q:"Base aeróbica",onde:"tudo",treino:"Z2 3×/sem 30–45 min"},{q:"Economia de corrida",onde:"ritmo sustentado",treino:"Cadência 170–180, passada curta, trote regular"},{q:"Tolerância ao impacto",onde:"joelho, panturrilha, canela",treino:"Progressão lenta, panturrilha e sóleo no Legs"}],
  programa:{nome:"Do trote aos 5 km (8 semanas, 2–3×/sem)", fases:[
   {fase:"Sem 1–2", obj:"6× (1 min trote 7–8 + 2 min caminhada 5–5,5)", sessao:["5 min aquecimento","6 ciclos","5 min volta à calma"]},
   {fase:"Sem 3–4", obj:"6× (90 s / 90 s)", sessao:["Mesma estrutura"]},
   {fase:"Sem 5–6", obj:"6× (2 min / 1 min)", sessao:["Mesma estrutura"]},
   {fase:"Sem 7–8", obj:"5–6× (3 min / 1 min) → depois 2× 10 min contínuos", sessao:["Mesma estrutura"]},
   {fase:"Depois", obj:"Corrida contínua 20–30 min Z2; 1 sessão/sem de 400–800 m em Z3–Z4 para o Hyrox", sessao:["Esteira moderado/forte (aba Cardio)"]}
  ]},
  aquecimento:["5 min caminhada rápida","Elevação de joelho, calcanhar no glúteo, skipping 20 m cada","Panturrilha no degrau 15","2 × 100 m progressivos"], prevencao:["Nordic curl 2×4–6 (van Dyk 2019)","Panturrilha unilateral 2×15","Ponte de glúteo unilateral 2×12","Tênis adequado ao peso; trocar a cada ~600–800 km"],
  regras:["Progressão é condicional: dor, recuperação ruim ou sequência pesada de BJJ → repete a semana ou troca por Z2 contínuo.","Sem sprint como rotina.","Separar da musculação de perna por ≥3 h, ou colocar depois."]},
 {id:"boxe", nome:"Boxe", emoji:"🥊", status:"modo",
  resumo:"A força de impacto do soco vem do chão: força máxima e explosiva de membros inferiores diferenciam quem soca forte; força máxima de membros superiores não. Rounds de 3 min com 1 min de pausa exigem capacidade aeróbica alta e repetição de esforços.",
  fonte:"Beattie & Ruddock 2022, JSCR (revisão); Uthoff & Lenetsky 2023, SCJ; Hernandez-Martinez 2024 (scoping review)",
  demandas:[{q:"Força máxima de pernas",onde:"base do soco",treino:"Agachamento/hack 3×3–6 (RIR 2) 1–2×/sem"},{q:"Força explosiva",onde:"soco, esquiva",treino:"Saltos (CMJ, box jump) 3×5; arremesso de medball rotacional 3×6/lado; carga 30–70% 1RM com intenção máxima (ACSM 2026 para potência)"},{q:"Rotação / anti-rotação",onde:"transferência quadril→punho",treino:"Pallof press, chop e lift na polia"},{q:"Resistência de ombro",onde:"guarda alta por 3 min",treino:"Elevação lateral 15–20, isometria de guarda 30–45 s"},{q:"Condicionamento",onde:"rounds",treino:"Intervalados 3 min forte / 1 min leve × 4–6 (esteira, bike ou saco)"}],
  programa:{nome:"Modo boxe (2 sessões curtas/sem, 25–35 min, pré ou pós treino técnico)", fases:[
   {fase:"Sessão A · força-potência", obj:"", sessao:["Agachamento Smith 3×4–6 RIR 2","Box jump ou salto vertical 3×5 (descanso 2 min)","Arremesso rotacional de medball ou chop na polia 3×6/lado","Pallof hold 2×20 s/lado"]},
   {fase:"Sessão B · condicionamento", obj:"", sessao:["5 min aquecimento","4–6 rounds de 3 min em Z4 / 1 min caminhando","Isometria de guarda com halteres leves 2×30–45 s","Elevação lateral 2×15–20"]}
  ]},
  aquecimento:["Pular corda 5 min","Rotação de tronco e ombro com elástico 2×12","Sombra 2 rounds de 2 min progressivos"], prevencao:["Manguito rotador com elástico 2×15","Punho: flexão e extensão com halter leve 2×15; bandagem sempre","Pescoço: isometria 2×10 s por direção"],
  regras:["Soco não é braço: priorize pernas e tronco.","Com cotovelo sintomático, evite socar saco pesado com cotovelo estendido ao máximo; luvas e bandagem sempre."]},
 {id:"futebol", nome:"Futebol", emoji:"⚽", status:"modo",
  resumo:"Jogo de 90 min: ~10 km a intensidade média perto do limiar anaeróbico (80–90% FCmáx), com sprints, saltos, mudanças de direção e contato. Capacidade aeróbica alta, força/potência de pernas e prevenção de lesão de posterior (nordic) são o que a ciência sustenta.",
  fonte:"Stølen et al. 2005, Sports Med (revisão de 181 estudos); Hoff & Helgerud 2004 (intervalado 4×4 min a 90–95% FCmáx)",
  demandas:[{q:"Capacidade aeróbica",onde:"manter intensidade nos 90 min",treino:"4×4 min a 90–95% FCmáx com 3 min leves, 1–2×/sem"},{q:"Força máxima e potência",onde:"sprint, salto, disputa",treino:"Agachamento 3×4–6; saltos 3×5"},{q:"Mudança de direção",onde:"drible, marcação",treino:"Shuttle 5–10 m, afundo lateral"},{q:"Prevenção de lesão",onde:"posterior, virilha, tornozelo",treino:"Nordic curl 2×4–6, adução isométrica/Copenhagen, panturrilha unilateral"}],
  programa:{nome:"Modo futebol (jogo 1×/sem + 2 sessões)", fases:[
   {fase:"Sessão A · força e prevenção (48 h antes do jogo)", obj:"", sessao:["Agachamento Smith 3×4–6 RIR 2","RDL 2×6–8","Nordic curl 2×4–6 (ou flexora excêntrica 3 s)","Copenhagen/adução isométrica 2×20 s/lado","Panturrilha unilateral 2×12"]},
   {fase:"Sessão B · aeróbico de alta intensidade", obj:"", sessao:["Aquecimento 8 min","4×4 min a 90–95% FCmáx / 3 min a 70%","Shuttle 6×10 m com mudança de direção","Volta à calma 5 min"]}
  ]},
  aquecimento:["FIFA 11+ reduzido: corrida leve 3 min, mudanças de direção, saltos, nordic 1×3, prancha 20 s (10–12 min)"], prevencao:["Nordic curl 2×4–6 (−51% lesão de posterior)","Copenhagen/adução isométrica 2×20 s (virilha)","Equilíbrio unipodal 2×30 s (tornozelo)","Agachamento e RDL no dia de força"],
  regras:["Jogar com 130 kg é carga articular alta: campo society com tênis adequado, aquecimento com corrida progressiva e mobilidade de quadril.","Dia seguinte ao jogo = recuperação (Z1 ou off), não Legs pesado."]},
 {id:"natacao", nome:"Natação", emoji:"🏊", status:"modo",
  resumo:"A força em terra transfere pouco e indiretamente para a água. O que a revisão sistemática sustenta: força máxima em terra (2–4 sessões/sem por 6–12 semanas) e pliometria melhoram saídas e viradas; para o nado, treino específico com resistência na água (elásticos, paraquedas) transfere melhor. Baixo impacto: ótimo cardio para peso elevado e joelho sensível.",
  fonte:"Amaro et al. 2018/2019, Science & Sports (revisão sistemática); Fone & van den Tillaar 2022, Sports Med Open (27 estudos); Crowley 2017",
  demandas:[{q:"Puxada (latíssimo, tríceps)",onde:"braçada",treino:"Puxada, pullover, tríceps — já no PPL"},{q:"Força de pernas e pliometria",onde:"saída e virada",treino:"Agachamento + saltos 3×5"},{q:"Core",onde:"posição do corpo",treino:"Pallof, prancha lateral"},{q:"Aeróbico",onde:"distância",treino:"Séries de 50–100 m com pausas curtas; nado contínuo Z2"}],
  programa:{nome:"Modo natação (2–3 sessões/sem na piscina + PPL)", fases:[
   {fase:"Piscina A · técnica + Z2", obj:"", sessao:["200 m aquecimento","8×50 m com 20 s de pausa, foco em braçada longa","400–800 m contínuo Z2","100 m soltura"]},
   {fase:"Piscina B · intervalado", obj:"", sessao:["200 m aquecimento","10×100 m com 30 s de pausa em Z3–Z4","4×25 m forte","100 m soltura"]},
   {fase:"Terra", obj:"", sessao:["O PPL 2.0 já cobre puxada e tríceps; acrescentar 3×5 saltos no Legs se o objetivo for virada/saída"]}
  ]},
  aquecimento:["Mobilidade de ombro com elástico 2 min","200 m soltos, 4×25 m técnica","Pull-apart 2×15"], prevencao:["Manguito rotador (rotação externa e interna) 2×15","Escápula: Y-T-W com halter leve 2×10","Alternar estilos para não repetir o mesmo arco de ombro"],
  regras:["Ombro: se houver dor, reduzir volume de crawl e priorizar pernas; manguito rotador com elástico 2×15.","Natação é a melhor opção de Z2 para dias de joelho ruim."]}
];

// ---------- Feminino ----------
window.FEMININO = {
  principios:[
   {t:"Mesma fisiologia, mesma dose", d:"Homens e mulheres ganham músculo em proporção semelhante com o mesmo treino relativo. As recomendações da ACSM 2026 (≥10 séries/músculo/semana para hipertrofia, cargas ≥80% 1RM para força) valem para as duas. Não existe treino 'feminino', existe ênfase diferente."},
   {t:"Ênfase em glúteo e posterior, sem abandonar o superior", d:"A prioridade estética comum (glúteo, posterior, cintura) pede padrão de quadril (hip thrust, RDL), agachamento e abdução. Mas upper 2×/semana continua necessário para postura, força e estética de ombro/costas."},
   {t:"Iniciante: menos volume, mais técnica", d:"Primeiras 2 semanas com 2 séries nos principais e 1–2 nos acessórios. RIR 2–3. Sobe para a estrutura completa depois."},
   {t:"Ciclo menstrual", d:"A evidência de periodizar o treino pelo ciclo é fraca e inconsistente; o que funciona é autorregular: em dias de mais fadiga/dor, trocar volume por técnica, sem parar."},
   {t:"Cardio", d:"2–3× por semana, 15–25 min, leve a moderado. OMS: 150–300 min/semana de atividade moderada + fortalecimento 2×/semana."},
   {t:"Progressão", d:"Mesma double progression: bateu o teto de reps em todas as séries com técnica → sobe carga."}
  ],
  programas:[
   {id:"stef_ul", nome:"Upper/Lower A-B (4×/semana) — Stefânia", origem:"ChatGPT, 2026-03-26, desenhado pelo Tiago com o coach virtual", semana:"Seg Upper A · Ter Lower A · Qui Upper B · Sex Lower B",
    sessoes:[
     {nome:"UPPER A", normal:[["Supino máquina ou halteres","3×8–10"],["Puxada na frente","3×8–12"],["Remada baixa","3×8–12"],["Desenvolvimento máquina","2×8–10"],["Elevação lateral","2×12–15"],["Tríceps corda","2×10–15"],["Rosca direta","2×10–12"]], rapida:[["Supino máquina","3×8–10"],["Puxada na frente","3×8–12"],["Remada baixa","2×10–12"],["Elevação lateral","2×12–15"],["Tríceps corda + rosca","2×10–12 cada"]]},
     {nome:"LOWER A", normal:[["Leg press","3×10–12"],["Stiff com halteres","3×8–10"],["Cadeira extensora","2×12–15"],["Mesa/cadeira flexora","3×10–12"],["Afundo ou passada","2×10/perna"],["Panturrilha","3×12–15"],["Abdômen máquina ou crunch","2×12–15"]], rapida:[["Leg press","3×10–12"],["Stiff","3×8–10"],["Flexora","2×10–12"],["Extensora","2×12–15"],["Panturrilha","2×12–15"]]},
     {nome:"UPPER B", normal:[["Supino inclinado máquina/halteres","3×8–10"],["Remada máquina","3×8–12"],["Puxada neutra","3×8–12"],["Crucifixo máquina","2×10–15"],["Elevação lateral ou posterior","2×12–15"],["Rosca martelo","2×10–12"],["Tríceps na polia","2×10–12"]], rapida:[["Supino inclinado máquina","3×8–10"],["Remada máquina","3×8–12"],["Puxada neutra","2×10–12"],["Elevação lateral","2×12–15"],["Rosca martelo + tríceps","2×10–12 cada"]]},
     {nome:"LOWER B", normal:[["Agachamento Smith, hack ou goblet","3×8–10"],["Cadeira flexora","3×10–12"],["Hip thrust","3×8–12"],["Cadeira abdutora","2×12–20"],["Búlgaro","2×8–10/perna"],["Panturrilha","3×12–15"],["Prancha ou abdominal infra","2–3 séries"]], rapida:[["Agachamento Smith/hack","3×8–10"],["Hip thrust","3×8–12"],["Flexora","2×10–12"],["Abdutora","2×15–20"],["Panturrilha","2×12–15"]]}
    ],
    regras:["RIR 1–3 na maioria das séries (nota 8–9 numa escala em que 10 é impossível fazer mais).","Descanso: grandes 90–150 s, pequenos 45–75 s.","Academia cheia: tirar acessório tudo bem, tirar o básico não."]},
   {id:"lower_gluteo_predio", nome:"Lower ênfase glúteo — prédio (1–2×/semana)", origem:"ChatGPT, 2026-05-02 (treino feito para amigas no prédio)", semana:"Encaixa com funcional/musculação da academia",
    sessoes:[{nome:"LOWER GLÚTEO", normal:[["Hip thrust no Smith","3×10–12"],["Agachamento no Smith (pés à frente)","2×8–10"],["Cadeira flexora","2–3×10–12"],["Kickback na polia","2×15–20"],["Abdução na polia","3×15–20"],["Cadeira extensora","2–3×12–15"],["Panturrilha em pé no Smith","3×12–15"]], rapida:[["Hip thrust","3×10–12"],["Agachamento Smith","2×8–10"],["Flexora","2×10–12"],["Abdução polia","2×15–20"]]}],
    regras:["Grandes: termina sentindo que faria mais 1–2 reps. Isoladores: até quase falha com técnica limpa.","Vídeos de execução: biblioteca (hip thrust, agachamento Smith, flexora, kickback, abdução, extensora, panturrilha)."]}
  ]
};

// ---------- Ciência (referências verificadas em 2026-10-25) ----------
window.SCIENCE = [
 {t:"Nordic curl previne lesão de posterior", oque:"Programas com o exercício nórdico reduziram lesões de isquiotibiais em ~51% em atletas de corrida e futebol (meta-análise de 8.459 atletas).", regra:"Nordic curl 2×4–6 nos modos futebol e corrida; na biblioteca como substituto da flexora sem máquina.", ref:"van Dyk, Behan & Whiteley, Br J Sports Med 2019;53:1362–70", url:"https://bjsm.bmj.com/content/53/21/1362", status:"verificado"},
 {t:"Volume semanal é a alavanca principal da hipertrofia", oque:"≥10 séries por grupo muscular por semana como referência prática para hipertrofia; para força, cargas ≥80% 1RM, 2–3 séries, exercício prioritário no início da sessão. Falha absoluta, máquina vs. livre e periodização complexa não mudaram resultados de forma consistente. Elásticos e peso corporal funcionam.", regra:"Volume-alvo por grupo na aba Treino. Supino e agachamento pesados primeiro.", ref:"ACSM Position Stand 2026, Medicine & Science in Sports & Exercise (137 revisões, >30 mil participantes)", url:"https://acsm.org/resistance-training-guidelines-update-2026/", status:"verificado"},
 {t:"Retornos decrescentes e séries fracionadas", oque:"Mais séries → mais hipertrofia e força, com retornos decrescentes. Séries indiretas contam 0,5 (supino conta meio para tríceps). Frequência importa pouco para hipertrofia quando o volume é igual, e ajuda força.", regra:"Contamos indiretas como 0,5; PPL rotativo é defensável para hipertrofia com 4 BJJ por semana.", ref:"Pelland, Remmert, Robinson, Hinson & Zourdos, Sports Medicine 2026;56(2):481–505 (67 estudos, 2.058 participantes)", url:"https://doi.org/10.1007/s40279-025-02344-w", status:"verificado"},
 {t:"Perto da falha para hipertrofia, não para força", oque:"Hipertrofia aumenta quanto mais perto da falha a série termina; força não depende disso. Treinar com 0–2 RIR maximiza crescimento; para força, parar mais longe preserva velocidade.", regra:"Compostos RIR 1–3 (força), isoladores RIR 0–2 (hipertrofia). Antes de BJJ duro, não caçar falha.", ref:"Robinson et al., Sports Medicine 2024 (meta-regressões, 214 estudos)", url:"https://pubmed.ncbi.nlm.nih.gov/38970765/", status:"verificado"},
 {t:"Descanso: mais de 60–90 s basta", oque:"Pequeno benefício de descansar >60 s; nenhuma diferença detectável acima de ~90 s para hipertrofia. Descansos curtos cortam reps nas séries seguintes.", regra:"Isoladores 90–150 s, compostos 2–3 min (para preservar carga).", ref:"Singer, Wolf, … Schoenfeld, Frontiers in Sports and Active Living 2024 (meta-análise bayesiana, 9 estudos)", url:"https://doi.org/10.3389/fspor.2024.1429789", status:"verificado"},
 {t:"Dose-resposta de volume (base histórica)", oque:"Cada série semanal adicional associou-se a mais hipertrofia; >10 séries/semana produziram mais que <5.", regra:"Piso de ~10 séries nos grupos prioritários.", ref:"Schoenfeld, Ogborn & Krieger, J Sports Sci 2017;35(11):1073–82", url:"https://pubmed.ncbi.nlm.nih.gov/27433992/", status:"verificado"},
 {t:"Isometria: específica do ângulo, melhor alongada", oque:"Isometria melhora força com especificidade angular; em comprimentos musculares maiores produz mais hipertrofia e transfere mais para o dinâmico; ≥70% de intensidade é necessária para adaptar tendão; intenção balística melhora produção rápida de força.", regra:"Isometrias em posições que aparecem no BJJ (70–100° de cotovelo, split, adução); submáximas enquanto o cotovelo doer.", ref:"Oranchuk, Storey, Nelson & Cronin, Scand J Med Sci Sports 2019;29(4):484–503 (revisão sistemática)", url:"https://doi.org/10.1111/sms.13375", status:"verificado"},
 {t:"Perfil físico do atleta de BJJ", oque:"Esporte intermitente; força máxima, isométrica e endurance associam-se a sucesso; VO₂max (42–52) não diferencia nível; atletas de alto nível têm 7–16% de gordura.", regra:"Força dinâmica + isometria + capacidade de repetir esforços. Cutting sustentado ajuda o jogo.", ref:"Andreato, Lara, Andrade & Branco, Sports Medicine – Open 2017;3:9 (58 estudos, 1.496 sujeitos)", url:"https://doi.org/10.1186/s40798-016-0069-5", status:"verificado"},
 {t:"Treino concorrente não mata hipertrofia", oque:"Cardio + musculação não compromete hipertrofia nem força máxima (SMD −0,01 e −0,06); só a força explosiva cai um pouco, mais quando na mesma sessão. Corrida interfere mais que bike na fibra tipo I.", regra:"Z2 à vontade; separar ≥3 h quando der; bike/natação nos dias de joelho; corrida com dose controlada.", ref:"Schumann et al., Sports Medicine 2022;52:601–612 (43 estudos, 1.090 participantes); Lundberg et al. 2022 (fibras)", url:"https://doi.org/10.1007/s40279-021-01587-7", status:"verificado"},
 {t:"Cutting preservando massa magra", oque:"Perder 0,5–1% do peso por semana; proteína 2,3–3,1 g/kg de massa magra; gordura 15–30% das calorias; o resto carboidrato. Timing e frequência de refeições têm efeito pequeno.", regra:"Calculadora de nutrição usa esses limites; perda mais rápida que 1%/semana acende alerta.", ref:"Helms, Aragon & Fitschen, JISSN 2014;11:20", url:"https://doi.org/10.1186/1550-2783-11-20", status:"verificado"},
 {t:"Proteína para quem treina", oque:"1,4–2,0 g/kg/dia para construir e manter massa; mais alto (2,3–3,1 g/kg de massa magra) em déficit. Distribuir 0,4 g/kg por refeição, 3–4 refeições.", regra:"Faixa de proteína da calculadora.", ref:"ISSN Position Stand: protein and exercise (Jäger et al.), JISSN 2017;14:20", url:"https://pubmed.ncbi.nlm.nih.gov/28642676/", status:"verificado"},
 {t:"Equação de TMB", oque:"Mifflin-St Jeor acerta dentro de 10% em mais pessoas, obesas ou não, que Harris-Benedict e Owen; mesmo assim a acurácia cai em obesidade e equações sem massa magra erram mais. Com % de gordura conhecido, usar a massa livre de gordura.", regra:"A calculadora roda Mifflin-St Jeor e, com % de gordura, Cunningham/Katch-McArdle, e usa o MENOR valor (conservador).", ref:"Frankenfield et al., J Am Diet Assoc 2005;105:775–89 (revisão sistemática); Frankenfield 2013 Clin Nutr; Mifflin et al. 1990", url:"https://pubmed.ncbi.nlm.nih.gov/15883556/", status:"verificado"},
 {t:"Atividade física para saúde", oque:"150–300 min/semana de aeróbico moderado (ou 75–150 vigoroso) + fortalecimento de todos os grandes grupos ≥2 dias/semana.", regra:"Z2 + passos cobrem o aeróbico; PPL cobre o fortalecimento.", ref:"OMS 2020 Guidelines on physical activity (Bull et al., BJSM 2020)", url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC7719906/", status:"verificado"},
 {t:"Hyrox: formato e fisiologia", oque:"8 × 1 km + 8 estações fixas; corrida ≈ metade do tempo; mediana 86,5 min em prova simulada no primeiro estudo revisado por pares.", regra:"Programa Hyrox 1.0 prioriza corrida e resistência de força sobre força máxima.", ref:"Regulamento oficial hyrox.com; Brandt et al., Frontiers in Physiology 2025;16:1519240 (primeiro estudo revisado por pares)", url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC11994925/", status:"verificado"},
 {t:"Boxe: força de soco vem das pernas", oque:"Força máxima e explosiva de membros inferiores diferenciam boxeadores de alto impacto; força máxima de membros superiores não.", regra:"Modo boxe: agachamento pesado, saltos, medball rotacional; superior só explosivo.", ref:"Beattie & Ruddock, J Strength Cond Res 2022;36(10):2957–69 (revisão)", url:"https://doi.org/10.1519/JSC.0000000000004252", status:"verificado"},
 {t:"Futebol: fisiologia e treino", oque:"~10 km por jogo a 80–90% FCmáx; intervalado 4×4 min a 90–95% FCmáx melhora VO₂max e desempenho; força máxima melhora sprint e salto.", regra:"Modo futebol: 4×4 + força + nordic.", ref:"Stølen, Chamari, Castagna & Wisløff, Sports Medicine 2005;35(6):501–36", url:"https://pubmed.ncbi.nlm.nih.gov/15974635/", status:"verificado"},
 {t:"Natação: força em terra transfere pouco", oque:"Sem consenso sobre o melhor método; força máxima em terra (6–12 sem, 2–4×/sem) e pliometria ajudam saídas e viradas; resistência específica na água transfere mais para o nado.", regra:"Modo natação: PPL como base + saltos + treino na água.", ref:"Amaro et al., Science & Sports 2019;34(1):e1–e14; Fone & van den Tillaar, Sports Medicine – Open 2022;8:19", url:"https://doi.org/10.1186/s40798-022-00410-5", status:"verificado"},
 {t:"Treino alongado (comprimento muscular)", oque:"Exercícios que carregam o músculo em comprimento maior tendem a produzir mais hipertrofia (ex.: tríceps overhead, rosca inclinada, flexora sentada).", regra:"Overhead, rosca inclinada e flexora sentada no PPL 2.0.", ref:"Pedrosa et al., Eur J Sport Sci 2022 (extensão de joelho em amplitude longa > curta); Maeo et al., Eur J Sport Sci 2023 (overhead ≈ +40% de hipertrofia do tríceps vs. pushdown)", url:"https://www.strongerbyscience.com/?p=57800", status:"verificado"},
 {t:"Isometria em tendinopatia: não é mágica", oque:"Evidência limitada de superioridade da isometria sobre exercícios isotônicos/excêntricos para dor de tendão; pode ser tolerável e aliviar em alguns casos.", regra:"Isometria não atravessa dor aguda; cotovelo bilateral recorrente → avaliação clínica.", ref:"Clifford et al., BMJ Open Sport & Exercise Medicine 2020;6:e000760 (revisão sistemática e meta-análise)", url:"https://pubmed.ncbi.nlm.nih.gov/32818059/", status:"verificado"}
];

// ---------- Nutrição (regras da calculadora) ----------
window.NUTRI = {
  atividade:[{k:"sed",n:"Sedentário · trabalho sentado, sem treino",f:1.2,fc:1.15},{k:"leve",n:"Leve · 1–2 treinos por semana",f:1.375,fc:1.3},{k:"mod",n:"Moderado · 3–4 treinos por semana",f:1.55,fc:1.45},{k:"alto",n:"Alto · 5–7 treinos por semana (musculação + esporte)",f:1.725,fc:1.6},{k:"muito",n:"Muito alto · 2 treinos por dia ou trabalho físico",f:1.9,fc:1.7}],
  nota:"Conservador = menor TMB entre as equações × fator de atividade reduzido (fc). Relógios inflam gasto de treino de força em 20–35%; por isso o app não soma 'calorias ativas' do relógio.",
  objetivos:[{k:"cut",n:"Perder gordura (déficit 20%)",d:-0.2},{k:"cutLeve",n:"Perder gordura devagar (déficit 12%)",d:-0.12},{k:"recomp",n:"Recomposição (déficit leve, proteína alta)",d:-0.06},{k:"manter",n:"Manter peso e performance",d:0},{k:"bulkLeve",n:"Ganhar massa devagar (superávit 5%)",d:0.05},{k:"bulk",n:"Ganhar massa (superávit 10%)",d:0.10},{k:"performance",n:"Performance esportiva (manutenção + carbo no treino)",d:0.02}],
  regras:["Déficit de 10–25% (nunca abaixo da TMB); meta de 0,5–1% do peso por semana (Helms 2014).","Proteína: 1,6–2,2 g/kg de peso; em déficit, 2,3–3,1 g/kg de massa magra quando % de gordura for conhecido (ISSN 2017; Helms 2014).","Gordura: 0,6–1,0 g/kg, no mínimo 20% das calorias.","Carboidrato: o que sobrar, concentrado em torno de treino e BJJ.","Água: ~35 ml/kg/dia + 500 ml por hora de treino (referência prática).","Fibra 25–38 g/dia.","Uma refeição fora não vira três dias fora; próxima refeição normal."],
  precedencia:"Se existe um protocolo formal de coach/nutricionista vigente, ele prevalece sobre esta calculadora. Use a calculadora para entender a lógica e conferir se o protocolo está dentro das faixas de consenso."
};
