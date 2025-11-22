import { Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UploadedFile, UseGuards, UseInterceptors, Req, UnauthorizedException } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileTypes, Roles } from 'generated/prisma';
import { BookExistsGuard } from './guards/books-exists.guard';
import { DynamicFileInterceptor } from './interceptors/dynamic-file.interceptor';
import { FileMatchGuard } from './guards/file-update.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { RolesAllowed } from 'src/auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Files')
@ApiBearerAuth()
@Controller('files')
export class FilesController {
    constructor(private filesService: FilesService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @RolesAllowed(Roles.ADMIN, Roles.AUTHOR)
    @Get()
    @ApiOperation({ summary: 'Obtener todos los archivos' })
    @ApiResponse({ status: 200, description: 'Lista de archivos obtenida correctamente.' })
    async getFiles() {
        return await this.filesService.getFiles();
    }

    @UseGuards(JwtAuthGuard, RolesGuard, BookExistsGuard)
    @RolesAllowed(Roles.ADMIN, Roles.AUTHOR)
    @Post('/book-create/:typeFile/:bookId')
    @UseInterceptors(DynamicFileInterceptor('file'))
    @ApiOperation({ summary: 'Subir un archivo a un libro' })
    @ApiParam({ name: 'bookId', description: 'ID del libro' })
    @ApiParam({ name: 'typeFile', description: 'Tipo de archivo', enum: FileTypes })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Archivo subido correctamente.' })
    async uploadCover(
        @Param('bookId', ParseIntPipe) bookId: number,
        @Param('typeFile') typeFile: FileTypes,
        @UploadedFile() file: Express.Multer.File,
        @Req() req
    ) {
        const user = req.user;

        if (user.rol === Roles.AUTHOR) {
            const owns = await this.filesService.checkBookOwnership(user.id, bookId);
            if (!owns) throw new UnauthorizedException('No puedes subir archivos a libros que no te pertenecen');
        }

        return await this.filesService.createFile(file, typeFile, bookId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @RolesAllowed(Roles.ADMIN, Roles.AUTHOR)
    @Delete('/book/:fileId')
    @ApiOperation({ summary: 'Eliminar un archivo de un libro' })
    @ApiParam({ name: 'fileId', description: 'ID del archivo' })
    @ApiResponse({ status: 200, description: 'Archivo eliminado correctamente.' })
    @ApiResponse({ status: 403, description: 'No autorizado.' })
    async deleteFile(@Param('fileId', ParseIntPipe) fileId: number, @Req() req) {
        const user = req.user;

        if (user.rol === Roles.AUTHOR) {
            const owns = await this.filesService.checkFileOwnership(user.id, fileId);
            if (!owns) throw new UnauthorizedException('No puedes eliminar archivos que no son de tus libros');
        }

        return await this.filesService.deleteFile(fileId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard, FileMatchGuard)
    @RolesAllowed(Roles.ADMIN, Roles.AUTHOR)
    @Put('/book-update/:typeFile/:id')
    @UseInterceptors(DynamicFileInterceptor('file'))
    @ApiOperation({ summary: 'Actualizar un archivo de un libro' })
    @ApiParam({ name: 'id', description: 'ID del archivo' })
    @ApiParam({ name: 'typeFile', description: 'Tipo de archivo', enum: FileTypes })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Archivo actualizado correctamente.' })
    @ApiResponse({ status: 403, description: 'No autorizado.' })
    async updateFile(
        @Param('typeFile') typeFile: FileTypes,
        @Param('id', ParseIntPipe) id: number,
        @UploadedFile() file: Express.Multer.File,
        @Req() req
    ) {
        const user = req.user;

        if (user.rol === Roles.AUTHOR) {
            const owns = await this.filesService.checkFileOwnership(user.id, id);
            if (!owns) throw new UnauthorizedException('No puedes actualizar archivos que no son de tus libros');
        }

        return await this.filesService.updateFile(file, id);
    }
}
