import "express-session";

declare module "express-session" {
  interface Session {
    user?: {
      id: number;
      firstName: string;
      lastName: string;
      username: string;
      email: string;
      roleId: number;
    };
  }
}
