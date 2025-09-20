-- DropForeignKey
ALTER TABLE `images` DROP FOREIGN KEY `Images_productId_fkey`;

-- DropIndex
DROP INDEX `Images_productId_fkey` ON `images`;

-- AddForeignKey
ALTER TABLE `Images` ADD CONSTRAINT `Images_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
