import { Body, Controller, Delete, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { RolesAllowed } from 'src/auth/decorators/roles.decorator';
import { Roles } from '../common/enums';
import { ApiOperation, ApiParam, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';


@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get()
    @ApiTags('Usuarios')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obtener todos los usuarios (solo ADMIN)' })
    @ApiResponse({
        status: 200,
        description: 'Lista de usuarios retornada correctamente.',
        type: [CreateUserDto],
    })
    @ApiResponse({
        status: 403,
        description: 'No autorizado.',
    })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @RolesAllowed(Roles.ADMIN)
    async getUsers() {
        return await this.usersService.getUsers();
    }

    @Get('authors')
    @ApiOperation({ summary: 'Obtener todos los autores (público)' })
    @ApiResponse({
        status: 200,
        description: 'Lista de autores retornada correctamente.',
    })
    @ApiResponse({
        status: 403,
        description: 'No autorizado.',
    })
    async getAuthors() {
        return await this.usersService.getAuthors();
    }

    @Get('/:id')
    @ApiTags('Usuarios')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obtener un usuario por ID único (solo ADMIN)' })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'Identificador numérico del usuario a buscar',
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: 'Usuario encontrado correctamente.',
    })
    @ApiResponse({
        status: 404,
        description: 'Usuario no encontrado.',
    })
    @ApiResponse({
        status: 403,
        description: 'No autorizado.',
    })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @RolesAllowed(Roles.ADMIN)
    async getUser(@Param('id', ParseIntPipe) id: number) {
        return await this.usersService.getUser(id);
    }

    @Delete('/:id')
    @ApiTags('Usuarios')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Eliminar un usuario por ID (solo ADMIN)' })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'Identificador numérico del usuario a eliminar',
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: 'Usuario eliminado correctamente.',
    })
    @ApiResponse({
        status: 404,
        description: 'Usuario no encontrado.',
    })
    @ApiResponse({
        status: 403,
        description: 'No autorizado.',
    })
    @ApiResponse({
        status: 500,
        description: 'Error interno del servidor.',
    })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @RolesAllowed(Roles.ADMIN)
    async deleteUser(@Param('id', ParseIntPipe) id: number) {
        return await this.usersService.deleteUser(id);
    }
}
