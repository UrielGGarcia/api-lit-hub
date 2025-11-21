import { Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileTypes } from 'generated/prisma';
import { BookExistsGuard } from './guards/books-exists.guard';
import { DynamicFileInterceptor } from './interceptors/dynamic-file.interceptor';
import { FileMatchGuard } from './guards/file-update.guard';

@Controller('files')
export class FilesController {
    constructor(private filesService: FilesService) { }

    @Get()
    async getFiles() {
        return await this.filesService.getFiles();
    }


    @Post('/book-create/:typeFile/:bookId')
    @UseGuards(BookExistsGuard)
    @UseInterceptors(DynamicFileInterceptor('file'))
    async uploadCover(
        @Param('bookId', ParseIntPipe) bookId: number,
        @Param('typeFile') typeFile: FileTypes,
        @UploadedFile() file: Express.Multer.File) {
        return await this.filesService.createFile(file, typeFile, bookId);
    }

    @Delete('/book/:fileId')
    async deleteFile(@Param('fileId', ParseIntPipe) fileId: number) {
        return await this.filesService.deleteFile(fileId);
    }

    @Put('/book-update/:typeFile/:id')
    @UseGuards(FileMatchGuard)
    @UseInterceptors(DynamicFileInterceptor('file'))
    async updateFile(
        @Param('typeFile') typeFile: FileTypes,
        @Param('id', ParseIntPipe) id: number,
        @UploadedFile() file: Express.Multer.File) {
        return await this.filesService.updateFile(file, id);
    }

}