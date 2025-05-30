import { Injectable, NestMiddleware } from "@nestjs/common"
import { Request, Response, NextFunction } from "express"

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    use(req: Request & { session?: any }, res: Response, next: NextFunction) {
        // ตรวจสอบ authentication ก่อน
        if (!req.session?.user) {
            return res.redirect('/auth/login')
        }
        
        // ดึงชื่อ route จาก path
        const pathParts = req.path.split('/').filter(part => part !== '')
        const routeName = pathParts[pathParts.length - 1] || ''
        
        // Debug logging (สามารถลบออกได้ในภายหลัง)
        console.log('Auth Middleware:', {
            path: req.path,
            pathParts,
            routeName,
            userRoleId: req.session.user.roleId,
            hasError: !!req.query.error
        })
        
        // ข้ามการตรวจสอบสิทธิ์สำหรับ:
        // 1. Root path (/)
        // 2. Dashboard (หน้าหลัก)
        // 3. เมื่อมี error parameter (ป้องกัน redirect loop)
        // 4. เมื่อ path เป็น /backend เฉยๆ (base path)
        // 5. เมื่อ routeName เป็นค่าว่าง
        if (req.path === '/' ||
            routeName === 'dashboard' || 
            routeName === 'backend' || 
            routeName === '' ||
            req.query.error || 
            req.path === '/backend' ||
            req.path === '/backend/') {
            return next()
        }
        
        // ตรวจสอบสิทธิ์การเข้าถึงหน้าต่างๆ (ยกเว้น dashboard)
        if (req.path !== '/backend' && req.path !== '/backend/') {
          const userRoleId = req.session.user.roleId
          
          // กำหนดสิทธิ์การเข้าถึงแต่ละหน้า
          const rolePermissions = {
            '/backend/users': [1], // เฉพาะ Administrator
            '/backend/categories': [1], // เฉพาะ Administrator  
            '/backend/reports': [1, 2], // Administrator และ Manager
            '/backend/settings': [1], // เฉพาะ Administrator
          }
          
          // ตรวจสอบว่าหน้าปัจจุบันต้องการสิทธิ์พิเศษหรือไม่
          const requiredRoles = rolePermissions[req.path]
          if (requiredRoles && !requiredRoles.includes(userRoleId)) {
            return res.status(403).render('errors/403', {
              title: 'Access Denied',
              message: 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้',
              layout: 'layouts/backlayout',
              user: req.session.user
            })
          }
        }
        
        // ถ้าผ่านการตรวจสอบทั้งหมด
        next()
    }
}