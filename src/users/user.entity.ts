import { Role } from "../roles/role.entity"
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ length: 50, unique: true })
    username: string

    @Column({ length: 100 })
    email: string

    @Column({ length: 255 })
    password: string

    @Column({ length: 50, nullable: true })
    firstName: string

    @Column({ length: 50, nullable: true })
    lastName: string

    @Column({ nullable: true })
    roleId: number

    @ManyToOne(() => Role, { nullable: true })
    @JoinColumn({ name: 'roleId' })
    role: Role

    @Column({ default: true })
    isActive: boolean

    @Column({ nullable: true })
    lastLoginAt: Date

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}