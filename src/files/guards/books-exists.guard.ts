import { BadRequestException, CanActivate, ExecutionContext, Injectable, NotFoundException } from "@nestjs/common";
import { FileTypes } from "../../common/enums";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class BookExistsGuard implements CanActivate {
    constructor(private readonly prismaService: PrismaService) { }

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const bookId = Number(request.params.bookId);
        const typeFile: FileTypes = request.params.typeFile;

        if (isNaN(bookId)) throw new NotFoundException('ID de libro inválido.');

        if (!Object.values(FileTypes).includes(typeFile as FileTypes)) {
            throw new NotFoundException('Tipo de archivo inválido.')
        }

        const exists = await this.prismaService.book.findUnique({ where: { id: bookId } });
        if (!exists) throw new NotFoundException(`El libro con id ${bookId} no existe.`)

        const fileExists = await this.prismaService.file.findFirst({
            where: {
                bookId: bookId,
                fileType: typeFile
            }
        });

        if (fileExists) throw new BadRequestException(`Ya existe un archivo de tipo ${typeFile} asignado a este libro.`)

        return true;
    }

}


