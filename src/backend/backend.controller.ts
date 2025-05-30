import { Controller, Get, Render, Req } from '@nestjs/common'
import { Request } from 'express'
import { UserService } from '../users/user.service'
import { DocumentService } from '../documents/document.service'
import { CategoryService } from '../categories/category.service'

@Controller('backend')
export class BackendController {
  
  constructor(
    private userService: UserService,
    private documentService: DocumentService,
    private categoryService: CategoryService
  ) {}
  
  @Get('dashboard')
  @Render('back/dashboard')
  async getDashboard(@Req() req: Request) {
    const user = await this.getUserWithRole(req)
    
    // ตรวจสอบ error message จาก URL parameter
    const errorMessage = req.query.error === 'access_denied' 
      ? 'คุณไม่มีสิทธิ์เข้าถึงหน้าที่ต้องการ' 
      : null

    try {
      // คำนวณสถิติต่างๆ
      const stats = await this.calculateDashboardStats()
      
      return {
        title: 'Dashboard',
        description: 'DMS System Admin Dashboard - Monitor and manage your document management system',
        layout: 'layouts/backlayout',
        currentPath: req.path,
        user,
        error: errorMessage,
        stats
      }
    } catch (error) {
      console.error('Error calculating dashboard stats:', error)
      
      // ส่งค่า default ในกรณีเกิดข้อผิดพลาด
      return {
        title: 'Dashboard',
        description: 'DMS System Admin Dashboard - Monitor and manage your document management system',
        layout: 'layouts/backlayout',
        currentPath: req.path,
        user,
        error: errorMessage,
        stats: {
          totalDocuments: 0,
          activeUsers: 0,
          totalCategories: 0,
          storageUsed: {
            percentage: 0,
            used: '10 MB',
            total: '100 GB'
          },
          recentDocuments: []
        }
      }
    }
  }

  @Get('users')
  @Render('back/users')
  async getUsers(@Req() req: Request) {
    const user = await this.getUserWithRole(req)
    return {
      title: 'Users',
      description: 'Manage system users and permissions',
      layout: 'layouts/backlayout',
      currentPath: req.path,
      user
    }
  }

  @Get('reports')
  @Render('back/reports')
  async getReports(@Req() req: Request) {
    const user = await this.getUserWithRole(req)
    return {
      title: 'Reports',
      description: 'View system analytics and reports',
      layout: 'layouts/backlayout',
      currentPath: req.path,
      user
    }
  }

  @Get('settings')
  @Render('back/settings')
  async getSettings(@Req() req: Request) {
    const user = await this.getUserWithRole(req)
    return {
      title: 'Settings',
      description: 'Configure system settings and preferences',
      layout: 'layouts/backlayout',
      currentPath: req.path,
      user
    }
  }

  @Get('profile')
  @Render('back/profile')
  async getProfile(@Req() req: Request) {
    const user = await this.getUserWithRole(req)
    return {
      title: 'Profile',
      description: 'Manage your profile settings',
      layout: 'layouts/backlayout',
      currentPath: req.path,
      user
    }
  }

  private async getUserWithRole(req: Request) {
    if (req.session?.user?.id) {
      const user = await this.userService.findById(req.session.user.id)
      return user
    }
    return req.session?.user
  }

  // คำนวณสถิติสำหรับ Dashboard
  private async calculateDashboardStats() {
    try {
      // ดึงข้อมูลเอกสารทั้งหมด
      const allDocuments = await this.documentService.findAll()
      
      // ดึงข้อมูลผู้ใช้ที่ active
      const allUsers = await this.userService.findAll()
      const activeUsers = allUsers.filter(user => user.isActive)
      
      // ดึงข้อมูลหมวดหมู่ที่ active
      const activeCategories = await this.categoryService.findActive()
      
      // คำนวณขนาดไฟล์ทั้งหมด
      const totalSize = allDocuments.reduce((sum, doc) => sum + (doc.size || 0), 0)
      const totalSizeGB = totalSize / (1024 * 1024 * 1024) // แปลงเป็น GB
      const maxStorageGB = 100 // กำหนดพื้นที่สูงสุด 100GB
      const storagePercentage = Math.min((totalSizeGB / maxStorageGB) * 100, 100)
      
      // เอกสารล่าสุด 5 รายการ
      const recentDocuments = allDocuments
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
      
      return {
        totalDocuments: allDocuments.length,
        activeUsers: activeUsers.length,
        totalCategories: activeCategories.length,
        storageUsed: {
          percentage: Math.round(storagePercentage),
          used: this.formatFileSize(totalSize),
          total: `${maxStorageGB} GB`,
          usedGB: totalSizeGB.toFixed(1)
        },
        recentDocuments
      }
    } catch (error) {
      console.error('Error in calculateDashboardStats:', error)
      throw error
    }
  }

  // Helper function สำหรับจัดรูปแบบขนาดไฟล์
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
} 