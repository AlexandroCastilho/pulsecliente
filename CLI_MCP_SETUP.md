# Conexao com Vercel e Supabase via CLI ou MCP

Este projeto agora tem um arquivo `.mcp.json` com os endpoints remotos de MCP para `Vercel` e `Supabase`.

Resumo rapido:

- `Vercel MCP`: `https://mcp.vercel.com`
- `Supabase MCP`: `https://mcp.supabase.com/mcp?read_only=true`
- O `Supabase MCP` foi deixado em modo somente leitura por seguranca.
- Se quiser limitar o acesso do Supabase a um unico projeto, adicione `&project_ref=SEU_PROJECT_REF` na URL.

## 1. Usar via MCP no Codex

Se o seu Codex estiver instalado no terminal normal, rode:

```powershell
codex mcp add vercel --url https://mcp.vercel.com
codex mcp add supabase --url "https://mcp.supabase.com/mcp?read_only=true"
```

Se quiser escopar o Supabase para um projeto especifico:

```powershell
codex mcp add supabase --url "https://mcp.supabase.com/mcp?project_ref=SEU_PROJECT_REF&read_only=true"
```

Observacoes:

- `Vercel MCP` usa OAuth e deve abrir o navegador na primeira autenticacao.
- `Supabase MCP` tambem suporta login por navegador e nao exige PAT no fluxo normal.
- O Supabase recomenda nao conectar MCP em dados de producao; prefira desenvolvimento, branch de banco, ou `read_only=true`.

## 2. Usar via CLI do Vercel

Instalacao:

```powershell
npm install -g vercel
```

Fluxo minimo:

```powershell
vercel login
vercel link
vercel env pull .env.local
vercel deploy
vercel deploy --prod
```

Comandos uteis:

```powershell
vercel project ls
vercel list
vercel logs DEPLOYMENT_URL --follow
vercel open
```

## 3. Usar via CLI do Supabase

Opcao sem instalacao global:

```powershell
npx supabase --help
```

Instalacao local no projeto:

```powershell
npm install supabase --save-dev
```

Fluxo minimo para vincular ao projeto remoto:

```powershell
npx supabase login
npx supabase link
```

Fluxo local completo, se quiser subir o stack Supabase no Docker:

```powershell
npx supabase init
npx supabase start
```

Comandos uteis:

```powershell
npx supabase projects list
npx supabase db push
npx supabase gen types typescript --linked
```

## 4. Ajuste recomendado para este projeto

Para este app Next.js com Prisma + Supabase:

1. Conecte o `Vercel` pela CLI para facilitar `link`, `env pull` e deploy.
2. Conecte o `Supabase` via MCP em `read_only` para inspecao, tipos e consultas assistidas.
3. Use a `Supabase CLI` para `link`, `db push`, migrations e tipos.

## 5. O que faltou fazer automaticamente aqui

Neste ambiente de execucao, `node`, `npm`, `vercel` e `supabase` nao estavam disponiveis no `PATH`, entao eu nao consegui autenticar as CLIs por voce nem executar `codex mcp add` daqui.

Quando voce rodar os comandos acima no seu terminal normal, a conexao deve fechar rapidamente.
