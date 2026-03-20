# 💎 PulseCliente 7.0

O PulseCliente é uma plataforma SaaS premium para gestão de pesquisas de satisfação e feedback de clientes (NPS, Estrelas, Múltipla Escolha e Texto Livre), desenvolvida com foco em performance, segurança e experiência do usuário de alto nível.

## 🚀 Funcionalidades Principais

- **📊 Dashboard de Elite**: Métricas consolidadas em tempo real com carregamento otimizado.
- **✉️ Motor de E-mails Asíncrono**: Disparos em massa processados em background para evitar timeouts.
- **🛡️ Segurança de Multi-Tenant**: Isolamento total de dados entre diferentes empresas.
- **👥 Gestão de Equipe**: Controle de membros com diferentes níveis de acesso (Owner, Admin, Member).
- **🎨 Design Moderno**: Interface responsiva, com suporte a Dark Mode e micro-animações fluidas.
- **⌨️ Acessibilidade (A11y)**: Navegação otimizada por teclado em pesquisas públicas.
- **⚙️ Configuração SMTP**: Gestão personalizada de servidores de envio de e-mail por empresa.

## 🛠️ Stack Tecnológico

- **Framework**: [Next.js 16.1.7 (App Router)](https://nextjs.org)
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL (via [Supabase](https://supabase.com))
- **ORM**: [Prisma](https://prisma.io)
- **Estilização**: Tailwind CSS v4 & Framer Motion
- **Notificações**: Sonner
- **Validação**: Zod

## 🏁 Como Começar

### Pré-requisitos
- Node.js 20+
- Instância do Supabase (PostgreSQL)

### Instalação

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure o arquivo `.env` baseando-se no `.env.example`.
   Variáveis obrigatórias:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL`
   - `DIRECT_URL`
4. Sincronize o banco de dados e gere o cliente Prisma:
   ```bash
   npx prisma db push
   npx prisma generate
   ```
5. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 🌍 Deploy (Vercel)

A aplicação está otimizada para a Vercel. O script `postinstall` garante que o Prisma seja configurado automaticamente no ambiente serverless. Veja o [Guia de Deploy Vercel](C:\Users\alexa\.gemini\antigravity\brain\52a36fed-aee5-4832-928b-dba5017e0792\walkthrough_vercel.md) para detalhes de variáveis de ambiente.

Antes de fazer deploy, configure em `Project Settings > Environment Variables`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `DIRECT_URL`

---
Desenvolvido com foco em excelência técnica e experiência do cliente. 🚀
