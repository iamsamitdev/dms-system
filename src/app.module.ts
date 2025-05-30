import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './users/user.module';
import { RoleModule } from './roles/role.module';
import { AuthModule } from './auth/auth.module';
import { BackendModule } from './backend/backend.module';
import { AppDataSource } from './database/data-source';
import { AuthMiddleware } from './middleware/auth.middleware';
import { EncodingMiddleware } from './middleware/encoding.middleware';
import { CategoryModule } from './categories/category.module';
import { DocumentModule } from './documents/document.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(AppDataSource.options),
    UserModule,
    RoleModule,
    AuthModule,
    BackendModule,
    CategoryModule,
    DocumentModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // เพิ่ม EncodingMiddleware สำหรับจัดการ encoding
    consumer
      .apply(EncodingMiddleware)
      .forRoutes('*'); // ใช้กับทุก route
      
    consumer
      .apply(AuthMiddleware)
      .forRoutes('backend'); // ใช้กับ /backend และ /backend/* ทั้งหมด
  }
}