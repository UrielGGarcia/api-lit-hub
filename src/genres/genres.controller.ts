import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { GenresService } from './genres.service';
import { CreateGenreDto } from './dto/create-genre.dto';

@Controller('genres')
export class GenresController {
    constructor(private genresService: GenresService) { }

    @Get()
    async getGeneres() {
        return await this.genresService.getGenres();
    }

    @Post()
    async createGenre(@Body() data: CreateGenreDto) {
        return await this.genresService.createGenre(data);
    }

    @Delete('/:id')
    async deleteGenre(@Param() id: number) {
        return await this.genresService.deleteGenre(id);
    }
}
