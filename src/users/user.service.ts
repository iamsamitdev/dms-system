import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ){}

    // ฟังก์ชันค้นหาผู้ใช้ตาม username
    async findByUsername(username: string): Promise<User | null> {
        return this.userRepository.findOne({ 
            where: { username },
            relations: ['role'] 
        })
    }

    // ฟังก์ชันค้นหาผู้ใช้ตาม email
    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ 
            where: { email },
            relations: ['role'] 
        })
    }

    // ฟังก์ชันค้นหาผู้ใช้ตาม ID
    async findById(id: number): Promise<User | null> {
        return this.userRepository.findOne({ 
            where: { id },
            relations: ['role'] 
        })
    }

    // ฟังก์ชันค้นหาผู้ใช้ทั้งหมด
    async findAll(): Promise<User[]> {
        return this.userRepository.find({ relations: ['role'] })
    }

    // ฟังก์ชันสร้างผู้ใช้ใหม่
    async create(userData: {
        username: string,
        email: string,
        password: string,
        firstName?: string,
        lastName?: string,
        roleId?: number
        }): Promise<User> {
            // Hash password ก่อนบันทึก
            const hashedPassword = await bcrypt.hash(userData.password, 10)

            const user = this.userRepository.create({
                ...userData,
                password: hashedPassword,
                roleId: userData.roleId || 3, // กำหนด roleId เป็น 3(ผู้ใช้ทั่วไป) ถ้าไม่ระบุ
            })
            return this.userRepository.save(user)
        }

    // ฟังก์ชันอัปเดตผู้ใช้
    async update(id: number, updateData: Partial<User>): Promise<User | null> {
        await this.userRepository.update(id, updateData)
        return this.findById(id)
    }

    // ฟังก์ชัน updateLastLogin
    async updateLastLogin(id: number): Promise<void> {
        await this.userRepository.update(id, {
            lastLoginAt: new Date(),
        })
    }

    // ฟังก์ชันลบผู้ใช้
    async delete(id: number): Promise<void> {
        await this.userRepository.delete(id)
    }

}