# Funções do Supabase desligadas em 2026-11-09

Decisão do Tiago em 09/11/2026: apagar `health-sync` (sem uso desde 27/10, quando a Saúde do iPhone saiu do app) e as duas funções do Strava (`strava-auth` e `strava-sync`, nunca configuradas).

O conector do Supabase usado pelo Claude não tem a opção de apagar função. Por isso cada uma foi trocada por uma versão que só responde 410 (desativada), e o código original foi guardado aqui para poder voltar. Nenhum segredo está nestes arquivos: as chaves ficavam nas variáveis de ambiente do Supabase.

Para apagar de vez: painel do Supabase › Edge Functions › cada função › Delete.
As tabelas `strava_tokens`, `health_keys` e `health_daily` continuam no banco.
