import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { MulterModule } from "@nestjs/platform-express"
import { Document } from "./document.entity"
import { DocumentService } from "./document.service"
import { DocumentController } from "./document.controller"
import { CategoryModule } from "../categories/category.module"
import { UserModule } from "../users/user.module"

@Module({
    imports: [
        TypeOrmModule.forFeature([Document]),
        MulterModule.register({
            dest: './uploads/documents',
        }),
        CategoryModule,
        UserModule
    ],
    controllers: [DocumentController],
    providers: [DocumentService],
    exports: [TypeOrmModule, DocumentService],
})
export class DocumentModule {} 