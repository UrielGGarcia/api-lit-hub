import { IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { Role } from "generated/prisma";

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(40)
    nombre: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(40)
    apellidoPaterno: string

    @IsString()
    @IsNotEmpty()
    @MaxLength(40)
    apellidoMaterno: string;

    @IsEmail()
    @IsNotEmpty()
    email: string

    @IsString()
    @MinLength(8)
    @MaxLength(100)
    @IsNotEmpty()
    password: string

    @IsEnum(Role)
    role: Role;
}

