/*
  Warnings:

  - You are about to drop the `product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `productimg` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `productkategori` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `productimg` DROP FOREIGN KEY `ProductImg_productId_fkey`;

-- DropForeignKey
ALTER TABLE `productkategori` DROP FOREIGN KEY `ProductKategori_produkId_fkey`;

-- DropTable
DROP TABLE `product`;

-- DropTable
DROP TABLE `productimg`;

-- DropTable
DROP TABLE `productkategori`;
