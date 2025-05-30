import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'

@Injectable()
export class EncodingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // ตั้งค่า charset สำหรับ response
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    
    // ตั้งค่า encoding สำหรับ request
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
      // แก้ไข encoding สำหรับ multipart/form-data (file upload)
      const originalOn = req.on.bind(req);
      req.on = function(event: string, listener: any) {
        if (event === 'data') {
          const originalListener = listener;
          listener = function(chunk: any) {
            // จัดการ encoding สำหรับ chunk data
            return originalListener.call(this, chunk);
          };
        }
        return originalOn(event, listener);
      };
    }
    
    // ตั้งค่า charset สำหรับ request body parsing
    if (!req.headers['content-type']) {
      req.headers['content-type'] = 'application/json; charset=utf-8';
    }
    
    next()
  }
} 