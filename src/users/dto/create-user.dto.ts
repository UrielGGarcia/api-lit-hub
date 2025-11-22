import { IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { Roles } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
    @ApiProperty({
        example: 'Uriel',
        description: 'Nombre del usuario',
        maxLength: 40,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(40)
    nombre: string;

    @ApiProperty({
        example: 'García',
        description: 'Apellido paterno del usuario',
        maxLength: 40,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(40)
    apellidoPaterno: string;

    @ApiProperty({
        example: 'García',
        description: 'Apellido materno del usuario',
        maxLength: 40,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(40)
    apellidoMaterno: string;

    @ApiProperty({
        example: 'correo@ejemplo.com',
        description: 'Correo electrónico del usuario (único)',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: '12345678',
        description: 'Contraseña del usuario (mínimo 8 caracteres)',
        minLength: 8,
        maxLength: 100,
    })
    @IsString()
    @MinLength(8)
    @MaxLength(100)
    @IsNotEmpty()
    password: string;

    @ApiProperty({
        example: Roles.ADMIN,
        description: 'Rol del usuario (ADMIN o USER)',
        enum: Roles,
    })
    @IsEnum(Roles)
    rol: Roles;
}
