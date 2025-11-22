import { Roles } from '../common/enums'
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  const nombre = process.env.ADMIN_NOMBRE || 'Admin'
  const apellidoPaterno = process.env.ADMIN_APELLIDO_PATERNO || 'Principal'
  const apellidoMaterno = process.env.ADMIN_APELLIDO_MATERNO || undefined

  if (!email || !password) {
    throw new Error('❌ Falta ADMIN_EMAIL o ADMIN_PASSWORD en el .env')
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      rol: Roles.ADMIN,
      nombre,
      apellidoPaterno,
      apellidoMaterno
    }
  })

  console.log('✅ Admin sembrado correctamente:', admin.email)
}

main()
  .catch((e) => {
    console.error('❌ Error en seed admin:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
