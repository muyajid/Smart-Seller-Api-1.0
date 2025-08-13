-- AlterTable
ALTER TABLE `account` MODIFY `password` VARCHAR(100) NOT NULL;

-- CreateTable
CREATE TABLE `ResetPasswordToken` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `accountId` CHAR(36) NOT NULL,
    `token` VARCHAR(100) NOT NULL,
    `expired` DATETIME(3) NOT NULL,
    `verified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ResetPasswordToken_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ResetPasswordToken` ADD CONSTRAINT `ResetPasswordToken_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
