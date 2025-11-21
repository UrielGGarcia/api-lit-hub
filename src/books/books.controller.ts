import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { JwtAuthGuard } from 'src/auth/dto/guards/jwt-auth.guard';
import { join } from 'path';
import { Response } from 'express';


@Controller('books')
export class BooksController {
    constructor(private booksServise: BooksService) { }

    @Get()
    async getBooks() {
        return await this.booksServise.getBooks();
    }

    @Get('/with-genres')
    async getBooksWithGenres() {
        return await this.booksServise.getBooksWithGenres();
    }

    @Get('/usersbooks')
    async getAllUsersBooks() {
        return await this.booksServise.getAllUserBooks();
    }

    @Get("/no-published")
    async getNoPublisedBooks() {
        return await this.booksServise.getNoPublishedBooks();
    }

    @Get('/by-author/:id')
    async getBooksByAuthor(@Param('id', ParseIntPipe) id: number) {
        return await this.booksServise.getBooksByAuthor(id)
    }

    @Get('/by-author-no-published/:id')
    async getBooksByAuthorNopublished(@Param('id', ParseIntPipe) id: number) {
        return await this.booksServise.getBooksByAuthorNoPublished(id)
    }

    @Get('/:id')
    async getBook(@Param('id', ParseIntPipe) id: number) {
        return await this.booksServise.getBookById(id);
    }

    @Get('/mybooks/:id')
    async getMyBooks(@Param('id', ParseIntPipe) id: number) {
        return await this.booksServise.myBooks(id);
    }

    @Post()
    async createBook(@Body() data: CreateBookDto) {
        return await this.booksServise.createBookWithGenres(data);
    }

    // books.controller.ts
    @Get('download/:bookId')
    @UseGuards(JwtAuthGuard)
    async downloadBook(
        @Param('bookId', ParseIntPipe) bookId: number, // ✅ convierte a número
        @Req() req,
        @Res() res: Response
    ) {
        const userId = req.user.id;

        const book = await this.booksServise.getBookIfUserOwnsIt(userId, bookId);

        if (!book) {
            throw new UnauthorizedException('No tienes acceso a este libro');
        }

        const filePath = join(process.cwd(), 'uploads/books/pdf', book.fileName);

        res.download(filePath);
    }

}
