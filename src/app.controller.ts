import { Body, Controller, Delete, Get, Param, Post, Put, Query, Render } from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Home page with layout
  @Get()
  @Render('front/index')
  getHome() {
    return {
      title: 'Home',
      description: 'Professional Document Management System for modern businesses. Secure storage, real-time collaboration, and intelligent organization.',
      layout: 'layouts/frontlayout'
    }
  }

  @Get('about')
  getAbout(): string {
    return 'This is the about page.'
  }

  @Get('contact')
  getContact(): string {
    return "This is the contact page."
  }

  // Dynamic route
  // Example: /user/123
  @Get('user/:id')
  getUser(@Param('id') id: string): string {
    return `User ID is ${id}`
  }

  // Multiple parameters
  // Example: /product/electronics/123
  @Get('product/:category/:id')
  getProduct(@Param('category') category: string, @Param('id') id: string): string {
    return `Product Category: ${category}, Product ID: ${id}`
  }

  // Optional parameters
  // Example: /search
  @Get('search')
  getSearchNoParam(): string {
    return 'No search query provided'
  }

  // Example: /search/laptop
  @Get('search/:query')
  getSearch(@Param('query') query: string): string {
    return `Search results for: ${query}`
  }

  // Route Query strings
  // Example: /find/product?q=laptop&sort=price
  @Get('find/product')
  getFindProduct(@Query('q') q?: string, @Query('sort') sort?: string): string {
    return `Search Query: ${q}, Sort By: ${sort}`
  }

  // Post method example
  // Example: /product
  @Post('product')
  createProduct(): string {
    return 'Product created successfully!'
  }

  // Put method example
  // Example: /product/123
  @Put('product/:id')
  updateProduct(@Param('id') id: string): string {
    return `Product with ID ${id} updated successfully!`
  }

  // Delete method example
  // Example: /product/123
  @Delete('product/:id')
  deleteProduct(@Param('id') id: string): string {
    return `Product with ID ${id} deleted successfully!`
  }

  // ตัวอย่างการ post รับค่าผ่าน body มี payload เป็น ชื่อสินค้า จำนวน และราคา และส่งค่ากลับเป็น JSON
  @Post('create-product')
  addProduct(
    @Body() productData: { 
      name: string; 
      quantity: number; 
      price: number }) {
    const response = {
      message: 'Product created successfully',
      product: {
        name: productData.name,
        quantity: productData.quantity,
        price: productData.price,
      },
    }
    return response
  }

  // Catch all route
  // 404 Not Found
  // @Get('*')
  // getNotFound(): string {
  //   return '404 Not Found'
  // }

}



