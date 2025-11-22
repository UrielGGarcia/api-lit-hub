import { BadRequestException, CanActivate, ExecutionContext, Injectable, NotFoundException } from "@nestjs/common";
import { FileTypes } from "@prisma/client";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class FileMatchGuard implements CanActivate {
    constructor(private readonly prismaService: PrismaService) { }

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const id = Number(request.params.id);
        const typeFile : FileTypes = request.params.typeFile;

        if (isNaN(id)) {
            throw new NotFoundException('ID de archivo inválido.');
        }

        if (!Object.values(FileTypes).includes(typeFile as FileTypes)) {
            throw new NotFoundException('Tipo de archivo inválido.')
        }

        const exists = await this.prismaService.file.findUnique({ where: { id } });
        if (!exists) throw new NotFoundException(`El archivo con id ${id} no existe.`);

        return true;
    }
}