import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { GenresService } from './genres.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { RolesAllowed } from 'src/auth/decorators/roles.decorator';
import { Roles } from 'generated/prisma';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('Géneros')
@Controller('genres')
export class GenresController {
    constructor(private genresService: GenresService) { }

    // GET /genres → pública
    @Get()
    @ApiOperation({ summary: 'Obtener todos los géneros' })
    @ApiResponse({
        status: 200,
        description: 'Lista de géneros retornada correctamente.',
        type: [CreateGenreDto],
    })
    async getGeneres() {
        return await this.genresService.getGenres();
    }

    // POST /genres → solo ADMIN o AUTHOR
    @UseGuards(JwtAuthGuard, RolesGuard)
    @RolesAllowed(Roles.ADMIN, Roles.AUTHOR)
    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Crear un nuevo género (solo ADMIN o AUTHOR)' })
    @ApiResponse({
        status: 201,
        description: 'Género creado correctamente.',
        type: CreateGenreDto,
    })
    @ApiResponse({
        status: 403,
        description: 'No autorizado.',
    })
    async createGenre(@Body() data: CreateGenreDto) {
        return await this.genresService.createGenre(data);
    }

    // DELETE /genres/:id → solo ADMIN o AUTHOR
    @UseGuards(JwtAuthGuard, RolesGuard)
    @RolesAllowed(Roles.ADMIN, Roles.AUTHOR)
    @Delete('/:id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Eliminar un género por ID (solo ADMIN o AUTHOR)' })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'Identificador del género a eliminar',
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: 'Género eliminado correctamente.',
    })
    @ApiResponse({
        status: 403,
        description: 'No autorizado.',
    })
    async deleteGenre(@Param('id', ParseIntPipe) id: number) {
        return await this.genresService.deleteGenre(id);
    }
}
