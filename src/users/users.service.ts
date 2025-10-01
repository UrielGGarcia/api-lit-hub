import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

    constructor(private prisma: PrismaService) { }

    async getUsers() {
        try {
            const users = await this.prisma.user.findMany();
            return users;

        } catch (error) {
            if (error instanceof Error) {
                throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    // Agregar get por usuario individual

    async createUser(user: CreateUserDto) {
        try {
            const existEmail = await this.prisma.user.findUnique({
                where: {
                    email: user.email,
                }
            });

            if (existEmail) {
                return `Èl correo ${user.email} ya está asociado a una cuenta.`;
            }

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(user.password, saltRounds);

            const newUser = await this.prisma.user.create({
                data: {
                    nombre: user.nombre,
                    apellidoPaterno: user.apellidoPaterno,
                    apellidoMaterno: user.apellidoMaterno,
                    email: user.email,
                    role: user.role,
                    password: hashedPassword,
                }
            });

            const payLoad = {
                usuario: newUser.email,
                rol: newUser.role,
            }

            return payLoad;

        } catch (error) {
            if (error instanceof Error) {
                throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

}
