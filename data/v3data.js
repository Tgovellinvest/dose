// ================= DOSE v3 · dados: corrida por zonas, dores, catálogo de fichas, ênfase por esporte =================
// Zonas por FC: percentuais da FC máxima (FCmáx ≈ 208 − 0,7 × idade, Tanaka 2001) e teste da fala. Velocidade é só referência: varia por pessoa.
window.ZONAS=[
 {z:"Z1",nome:"Regenerativo",pct:[0.50,0.60],fala:"conversa fácil",uso:"aquecimento, volta à calma, dia seguinte a treino duro",ref:"caminhada rápida / trote muito leve"},
 {z:"Z2",nome:"Base aeróbica",pct:[0.60,0.70],fala:"frases inteiras",uso:"a maior parte do volume (70–80%)",ref:"trote confortável; dá para conversar"},
 {z:"Z3",nome:"Moderado",pct:[0.70,0.80],fala:"frases curtas",uso:"ritmo de prova longa (21k/42k)",ref:"ritmo de maratona a meia"},
 {z:"Z4",nome:"Limiar",pct:[0.80,0.90],fala:"poucas palavras",uso:"tempo runs, cruzeiro; ritmo de 10k",ref:"ritmo que você sustenta ~1 h"},
 {z:"Z5",nome:"VO₂máx",pct:[0.90,1.00],fala:"não fala",uso:"tiros de 2–5 min; ritmo de 3–5k",ref:"ritmo de 5k ou mais rápido"}];
window.fcMax=(idade)=>idade?Math.round(208-0.7*idade):null;
// Planos de corrida (3 dias/semana + força 2×). Semanas-tipo; progressão ≤10%/semana; semana 4 e 8 mais leves. Fontes: ACSM (2018) e Seiler (2010) para distribuição polarizada/piramidal; corrida longa ≤30% do volume.
window.RUN_PLANS=[
 {id:"5k",nome:"5 km",sem:8,nivel:"do zero ao 5k contínuo ou 5k mais rápido",semana:[["Fácil","Z2 · 20–35 min (iniciante: alterna 1–3 min trote / 1 min caminhada)"],["Qualidade","Z4–Z5 · 6–10 × 1–2 min forte com 1–2 min de trote; aquece e desaquece 10 min em Z1–Z2"],["Longo","Z2 · 35–50 min contínuos ou em blocos"]],prog:["Sem 1–3: sobe 5–10% o longo por semana","Sem 4: −30% (recuperação)","Sem 5–7: tiros passam de 1 min para 2–3 min","Sem 8: prova ou teste de 5k; semana com metade do volume"],forca:"2× musculação (força específica da Corrida na aba Esportes): panturrilha, posterior nórdico, step-up/afundo",nutri:"Hidratação normal; carboidrato antes só se o treino passar de 60 min."},
 {id:"10k",nome:"10 km",sem:10,nivel:"quem já corre 5k",semana:[["Fácil","Z2 · 35–45 min"],["Qualidade","Z4 · 3–5 × 5–8 min no limiar (ritmo de 10k) com 2 min de trote; ou 8–12 × 400 m em Z5"],["Longo","Z2 · 60–80 min, últimos 10 min em Z3 a partir da semana 5"]],prog:["+10% volume/semana por 3 semanas, depois −30%","Semana 8: 8 km em ritmo de prova dentro do longo","Semana 10: prova; volume cai 40%"],forca:"2× musculação; a sessão de perna 48 h antes do longo, não na véspera",nutri:"Longo >75 min: 30 g de carboidrato por hora; teste na prova o que usou no treino."},
 {id:"21k",nome:"Meia maratona",sem:12,nivel:"quem corre 10k confortável",semana:[["Fácil","Z2 · 40–50 min"],["Qualidade","Z3–Z4 · tempo run 20–40 min contínuos no ritmo de meia; alternar com 5 × 1 km em Z4"],["Longo","Z2 · 75–120 min; a cada 2 semanas com 20–30 min finais em Z3 (ritmo de prova)"]],prog:["Longo sobe 1–2 km por semana até 18 km (sem 10)","Semanas 4, 8: recuperação (−30%)","Semanas 11–12: taper, mantém intensidade, corta volume 40–50%"],forca:"2× musculação até a semana 10, 1× no taper; manter cargas, cortar séries",nutri:"Carboidrato 5–7 g/kg nos dias de longo; 30–60 g/h na prova; sódio se suar muito."},
 {id:"42k",nome:"Maratona",sem:16,nivel:"quem já correu meia; 4 dias/semana",semana:[["Fácil","Z2 · 45–60 min"],["Qualidade","Z3–Z4 · 2 × 20 min em ritmo de meia, ou 6 × 1 km em Z4; sempre com 15 min de Z1–Z2 antes e depois"],["Médio-longo","Z2 · 60–90 min no meio da semana"],["Longo","Z2 · 90–180 min; 3 longos com os 30–40 min finais em ritmo de maratona (Z3)"]],prog:["Longo de 20 km (sem 4) a 32–34 km (sem 13); nunca mais que 3 h","Semanas 4, 8, 12: −30%","Taper de 3 semanas: −20/−40/−60% de volume, intensidade mantida"],forca:"2× até a semana 12, depois 1× leve; força de panturrilha e glúteo médio protege o final da prova",nutri:"Treinar o estômago: 60–90 g de carboidrato por hora nos longos acima de 2 h; carga de carboidrato 8–10 g/kg nos 2 dias antes da prova (Burke 2011)."}];
// Locais de dor (0–10) no pós-sessão e no registro de esporte
window.DORES=[["cotovelo","Cotovelo"],["joelho","Joelho"],["ombro","Ombro"],["lombar","Lombar"],["punho","Punho"],["quadril","Quadril"],["tornozelo","Tornozelo"],["pescoco","Pescoço"],["maos","Mãos e dedos"],["pes","Pés"]];
// Catálogo de fichas prontas (presets do gerador). dias = sessões de musculação/semana.
window.CATALOGO=[
 {k:"fb_iniciante",n:"Corpo inteiro 3× · começando",d:"3 dias · todos os grupos em cada sessão · aprender o movimento",cfg:{objetivoTreino:"geral",dias:3,experiencia:"iniciante"}},
 {k:"fb_2",n:"Corpo inteiro 2× · pouco tempo",d:"2 dias · compostos pesados · 45 min",cfg:{objetivoTreino:"hipertrofia",dias:2,experiencia:"intermediario"}},
 {k:"ul_4",n:"Superior / Inferior 4×",d:"4 dias · cada grupo 2× por semana · o mais usado",cfg:{objetivoTreino:"hipertrofia",dias:4,experiencia:"intermediario",preferSplit:"ul"}},
 {k:"ppl_3",n:"Push / Pull / Legs 3×",d:"3 dias · uma sessão por padrão de movimento",cfg:{objetivoTreino:"hipertrofia",dias:3,experiencia:"avancado",preferSplit:"ppl"}},
 {k:"ppl_6",n:"Push / Pull / Legs 6×",d:"6 dias · alto volume · avançado",cfg:{objetivoTreino:"hipertrofia",dias:6,experiencia:"avancado",preferSplit:"ppl"}},
 {k:"forca_3",n:"Força 3× · cargas altas",d:"3 dias · 3–6 reps nos compostos · 3 min de descanso",cfg:{objetivoTreino:"forca",dias:3,experiencia:"avancado"}},
 {k:"forca_4",n:"Força 4× · superior/inferior",d:"4 dias · força nos compostos, hipertrofia nos acessórios",cfg:{objetivoTreino:"forca",dias:4,experiencia:"avancado",preferSplit:"ul"}},
 {k:"emagrecer_4",n:"Perder gordura 4×",d:"4 dias · descanso curto · compostos primeiro · cardio depois",cfg:{objetivoTreino:"emagrecer",dias:4,experiencia:"intermediario",preferSplit:"ul"}},
 {k:"gluteo_4",n:"Glúteo e pernas 4× · ênfase",d:"4 dias · hip thrust, abdução e unilaterais em dose extra",cfg:{objetivoTreino:"hipertrofia",dias:4,experiencia:"intermediario",preferSplit:"ul",prioridades:["gluteo","pernas"]}},
 {k:"ombro_costas_4",n:"Costas e ombros 4× · ênfase",d:"4 dias · puxadas e deltoide lateral com séries extras",cfg:{objetivoTreino:"hipertrofia",dias:4,experiencia:"intermediario",preferSplit:"ul",prioridades:["costas","ombro"]}},
 {k:"atleta_3",n:"Atleta 3× · potência",d:"3 dias · 3–5 reps, descanso longo · para quem compete em outro esporte",cfg:{objetivoTreino:"potencia",dias:3,experiencia:"avancado",prioridades:["pernas","core"]}},
 {k:"saude_50",n:"Saúde e longevidade 3× · 50+",d:"3 dias · 8–12 reps a RIR 2–3 · força, equilíbrio e massa magra",cfg:{objetivoTreino:"saude",dias:3,experiencia:"iniciante"}},
 {k:"casa_3",n:"Em casa 3× · corpo e elásticos",d:"3 dias · sem academia",cfg:{objetivoTreino:"geral",dias:3,experiencia:"iniciante",modo:"semequip"}},
 {k:"hyrox_s",n:"Híbrido Hyrox · 2 força + 2 corrida",d:"resistência muscular + corrida · simulação quinzenal",cfg:{objetivoTreino:"resistencia",dias:2,experiencia:"intermediario",prioridades:["pernas","core"]}}];
// Ênfase no esporte: exercícios do acervo que entram (ou substituem) na ficha de musculação. [id, motivo]
window.SPORT_EX={
 corrida:[["nordic_curl","posterior: −51% lesão (van Dyk 2019)"],["step_up","unilateral, transfere para a passada"],["panturrilha_unilateral","tendão de Aquiles e sóleo"]],
 bjj:[["remada_invertida","puxar com o corpo: pegada e costas"],["pallof_hold","anti-rotação: guarda e raspagem"],["barra_fixa","pegada e dorsal"]],
 boxe:[["pallof_hold","rotação de tronco controlada"],["remada_unilateral_polia","costas e ombro posterior"],["crucifixo_inverso_polia","saúde do ombro"]],
 futebol:[["nordic_curl","posterior: menos lesão (van Dyk 2019)"],["bulgarian_smith","força unilateral e sprint"],["aducao_isometrica","adutores: virilha"]],
 hyrox:[["sled_push","estação 2"],["farmer_carry","estação 6"],["wall_ball","estação 8"]],
 natacao:[["puxada_frente","dorsal: fase de tração"],["crucifixo_inverso_polia","manguito e ombro posterior"],["pallof_hold","tronco estável na água"]],
 crossfit:[["agachamento_smith","padrão básico pesado"],["barra_fixa","pull-up"],["remo_erg","motor"]],
 ciclismo:[["leg_press","quadríceps em amplitude de pedal"],["step_up","unilateral"],["prancha_lateral","tronco no guidão"]],
 tenis:[["pallof_hold","rotação e anti-rotação"],["afundo_reverso","deslocamento lateral e frenagem"],["crucifixo_inverso_polia","ombro posterior: saque"]],
 volei:[["agachamento_smith","salto"],["panturrilha_smith","impulsão"],["crucifixo_inverso_polia","ombro: ataque"]],
 bike:[["leg_press","quadríceps"],["step_up","unilateral"],["prancha_lateral","tronco"]]};
// Modos de equipamento adicionais (os ids existem no acervo)
window.MODOS_V3={halteres:"Só halteres e banco",maquinas:"Só máquinas (sem barra livre)",elastico:"Só elásticos",calistenia:"Barra fixa e paralelas (calistenia)"};
window.EQUIP_V3={halteres:["halteres","banco","corpo"],maquinas:["maquina","polia","smith","corpo"],elastico:["band","corpo"],calistenia:["corpo","band"]};
// Treino e mulheres: princípios que entram automaticamente quando o perfil é feminino (McNulty 2020; Colenso-Semple 2023; Roberts 2020)
window.FEM_AUTO={titulo:"Ajustes automáticos para você",itens:["Mesmas regras de volume e intensidade: mulheres respondem igual ao treino de força por kg de massa magra (Roberts 2020).","Ciclo menstrual não muda o programa por padrão: as evidências não sustentam periodizar por fase (McNulty 2020; Colenso-Semple 2023). Se a fase lútea pesar, deixe o check-in registrar e o coach reduz 1 série.","Glúteo e posterior ganham 1 série extra quando você marca essa prioridade; não é obrigatório.","Ferro: se sentir fadiga fora do normal, exame de ferritina com médico antes de suplementar.","Proteína e calorias seguem a mesma calculadora conservadora; nada de 1200 kcal."]};
