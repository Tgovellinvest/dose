// DOSE · strava-sync: para o usuário logado, renova o token se preciso e devolve as atividades novas do Strava já no formato do app.
import { createClient } from "jsr:@supabase/supabase-js@2";

const CID = Deno.env.get("STRAVA_CLIENT_ID") ?? "";
const CSEC = Deno.env.get("STRAVA_CLIENT_SECRET") ?? "";
const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SB_SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type, apikey", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

// Mapeia tipo do Strava -> tipo do DOSE
const TIPO: Record<string, string> = { Run: "Corrida", TrailRun: "Corrida", VirtualRun: "Esteira", Walk: "Caminhada", Hike: "Caminhada", Ride: "Bike", VirtualRide: "Bike", EBikeRide: "Bike", Swim: "Natação", Rowing: "Remo", Elliptical: "Elíptico", StairStepper: "Escada", Soccer: "Futebol", Tennis: "Tênis", Workout: "Cardio", HighIntensityIntervalTraining: "HIIT", Crossfit: "CrossFit", WeightTraining: "Musculação", MartialArts: "BJJ" };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  const auth = req.headers.get("Authorization") ?? "";
  const jwt = auth.replace(/^Bearer\s+/i, "");
  const sb = createClient(SB_URL, SB_SERVICE);
  const { data: ud, error: ue } = await sb.auth.getUser(jwt);
  if (ue || !ud?.user) return json({ error: "sessao" }, 401);
  const uid = ud.user.id;

  const { data: tok } = await sb.from("strava_tokens").select("*").eq("user_id", uid).maybeSingle();
  if (!tok) return json({ connected: false, activities: [] });

  let access = tok.access_token;
  if (Date.now() / 1000 > tok.expires_at - 60) {
    const r = await fetch("https://www.strava.com/oauth/token", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ client_id: CID, client_secret: CSEC, grant_type: "refresh_token", refresh_token: tok.refresh_token }) });
    if (!r.ok) return json({ connected: true, error: "refresh" }, 502);
    const t = await r.json(); access = t.access_token;
    await sb.from("strava_tokens").update({ access_token: t.access_token, refresh_token: t.refresh_token, expires_at: t.expires_at }).eq("user_id", uid);
  }

  const body = await req.json().catch(() => ({}));
  const after = Math.floor((body.after ? new Date(body.after).getTime() : Date.now() - 60 * 86400000) / 1000);
  const r = await fetch(`https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=100`, { headers: { Authorization: "Bearer " + access } });
  if (!r.ok) return json({ connected: true, error: "strava_" + r.status }, 502);
  const acts = await r.json();
  const out = (acts as any[]).map((a) => ({
    strava_id: a.id, data: String(a.start_date_local).slice(0, 10), tipo: TIPO[a.sport_type] ?? TIPO[a.type] ?? (a.sport_type || a.type || "Cardio"),
    min: Math.round((a.moving_time || 0) / 60), km: a.distance ? Math.round(a.distance / 100) / 10 : null,
    fc: a.average_heartrate ? Math.round(a.average_heartrate) : null, fcmax: a.max_heartrate ? Math.round(a.max_heartrate) : null,
    esforco: a.suffer_score ?? null, nome: a.name || "", elev: a.total_elevation_gain ? Math.round(a.total_elevation_gain) : null,
  }));
  await sb.from("strava_tokens").update({ last_sync: new Date().toISOString() }).eq("user_id", uid);
  return json({ connected: true, athlete_id: tok.athlete_id, activities: out });
});
