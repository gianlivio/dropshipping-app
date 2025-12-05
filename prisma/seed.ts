import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)

  // 1. Crea SUPER_ADMIN
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      name: 'Super Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  })
  console.log('✅ Super Admin creato:', admin.email)

  // 2. Crea UTENTEMASTER
  const masterUser = await prisma.user.upsert({
    where: { email: 'master@test.com' },
    update: {},
    create: {
      email: 'master@test.com',
      name: 'Mario Rossi',
      password: hashedPassword,
      role: 'UTENTEMASTER',
    },
  })
  console.log('✅ Utente Master creato:', masterUser.email)

  // 3. Crea profilo Master
  const master = await prisma.master.upsert({
    where: { userId: masterUser.id },
    update: {},
    create: {
      userId: masterUser.id,
      storeName: 'ElettricaShop',
      storeSlug: 'elettricashop',
      description: 'Materiale elettrico di qualità',
      primaryColor: '#FF6B00',
      secondaryColor: '#333333',
    },
  })
  console.log('✅ Profilo Master creato:', master.storeName)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })