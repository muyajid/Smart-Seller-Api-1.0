-- CreateTable
CREATE TABLE `Product` (
    `id` CHAR(36) NOT NULL,
    `namaProduk` VARCHAR(60) NOT NULL,
    `deskripsiProduk` TEXT NULL,
    `hargaProduk` FLOAT NOT NULL,
    `stokProduk` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Product_namaProduk_key`(`namaProduk`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductKategori` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `produkId` CHAR(36) NOT NULL,
    `kategoriProduk` VARCHAR(50) NOT NULL,
    `kategoriData` VARCHAR(50) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductImg` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` CHAR(36) NOT NULL,
    `imgUrl` VARCHAR(100) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProductKategori` ADD CONSTRAINT `ProductKategori_produkId_fkey` FOREIGN KEY (`produkId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductImg` ADD CONSTRAINT `ProductImg_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
