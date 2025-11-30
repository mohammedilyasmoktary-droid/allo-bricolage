-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Nov 29, 2025 at 11:20 PM
-- Server version: 11.8.3-MariaDB-log
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u905810677_alobricolage`
--

-- --------------------------------------------------------

--
-- Table structure for table `ChatMessage`
--

CREATE TABLE `ChatMessage` (
  `id` varchar(191) NOT NULL,
  `bookingId` varchar(191) NOT NULL,
  `senderId` varchar(191) NOT NULL,
  `receiverId` varchar(191) NOT NULL,
  `message` text NOT NULL,
  `messageType` varchar(191) NOT NULL DEFAULT 'TEXT',
  `fileUrl` varchar(191) DEFAULT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `DiagnosisRequest`
--

CREATE TABLE `DiagnosisRequest` (
  `id` varchar(191) NOT NULL,
  `clientId` varchar(191) NOT NULL,
  `issueType` varchar(191) NOT NULL,
  `description` text NOT NULL,
  `photos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`photos`)),
  `suggestedCategoryId` varchar(191) DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `GalleryImage`
--

CREATE TABLE `GalleryImage` (
  `id` varchar(191) NOT NULL,
  `bookingId` varchar(191) DEFAULT NULL,
  `categoryId` varchar(191) DEFAULT NULL,
  `imageUrl` varchar(191) NOT NULL,
  `title` varchar(191) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `isBeforeAfter` tinyint(1) NOT NULL DEFAULT 0,
  `isBefore` tinyint(1) NOT NULL DEFAULT 0,
  `technicianId` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Notification`
--

CREATE TABLE `Notification` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `type` enum('BOOKING_CREATED','BOOKING_ACCEPTED','BOOKING_DECLINED','BOOKING_ON_THE_WAY','BOOKING_IN_PROGRESS','BOOKING_COMPLETED','BOOKING_CANCELLED','PAYMENT_CONFIRMED','VERIFICATION_APPROVED','VERIFICATION_REJECTED','SUBSCRIPTION_EXPIRED','SUBSCRIPTION_RENEWED') NOT NULL,
  `message` varchar(191) NOT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `PasswordResetToken`
--

CREATE TABLE `PasswordResetToken` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `token` varchar(191) NOT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Review`
--

CREATE TABLE `Review` (
  `id` varchar(191) NOT NULL,
  `bookingId` varchar(191) NOT NULL,
  `reviewerId` varchar(191) NOT NULL,
  `revieweeId` varchar(191) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ServiceCategory`
--

CREATE TABLE `ServiceCategory` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ServiceRequest`
--

CREATE TABLE `ServiceRequest` (
  `id` varchar(191) NOT NULL,
  `clientId` varchar(191) NOT NULL,
  `technicianId` varchar(191) DEFAULT NULL,
  `technicianProfileId` varchar(191) DEFAULT NULL,
  `categoryId` varchar(191) NOT NULL,
  `description` text NOT NULL,
  `photos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`photos`)),
  `city` varchar(191) NOT NULL,
  `address` varchar(191) NOT NULL,
  `scheduledDateTime` datetime(3) DEFAULT NULL,
  `status` enum('PENDING','ACCEPTED','DECLINED','ON_THE_WAY','IN_PROGRESS','COMPLETED','AWAITING_PAYMENT','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `estimatedPrice` double DEFAULT NULL,
  `finalPrice` double DEFAULT NULL,
  `paymentMethod` enum('CASH','CARD','WAFACASH','BANK_TRANSFER') DEFAULT NULL,
  `paymentStatus` enum('UNPAID','PENDING','PAID') NOT NULL DEFAULT 'UNPAID',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Subscription`
--

CREATE TABLE `Subscription` (
  `id` varchar(191) NOT NULL,
  `technicianProfileId` varchar(191) NOT NULL,
  `plan` enum('FREE_TRIAL','BASIC','PREMIUM') NOT NULL,
  `status` enum('ACTIVE','EXPIRED','CANCELLED','PENDING_PAYMENT') NOT NULL DEFAULT 'ACTIVE',
  `startDate` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `endDate` datetime(3) NOT NULL,
  `autoRenew` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `SubscriptionPayment`
--

CREATE TABLE `SubscriptionPayment` (
  `id` varchar(191) NOT NULL,
  `subscriptionId` varchar(191) NOT NULL,
  `amount` double NOT NULL,
  `paymentMethod` enum('CASH','CARD','WAFACASH','BANK_TRANSFER') NOT NULL,
  `paymentStatus` enum('UNPAID','PENDING','PAID') NOT NULL DEFAULT 'PENDING',
  `receiptUrl` varchar(191) DEFAULT NULL,
  `transactionId` varchar(191) DEFAULT NULL,
  `paidAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `TechnicianDocument`
--

CREATE TABLE `TechnicianDocument` (
  `id` varchar(191) NOT NULL,
  `technicianProfileId` varchar(191) NOT NULL,
  `type` enum('ID_CARD','CERTIFICATE','OTHER') NOT NULL,
  `fileUrl` varchar(191) NOT NULL,
  `uploadedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `TechnicianProfile`
--

CREATE TABLE `TechnicianProfile` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `skills` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`skills`)),
  `yearsOfExperience` int(11) NOT NULL,
  `hourlyRate` double DEFAULT NULL,
  `basePrice` double DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `profilePictureUrl` varchar(191) DEFAULT NULL,
  `verificationStatus` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `averageRating` double NOT NULL DEFAULT 0,
  `isOnline` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `User`
--

CREATE TABLE `User` (
  `id` varchar(191) NOT NULL,
  `role` enum('CLIENT','TECHNICIAN','ADMIN') NOT NULL DEFAULT 'CLIENT',
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `phone` varchar(191) NOT NULL,
  `passwordHash` varchar(191) NOT NULL,
  `city` varchar(191) NOT NULL,
  `profilePictureUrl` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ChatMessage`
--
ALTER TABLE `ChatMessage`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ChatMessage_bookingId_idx` (`bookingId`),
  ADD KEY `ChatMessage_senderId_idx` (`senderId`),
  ADD KEY `ChatMessage_receiverId_idx` (`receiverId`),
  ADD KEY `ChatMessage_createdAt_idx` (`createdAt`);

--
-- Indexes for table `DiagnosisRequest`
--
ALTER TABLE `DiagnosisRequest`
  ADD PRIMARY KEY (`id`),
  ADD KEY `DiagnosisRequest_clientId_idx` (`clientId`),
  ADD KEY `DiagnosisRequest_status_idx` (`status`),
  ADD KEY `DiagnosisRequest_suggestedCategoryId_fkey` (`suggestedCategoryId`);

--
-- Indexes for table `GalleryImage`
--
ALTER TABLE `GalleryImage`
  ADD PRIMARY KEY (`id`),
  ADD KEY `GalleryImage_categoryId_idx` (`categoryId`),
  ADD KEY `GalleryImage_technicianId_idx` (`technicianId`),
  ADD KEY `GalleryImage_createdAt_idx` (`createdAt`),
  ADD KEY `GalleryImage_bookingId_fkey` (`bookingId`);

--
-- Indexes for table `Notification`
--
ALTER TABLE `Notification`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Notification_userId_idx` (`userId`),
  ADD KEY `Notification_isRead_idx` (`isRead`),
  ADD KEY `Notification_createdAt_idx` (`createdAt`);

--
-- Indexes for table `PasswordResetToken`
--
ALTER TABLE `PasswordResetToken`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `PasswordResetToken_token_key` (`token`),
  ADD KEY `PasswordResetToken_userId_idx` (`userId`),
  ADD KEY `PasswordResetToken_token_idx` (`token`),
  ADD KEY `PasswordResetToken_expiresAt_idx` (`expiresAt`);

--
-- Indexes for table `Review`
--
ALTER TABLE `Review`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Review_bookingId_reviewerId_key` (`bookingId`,`reviewerId`),
  ADD KEY `Review_bookingId_idx` (`bookingId`),
  ADD KEY `Review_reviewerId_idx` (`reviewerId`),
  ADD KEY `Review_revieweeId_idx` (`revieweeId`);

--
-- Indexes for table `ServiceCategory`
--
ALTER TABLE `ServiceCategory`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ServiceCategory_name_key` (`name`),
  ADD KEY `ServiceCategory_isActive_idx` (`isActive`);

--
-- Indexes for table `ServiceRequest`
--
ALTER TABLE `ServiceRequest`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ServiceRequest_clientId_idx` (`clientId`),
  ADD KEY `ServiceRequest_technicianId_idx` (`technicianId`),
  ADD KEY `ServiceRequest_categoryId_idx` (`categoryId`),
  ADD KEY `ServiceRequest_status_idx` (`status`),
  ADD KEY `ServiceRequest_city_idx` (`city`),
  ADD KEY `ServiceRequest_createdAt_idx` (`createdAt`),
  ADD KEY `ServiceRequest_technicianProfileId_fkey` (`technicianProfileId`);

--
-- Indexes for table `Subscription`
--
ALTER TABLE `Subscription`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Subscription_technicianProfileId_idx` (`technicianProfileId`),
  ADD KEY `Subscription_status_idx` (`status`),
  ADD KEY `Subscription_endDate_idx` (`endDate`);

--
-- Indexes for table `SubscriptionPayment`
--
ALTER TABLE `SubscriptionPayment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `SubscriptionPayment_subscriptionId_idx` (`subscriptionId`),
  ADD KEY `SubscriptionPayment_paymentStatus_idx` (`paymentStatus`);

--
-- Indexes for table `TechnicianDocument`
--
ALTER TABLE `TechnicianDocument`
  ADD PRIMARY KEY (`id`),
  ADD KEY `TechnicianDocument_technicianProfileId_idx` (`technicianProfileId`);

--
-- Indexes for table `TechnicianProfile`
--
ALTER TABLE `TechnicianProfile`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `TechnicianProfile_userId_key` (`userId`),
  ADD KEY `TechnicianProfile_verificationStatus_idx` (`verificationStatus`),
  ADD KEY `TechnicianProfile_isOnline_idx` (`isOnline`),
  ADD KEY `TechnicianProfile_userId_idx` (`userId`);

--
-- Indexes for table `User`
--
ALTER TABLE `User`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`),
  ADD KEY `User_email_idx` (`email`),
  ADD KEY `User_role_idx` (`role`),
  ADD KEY `User_city_idx` (`city`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ChatMessage`
--
ALTER TABLE `ChatMessage`
  ADD CONSTRAINT `ChatMessage_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `ServiceRequest` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ChatMessage_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ChatMessage_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `DiagnosisRequest`
--
ALTER TABLE `DiagnosisRequest`
  ADD CONSTRAINT `DiagnosisRequest_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `DiagnosisRequest_suggestedCategoryId_fkey` FOREIGN KEY (`suggestedCategoryId`) REFERENCES `ServiceCategory` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `GalleryImage`
--
ALTER TABLE `GalleryImage`
  ADD CONSTRAINT `GalleryImage_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `ServiceRequest` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `GalleryImage_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `ServiceCategory` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `GalleryImage_technicianId_fkey` FOREIGN KEY (`technicianId`) REFERENCES `User` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `Notification`
--
ALTER TABLE `Notification`
  ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `PasswordResetToken`
--
ALTER TABLE `PasswordResetToken`
  ADD CONSTRAINT `PasswordResetToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Review`
--
ALTER TABLE `Review`
  ADD CONSTRAINT `Review_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `ServiceRequest` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Review_revieweeId_fkey` FOREIGN KEY (`revieweeId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Review_reviewerId_fkey` FOREIGN KEY (`reviewerId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ServiceRequest`
--
ALTER TABLE `ServiceRequest`
  ADD CONSTRAINT `ServiceRequest_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `ServiceCategory` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `ServiceRequest_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ServiceRequest_technicianId_fkey` FOREIGN KEY (`technicianId`) REFERENCES `User` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `ServiceRequest_technicianProfileId_fkey` FOREIGN KEY (`technicianProfileId`) REFERENCES `TechnicianProfile` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `Subscription`
--
ALTER TABLE `Subscription`
  ADD CONSTRAINT `Subscription_technicianProfileId_fkey` FOREIGN KEY (`technicianProfileId`) REFERENCES `TechnicianProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `SubscriptionPayment`
--
ALTER TABLE `SubscriptionPayment`
  ADD CONSTRAINT `SubscriptionPayment_subscriptionId_fkey` FOREIGN KEY (`subscriptionId`) REFERENCES `Subscription` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `TechnicianDocument`
--
ALTER TABLE `TechnicianDocument`
  ADD CONSTRAINT `TechnicianDocument_technicianProfileId_fkey` FOREIGN KEY (`technicianProfileId`) REFERENCES `TechnicianProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `TechnicianProfile`
--
ALTER TABLE `TechnicianProfile`
  ADD CONSTRAINT `TechnicianProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
