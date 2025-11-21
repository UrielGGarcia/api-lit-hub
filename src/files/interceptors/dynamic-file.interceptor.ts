import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Type, } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileTypes } from 'generated/prisma';
import { generateSettings } from '../multer/multer.config';

export function DynamicFileInterceptor(fieldName: string): Type<NestInterceptor> {
    @Injectable()
    class MixinInterceptor implements NestInterceptor {
        async intercept(context: ExecutionContext, next: CallHandler) {
                const request = context.switchToHttp().getRequest();

                const typeFile = request.params.typeFile?.toUpperCase();

                // Verifica si el tipo es válido dentro del enum
                if (!Object.values(FileTypes).includes(typeFile)) {
                    throw new Error(`Tipo de archivo inválido: ${typeFile}`);
                }

                // Genera la configuración de Multer dinámicamente
                const config = generateSettings(typeFile as FileTypes);

                // Crea un nuevo interceptor de FileInterceptor con esa configuración
                const DynamicInterceptor = FileInterceptor(fieldName, config);
                const interceptor = new DynamicInterceptor();

                return interceptor.intercept(context, next);

        }
    }

    return MixinInterceptor;
}
