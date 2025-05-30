import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { Document } from "../documents/document.entity"

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ length: 100 })
    name: string

    @Column({ type: 'text', nullable: true })
    description: string

    @Column({ default: true })
    isActive: boolean

    @OneToMany(() => Document, document => document.category)
    documents: Document[]

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
} 