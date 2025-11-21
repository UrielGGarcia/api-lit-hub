import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';

@ApiTags('Usuarios')
@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    // GET /users
    @Get()
    @ApiOperation({ summary: 'Obtener todos los usuarios' })
    @ApiResponse({
        status: 200,
        description: 'Lista de usuarios retornada correctamente.',
        type: [CreateUserDto],
    })
    @ApiResponse({
        status: 500,
        description: 'Error interno del servidor.',
    })
    async getUsers() {
        return await this.usersService.getUsers();
    }

    @Get('authors')
    async getAuthors() {
        return await this.usersService.getAuthors();
    }


    // GET /users/:id
    @Get('/:id')
    @ApiOperation({ summary: 'Obtener un usuario por ID único' })
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
    async getUser(@Param('id', ParseIntPipe) id: number) {
        return await this.usersService.getUser(id);
    }


    // DELETE /users/:id
    @Delete('/:id')
    @ApiOperation({ summary: 'Eliminar un usuario por ID' })
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
        status: 500,
        description: 'Error interno del servidor.',
    })
    async deleteUser(@Param('id', ParseIntPipe) id: number) {
        return await this.usersService.deleteUser(id);
    }
}
