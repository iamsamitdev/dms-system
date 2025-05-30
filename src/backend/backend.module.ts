import { Module } from '@nestjs/common'
import { BackendController } from './backend.controller'
import { UserModule } from '../users/user.module'
import { DocumentModule } from '../documents/document.module'
import { CategoryModule } from '../categories/category.module'

@Module({
  imports: [UserModule, DocumentModule, CategoryModule],
  controllers: [BackendController],
})
export class BackendModule {} 