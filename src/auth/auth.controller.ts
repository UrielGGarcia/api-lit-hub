import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { JwtAuthGuard } from './dto/guards/jwt-auth.guard';
import { Roles } from 'generated/prisma';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

interface RequestWithUser extends Request {
  user: {
    id: number;
    email: string;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    rol: Roles;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/login')
  async singIn(@Body() data: AuthDto) {
    return this.authService.logIn(data);
  }

  @Post('/register')
  async registerUser(@Body() data: CreateUserDto) {
    return this.authService.registerUser(data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  getMe(@Req() req: RequestWithUser) {
    return req.user;
  }
}