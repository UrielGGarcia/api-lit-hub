import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class GenresService {
    constructor(private prismaService: PrismaService) { }

    async getGenres() {
        try {
            const gen = await this.prismaService.genre.findMany();
            return gen;

        } catch (error) {
            if (error instanceof Error) {
                throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    // genres.service.ts
    async createGenre(data: CreateGenreDto) {
        try {
            // Normaliza el nombre para comparar
            const normalized = data.name.trim().toLowerCase();

            // Busca si ya existe un género con el nombre normalizado
            const existing = await this.prismaService.genre.findMany(); // traemos todos
            const found = existing.find(g => g.name.toLowerCase() === normalized);
            if (found) return found;

            // Capitaliza la primera letra para crear
            const formattedName = normalized.charAt(0).toUpperCase() + normalized.slice(1);

            // Crea el nuevo género
            return this.prismaService.genre.create({ data: { name: formattedName } });
        } catch (error) {
            if (error instanceof Error) {
                throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }



    async deleteGenre(id: number) {
        try {
            const deletedGenre = await this.prismaService.genre.delete({
                where: {
                    id,
                }
            });

            if (deletedGenre) {
                return deletedGenre;
            }

        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new NotFoundException(`El género con id ${id} no fue encontrado.`);
            }
            if (error instanceof NotFoundException) {
                throw new NotFoundException(error.message);
            }
            if (error instanceof Error) {
                throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
}
