import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Category } from "./category.entity"

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>
    ) {}

    // ดึงหมวดหมู่ทั้งหมด (รวม inactive สำหรับ admin)
    async findAll(): Promise<Category[]> {
        return this.categoryRepository.find({
            order: { createdAt: 'DESC' }
        })
    }

    // ดึงหมวดหมู่ที่ใช้งานเท่านั้น (สำหรับ dropdown)
    async findActive(): Promise<Category[]> {
        return this.categoryRepository.find({
            where: { isActive: true },
            order: { createdAt: 'DESC' }
        })
    }

    // ดึงหมวดหมู่ตาม ID
    async findById(id: string): Promise<Category | null> {
        return this.categoryRepository.findOne({
            where: { id }
        })
    }

    // สร้างหมวดหมู่ใหม่
    async create(categoryData: {
        name: string
        description?: string
    }): Promise<Category> {
        const category = this.categoryRepository.create(categoryData)
        return this.categoryRepository.save(category)
    }

    // อัพเดทหมวดหมู่
    async update(id: string, categoryData: {
        name?: string
        description?: string
        isActive?: boolean
    }): Promise<Category | null> {
        await this.categoryRepository.update(id, categoryData)
        return this.findById(id)
    }

    // ลบหมวดหมู่ (soft delete)
    async delete(id: string): Promise<boolean> {
        const result = await this.categoryRepository.update(id, { isActive: false })
        return (result.affected ?? 0) > 0
    }

    // ตรวจสอบว่าชื่อหมวดหมู่ซ้ำหรือไม่
    async isNameExists(name: string, excludeId?: string): Promise<boolean> {
        const query = this.categoryRepository.createQueryBuilder('category')
            .where('category.name = :name', { name })
            .andWhere('category.isActive = :isActive', { isActive: true })

        if (excludeId) {
            query.andWhere('category.id != :excludeId', { excludeId })
        }

        const count = await query.getCount()
        return count > 0
    }
} 