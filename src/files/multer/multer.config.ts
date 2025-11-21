import { existsSync, mkdirSync } from "fs";
import { diskStorage } from "multer";
import { extname } from "path";
import { allowedMimeTypesCover, allowedMimeTypesEpub, allowedMimeTypesPdf } from "./MimeTypes";
import { BadRequestException, Type } from "@nestjs/common";
import { FileTypes } from "generated/prisma";


export const generateSettings = (tipoArchivo: FileTypes): {} => {

    let settings = {};

    switch (tipoArchivo) {
        case FileTypes.COVER:
            settings = {
                storage: diskStorage({
                    destination: (req, file, cb) => {
                        const uploadPath = './uploads/books/covers';
                        if (!existsSync(uploadPath)) {
                            mkdirSync(uploadPath, { recursive: true });
                        }
                        cb(null, uploadPath);
                    },
                    filename: (req, file, cb) => {
                        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                        cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
                    },
                }),
                fileFilter: (req, file, cb) => {
                    if (!allowedMimeTypesCover.includes(file.mimetype)) {
                        return cb(new BadRequestException('Tipo de archivo no permitido solo JPEG, JPG y PNG'), false);
                    }
                    cb(null, true);
                },
            };
            break;

        case FileTypes.PDF:
            settings = {
                storage: diskStorage({
                    destination: (req, file, cb) => {
                        const uploadPath = './uploads/books/pdf';
                        if (!existsSync(uploadPath)) {
                            mkdirSync(uploadPath, { recursive: true });
                        }
                        cb(null, uploadPath);
                    },
                    filename: (req, file, cb) => {
                        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                        cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
                    },
                }),
                fileFilter: (req, file, cb) => {
                    if (!allowedMimeTypesPdf.includes(file.mimetype)) {
                        return cb(new BadRequestException('Tipo de archivo no permitido solo PDF.'), false);
                    }
                    cb(null, true);
                },
            };
            break;

        case FileTypes.EPUB:
            settings = {
                storage: diskStorage({
                    destination: (req, file, cb) => {
                        const uploadPath = './uploads/books/epub';
                        if (!existsSync(uploadPath)) {
                            mkdirSync(uploadPath, { recursive: true });
                        }
                        cb(null, uploadPath);
                    },
                    filename: (req, file, cb) => {
                        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                        cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
                    },
                }),
                fileFilter: (req, file, cb) => {
                    if (!allowedMimeTypesEpub.includes(file.mimetype)) {
                        return cb(new BadRequestException('Tipo de archivo no permitido solo EPUB.'), false);
                    }
                    cb(null, true);
                },
            };
            break;

        default:
            throw new Error('Formato no soportado.');
    }

    return settings;
}





