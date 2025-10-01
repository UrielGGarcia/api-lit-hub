/*
  Warnings:

  - You are about to drop the column `createdAt` on the `autor` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `autor` table. All the data in the column will be lost.
  - You are about to drop the column `coverUrl` on the `book` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `book` table. All the data in the column will be lost.
  - You are about to drop the column `epubUrl` on the `book` table. All the data in the column will be lost.
  - You are about to drop the column `pdfUrl` on the `book` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `book` table. All the data in the column will be lost.
  - You are about to drop the column `bookId` on the `comment` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `comment` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `comment` table. All the data in the column will be lost.
  - You are about to drop the column `bookId` on the `purchase` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `purchase` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `purchase` table. All the data in the column will be lost.
  - You are about to drop the column `bookId` on the `rating` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `rating` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `rating` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `user` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `autor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cover_url` to the `book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `epub_url` to the `book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pdf_url` to the `book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `book_id` to the `comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `book_id` to the `purchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `purchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `book_id` to the `rating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `rating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `apellido_materno` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `apellido_paterno` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."comment" DROP CONSTRAINT "comment_bookId_fkey";

-- DropForeignKey
ALTER TABLE "public"."comment" DROP CONSTRAINT "comment_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."purchase" DROP CONSTRAINT "purchase_bookId_fkey";

-- DropForeignKey
ALTER TABLE "public"."purchase" DROP CONSTRAINT "purchase_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."rating" DROP CONSTRAINT "rating_bookId_fkey";

-- DropForeignKey
ALTER TABLE "public"."rating" DROP CONSTRAINT "rating_userId_fkey";

-- AlterTable
ALTER TABLE "public"."autor" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."book" DROP COLUMN "coverUrl",
DROP COLUMN "createdAt",
DROP COLUMN "epubUrl",
DROP COLUMN "pdfUrl",
DROP COLUMN "updatedAt",
ADD COLUMN     "cover_url" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "epub_url" TEXT NOT NULL,
ADD COLUMN     "pdf_url" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."comment" DROP COLUMN "bookId",
DROP COLUMN "createdAt",
DROP COLUMN "userId",
ADD COLUMN     "book_id" INTEGER NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."purchase" DROP COLUMN "bookId",
DROP COLUMN "createdAt",
DROP COLUMN "userId",
ADD COLUMN     "book_id" INTEGER NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."rating" DROP COLUMN "bookId",
DROP COLUMN "createdAt",
DROP COLUMN "userId",
ADD COLUMN     "book_id" INTEGER NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."user" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "username",
ADD COLUMN     "apellido_materno" TEXT NOT NULL,
ADD COLUMN     "apellido_paterno" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "nombre" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."purchase" ADD CONSTRAINT "purchase_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase" ADD CONSTRAINT "purchase_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comment" ADD CONSTRAINT "comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comment" ADD CONSTRAINT "comment_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rating" ADD CONSTRAINT "rating_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rating" ADD CONSTRAINT "rating_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
