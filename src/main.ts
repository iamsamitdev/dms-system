import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from './app.module'
import * as hbs from 'hbs'
import { join } from 'path'
import * as session from 'express-session'
import * as dotenv from 'dotenv'

dotenv.config()

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  // ตั้งค่า body parser สำหรับจัดการ encoding
  app.use(require('express').json({ limit: '50mb' }));
  app.use(require('express').urlencoded({ 
    extended: true, 
    limit: '50mb',
    parameterLimit: 50000 
  }));

  // ตั้งค่า session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET as string,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // ตั้งเป็น true ถ้าใช้ HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 ชั่วโมง
      },
    }),
  )

  // ตั้งค่า Handlebars เป็น view engine
  app.setViewEngine('hbs')

  // ตั้งค่าโฟลเดอร์สำหรับ static assets (เช่น CSS)
  app.useStaticAssets(join(__dirname, '..', '..', 'public'))

  // ตั้งค่าโฟลเดอร์สำหรับ views
  app.setBaseViewsDir(join(__dirname, '..', 'views'))

  // ลงทะเบียน partials (ถ้ามี)
  hbs.registerPartials(join(__dirname, '..', 'views', 'partials'))

  // ลงทะเบียน Handlebars helpers
  hbs.registerHelper('substring', function(str: string, start: number, length: number) {
    if (!str) return ''
    return str.substring(start, start + length).toUpperCase()
  })

  hbs.registerHelper('uppercase', function(str: string) {
    if (!str) return ''
    return str.toUpperCase()
  })

  // เพิ่ม helpers สำหรับการควบคุมสิทธิ์
  hbs.registerHelper('eq', function(a: any, b: any) {
    return a === b
  })

  hbs.registerHelper('or', function() {
    return Array.prototype.slice.call(arguments, 0, -1).some(Boolean)
  })

  // เพิ่ม helper สำหรับการเปรียบเทียบตัวเลข
  hbs.registerHelper('gt', function(a: any, b: any) {
    return a > b
  })

  hbs.registerHelper('lt', function(a: any, b: any) {
    return a < b
  })

  hbs.registerHelper('gte', function(a: any, b: any) {
    return a >= b
  })

  hbs.registerHelper('lte', function(a: any, b: any) {
    return a <= b
  })

  // File helpers
  hbs.registerHelper('getFileIcon', function (mimeType) {
    const icons = {
      'application/pdf': 'fas fa-file-pdf',
      'application/msword': 'fas fa-file-word',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'fas fa-file-word',
      'application/vnd.ms-excel': 'fas fa-file-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'fas fa-file-excel',
      'application/vnd.ms-powerpoint': 'fas fa-file-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'fas fa-file-powerpoint',
      'text/plain': 'fas fa-file-alt',
      'image/jpeg': 'fas fa-file-image',
      'image/png': 'fas fa-file-image'
    }
    return icons[mimeType] || 'fas fa-file'
  })

  hbs.registerHelper('getFileIconColor', function (mimeType) {
    const colors = {
      'application/pdf': 'text-red-600',
      'application/msword': 'text-blue-600',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'text-blue-600',
      'application/vnd.ms-excel': 'text-green-600',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'text-green-600',
      'application/vnd.ms-powerpoint': 'text-orange-600',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'text-orange-600',
      'text/plain': 'text-gray-600',
      'image/jpeg': 'text-purple-600',
      'image/png': 'text-purple-600'
    }
    return colors[mimeType] || 'text-gray-600'
  })

  hbs.registerHelper('getFileIconBg', function (mimeType) {
    const backgrounds = {
      'application/pdf': 'bg-red-100',
      'application/msword': 'bg-blue-100',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'bg-blue-100',
      'application/vnd.ms-excel': 'bg-green-100',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'bg-green-100',
      'application/vnd.ms-powerpoint': 'bg-orange-100',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'bg-orange-100',
      'text/plain': 'bg-gray-100',
      'image/jpeg': 'bg-purple-100',
      'image/png': 'bg-purple-100'
    }
    return backgrounds[mimeType] || 'bg-gray-100'
  })

  hbs.registerHelper('getFileType', function (mimeType) {
    const types = {
      'application/pdf': 'PDF',
      'application/msword': 'DOC',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
      'application/vnd.ms-excel': 'XLS',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
      'application/vnd.ms-powerpoint': 'PPT',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
      'text/plain': 'TXT',
      'image/jpeg': 'JPG',
      'image/png': 'PNG'
    }
    return types[mimeType] || 'FILE'
  })

  hbs.registerHelper('getStatusBg', function (status) {
    const statusBg = {
      'draft': 'bg-yellow-100',
      'published': 'bg-green-100',
      'archived': 'bg-gray-100',
      'deleted': 'bg-red-100'
    }
    return statusBg[status] || 'bg-gray-100'
  })

  hbs.registerHelper('getStatusColor', function (status) {
    const statusColor = {
      'draft': 'text-yellow-800',
      'published': 'text-green-800',
      'archived': 'text-gray-800',
      'deleted': 'text-red-800'
    }
    return statusColor[status] || 'text-gray-800'
  })

  hbs.registerHelper('formatFileSize', function (bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  })

  hbs.registerHelper('formatDate', function (date) {
    if (!date) return ''
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (hours < 1) return 'เมื่อสักครู่'
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`
    if (days < 7) return `${days} วันที่แล้ว`
    
    return new Date(date).toLocaleDateString('th-TH')
  })

  hbs.registerHelper('getInitials', function (firstName, lastName) {
    const first = firstName ? firstName.charAt(0).toUpperCase() : ''
    const last = lastName ? lastName.charAt(0).toUpperCase() : ''
    return first + last
  })

  // Pagination helpers
  hbs.registerHelper('add', function (a, b) {
    return a + b
  })

  hbs.registerHelper('subtract', function (a, b) {
    return a - b
  })

  hbs.registerHelper('generatePageNumbers', function (current, total) {
    const pages: number[] = []
    const maxVisible = 5 // แสดงหมายเลขหน้าสูงสุด 5 หน้า
    
    if (total <= maxVisible) {
      // ถ้าหน้าทั้งหมดน้อยกว่าหรือเท่ากับ maxVisible แสดงทั้งหมด
      for (let i = 1; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // คำนวณช่วงหน้าที่จะแสดง
      let start = Math.max(1, current - Math.floor(maxVisible / 2))
      let end = Math.min(total, start + maxVisible - 1)
      
      // ปรับ start ถ้า end ติดขอบ
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1)
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
    }
    
    return pages
  })

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap();
