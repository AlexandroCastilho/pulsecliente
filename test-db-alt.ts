
import { PrismaClient } from '@prisma/client'

// Testando formato alternativo: Pooler Session Mode (porta 5432)
const url1 = "postgres://postgres.defynkuuopwczihxlfda:Luisa%40276148@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
const url2 = "postgres://postgres.defynkuuopwczihxlfda:Luisa%40276148@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"

async function test(url: string, label: string) {
  const prisma = new PrismaClient({
    datasources: {
      db: { url }
    }
  })
  try {
    console.log(`Testando ${label}...`)
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log(`${label} OK:`, result)
    return true
  } catch (error: any) {
    console.error(`${label} FALHOU:`, error.message)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

async function runTests() {
  await test(url1, 'Pooler Session (aws-0)')
  await test(url2, 'Pooler Session (aws-1)')
}

runTests()
