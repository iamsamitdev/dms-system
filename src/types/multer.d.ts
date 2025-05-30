declare namespace Express {
  namespace Multer {
    interface File {
      fieldname: string
      originalname: string
      encoding: string
      mimetype: string
      size: number
      destination: string
      filename: string
      path: string
      buffer: Buffer
    }
  }
}

// เพิ่ม interface สำหรับ Document ที่มีข้อมูลเพิ่มเติม
declare module '../documents/document.entity' {
  interface Document {
    displayName?: string
    fileExtension?: string
    formattedSize?: string
    formattedDate?: string
  }
} 