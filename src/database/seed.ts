import { AppDataSource } from './data-source'
import { Role } from '../roles/role.entity'
import { User } from '../users/user.entity'
import * as bcrypt from 'bcrypt'

async function seed() {
  try {
    await AppDataSource.initialize()
    console.log('Database connected')

    const roleRepository = AppDataSource.getRepository(Role)
    const userRepository = AppDataSource.getRepository(User)

    // สร้าง roles
    const roles = [
      {
        name: 'Administrator',
        description: 'ผู้ดูแลระบบ',
        permissions: ['all']
      },
      {
        name: 'Manager',
        description: 'ผู้จัดการ',
        permissions: ['read', 'write', 'approve']
      },
      {
        name: 'User',
        description: 'ผู้ใช้งานทั่วไป',
        permissions: ['read', 'write']
      }
    ]

    for (const roleData of roles) {
      const existingRole = await roleRepository.findOne({ where: { name: roleData.name } })
      if (!existingRole) {
        const role = roleRepository.create(roleData)
        await roleRepository.save(role)
        console.log(`Created role: ${roleData.name}`)
      }
    }

    // สร้าง admin user
    const adminRole = await roleRepository.findOne({ where: { name: 'Administrator' } })
    const existingAdmin = await userRepository.findOne({ where: { username: 'admin' } })
    
    if (!existingAdmin && adminRole) {
      const hashedPassword = await bcrypt.hash('admin123', 10)
      const adminUser = userRepository.create({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        roleId: adminRole.id
      })
      await userRepository.save(adminUser)
      console.log('Created admin user')
    }

    console.log('Seed completed successfully')
    await AppDataSource.destroy()
  } catch (error) {
    console.error('Seed failed:', error)
    process.exit(1)
  }
}

seed()