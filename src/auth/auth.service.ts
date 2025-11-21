import { HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { Prisma } from 'generated/prisma';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService
    ) { }

    async logIn(data: AuthDto) {
        try {
            const user = await this.prismaService.user.findUnique({
                where: {
                    email: data.email,
                },
            });

            if (!user) {
                return { message: `El email ${data.email} no está asociado a ninguna cuenta.` }
            }

            const isMatch = await bcrypt.compare(data.password, user.password);
            if (!isMatch) {
                throw new UnauthorizedException('Credenciales incorrectas.')
            }

            const payload = {
                sub: user.id,
                email: user.email,
                nombre: user.nombre,
                apellidoPaterno: user.apellidoPaterno,
                apellidoMaterno: user.apellidoMaterno,
                rol: user.rol
            };

            return {
                user: {
                    id: user.id,
                    nombre: user.nombre,
                    apellidoPaterno: user.apellidoPaterno,
                    apellidoMaterno: user.apellidoMaterno,
                    email: user.email,
                    rol: user.rol,
                },
                access_token: await this.jwtService.signAsync(payload),
            };


        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new NotFoundException(`El email ${data.email} no fue encontrado`);
            }
            if (error instanceof Error) {
                throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            }
            if (error instanceof NotFoundException) {
                throw new NotFoundException(error.message);
            }

        }
    }

    async registerUser(user: CreateUserDto) {
        try {
            const existEmail = await this.prismaService.user.findUnique({
                where: {
                    email: user.email,
                }
            });

            if (existEmail) {
                return {
                    message: `El correo ${user.email} ya está asociado a una cuenta, intenta con alguno diferente.`
                };
            }

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(user.password, saltRounds);

            const newUser = await this.prismaService.user.create({
                data: {
                    nombre: user.nombre,
                    apellidoPaterno: user.apellidoPaterno,
                    apellidoMaterno: user.apellidoMaterno,
                    email: user.email,
                    rol: user.rol,
                    password: hashedPassword,
                }
            });

            const payload = {
                sub: newUser.id,
                email: newUser.email,
                nombre: newUser.nombre,
                apellidoPaterno: newUser.apellidoPaterno,
                apellidoMaterno: newUser.apellidoMaterno,
                rol: newUser.rol
            };

            return {
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    nombre: newUser.nombre,
                    apellidoPaterno: newUser.apellidoPaterno,
                    apellidoMaterno: newUser.apellidoMaterno,
                    rol: newUser.rol
                },
                access_token: await this.jwtService.signAsync(payload),
            };

        } catch (error) {
            if (error instanceof Error) {
                throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
}