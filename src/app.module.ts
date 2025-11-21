import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { BooksModule } from './books/books.module';
import { FilesModule } from './files/files.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { GenresModule } from './genres/genres.module';
import { RatingsModule } from './ratings/ratings.module';
import { CommentsModule } from './comments/comments.module';
import { PurchasesModule } from './purchases/purchases.module';
import { AuthModule } from './auth/auth.module';
import { StripeModule } from './stripe/stripe.module';


@Module({
  imports: [
    UsersModule,
    BooksModule,
    FilesModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads', 'books', 'covers'),
      serveRoot: '/uploads/books/covers',
    }),
    GenresModule,
    RatingsModule,
    CommentsModule,
    PurchasesModule,
    AuthModule,
    StripeModule,
  ],

  controllers: [],
  providers: [],
})
export class AppModule { }
