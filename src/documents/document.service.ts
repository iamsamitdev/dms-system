import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Document, DocumentStatus } from "./document.entity"

export interface PaginationResult {
    documents: Document[]
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
}

@Injectable()
export class DocumentService {
    constructor(
        @InjectRepository(Document)
        private documentRepository: Repository<Document>
    ) {}

    // ฟังก์ชันสำหรับถอดรหัสชื่อไฟล์จาก Base64
    private decodeFilename(filename: string): string {
        try {
            const parts = filename.split('-')
            if (parts.length >= 4 && parts[0] === 'doc') {
                // ตรวจสอบว่าเป็นไฟล์ที่เข้ารหัสแล้วหรือไม่
                const encodedPart = parts.slice(3).join('-')
                const lastDotIndex = encodedPart.lastIndexOf('.')
                
                if (lastDotIndex > 0) {
                    const encodedName = encodedPart.substring(0, lastDotIndex)
                    const ext = encodedPart.substring(lastDotIndex)
                    
                    try {
                        const decodedName = Buffer.from(encodedName, 'base64').toString('utf8')
                        return decodedName + ext
                    } catch {
                        return filename // ถ้าถอดรหัสไม่ได้ให้ใช้ชื่อเดิม
                    }
                }
            }
            return filename
        } catch (error) {
            return filename
        }
    }

    // ฟังก์ชันสำหรับเพิ่มข้อมูลการแสดงผลให้กับเอกสาร
    private enhanceDocumentDisplay(document: Document): Document {
        return {
            ...document,
            displayName: document.originalName || this.decodeFilename(document.filename),
            fileExtension: document.filename.split('.').pop()?.toLowerCase() || '',
            formattedSize: this.formatFileSize(document.size),
            formattedDate: document.createdAt ? new Date(document.createdAt).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }) : ''
        } as Document
    }

    // ฟังก์ชันสำหรับแปลงขนาดไฟล์เป็นรูปแบบที่อ่านง่าย
    private formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes'
        
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    // ดึงเอกสารพร้อม pagination
    async findWithPagination(page: number = 1, limit: number = 5): Promise<PaginationResult> {
        try {
            console.log(`DocumentService: findWithPagination - page: ${page}, limit: ${limit}`)
            
            const skip = (page - 1) * limit
            
            const [documents, total] = await this.documentRepository.findAndCount({
                where: { isActive: true },
                relations: {
                    owner: {
                        role: true
                    },
                    category: true
                },
                order: { createdAt: 'DESC' },
                skip,
                take: limit
            })
            
            const totalPages = Math.ceil(total / limit)
            
            // เพิ่มข้อมูลการแสดงผลให้กับเอกสารทั้งหมด
            const enhancedDocuments = documents.map(doc => this.enhanceDocumentDisplay(doc))
            
            console.log(`DocumentService: Found ${enhancedDocuments.length} documents, total: ${total}, totalPages: ${totalPages}`)
            
            return {
                documents: enhancedDocuments,
                total,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        } catch (error) {
            console.error('DocumentService: Error in findWithPagination:', error)
            throw error
        }
    }

    // ดึงเอกสารทั้งหมด (เก็บไว้สำหรับ backward compatibility)
    async findAll(): Promise<Document[]> {
        try {
            console.log('DocumentService: Starting findAll query...')
            
            // ตรวจสอบข้อมูลทั้งหมดก่อน (รวม inactive)
            const allDocuments = await this.documentRepository.find({
                order: { createdAt: 'DESC' }
            })
            console.log('DocumentService: Total documents in DB:', allDocuments.length)
            
            // ตรวจสอบเฉพาะ active documents
            const activeDocuments = await this.documentRepository.find({
                where: { isActive: true },
                order: { createdAt: 'DESC' }
            })
            console.log('DocumentService: Active documents:', activeDocuments.length)
            
            // ดึงข้อมูลพร้อม relations
            const documents = await this.documentRepository.find({
                where: { isActive: true },
                relations: {
                    owner: {
                        role: true
                    },
                    category: true
                },
                order: { createdAt: 'DESC' }
            })
            
            console.log('DocumentService: Documents with relations:', documents.length)
            
            // เพิ่มข้อมูลการแสดงผลให้กับเอกสารทั้งหมด
            const enhancedDocuments = documents.map(doc => this.enhanceDocumentDisplay(doc))
            
            if (enhancedDocuments.length > 0) {
                console.log('DocumentService: Sample document:', {
                    id: enhancedDocuments[0].id,
                    title: enhancedDocuments[0].title,
                    originalName: enhancedDocuments[0].originalName,
                    displayName: (enhancedDocuments[0] as any).displayName,
                    ownerId: enhancedDocuments[0].ownerId,
                    categoryId: enhancedDocuments[0].categoryId,
                    hasOwner: !!enhancedDocuments[0].owner,
                    hasCategory: !!enhancedDocuments[0].category,
                    ownerName: enhancedDocuments[0].owner ? `${enhancedDocuments[0].owner.firstName} ${enhancedDocuments[0].owner.lastName}` : 'No owner'
                })
            }
            
            return enhancedDocuments
        } catch (error) {
            console.error('DocumentService: Error in findAll:', error)
            throw error
        }
    }

    // ดึงเอกสารตาม ID
    async findById(id: string): Promise<Document | null> {
        const document = await this.documentRepository.findOne({
            where: { id, isActive: true },
            relations: ['owner', 'category']
        })
        
        return document ? this.enhanceDocumentDisplay(document) : null
    }

    // สร้างเอกสารใหม่
    async create(documentData: {
        title: string
        description?: string
        filename: string
        originalName: string
        mimeType: string
        size: number
        path: string
        ownerId: string
        categoryId?: string
        status?: DocumentStatus
    }): Promise<Document> {
        const document = this.documentRepository.create(documentData)
        const savedDocument = await this.documentRepository.save(document)
        return this.enhanceDocumentDisplay(savedDocument)
    }

    // อัพเดทเอกสาร
    async update(id: string, documentData: Partial<Document>): Promise<Document | null> {
        await this.documentRepository.update(id, documentData)
        return this.findById(id)
    }

    // ลบเอกสาร (soft delete)
    async delete(id: string): Promise<boolean> {
        const result = await this.documentRepository.update(id, { isActive: false })
        return (result.affected ?? 0) > 0
    }

    // เพิ่มจำนวนการดาวน์โหลด
    async incrementDownloadCount(id: string): Promise<void> {
        await this.documentRepository.increment({ id }, 'downloadCount', 1)
    }
} 