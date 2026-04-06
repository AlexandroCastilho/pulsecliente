/**
 * Script de diagnóstico de conexões do PULSE7.0
 * Testa: Supabase API, Supabase Auth, Database via Prisma
 */
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '..', '.env.local') })
config({ path: resolve(__dirname, '..', '.env') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const DATABASE_URL = process.env.DATABASE_URL
const DIRECT_URL = process.env.DIRECT_URL

console.log('═══════════════════════════════════════════════════')
console.log('  🔍 PULSE7.0 — Diagnóstico de Conexões')
console.log('═══════════════════════════════════════════════════')
console.log()

// ── 1. Verificar variáveis de ambiente ──
console.log('📋 1. VARIÁVEIS DE AMBIENTE')
console.log('──────────────────────────────────────────────')
console.log(`  NEXT_PUBLIC_SUPABASE_URL:      ${SUPABASE_URL ? '✅ Definida' : '❌ AUSENTE'}`)
console.log(`  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? '✅ Definida' : '❌ AUSENTE'}`)
console.log(`  SUPABASE_SERVICE_ROLE_KEY:     ${SUPABASE_SERVICE_ROLE_KEY ? '✅ Definida' : '❌ AUSENTE'}`)
console.log(`  DATABASE_URL:                  ${DATABASE_URL ? '✅ Definida' : '❌ AUSENTE'}`)
console.log(`  DIRECT_URL:                    ${DIRECT_URL ? '✅ Definida' : '❌ AUSENTE'}`)
console.log(`  SMTP_ENCRYPTION_KEY:           ${process.env.SMTP_ENCRYPTION_KEY ? '✅ Definida' : '❌ AUSENTE'}`)
console.log(`  STRIPE_SECRET_KEY:             ${process.env.STRIPE_SECRET_KEY ? '✅ Definida' : '❌ AUSENTE'}`)
console.log(`  CRON_SECRET:                   ${process.env.CRON_SECRET ? '✅ Definida' : '❌ AUSENTE'}`)
console.log()

// ── 2. Testar Supabase REST API (health) ──
console.log('🌐 2. SUPABASE REST API')
console.log('──────────────────────────────────────────────')
try {
  const healthRes = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    }
  })
  console.log(`  Status HTTP: ${healthRes.status} ${healthRes.statusText}`)
  if (healthRes.ok) {
    console.log('  ✅ Supabase REST API respondendo normalmente')
  } else {
    const body = await healthRes.text()
    console.log(`  ❌ Erro: ${body.substring(0, 200)}`)
  }
} catch (error) {
  console.log(`  ❌ Falha na conexão: ${error.message}`)
}
console.log()

// ── 3. Testar Supabase Auth ──
console.log('🔐 3. SUPABASE AUTH')
console.log('──────────────────────────────────────────────')
try {
  const authRes = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    }
  })
  console.log(`  Status HTTP: ${authRes.status} ${authRes.statusText}`)
  if (authRes.ok) {
    const authData = await authRes.json()
    console.log('  ✅ Supabase Auth respondendo normalmente')
    console.log(`  Provedor de e-mail ativo: ${authData.external?.email ? '✅' : '❌'}`)
    console.log(`  Confirmação de e-mail: ${authData.mailer_autoconfirm ? 'Auto-confirm' : 'Requer confirmação'}`)
  } else {
    const body = await authRes.text()
    console.log(`  ❌ Erro: ${body.substring(0, 200)}`)
  }
} catch (error) {
  console.log(`  ❌ Falha na conexão Auth: ${error.message}`)
}
console.log()

// ── 4. Testar Supabase Admin (Service Role) ──
console.log('🔑 4. SUPABASE SERVICE ROLE (Admin)')
console.log('──────────────────────────────────────────────')
if (SUPABASE_SERVICE_ROLE_KEY) {
  try {
    const adminRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=1`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      }
    })
    console.log(`  Status HTTP: ${adminRes.status} ${adminRes.statusText}`)
    if (adminRes.ok) {
      const adminData = await adminRes.json()
      const userCount = adminData.users?.length ?? 0
      console.log(`  ✅ Service Role Key válida — ${userCount} usuário(s) retornado(s)`)
    } else {
      const body = await adminRes.text()
      console.log(`  ❌ Erro: ${body.substring(0, 200)}`)
    }
  } catch (error) {
    console.log(`  ❌ Falha na conexão Admin: ${error.message}`)
  }
} else {
  console.log('  ⚠️  SUPABASE_SERVICE_ROLE_KEY não definida — Pulando teste')
}
console.log()

// ── 5. Testar conexão com Database via SQL direto ──
console.log('🗄️  5. DATABASE (Conexão via PgBouncer)')
console.log('──────────────────────────────────────────────')
try {
  // Simple connection test via PostgREST (lê tabelas públicas)
  const dbRes = await fetch(`${SUPABASE_URL}/rest/v1/empresas?select=id&limit=1`, {
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY}`,
      'Prefer': 'count=exact'
    }
  })
  console.log(`  Status HTTP: ${dbRes.status} ${dbRes.statusText}`)
  const rangeHeader = dbRes.headers.get('content-range')
  if (dbRes.ok) {
    const data = await dbRes.json()
    console.log(`  ✅ PostgREST respondendo — Tabela 'empresas' acessível`)
    console.log(`  Registros encontrados: ${rangeHeader || data.length + ' (na resposta)'}`)
  } else {
    const body = await dbRes.text()
    console.log(`  ❌ Erro: ${body.substring(0, 300)}`)
  }
} catch (error) {
  console.log(`  ❌ Falha na conexão DB: ${error.message}`)
}
console.log()

// ── 6. Testar todas as tabelas via PostgREST ──
console.log('📊 6. VERIFICAÇÃO DE TABELAS')
console.log('──────────────────────────────────────────────')
const tables = ['empresas', 'usuarios', 'pesquisas', 'perguntas', 'envios', 'respostas', 'smtp_configs', 'notificacoes', 'convites', 'stripe_events']
for (const table of tables) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id&limit=1`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY}`,
        'Prefer': 'count=exact'
      }
    })
    const range = res.headers.get('content-range')
    if (res.ok) {
      const total = range ? range.split('/')[1] : '?'
      console.log(`  ✅ ${table.padEnd(16)} — ${total} registro(s)`)
    } else {
      const errBody = await res.text()
      // Check for 404 vs permission error
      if (res.status === 404) {
        console.log(`  ❌ ${table.padEnd(16)} — TABELA NÃO ENCONTRADA`)
      } else {
        console.log(`  ⚠️  ${table.padEnd(16)} — HTTP ${res.status}: ${errBody.substring(0, 100)}`)
      }
    }
  } catch (error) {
    console.log(`  ❌ ${table.padEnd(16)} — Erro: ${error.message}`)
  }
}
console.log()

// ── 7. Testar Prisma Client ──
console.log('🔧 7. PRISMA CLIENT')
console.log('──────────────────────────────────────────────')
try {
  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient()
  
  // Teste básico de query
  const empresaCount = await prisma.empresa.count()
  const usuarioCount = await prisma.usuario.count()
  const pesquisaCount = await prisma.pesquisa.count()
  const envioCount = await prisma.envio.count()
  
  console.log(`  ✅ Prisma Client conectado com sucesso!`)
  console.log(`     Empresas:   ${empresaCount}`)
  console.log(`     Usuários:   ${usuarioCount}`)
  console.log(`     Pesquisas:  ${pesquisaCount}`)
  console.log(`     Envios:     ${envioCount}`)
  
  await prisma.$disconnect()
} catch (error) {
  console.log(`  ❌ Erro Prisma: ${error.message}`)
}
console.log()

// ── Resumo ──
console.log('═══════════════════════════════════════════════════')
console.log('  📝 DIAGNÓSTICO CONCLUÍDO')
console.log('═══════════════════════════════════════════════════')
