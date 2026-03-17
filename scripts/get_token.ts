import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const envio = await prisma.envio.findFirst({
    where: { status: 'ENVIADO' },
    select: { token: true }
  })
  console.log('TOKEN_PARA_TESTE:', envio?.token)
}

main().finally(() => prisma.$disconnect())
