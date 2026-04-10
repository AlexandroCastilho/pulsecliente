/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const envios = await prisma.envio.findMany({
    where: { status: 'PENDENTE' },
    select: { token: true, emailDestinatario: true },
    take: 1
  })
  console.log(JSON.stringify(envios, null, 2))
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
