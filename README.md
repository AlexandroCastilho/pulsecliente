# 💎 Pulse7.0 — Elite Customer Experience Platform

A **Pulse7.0** é uma plataforma SaaS premium dedicada à gestão de satisfação e feedback de clientes. Projetada para empresas que buscam excelência técnica e uma experiência de usuário impecável, a plataforma combina métricas de NPS, avaliações em estrelas e feedbacks qualitativos em um ecossistema de alta performance.

---

## 🚀 Diferenciais de Elite

### 🛡️ Engenharia de UX & Acessibilidade (WCAG 2.2 AA)
Implementamos um rigoroso padrão de acessibilidade e usabilidade:
- **Navegação Semântica**: Componentes ARIA-compliant (Tabs, Modais, Accordions) com suporte total a teclado.
- **Hierarquia Visual Superior**: Design focado em legibilidade (textos ≥ 11px) e contraste otimizado.
- **Feedback Unificado**: Sistema de alertas orientado à ação, garantindo clareza em cada interação.

### 📊 Inteligência de Dados & Saúde da Base
Nosso Wizard de Envios não apenas dispara pesquisas, ele audita sua base:
- **Auditoria de Lista**: Identificação automática de e-mails inválidos, duplicados e métricas de aproveitamento em tempo real.
- **NPS Pro**: Classificação automática de Detratores, Neutros e Promotores com visualização consolidada.
- **Métricas de Performance**: Dashboard de elite com carregamento instantâneo e dados consolidados.

### ⚙️ Infraestrutura Robusta
- **Multi-Tenant Seguro**: Isolamento total de dados entre organizações com arquitetura escalável.
- **Motor de E-mails Próprio**: Suporte a múltiplos SMTPs com reputação controlada pela marca.
- **Design Moderno**: Interface construída com **Tailwind CSS v4** e micro-animações fluidas via **Framer Motion**.

---

## 🛠️ Stack Tecnológico

- **Core**: [Next.js 16.1.7 (App Router)](https://nextjs.org)
- **Database**: PostgreSQL via [Supabase](https://supabase.com)
- **ORM**: [Prisma](https://prisma.io)
- **Styling**: Tailwind CSS & Lucide Icons
- **Animation**: Framer Motion
- **Notificações**: Sonner (Toast System)

---

## 🏁 Guia Rápido de Configuração

### 1. Preparação do Ambiente
Certifique-se de possuir o **Node.js 20+** instalado.

```bash
# Clone e instalação
npm install

# Sincronização de Banco e Prisma
npx prisma db push
npx prisma generate
```

### 2. Variáveis de Ambiente (`.env`)
Configure as conexões essenciais para o funcionamento:
- `DATABASE_URL`: Conexão direta com PostgreSQL.
- `NEXT_PUBLIC_SUPABASE_URL` & `ANON_KEY`: Integração com Supabase Auth/Storage.
- `SUPABASE_SERVICE_ROLE_KEY`: Acesso administrativo seguro.

### 3. Execução
```bash
npm run dev
```

---

## 🌍 Deploy (Vercel)

A plataforma está otimizada para o ecossistema Vercel, com suporte nativo a Edge Functions e otimização de imagem automática.

---
Desenvolvido com o compromisso de transformar cada feedback em uma oportunidade de crescimento. 🚀
