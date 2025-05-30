import { Controller, Get, Post, Put, Delete, Body, Param, Res, Render, Req } from "@nestjs/common"
import { Response, Request } from "express"
import { CategoryService } from "./category.service"

@Controller('backend/categories')
export class CategoryController {
    constructor(private categoryService: CategoryService) {}

    // หน้าจัดการหมวดหมู่
    @Get()
    @Render('back/categories')
    async getCategories(@Req() req: Request) {
        const categories = await this.categoryService.findAll()
        const user = req.session?.user
        
        return {
            title: 'Categories',
            description: 'Manage document categories',
            layout: 'layouts/backlayout',
            currentPath: req.path,
            user,
            categories
        }
    }

    // API: ดึงหมวดหมู่ทั้งหมด
    @Get('api')
    async getCategoriesApi() {
        return this.categoryService.findAll()
    }

    // API: ดึงหมวดหมู่ที่ใช้งานเท่านั้น (สำหรับ dropdown)
    @Get('api/active')
    async getActiveCategoriesApi() {
        return this.categoryService.findActive()
    }

    // API: ดึงหมวดหมู่ตาม ID
    @Get('api/:id')
    async getCategoryById(@Param('id') id: string, @Res() res: Response) {
        try {
            const category = await this.categoryService.findById(id)
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'ไม่พบหมวดหมู่ที่ต้องการ'
                })
            }

            return res.json(category)
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่'
            })
        }
    }

    // API: สร้างหมวดหมู่ใหม่
    @Post('api')
    async createCategory(
        @Body() body: { name: string, description?: string },
        @Res() res: Response
    ) {
        try {
            // ตรวจสอบชื่อซ้ำ
            const nameExists = await this.categoryService.isNameExists(body.name)
            if (nameExists) {
                return res.status(400).json({
                    success: false,
                    message: 'ชื่อหมวดหมู่นี้มีอยู่แล้ว'
                })
            }

            const category = await this.categoryService.create(body)
            return res.json({
                success: true,
                message: 'สร้างหมวดหมู่สำเร็จ',
                data: category
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'เกิดข้อผิดพลาดในการสร้างหมวดหมู่'
            })
        }
    }

    // API: อัพเดทหมวดหมู่
    @Put('api/:id')
    async updateCategory(
        @Param('id') id: string,
        @Body() body: { name?: string, description?: string, isActive?: boolean },
        @Res() res: Response
    ) {
        try {
            // ตรวจสอบชื่อซ้ำ (ยกเว้น ID ปัจจุบัน) เฉพาะเมื่อมีการส่ง name มา
            if (body.name) {
                const nameExists = await this.categoryService.isNameExists(body.name, id)
                if (nameExists) {
                    return res.status(400).json({
                        success: false,
                        message: 'ชื่อหมวดหมู่นี้มีอยู่แล้ว'
                    })
                }
            }

            const category = await this.categoryService.update(id, body)
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'ไม่พบหมวดหมู่ที่ต้องการแก้ไข'
                })
            }

            return res.json({
                success: true,
                message: 'อัพเดทหมวดหมู่สำเร็จ',
                data: category
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'เกิดข้อผิดพลาดในการอัพเดทหมวดหมู่'
            })
        }
    }

    // API: ลบหมวดหมู่
    @Delete('api/:id')
    async deleteCategory(@Param('id') id: string, @Res() res: Response) {
        try {
            const success = await this.categoryService.delete(id)
            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: 'ไม่พบหมวดหมู่ที่ต้องการลบ'
                })
            }

            return res.json({
                success: true,
                message: 'ลบหมวดหมู่สำเร็จ'
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'เกิดข้อผิดพลาดในการลบหมวดหมู่'
            })
        }
    }
} 