import { HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { Prisma } from '@prisma/client';
import { runInThisContext } from 'vm';
import { audit } from 'rxjs';

@Injectable()
export class BooksService {

    constructor(private prisma: PrismaService) { }

    async getBooks() {
        try {
            const books = await this.prisma.book.findMany({
                where: { published: true },
                select: {
                    id: true,
                    title: true,
                    price: true,
                    sinopsis: true,
                    idioma: true,
                    stripePriceId: true,
                    stripeProductId: true,
                    files: {
                        where: { fileType: 'COVER' },
                        select: { name: true },
                    },
                    author: {
                        select: {
                            id: true,
                            nombre: true,
                            apellidoPaterno: true,
                            apellidoMaterno: true,
                        },
                    },
                    genres: {
                        select: {
                            id: true,
                            name: true,

                        },
                    },
                },
            });

            return books.map(book => ({
                ...book,
                cover: book.files[0]?.name || null,
                files: undefined,
            }));


        } catch (error) {
            if (error instanceof Error) {
                throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async getBooksWithGenres() {
        try {
            const books = await this.prisma.book.findMany({
                include: {
                    genres: true,
                }
            });

            return books;

        } catch (error) {
            if (error instanceof Error) {
                throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async getAllUserBooks() {
        try {
            const usersBooks = await this.prisma.userBook.findMany();


            return usersBooks;

        } catch (error) {
            if (error instanceof Error) {
                throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async getUserBooksByUserId(userId: number) {
        return await this.prisma.userBook.findMany({
            where: { userId },
            select: { id: true, createdAt: true, bookId: true, userId: true }
        });
    }


    async getNoPublishedBooks() {
        try {
            const books = await this.prisma.book.findMany({
                where: { published: false },
                select: {
                    id: true,
                    title: true,
                    price: true,
                    sinopsis: true,
                    idioma: true,
                    files: {
                        where: { fileType: 'COVER' },
                        select: { name: true },
                    },
                    author: {
                        select: {
                            id: true,
                            nombre: true,
                            apellidoPaterno: true,
                            apellidoMaterno: true,
                        },
                    },
                },

            });

            return books.map(book => ({
                ...book,
                cover: book.files[0]?.name || null,
                files: undefined,
            }));

        } catch (error) {
            if (error instanceof Error) {
                throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async getBookById(id: number) {
        try {
            const books = await this.prisma.book.findMany({
                where: {
                    id
                },
                select: {
                    id: true,
                    title: true,
                    price: true,
                    sinopsis: true,
                    idioma: true,
                    stripePriceId: true,
                    stripeProductId: true,
                    files: {
                        where: { fileType: 'COVER' },
                        select: { name: true },
                    },
                    genres: true,
                    author: {
                        select: {
                            id: true,
                            nombre: true,
                            apellidoPaterno: true,
                            apellidoMaterno: true,
                        },
                    },
                },

            });

            return books.map(book => ({
                ...book,
                cover: book.files[0]?.name || null,
                files: undefined,
            }));

        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new NotFoundException(`El libro con id ${id} no fue encontrado.`);
            }
            if (error instanceof NotFoundException) {
                throw new NotFoundException(error.message);
            }
            if (error instanceof Error) {
                throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }


    async createBook(data: CreateBookDto) {
        try {
            const author = await this.prisma.user.findUnique({
                where: {
                    id: data.authorId,
                }
            });


            if (!author) {
                throw new NotFoundException(`El autor con id ${data.authorId} no fue encontrado.`);
            }

            const newBook = await this.prisma.book.create({
                data: {
                    title: data.title,
                    sinopsis: data.sinopsis,
                    price: data.price,
                    idioma: data.idioma,
                    authorId: data.authorId,
                },
            });

            return newBook;

        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new NotFoundException(`El usuario con id ${data.authorId} no fue encontrado.`);
            }
            if (error instanceof NotFoundException) {
                throw new NotFoundException(error.message);
            }
            if (error instanceof Error) {
                throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

    }

    async getBooksByAuthor(id: number) {
        try {
            const booksByAuthor = await this.prisma.book.findMany({
                where: {
                    authorId: id,
                    published: true,
                },

                select: {
                    id: true,
                    title: true,
                    price: true,
                    sinopsis: true,
                    stripePriceId: true,
                    stripeProductId: true,
                    files: {
                        where: { fileType: 'COVER' },
                        select: { name: true },
                    },
                    genres: true,
                    author: {
                        select: {
                            id: true,
                            nombre: true,
                            apellidoPaterno: true,
                            apellidoMaterno: true,
                        },
                    },
                },
            });

            if (booksByAuthor.length <= 0) {
                return `No existe ebooks del autor con id ${id}`
            }

            return booksByAuthor.map(book => ({
                ...book,
                cover: book.files[0]?.name || null,
                files: undefined,
            }));

        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new NotFoundException(`El usuario con id ${id} no fue encontrado.`);
            }
            if (error instanceof NotFoundException) {
                throw new NotFoundException(error.message);
            }
            if (error instanceof Error) {
                throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async getBooksByAuthorNoPublished(id: number) {
        try {
            const booksByAuthor = await this.prisma.book.findMany({
                where: {
                    authorId: id,
                    published: false
                },
                select: {
                    id: true,
                    title: true,
                    price: true,
                    sinopsis: true,
                    files: {
                        where: { fileType: 'COVER' },
                        select: { name: true },
                    },
                    author: {
                        select: {
                            id: true,
                            nombre: true,
                            apellidoPaterno: true,
                            apellidoMaterno: true,
                        },
                    },
                }
            });

            if (booksByAuthor.length <= 0) {
                return `No existe ebooks del autor con id ${id}`
            }

            return booksByAuthor.map(book => ({
                ...book,
                cover: book.files[0]?.name || null,
                files: undefined,
            }));

        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new NotFoundException(`El usuario con id ${id} no fue encontrado.`);
            }
            if (error instanceof NotFoundException) {
                throw new NotFoundException(error.message);
            }
            if (error instanceof Error) {
                throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }


    async myBooks(userId: number) {
        try {
            const userBooks = await this.prisma.userBook.findMany({
                where: {
                    userId,
                },
                select: {
                    id: true,       // userBookId
                    bookId: true,   // bookId
                    book: {
                        select: {
                            title: true,
                            sinopsis: true,
                            author: true,
                            files: {
                                where: {
                                    fileType: "COVER",
                                },
                                select: {
                                    name: true,
                                    id: true,
                                },
                            },
                        },
                    },
                },
            });

            const result = userBooks.map((item) => ({
                userBookId: item.id,
                bookId: item.bookId,

                title: item.book.title,
                sinopsis: item.book.sinopsis,
                author: `${item.book.author.nombre} ${item.book.author.apellidoPaterno} ${item.book.author.apellidoMaterno}`,

                cover: item.book.files.length
                    ? `${item.book.files[0].name}`
                    : null,
            }));

            return result;

        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new NotFoundException(`El usuario con id ${userId} no fue encontrado.`);
            }

            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException('Error al obtener la biblioteca del usuario');
        }
    }

    async getBookIfUserOwnsIt(userId: number, bookId: number, isAdmin = false) {
        try {
            let relation;

            if (isAdmin) {
                // ADMIN: trae el libro directamente con el PDF
                const book = await this.prisma.book.findUnique({
                    where: { id: bookId },
                    include: {
                        files: {
                            where: { fileType: 'PDF' },
                        },
                    },
                });

                if (!book || !book.files.length) return null;

                return { fileName: book.files[0].name };
            }

            // Usuario normal: solo si tiene relación
            relation = await this.prisma.userBook.findFirst({
                where: { userId, bookId },
                include: {
                    book: {
                        include: {
                            files: {
                                where: { fileType: 'PDF' },
                            },
                        },
                    },
                },
            });

            if (!relation || !relation.book.files.length) return null;

            return { fileName: relation.book.files[0].name };
        } catch (error) {
            if (error instanceof Error) {
                throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    // books.service.ts
    async createBookWithGenres(data: CreateBookDto) {
        try {
            return await this.prisma.book.create({
                data: {
                    title: data.title,
                    sinopsis: data.sinopsis,
                    price: data.price,
                    idioma: data.idioma,
                    authorId: data.authorId,
                    // Conectar géneros existentes
                    genres: {
                        connect: data.genreIds.map(id => ({ id })),
                    },
                },
                include: {
                    genres: true, // devuelve los géneros relacionados
                },
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }



}
