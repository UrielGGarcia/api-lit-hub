import { IsNotEmpty, IsNumber, IsString, MaxLength } from "class-validator";

export class CreateBookDto {

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    title: string;

    @IsString()
    @IsNotEmpty()
    sinopsis: string;

    @IsString()
    @IsNotEmpty()
    price: string;

    @IsString()
    @IsNotEmpty()
    idioma: string;

    @IsNumber()
    @IsNotEmpty()
    authorId: number;

    genreIds: number[];
}

