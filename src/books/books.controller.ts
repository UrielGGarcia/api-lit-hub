import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { join } from 'path';
import { Response } from 'express';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { RolesAllowed } from 'src/auth/decorators/roles.decorator';
import { Roles } from '@prisma/client';

@ApiTags('Books') // Agrupa todos los endpoints bajo "Books" en Swagger
@Controller('books')
export class BooksController {
    constructor(private booksServise: BooksService) {}

    @ApiOperation({ summary: 'Obtener todos los libros publicados' })
    @ApiResponse({ status: 200, description: 'Lista de libros' })
    @Get()
    async getBooks() {
        return await this.booksServise.getBooks();
    }

    @ApiOperation({ summary: 'Obtener todos los libros con sus géneros' })
    @ApiResponse({ status: 200, description: 'Lista de libros con géneros' })
    @Get('/with-genres')
    async getBooksWithGenres() {
        return await this.booksServise.getBooksWithGenres();
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Obtener libros asociados a los usuarios' })
    @ApiResponse({ status: 200, description: 'Lista de libros por usuario (ADMIN ve todos)' })
    @Get('/usersbooks')
    async getAllUsersBooks(@Req() req) {
        const user = req.user;

        if (user.rol === Roles.ADMIN) {
            return await this.booksServise.getAllUserBooks();
        }

        return await this.booksServise.getUserBooksByUserId(user.id);
    }

    @ApiOperation({ summary: 'Obtener libros no publicados' })
    @ApiResponse({ status: 200, description: 'Lista de libros no publicados' })
    @Get("/no-published")
    async getNoPublisedBooks() {
        return await this.booksServise.getNoPublishedBooks();
    }

    @ApiOperation({ summary: 'Obtener libros por autor' })
    @ApiParam({ name: 'id', type: Number })
    @Get('/by-author/:id')
    async getBooksByAuthor(@Param('id', ParseIntPipe) id: number) {
        return await this.booksServise.getBooksByAuthor(id)
    }

    @ApiOperation({ summary: 'Obtener libros no publicados por autor' })
    @ApiParam({ name: 'id', type: Number })
    @Get('/by-author-no-published/:id')
    async getBooksByAuthorNopublished(@Param('id', ParseIntPipe) id: number) {
        return await this.booksServise.getBooksByAuthorNoPublished(id)
    }

    @ApiOperation({ summary: 'Obtener libro por id' })
    @ApiParam({ name: 'id', type: Number })
    @Get('/:id')
    async getBook(@Param('id', ParseIntPipe) id: number) {
        return await this.booksServise.getBookById(id);
    }

    @ApiOperation({ summary: 'Obtener libros propios de un usuario' })
    @ApiParam({ name: 'id', type: Number })
    @Get('/mybooks/:id')
    async getMyBooks(@Param('id', ParseIntPipe) id: number) {
        return await this.booksServise.myBooks(id);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @RolesAllowed(Roles.ADMIN, Roles.AUTHOR)
    @ApiOperation({ summary: 'Crear un libro (solo ADMIN/AUTHOR)' })
    @ApiResponse({ status: 201, description: 'Libro creado correctamente' })
    @Post()
    async createBook(@Body() data: CreateBookDto) {
        return await this.booksServise.createBookWithGenres(data);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Descargar PDF de un libro (ADMIN puede todos, usuario solo si posee)' })
    @ApiParam({ name: 'bookId', type: Number })
    @Get('download/:bookId')
    async downloadBook(
        @Param('bookId', ParseIntPipe) bookId: number,
        @Req() req,
        @Res() res: Response
    ) {
        const user = req.user;

        const book = await this.booksServise.getBookIfUserOwnsIt(
            user.id,
            bookId,
            user.rol === Roles.ADMIN,
        );

        if (!book) {
            throw new UnauthorizedException('No tienes acceso a este libro');
        }

        const filePath = join(process.cwd(), 'uploads/books/pdf', book.fileName);
        res.download(filePath);
    }
}
