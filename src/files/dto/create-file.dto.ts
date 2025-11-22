import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { FileTypes } from "../../common/enums";

export class CreateFileDto {

    @ApiProperty({
        example: 'portada-libro',
        description: 'Nombre descriptivo del archivo',
        maxLength: 100,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @ApiProperty({
        example: FileTypes.COVER,
        description: 'Tipo de archivo (COVER, PDF, EPUB)',
        enum: FileTypes,
    })
    @IsEnum(FileTypes)
    fileType: FileTypes;

    @ApiProperty({
        example: 'https://miservidor.com/uploads/covers/portada.jpg',
        description: 'URL donde se encuentra el archivo',
    })
    @IsString()
    @IsNotEmpty()
    urlFile: string;

    @ApiProperty({
        example: 1,
        description: 'ID del libro al que pertenece el archivo',
    })
    @IsInt()
    @IsNotEmpty()
    bookId: number;
}
