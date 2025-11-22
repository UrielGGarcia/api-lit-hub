import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { RolesAllowed } from './decorators/roles.decorator';
import { Roles } from '../common/enums';
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

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @ApiOperation({ summary: 'Registro público de usuario CLIENT' })
  @ApiResponse({ status: 201, description: 'Usuario CLIENT creado correctamente' })
  @Post('/register')
  async registerClient(@Body() data: CreateUserDto) {
    data.rol = Roles.CLIENT;
    return this.authService.registerUser(data);
  }

  @ApiOperation({ summary: 'Login de usuario' })
  @ApiResponse({ status: 200, description: 'Retorna JWT y datos del usuario' })
  @Post('/login')
  async signIn(@Body() data: AuthDto) {
    return this.authService.logIn(data);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener datos del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Información del usuario' })
  @Get('/me')
  getMe(@Req() req: RequestWithUser) {
    return req.user;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesAllowed(Roles.ADMIN)
  @ApiOperation({ summary: 'Crear usuario AUTHOR o ADMIN (solo ADMIN)' })
  @ApiResponse({ status: 201, description: 'Usuario AUTHOR o ADMIN creado correctamente' })
  @Post('/admin/users')
  async registerAdminOrAuthor(@Body() data: CreateUserDto) {
    const allowedRoles: Roles[] = [Roles.AUTHOR, Roles.ADMIN];
    if (!allowedRoles.includes(data.rol)) {
      throw new Error('Solo se puede crear AUTHOR o ADMIN desde esta ruta.');
    }
    return this.authService.registerUser(data);
  }
}
