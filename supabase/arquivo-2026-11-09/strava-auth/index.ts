// DOSE · strava-auth: recebe o code do OAuth do Strava, troca por tokens e guarda para o usuário.
// O usuário é identificado pelo JWT enviado em `state` (gerado pelo app no momento do clique).
import { createClient } from "jsr:@supabase/supabase-js@2";

const APP = "https://tgovellinvest.github.io/dose/";
const CID = Deno.env.get("STRAVA_CLIENT_ID") ?? "";
const CSEC = Deno.env.get("STRAVA_CLIENT_SECRET") ?? "";
const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SB_SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const back = (q: string) => new Response(null, { status: 302, headers: { Location: APP + "#mais?t=conta&strava=" + q } });

Deno.serve(async (req) => {
  const u = new URL(req.url);
  const code = u.searchParams.get("code");
  const state = u.searchParams.get("state") ?? "";
  if (u.searchParams.get("error")) return back("negado");
  if (!code || !state) return back("erro");
  if (!CID || !CSEC) return back("semconfig");

  const sb = createClient(SB_URL, SB_SERVICE);
  const { data: userData, error: uerr } = await sb.auth.getUser(state);
  if (uerr || !userData?.user) return back("sessao");

  const r = await fetch("https://www.strava.com/oauth/token", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: CID, client_secret: CSEC, code, grant_type: "authorization_code" }),
  });
  if (!r.ok) return back("token");
  const t = await r.json();
  const { error } = await sb.from("strava_tokens").upsert({
    user_id: userData.user.id, athlete_id: t.athlete?.id ?? null,
    access_token: t.access_token, refresh_token: t.refresh_token, expires_at: t.expires_at,
  });
  return back(error ? "erro" : "ok");
});
