import { HttpException, HttpStatus, Injectable, NotFoundException, ParseIntPipe } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { FileTypes } from '../common/enums';
import { PrismaClientKnownRequestError } from 'generated/prisma/runtime/library';
import * as path from 'path';
import { promises as fs } from 'fs';
import { StripeService } from 'src/stripe/stripe.service';

@Injectable()
export class FilesService {
    constructor(private prismaService: PrismaService, private readonly stripeService: StripeService) { }

    async checkBookOwnership(userId: number, bookId: number): Promise<boolean> {
        const book = await this.prismaService.book.findUnique({
            where: { id: bookId },
            select: { authorId: true },
        });
        return book?.authorId === userId;
    }

    async checkFileOwnership(userId: number, fileId: number): Promise<boolean> {
        const file = await this.prismaService.file.findUnique({
            where: { id: fileId },
            include: { book: true },
        });

        if (!file || !file.book) return false; // archivo o libro no existen

        return file.book.authorId === userId;
    }



    async getFiles() {
        try {
            const files = await this.prismaService.file.findMany()
            return files;

        } catch (error) {
            if (error instanceof Error) {
                throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async createFile(file: Express.Multer.File, typeFile: FileTypes, bookId: number) {
        try {
            const newFile = await this.prismaService.file.create({
                data: {
                    name: file.filename,
                    fileType: typeFile,
                    mimeType: file.mimetype,
                    urlFile: file.destination + '/' + file.filename,
                    bookId: bookId,
                },
            });

            switch (typeFile) {
                case "COVER":
                    await this.prismaService.book.update({
                        where: {
                            id: bookId,
                        },
                        data: {
                            hasCover: true
                        }
                    });
                    break;
                case "EPUB":
                    await this.prismaService.book.update({
                        where: {
                            id: bookId,
                        },
                        data: {
                            hasEpub: true
                        }
                    });
                    break
                case "PDF":
                    await this.prismaService.book.update({
                        where: {
                            id: bookId,
                        },
                        data: {
                            hasPdf: true
                        }
                    });
                    break
            }

            const book = await this.prismaService.book.findUnique({
                where: {
                    id: bookId
                }
            });

            if (book?.hasCover && book.hasEpub && book.hasPdf) {


                const bookPublished = await this.prismaService.book.update({
                    where: {
                        id: bookId
                    },
                    data: {
                        published: true
                    }
                });

                const bookAddedStripe = await this.stripeService.createDynamicProduct({
                    title: bookPublished.title,
                    description: bookPublished.sinopsis,
                    price: Number(bookPublished.price),
                });

                const bookUpdated = await this.prismaService.book.update({
                    where: {
                        id: bookPublished.id,
                    },
                    data: {
                        stripePriceId: bookAddedStripe.priceId,
                        stripeProductId: bookAddedStripe.productId,
                    }
                });

                return ({
                    estado: "Archivo subido exitosamente.",
                    archivo: file,
                    registro: newFile,
                    actualizado: `Archivo de tipo: ${typeFile} en el bookId ${bookId}`,
                    ebookactualizado: bookPublished.published,
                    datosstripe: { bookUpdated }
                });
            }

            return ({
                estado: "Archivo subido exitosamente.",
                archivo: file,
                registro: newFile,
                actualizado: `Archivo de tipo: ${typeFile} en el bookId ${bookId}`
            });

        } catch (error) {
            if (error instanceof Error) {
                throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }


    async deleteFile(fileId: number) {
        const file = await this.prismaService.file.findUnique({
            where: { id: fileId },
        });

        if (!file) {
            throw new NotFoundException(`Archivo con ID ${fileId} no encontrado`);
        }

        const filePath = path.resolve(file.urlFile);
        let fileDeletedMessage = 'Archivo físico eliminado correctamente';

        try {
            await fs.unlink(filePath);
        } catch (err) {
            fileDeletedMessage = `No se pudo eliminar el archivo físico: ${err.message}`;
        }

        await this.prismaService.file.delete({
            where: { id: fileId },
        });

        return {
            Estado: fileDeletedMessage,
            archivo: file,
        };
    }

    async updateFile(file: Express.Multer.File, id: number) {
        try {
            const removedFile = await this.prismaService.file.findUnique({ where: { id } });

            if (!removedFile) {
                throw new NotFoundException(`El archivo con id ${id} no existe.`)
            }

            const filePath = path.resolve(removedFile.urlFile);
            let fileDeletedMessage = "Archivo actualizado correctamente."
            const oldFile = removedFile;

            try {
                await fs.unlink(filePath);
            } catch (err) {
                fileDeletedMessage = `No se pudo eliminar el archivo físico: ${err.message}`;
            }

            const updatedFile = await this.prismaService.file.update({
                where: { id },
                data: {
                    name: file.filename,
                    urlFile: file.destination + '/' + file.filename,
                }
            });

            return {
                "Estado": fileDeletedMessage,
                "Archivo anterior:": oldFile,
                "Archivo actualizado": updatedFile
            };

        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
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



}
