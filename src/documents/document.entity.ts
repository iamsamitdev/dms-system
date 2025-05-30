import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { User } from "../users/user.entity"
import { Category } from "../categories/category.entity"

export enum DocumentStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    ARCHIVED = 'archived',
    DELETED = 'deleted'
}

@Entity('documents')
export class Document {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ length: 255 })
    title: string

    @Column({ type: 'text', nullable: true })
    description: string

    @Column({ length: 255 })
    filename: string

    @Column({ length: 255 })
    originalName: string

    @Column({ length: 100 })
    mimeType: string

    @Column({ type: 'bigint' })
    size: number

    @Column({ length: 500 })
    path: string

    @Column({
        type: 'enum',
        enum: DocumentStatus,
        default: DocumentStatus.DRAFT
    })
    status: DocumentStatus

    @Column({ default: 1 })
    version: number

    @Column({ nullable: true })
    ownerId: string

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'ownerId' })
    owner: User

    @Column({ nullable: true })
    categoryId: string

    @ManyToOne(() => Category, category => category.documents, { nullable: true })
    @JoinColumn({ name: 'categoryId' })
    category: Category

    @Column({ default: 0 })
    downloadCount: number

    @Column({ default: true })
    isActive: boolean

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
} 