-- CreateTable
CREATE TABLE `Account` (
    `id` CHAR(36) NOT NULL,
    `username` VARCHAR(60) NOT NULL,
    `email` VARCHAR(60) NOT NULL,
    `password` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `Account_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
