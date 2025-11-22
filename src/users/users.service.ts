import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from 'generated/prisma';

@Injectable()
export class UsersService {

    constructor(
        private prisma: PrismaService,
    ) { }

    async getUsers() {
        try {
            const users = await this.prisma.user.findMany({
                select: {
                    id: true,
                    nombre: true,
                    apellidoMaterno: true,
                    apellidoPaterno: true,
                    email: true,
                    rol: true,
                    createdAt: true,
                    updatedAt: true,
                }
            });
            return users;

        } catch (error) {
            if (error instanceof Error) {
                throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async getAuthors() {
        try {
            const author = await this.prisma.user.findMany({
                where: {
                    rol: "AUTHOR",
                },
                select: {
                    id: true,
                    nombre: true,
                    email: true,
                    apellidoPaterno: true,
                    apellidoMaterno: true,
                }
            });
            return author;

        } catch (error) {

            if (error instanceof NotFoundException) {
                throw new NotFoundException(error.message);
            }
            if (error instanceof Error) {
                throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async getUser(id: number) {
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    id
                }
            });

            if (user) return ({ "Nombre": user.nombre, "Email": user.email })
            throw new NotFoundException(`El usuario con id : ${id} no fue encontrado.`)

        } catch (error) {
            if (error instanceof NotFoundException)
                throw new NotFoundException(error.message)
            if (error instanceof Error)
                throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }



    async deleteUser(id: number) {
        try {
            const deletedUser = await this.prisma.user.delete({
                where: {
                    id
                }
            });


            if (deletedUser) {
                return { message: `El usuario con email ${deletedUser.email} fue eliminado correctamente.` };
            }

        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new NotFoundException(`El usuario con id ${id} no fue encontrado.`);
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
