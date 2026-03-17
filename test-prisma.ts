import prisma from './src/lib/prisma.js'

async function main() {
  try {
    const config = await prisma.smtpConfig.findFirst()
    console.log('SmtpConfig is accessible runtime:', !!config || true)
  } catch (e) {
    console.error('SmtpConfig is NOT accessible at runtime:', e.message)
  }
}

main()
