// DOSE · health-sync: recebe do Atalho do iPhone (sem login) um resumo diário da Saúde, autenticado pela chave pessoal do usuário.
// Body: { key, data?, peso?, passos?, sono?, fcrep?, hrv? }
// v4: aceita o que o Atalho mandar cru (número, texto "72,4 kg", lista de amostras em linhas). Passos e sono são somados aqui,
// então o atalho não precisa de 'Calcular Estatísticas'.
import { createClient } from "jsr:@supabase/supabase-js@2";

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SB_SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type, apikey", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });
const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

// Lista de valores a partir do que vier: número, array, ou texto com uma amostra por linha.
function valores(v: unknown, inteiro = false): number[] {
  if (v === null || v === undefined || v === "") return [];
  if (typeof v === "number") return Number.isFinite(v) ? [v] : [];
  if (Array.isArray(v)) return v.flatMap(x => valores(x, inteiro));
  if (typeof v === "object") { const o = v as any; return valores(o.value ?? o.valor ?? o.quantity ?? null, inteiro); }
  return String(v).split(/[\n;]+/).flatMap(linha => {
    let t = linha.replace(/\s/g, "");
    const m = t.match(/-?\d[\d.,]*/); if (!m) return [];
    t = m[0];
    if (inteiro) t = t.replace(/[.,](?=\d{3}(\D|$))/g, "").replace(",", ".");
    else if (t.includes(",")) t = t.replace(/\./g, "").replace(",", ".");
    const n = parseFloat(t); return Number.isFinite(n) ? [n] : [];
  });
}
const primeiro = (v: unknown) => { const a = valores(v); return a.length ? a[0] : null; };
const soma = (v: unknown, inteiro = false) => { const a = valores(v, inteiro); return a.length ? a.reduce((x, y) => x + y, 0) : null; };
const horasSono = (v: number | null) => { if (v === null || v <= 0) return null; if (v < 20) return v; if (v <= 1440) return v / 60; if (v < 86400) return v / 3600; return null; };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return json({ error: "metodo" }, 405);
  let b: any; try { b = await req.json(); } catch { return json({ error: "json" }, 400); }
  const km = String(b.key || "").match(UUID);
  if (!km) return json({ error: "chave" }, 401);
  const key = km[0].toLowerCase();
  const sb = createClient(SB_URL, SB_SERVICE);
  const { data: hk } = await sb.from("health_keys").select("user_id").eq("key", key).maybeSingle();
  if (!hk) return json({ error: "chave" }, 401);
  const data = /^\d{4}-\d{2}-\d{2}$/.test(String(b.data || "")) ? b.data : new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
  const row: Record<string, unknown> = { user_id: hk.user_id, data, fonte: "iphone", atualizado_em: new Date().toISOString() };
  const peso = primeiro(b.peso); if (peso && peso > 20 && peso < 400) row.peso = Math.round(peso * 10) / 10;
  const passos = soma(b.passos, true); if (passos !== null && passos >= 0 && passos < 200000) row.passos = Math.round(passos);
  const sono = horasSono(soma(b.sono)); if (sono !== null && sono > 0 && sono < 20) row.sono = Math.round(sono * 10) / 10;
  const fc = primeiro(b.fcrep); if (fc && fc > 25 && fc < 150) row.fcrep = Math.round(fc);
  const hrv = primeiro(b.hrv); if (hrv && hrv > 0 && hrv < 400) row.hrv = Math.round(hrv);
  const campos = Object.keys(row).filter(k => !["user_id","data","fonte","atualizado_em"].includes(k));
  if (!campos.length) return json({ error: "vazio", recebido: Object.keys(b) }, 400);
  const { error } = await sb.from("health_daily").upsert(row, { onConflict: "user_id,data" });
  if (error) return json({ error: "gravar", detail: error.message }, 500);
  return json({ ok: true, data, campos });
});
