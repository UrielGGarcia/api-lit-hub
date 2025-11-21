import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { PrismaService } from 'src/prisma.service';
import { StripeService } from 'src/stripe/stripe.service';

@Module({
  providers: [FilesService, PrismaService, StripeService],
  controllers: [FilesController],
})
export class FilesModule { }
