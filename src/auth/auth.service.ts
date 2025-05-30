import { Injectable } from "@nestjs/common"
import { UserService } from "src/users/user.service"
import * as bcrypt from "bcrypt"

@Injectable()
export class AuthService {
    constructor(private userService: UserService) {}

    async validateUser(username: string, password: string): Promise<any> {
        const user = await this.userService.findByUsername(username)
        if (user && await bcrypt.compare(password, user.password)) {
            // Update last login time
            await this.userService.updateLastLogin(user.id)

            const { password, ...result } = user
            return result
        }
        return null
    }
}