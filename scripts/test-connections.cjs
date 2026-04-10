/**
 * Script de diagnóstico de conexões do PULSE7.0
 * Testa: Supabase API, Supabase Auth, Database via Prisma
 * Sem dependências externas (lê .env manualmente)
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path')

// Carregar .env manualmente
function loadEnv(filepath) {
  if (!fs.existsSync(filepath)) return
  const content = fs.readFileSync(filepath, 'utf8')
  content.split('\n').forEach(line => {
    line = line.trim().replace(/\r$/, '')
    if (!line || line.startsWith('#')) return
    const eqIndex = line.indexOf('=')
    if (eqIndex === -1) return
    const key = line.substring(0, eqIndex).trim()
    let value = line.substring(eqIndex + 1).trim()
    // Remove quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) {
      process.env[key] = value
    }
  })
}

loadEnv(path.resolve(__dirname, '..', '.env.local'))
loadEnv(path.resolve(__dirname, '..', '.env'))

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const DATABASE_URL = process.env.DATABASE_URL
const DIRECT_URL = process.env.DIRECT_URL

async function run() {
  console.log('')
  console.log('===================================================')
  console.log('  PULSE7.0 - Diagnostico de Conexoes')
  console.log('===================================================')
  console.log('')

  // 1. Variáveis de Ambiente
  console.log('[1] VARIAVEIS DE AMBIENTE')
  console.log('---------------------------------------------------')
  console.log('  SUPABASE_URL:          ' + (SUPABASE_URL ? 'OK -> ' + SUPABASE_URL : 'AUSENTE'))
  console.log('  SUPABASE_ANON_KEY:     ' + (SUPABASE_ANON_KEY ? 'OK -> ' + SUPABASE_ANON_KEY.substring(0,25) + '...' : 'AUSENTE'))
  console.log('  SERVICE_ROLE_KEY:      ' + (SUPABASE_SERVICE_ROLE_KEY ? 'OK (definida)' : 'AUSENTE'))
  console.log('  DATABASE_URL:          ' + (DATABASE_URL ? 'OK (definida)' : 'AUSENTE'))
  console.log('  DIRECT_URL:            ' + (DIRECT_URL ? 'OK (definida)' : 'AUSENTE'))
  console.log('  SMTP_ENCRYPTION_KEY:   ' + (process.env.SMTP_ENCRYPTION_KEY ? 'OK' : 'AUSENTE'))
  console.log('  STRIPE_SECRET_KEY:     ' + (process.env.STRIPE_SECRET_KEY ? 'OK' : 'AUSENTE'))
  console.log('  CRON_SECRET:           ' + (process.env.CRON_SECRET ? 'OK' : 'AUSENTE'))
  console.log('')

  // 2. Supabase REST API
  console.log('[2] SUPABASE REST API')
  console.log('---------------------------------------------------')
  try {
    const healthRes = await fetch(SUPABASE_URL + '/rest/v1/', {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      }
    })
    console.log('  Status HTTP: ' + healthRes.status + ' ' + healthRes.statusText)
    if (healthRes.ok || healthRes.status === 200) {
      console.log('  [OK] Supabase REST API respondendo normalmente')
    } else {
      const body = await healthRes.text()
      console.log('  [WARN] Resposta: ' + body.substring(0, 200))
    }
  } catch (error) {
    console.log('  [ERRO] Falha na conexao: ' + error.message)
  }
  console.log('')

  // 3. Supabase Auth
  console.log('[3] SUPABASE AUTH')
  console.log('---------------------------------------------------')
  try {
    const authRes = await fetch(SUPABASE_URL + '/auth/v1/settings', {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      }
    })
    console.log('  Status HTTP: ' + authRes.status + ' ' + authRes.statusText)
    if (authRes.ok) {
      const authData = await authRes.json()
      console.log('  [OK] Supabase Auth respondendo normalmente')
      console.log('      E-mail habilitado: ' + (authData.external?.email ? 'SIM' : 'NAO'))
      console.log('      Auto-confirm: ' + (authData.mailer_autoconfirm ? 'SIM' : 'NAO (requer verificacao)'))
    } else {
      const body = await authRes.text()
      console.log('  [ERRO] ' + body.substring(0, 200))
    }
  } catch (error) {
    console.log('  [ERRO] Falha Auth: ' + error.message)
  }
  console.log('')

  // 4. Service Role
  console.log('[4] SUPABASE SERVICE ROLE (Admin)')
  console.log('---------------------------------------------------')
  if (SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const adminRes = await fetch(SUPABASE_URL + '/auth/v1/admin/users?page=1&per_page=3', {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_SERVICE_ROLE_KEY,
        }
      })
      console.log('  Status HTTP: ' + adminRes.status + ' ' + adminRes.statusText)
      if (adminRes.ok) {
        const adminData = await adminRes.json()
        const users = adminData.users || []
        console.log('  [OK] Service Role Key valida — ' + users.length + ' usuario(s) retornado(s)')
        users.forEach(u => {
          console.log('      - ' + u.email + ' (confirmado: ' + (u.email_confirmed_at ? 'SIM' : 'NAO') + ')')
        })
      } else {
        const body = await adminRes.text()
        console.log('  [ERRO] ' + body.substring(0, 200))
      }
    } catch (error) {
      console.log('  [ERRO] ' + error.message)
    }
  } else {
    console.log('  [SKIP] SERVICE_ROLE_KEY nao definida')
  }
  console.log('')

  // 5. Tabelas via PostgREST
  console.log('[5] VERIFICACAO DE TABELAS VIA POSTGREST')
  console.log('---------------------------------------------------')
  const authKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY
  const tables = ['empresas', 'usuarios', 'pesquisas', 'perguntas', 'envios', 'respostas', 'smtp_configs', 'notificacoes', 'convites', 'stripe_events']
  for (const table of tables) {
    try {
      const res = await fetch(SUPABASE_URL + '/rest/v1/' + table + '?select=id&limit=1', {
        headers: {
          'apikey': authKey,
          'Authorization': 'Bearer ' + authKey,
          'Prefer': 'count=exact'
        }
      })
      const range = res.headers.get('content-range')
      if (res.ok) {
        const total = range ? range.split('/')[1] : '?'
        console.log('  [OK]   ' + table.padEnd(16) + ' -> ' + total + ' registro(s)')
      } else {
        const errBody = await res.text()
        try {
          const parsed = JSON.parse(errBody)
          console.log('  [WARN] ' + table.padEnd(16) + ' -> HTTP ' + res.status + ': ' + (parsed.message || '').substring(0, 80))
        } catch {
          console.log('  [WARN] ' + table.padEnd(16) + ' -> HTTP ' + res.status)
        }
      }
    } catch (error) {
      console.log('  [ERRO] ' + table.padEnd(16) + ' -> ' + error.message)
    }
  }
  console.log('')

  // 6. Prisma Client
  console.log('[6] PRISMA CLIENT (Conexao direta ao banco)')
  console.log('---------------------------------------------------')
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    
    const empresaCount = await prisma.empresa.count()
    const usuarioCount = await prisma.usuario.count()
    const pesquisaCount = await prisma.pesquisa.count()
    const envioCount = await prisma.envio.count()
    const respostaCount = await prisma.resposta.count()
    const notificacaoCount = await prisma.notificacao.count()
    
    console.log('  [OK] Prisma Client conectado com sucesso!')
    console.log('      Empresas:      ' + empresaCount)
    console.log('      Usuarios:      ' + usuarioCount)
    console.log('      Pesquisas:     ' + pesquisaCount)
    console.log('      Envios:        ' + envioCount)
    console.log('      Respostas:     ' + respostaCount)
    console.log('      Notificacoes:  ' + notificacaoCount)
    
    // Teste de integridade
    try {
      const orphanUsers = await prisma.$queryRawUnsafe(`
        SELECT u.id, u.email FROM usuarios u 
        LEFT JOIN empresas e ON u."empresaId" = e.id 
        WHERE e.id IS NULL
      `)
      if (orphanUsers.length > 0) {
        console.log('  [WARN] ' + orphanUsers.length + ' usuario(s) ORFAO(s) sem empresa:')
        orphanUsers.forEach(u => console.log('      - ' + u.email))
      } else {
        console.log('  [OK] Integridade: Todos os usuarios tem empresa vinculada')
      }
    } catch (intErr) {
      console.log('  [WARN] Nao foi possivel verificar integridade: ' + intErr.message)
    }
    
    await prisma.$disconnect()
  } catch (error) {
    console.log('  [ERRO] Prisma: ' + error.message)
    if (error.message.includes('connect') || error.message.includes('ECONNREFUSED')) {
      console.log('      Dica: Verifique se DATABASE_URL esta acessivel e se o projeto Supabase nao esta pausado')
    }
  }
  console.log('')

  console.log('===================================================')
  console.log('  DIAGNOSTICO CONCLUIDO')
  console.log('===================================================')
  console.log('')
}

run().catch(err => {
  console.error('Erro fatal:', err)
  process.exit(1)
})
