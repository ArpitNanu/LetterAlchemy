/*
  Warnings:

  - You are about to drop the column `aiHeadings` on the `newsHeadline` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[url]` on the table `newsHeadline` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "newsHeadline" DROP COLUMN "aiHeadings",
ALTER COLUMN "text" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "newsHeadline_url_key" ON "newsHeadline"("url");
