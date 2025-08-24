/*
  Warnings:

  - You are about to drop the column `kategoriData` on the `productkategori` table. All the data in the column will be lost.
  - You are about to drop the column `kategoriProduk` on the `productkategori` table. All the data in the column will be lost.
  - Added the required column `atribut` to the `ProductKategori` table without a default value. This is not possible if the table is not empty.
  - Added the required column `harga` to the `ProductKategori` table without a default value. This is not possible if the table is not empty.
  - Added the required column `namaKategori` to the `ProductKategori` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stok` to the `ProductKategori` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `ProductKategori` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `productkategori` DROP COLUMN `kategoriData`,
    DROP COLUMN `kategoriProduk`,
    ADD COLUMN `atribut` VARCHAR(20) NOT NULL,
    ADD COLUMN `harga` FLOAT NOT NULL,
    ADD COLUMN `namaKategori` VARCHAR(50) NOT NULL,
    ADD COLUMN `stok` INTEGER NOT NULL,
    ADD COLUMN `value` VARCHAR(20) NOT NULL;
