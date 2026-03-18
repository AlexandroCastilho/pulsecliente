# Guia de Deploy no Vercel - Pulse7.0

Este guia contém os passos necessários para colocar sua aplicação online usando o **Vercel**.

## 1. Preparação do Repositório
Certifique-se de que seu código está em um repositório (GitHub, GitLab ou Bitbucket).

## 2. Configuração no Dashboard do Vercel
1. Vá para [vercel.com](https://vercel.com) e clique em **"Add New"** > **"Project"**.
2. Importe seu repositório do Pulse7.0.

## 3. Configurações de Build
O Vercel deve detectar automaticamente as configurações de Next.js, mas confirme:
- **Framework Preset:** Next.js
- **Root Directory:** `./`
- **Build Command:** `next build`
- **Output Directory:** `.next`
- **Install Command:** `npm install` (ou `yarn install`)

## 4. Variáveis de Ambiente (CRÍTICO)
No campo **"Environment Variables"**, adicione as seguintes chaves do seu arquivo `.env`:

### Supabase & Auth
- `NEXT_PUBLIC_SUPABASE_URL`: Sua URL do Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Sua chave anônima.

### Banco de Dados (PostgreSQL)
- `DATABASE_URL`: URL de conexão (Recomendado usar o Transaction Mode/Pooling do Supabase).
- `DIRECT_URL`: URL de conexão direta para migrações Prisma.

### Aplicação & Segurança
- `NEXT_PUBLIC_APP_URL`: A URL final do seu site (ex: `https://pulse7.vercel.app`).
- `CRON_SECRET`: Um segredo forte para proteger seus Workers/Cron Jobs.

### E-mail (Nodemailer) - Opcional se configurado via UI
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_NAME`, `SMTP_FROM_EMAIL`.

## 5. Prisma & Banco de Dados
Como incluímos o `postinstall: prisma generate` no `package.json`, o Vercel gerará o cliente do Prisma automaticamente durante o build.

**Importante:** Antes do primeiro deploy, certifique-se de que seu banco de dados está sincronizado:
```bash
npx prisma db push
```

## 6. Logs e Depuração
Após o deploy, você pode acompanhar os logs em tempo real na aba **"Logs"** do seu projeto no Vercel para garantir que as rotas de API e Workers estão funcionando corretamente.

---
*Dica: Se você encontrar erros de timeout em funções serverless, verifique se está usando @supabase/ssr corretamente e se o pooling do banco de dados está ativo.*
