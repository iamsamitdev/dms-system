import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  
  // Get Hello Kitty message
  getHello(): string {
    return 'Hello Kitty!';
  }

  // Get About message
  getAbout(): string {
    return 'This is a simple NestJS application.';
  }

}
