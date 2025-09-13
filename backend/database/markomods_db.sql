-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 08/09/2025 às 23:41
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `markomods_db`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `activities`
--

CREATE TABLE `activities` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `user_id` varchar(36) NOT NULL,
  `mod_id` varchar(36) NOT NULL,
  `activity_type` enum('download','favorite','comment','comment_vote') NOT NULL,
  `activity_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`activity_data`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `category` enum('auth','mods','users','security','system','comments','favorites','downloads','admin') NOT NULL DEFAULT 'system',
  `level` enum('info','success','warning','error') NOT NULL DEFAULT 'info',
  `resource_type` varchar(50) DEFAULT NULL,
  `resource_id` varchar(36) DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `ads`
--

CREATE TABLE `ads` (
  `id` char(36) NOT NULL,
  `content` longtext NOT NULL,
  `ad_type` varchar(50) DEFAULT 'google_ads',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `ads_config`
--

CREATE TABLE `ads_config` (
  `id` int(11) NOT NULL,
  `google_adsense_enabled` tinyint(1) DEFAULT 0,
  `google_adsense_account` varchar(255) DEFAULT 'ca-pub-8224876793145643',
  `custom_ads_enabled` tinyint(1) DEFAULT 0,
  `mod_detail_page` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`mod_detail_page`)),
  `mod_download_page` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`mod_download_page`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `ads_config`
--

INSERT INTO `ads_config` (`id`, `google_adsense_enabled`, `google_adsense_account`, `custom_ads_enabled`, `mod_detail_page`, `mod_download_page`, `created_at`, `updated_at`) VALUES
(1, 1, 'ca-pub-8224876793145643', 0, '{\"enabled\":false,\"topBanner\":{\"enabled\":false,\"code\":\"\",\"type\":\"google-adsense\"}}', '{\"enabled\":false,\"topBanner\":{\"enabled\":false,\"code\":\"\",\"type\":\"google-adsense\"}}', '2025-09-07 01:46:45', '2025-09-08 16:35:04'),
(2, 0, 'ca-pub-8224876793145643', 0, '{\"enabled\": false, \"topBanner\": {\"enabled\": false, \"code\": \"\", \"type\": \"google-adsense\"}}', '{\"enabled\": false, \"topBanner\": {\"enabled\": false, \"code\": \"\", \"type\": \"google-adsense\"}}', '2025-09-07 02:03:30', '2025-09-07 02:03:30');

-- --------------------------------------------------------

--
-- Estrutura para tabela `categories`
--

CREATE TABLE `categories` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `color` varchar(7) DEFAULT '#6A50BE',
  `icon` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `comments`
--

CREATE TABLE `comments` (
  `id` varchar(36) NOT NULL,
  `mod_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `parent_id` varchar(36) DEFAULT NULL,
  `content` text NOT NULL,
  `is_approved` tinyint(1) DEFAULT 0,
  `is_edited` tinyint(1) DEFAULT 0,
  `edited_at` timestamp NULL DEFAULT NULL,
  `like_count` int(11) DEFAULT 0,
  `dislike_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `rating` int(11) DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `rejected_at` timestamp NULL DEFAULT NULL,
  `rejected_by` varchar(36) DEFAULT NULL,
  `is_reply` tinyint(1) DEFAULT 0,
  `reply_to_user_id` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Acionadores `comments`
--
DELIMITER $$
CREATE TRIGGER `after_comment_insert` AFTER INSERT ON `comments` FOR EACH ROW BEGIN
    IF NEW.is_approved = TRUE THEN
        UPDATE mods 
        SET comment_count = comment_count + 1 
        WHERE id = NEW.mod_id;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `comment_votes`
--

CREATE TABLE `comment_votes` (
  `id` varchar(36) NOT NULL,
  `comment_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `vote_type` enum('upvote','downvote') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `content_types`
--

CREATE TABLE `content_types` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `display_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `minecraft_edition` enum('java','bedrock') NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `content_types`
--

INSERT INTO `content_types` (`id`, `name`, `display_name`, `description`, `minecraft_edition`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'mods', 'Mods', 'Modifica├º├Áes para Minecraft Java Edition - vers├úo tradicional para PC', 'java', 1, '2025-08-25 21:18:32', '2025-08-25 21:18:32'),
(2, 'addons', 'Addons', 'Addons para Minecraft Bedrock Edition - vers├úo multiplataforma (PC, mobile, consoles)', 'bedrock', 1, '2025-08-25 21:18:32', '2025-08-25 21:18:32');

-- --------------------------------------------------------

--
-- Estrutura para tabela `downloads`
--

CREATE TABLE `downloads` (
  `id` int(11) NOT NULL,
  `mod_id` varchar(64) NOT NULL,
  `user_id` varchar(64) NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `email_verification_tokens`
--

CREATE TABLE `email_verification_tokens` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `used_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `email_verification_tokens`
--

INSERT INTO `email_verification_tokens` (`id`, `user_id`, `token`, `expires_at`, `used`, `created_at`, `used_at`) VALUES
('01b929cf-3032-4716-b8c1-a49e02219930', '48e45f3e-abcf-46f8-9af7-bd50a3cbff36', '68fc791c-c28b-4da0-a8d3-1bea316520c2:57bb2e95-8bb5-4922-bab0-01fb37e32cbd', '2025-09-09 19:30:59', 0, '2025-09-08 19:30:59', NULL),
('06468a54-a851-4360-b7db-ec3d027e6528', '376d8f41-dba4-4e68-bd93-7fee30edb29a', 'a9803285-8e66-473e-9f54-a791644c4c16:e5543413-4d0d-43a1-aa3e-82afdb2e16c4', '2025-09-09 19:43:51', 0, '2025-09-08 19:43:51', NULL),
('0e27e39e-4535-4905-b273-5b44b6cf8a40', '9863c403-f02a-4aee-8530-1c3bf9abe513', 'ac4dab05-a573-43eb-8cfa-ab75fc7d2808:30e9cd92-7a1c-4c00-a7ed-ef6446aa4991', '2025-09-09 19:01:42', 0, '2025-09-08 19:01:42', NULL),
('1246b22e-8025-450c-9e62-f1dfe4cd759b', 'f6c92898-3502-4f3c-abcb-93b5370546e7', 'd28f3e79-2b74-4c1e-96fb-fde2a8bd162d:686b5eb8-816e-4578-b388-e7da1bda2ce8', '2025-09-09 18:18:16', 0, '2025-09-08 18:18:16', NULL),
('15bd10ab-81a2-4139-8c16-680ecb102730', 'e48a07c1-973c-444e-9bd0-17995edc8a0f', '1f8ca81f-6787-49b5-9da4-0ec094fdf7f1:0c09edcc-823e-4739-911d-28dfc822d84f', '2025-09-09 19:09:41', 0, '2025-09-08 19:09:41', NULL),
('1aa71547-9d0f-4719-bb1e-bd2fcfc66ab9', '0cf8527c-b6a0-4853-b842-ad5edd7134da', '0c06bdce-bea0-409c-8da2-de3dcf4df37c:ca0a2e49-8922-4145-ac39-f2ee673983a8', '2025-09-09 20:17:58', 0, '2025-09-08 20:17:58', NULL),
('20d0759f-33ad-4b3b-bb7d-34086e54b52f', '186502d3-348b-4b6c-8859-4f8537df6653', 'f2599173-989f-4b48-bd20-3a54b6c29820:e1850005-73c5-4e74-a5c4-c157af8d7478', '2025-09-09 18:21:22', 1, '2025-09-08 18:21:22', '2025-09-08 15:35:23'),
('220be42c-003b-46ec-8f3d-fa38cacc1c2d', '37b2edbd-8769-445d-9ca3-7f48cc0be623', '82b1c8a5-6df3-4d79-b77d-8c5113436d66:88288d51-a7b1-4165-9d73-ccc87730429d', '2025-09-09 18:52:42', 0, '2025-09-08 18:52:42', NULL),
('28866bf5-105f-4f35-af71-022c14191e71', 'da1cdbfa-694b-4c77-8e8b-736d1c9ad548', '5067312e-a641-411f-b321-4fe507a5374b:e2fc3438-c9a1-4ffd-8c87-a9239f32f810', '2025-09-09 20:20:34', 1, '2025-09-08 20:20:34', '2025-09-08 17:20:56'),
('35204bf2-7c99-4acd-82ab-949fb981df68', '8fb022dd-4173-4fd0-af57-16f8622480b5', 'ca9dc825-d4f8-45b4-b431-9ed584dfeb02:38d36bae-88cb-40aa-890c-f3a4dfbfd571', '2025-09-09 17:27:17', 1, '2025-09-08 17:27:17', '2025-09-08 14:44:34'),
('36f53ede-a3ed-4ee9-9a3a-981d238e4346', '89aa079a-c342-419c-8ca0-540aa573d02d', '49208e05-e664-4d13-8224-a2532c3ab91e:82ac3408-af19-4985-9292-88315356852f', '2025-09-09 19:34:37', 0, '2025-09-08 19:34:37', NULL),
('46a56580-1a6d-478b-95a2-39ec1cf072d3', 'e2c6b779-a957-45bd-832a-06b75b1daf0a', '4b59d287-d102-4423-bd06-5e425a62eb55:c545d12e-4768-4ccc-abf1-0c0678377bb0', '2025-09-09 19:10:21', 1, '2025-09-08 19:10:21', '2025-09-08 16:11:30'),
('54e0d29a-4b19-4e8b-b0fa-5048829ac1cf', 'e2c6b779-a957-45bd-832a-06b75b1daf0a', 'b6ef2be4-b6d9-4a1a-83a6-854369108ed5:1333a428-ef80-4886-a8b0-37771a071329', '2025-09-09 19:11:30', 0, '2025-09-08 19:11:30', NULL),
('595558ff-2e34-48b3-ad55-60e6bd5a8e20', '186502d3-348b-4b6c-8859-4f8537df6653', 'e7b26c12-80ea-4aa2-819b-18a26e9fb0ee:33de0b30-5cbd-4dc3-8dc4-fea7292731d0', '2025-09-09 18:35:23', 0, '2025-09-08 18:35:23', NULL),
('5b3be275-f787-4405-adac-d1f360afa0b0', '7b50a1e2-5887-478f-a070-751fa19d583b', '81ed76d8-4619-45c3-9043-4062731817f5:53c4c716-18ca-4333-89b0-6f0dcb957b87', '2025-09-09 18:57:18', 0, '2025-09-08 18:57:18', NULL),
('727c6249-6c92-442f-bde1-750bbda8bd12', 'c18c77db-3b70-41a4-a753-e6a2aaef4885', '83dd84de-9d65-45fd-9d42-14dc9e993715:a0164ed5-8dae-4254-9e84-0d8620b1a3bc', '2025-09-09 19:13:29', 0, '2025-09-08 19:13:29', NULL),
('75470352-43bb-4b45-bbb7-35007ecedc5e', '5dbd3dff-c4d5-40f4-a807-64a2a5721286', '0b595e11-2c8e-4dfd-9525-73b3d66cdd3b:37f043f9-a3b0-4d3c-826f-8be749932323', '2025-09-09 19:48:36', 1, '2025-09-08 19:48:36', '2025-09-08 16:48:50'),
('7a95480d-33b6-4c0d-8cab-057156ada582', 'f6c92898-3502-4f3c-abcb-93b5370546e7', '7a3219f1-4734-47b5-967d-5d61a0a612fd:41f0d712-0592-459c-ab72-181547dc1fb4', '2025-09-09 17:45:34', 1, '2025-09-08 17:45:34', '2025-09-08 15:17:13'),
('7cc58bf0-2390-4fbd-9cd5-815013205c62', '8fb022dd-4173-4fd0-af57-16f8622480b5', '5acd3182-c586-4370-91f6-7f27f13f797e:98afc62b-6097-4b68-9052-b285a75af8f3', '2025-09-09 17:44:34', 0, '2025-09-08 17:44:34', NULL),
('82cbdaaa-e180-43eb-a4af-3ac97226fffb', '24c02e07-c6a4-4c05-b1f5-85920be9cf50', '830cb9d6-d1c4-42b2-b59a-2b7d9d0a3f26:483e68b3-3b1c-4519-b562-d443b0139a34', '2025-09-09 20:26:40', 1, '2025-09-08 20:26:40', '2025-09-08 17:26:52'),
('89ccb118-d35a-4eeb-a8c4-72a0c659b4ef', 'a9960b81-75ab-4878-aeec-3b9f77e7fc7d', 'eec493f8-ef32-466c-ae6f-76099697c0e3:9d99f29c-85a3-4ae5-8e05-c8e85f7a3246', '2025-09-09 19:45:46', 0, '2025-09-08 19:45:46', NULL),
('bdee0696-3151-486c-937e-8c2c68d5b8aa', 'da4b0ef9-5549-4a50-9bd9-b2c26655f8c8', '91d44fa3-8dd7-4120-bd84-249529e35d92:c5349daa-efc5-49b9-a502-244483534424', '2025-09-09 20:22:12', 1, '2025-09-08 20:22:12', '2025-09-08 17:22:31'),
('cc881f97-75f8-4223-bffd-7607e85dab9e', '48e45f3e-abcf-46f8-9af7-bd50a3cbff36', '0a16f51f-0645-4e6e-93e0-25309652e755:7a8a1373-47ac-40f1-9acf-d9decbaa5189', '2025-09-09 19:28:09', 1, '2025-09-08 19:28:09', '2025-09-08 16:30:59'),
('d8446ff2-945c-4d93-a145-0e83679563d8', '8055ffbb-5054-47c7-bae3-10fa6697bec2', '7a080ec3-ac25-4235-aa21-0718fc624335:ce78f39a-30e5-4e68-aefe-2ca00d818e20', '2025-09-09 19:06:21', 0, '2025-09-08 19:06:21', NULL),
('ed250484-db2d-4014-af2e-e59107e3a954', '59e9913a-ae4d-4b7a-b403-5d4af08b5735', '13dde023-c648-43d3-935e-c9ac95f1fce4:aaa9fbe1-5d92-4dc3-9bd0-799c5a7b1759', '2025-09-09 18:56:46', 0, '2025-09-08 18:56:46', NULL),
('f45f81a4-4886-466a-a6b1-9eedc8059266', 'a165da81-22e1-45f0-908b-0a035316648e', 'e1275a05-72e7-4851-b97f-7f26376e186f:912aa248-4026-4c18-b3fa-b5197a226a09', '2025-09-09 19:40:35', 0, '2025-09-08 19:40:35', NULL),
('fe28e22c-126c-40bb-93de-ee2ef3143960', 'f6c92898-3502-4f3c-abcb-93b5370546e7', '4b4da72d-4bf5-465b-890c-09ab571e28bf:cc797905-273b-4906-afd2-f472d976d127', '2025-09-09 18:17:13', 1, '2025-09-08 18:17:13', '2025-09-08 15:18:16');

-- --------------------------------------------------------

--
-- Estrutura para tabela `favorites`
--

CREATE TABLE `favorites` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `mod_id` varchar(36) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `forbidden_words`
--

CREATE TABLE `forbidden_words` (
  `id` int(11) NOT NULL,
  `word` varchar(100) NOT NULL,
  `severity` enum('low','medium','high') DEFAULT 'medium',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `forbidden_words`
--

INSERT INTO `forbidden_words` (`id`, `word`, `severity`, `created_at`) VALUES
(1, 'idiota', 'medium', '2025-08-26 16:23:35'),
(2, 'burro', 'medium', '2025-08-26 16:23:35'),
(3, 'otario', 'medium', '2025-08-26 16:23:35'),
(5, 'merda', 'high', '2025-08-26 16:23:35'),
(6, 'porra', 'high', '2025-08-26 16:23:35'),
(7, 'caralho', 'high', '2025-08-26 16:23:35'),
(8, 'fdp', 'high', '2025-08-26 16:23:35'),
(9, 'vagabundo', 'medium', '2025-08-26 16:23:35'),
(10, 'lixo', 'high', '2025-08-26 16:23:35'),
(11, 'imbecil', 'medium', '2025-08-26 16:23:35'),
(12, 'imb3cil', 'medium', '2025-08-26 16:23:35'),
(13, 'estupido', 'medium', '2025-08-26 16:23:35'),
(14, 'estup1do', 'medium', '2025-08-26 16:23:35'),
(15, 'lix0', 'medium', '2025-08-26 16:23:35'),
(16, 'bosta', 'high', '2025-08-26 16:23:35'),
(17, 'vtnc', 'high', '2025-08-26 16:23:35'),
(18, 'macaco', 'high', '2025-08-26 16:23:35'),
(19, 'm4caco', 'high', '2025-08-26 16:23:35'),
(20, 'm4c4co', 'high', '2025-08-26 16:23:35'),
(21, 'm4c4c0', 'high', '2025-08-26 16:23:35'),
(22, 'cu', 'high', '2025-08-26 16:23:35'),
(23, 'puta', 'high', '2025-08-26 16:23:35'),
(24, 'put4', 'high', '2025-08-26 16:23:35'),
(25, 'buceta', 'high', '2025-08-26 16:23:35'),
(26, 'bucet4', 'high', '2025-08-26 16:23:35');

-- --------------------------------------------------------

--
-- Estrutura para tabela `mods`
--

CREATE TABLE `mods` (
  `id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `type` enum('mod','addon') NOT NULL DEFAULT 'mod',
  `version` varchar(50) DEFAULT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `long_description_markdown` longtext DEFAULT NULL,
  `short_description` varchar(500) DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `download_url` varchar(500) DEFAULT NULL,
  `video_url` varchar(500) DEFAULT NULL,
  `minecraft_version` varchar(50) NOT NULL,
  `mod_loader` enum('forge','fabric','quilt','other') NOT NULL,
  `file_size` bigint(20) NOT NULL,
  `file_hash` varchar(64) NOT NULL,
  `thumbnail_url` varchar(500) DEFAULT NULL,
  `download_url_pc` varchar(500) DEFAULT NULL,
  `download_url_mobile` varchar(500) DEFAULT NULL,
  `gallery_urls` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`gallery_urls`)),
  `download_url_public` varchar(500) DEFAULT NULL,
  `download_url_vip` varchar(500) DEFAULT NULL,
  `youtube_video_url` varchar(500) DEFAULT NULL,
  `is_published` tinyint(1) DEFAULT 0,
  `is_featured` tinyint(1) DEFAULT 0,
  `is_archived` tinyint(1) DEFAULT 0,
  `is_approved` tinyint(1) DEFAULT 0,
  `approval_status` enum('pending','approved','rejected') DEFAULT 'pending',
  `rejection_reason` text DEFAULT NULL,
  `download_count` int(11) DEFAULT 0,
  `view_count` int(11) DEFAULT 0,
  `like_count` int(11) DEFAULT 0,
  `author_id` varchar(36) NOT NULL,
  `category_id` varchar(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `published_at` timestamp NULL DEFAULT NULL,
  `content_type_id` int(11) DEFAULT 1,
  `comment_count` int(11) DEFAULT 0,
  `full_description` longtext NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `mod_favorites`
--

CREATE TABLE `mod_favorites` (
  `id` int(11) NOT NULL,
  `mod_id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `mod_favorites`
--

INSERT INTO `mod_favorites` (`id`, `mod_id`, `user_id`, `created_at`) VALUES
(15, '8e366408-3e85-4f77-90eb-b67d1916e780', '8fb022dd-4173-4fd0-af57-16f8622480b5', '2025-08-26 16:36:11');

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `mod_stats`
-- (Veja abaixo para a visão atual)
--
CREATE TABLE `mod_stats` (
`id` varchar(36)
,`title` varchar(255)
,`download_count` int(11)
,`view_count` int(11)
,`like_count` int(11)
,`comment_count` bigint(21)
,`author_name` varchar(50)
,`category_name` varchar(100)
);

-- --------------------------------------------------------

--
-- Estrutura para tabela `mod_tags`
--

CREATE TABLE `mod_tags` (
  `id` varchar(36) NOT NULL,
  `mod_id` varchar(36) NOT NULL,
  `tag_name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `mod_views`
--

CREATE TABLE `mod_views` (
  `id` int(11) NOT NULL,
  `mod_id` varchar(255) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `view_count` int(11) DEFAULT 1,
  `last_viewed` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `password_reset_tokens`
--

INSERT INTO `password_reset_tokens` (`id`, `user_id`, `token`, `expires_at`, `used_at`, `created_at`) VALUES
('fcb6a71f-ff06-423c-a237-8c840d65f552', '5dbd3dff-c4d5-40f4-a807-64a2a5721286', '214939dc-28a0-4363-9dd8-56f5fe6f3552', '2025-09-08 20:16:15', '2025-09-08 20:16:15', '2025-09-08 20:15:50');

-- --------------------------------------------------------

--
-- Estrutura para tabela `reports`
--

CREATE TABLE `reports` (
  `id` varchar(36) NOT NULL,
  `reporter_id` varchar(36) NOT NULL,
  `reported_content_type` enum('mod','comment','user') NOT NULL,
  `reported_content_id` varchar(36) NOT NULL,
  `reason` enum('spam','inappropriate','copyright','other') NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('pending','reviewed','resolved','dismissed') DEFAULT 'pending',
  `moderator_id` varchar(36) DEFAULT NULL,
  `moderator_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `resolved_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `system_settings`
--

CREATE TABLE `system_settings` (
  `id` varchar(36) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `setting_type` enum('string','number','boolean','json') DEFAULT 'string',
  `description` text DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `system_settings`
--

INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `description`, `is_public`, `created_at`, `updated_at`) VALUES
('', 'auto_approve_trusted_users', 'Plataforma de mods para Minecraft', 'boolean', 'Aprova automaticamente coment??rios de usu??rios confi??veis', 0, '2025-09-06 22:07:28', '2025-09-06 22:07:28'),
('setting-001', 'site_name', 'Eu, Marko! Mods', 'string', 'Nome do site', 1, '2025-08-12 01:33:26', '2025-08-12 01:33:26'),
('setting-002', 'site_description', 'Plataforma de mods para Minecraft', 'string', 'Descri????o do site', 1, '2025-08-12 01:33:26', '2025-08-12 01:33:26'),
('setting-003', 'max_file_size', '100', 'number', 'Tamanho m??ximo de arquivo em MB', 0, '2025-08-12 01:33:26', '2025-08-12 01:33:26'),
('setting-004', 'allowed_file_types', '[\"jar\", \"zip\", \"rar\"]', 'json', 'Tipos de arquivo permitidos', 0, '2025-08-12 01:33:26', '2025-08-12 01:33:26'),
('setting-005', 'moderation_enabled', 'true', 'boolean', 'Sistema de modera????o ativado', 0, '2025-08-12 01:33:26', '2025-09-06 22:07:28');

-- --------------------------------------------------------

--
-- Estrutura para tabela `users`
--

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `display_name` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `role` enum('member','moderator','admin','super_admin') DEFAULT 'member',
  `is_verified` tinyint(1) DEFAULT 0,
  `is_banned` tinyint(1) DEFAULT 0,
  `ban_reason` text DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `banned_at` timestamp NULL DEFAULT NULL,
  `banned_by` varchar(36) DEFAULT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `privacy_settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`privacy_settings`)),
  `notification_settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`notification_settings`)),
  `theme_settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`theme_settings`)),
  `language_settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`language_settings`)),
  `account_settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`account_settings`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `display_name`, `password_hash`, `avatar_url`, `role`, `is_verified`, `is_banned`, `ban_reason`, `last_login`, `created_at`, `updated_at`, `banned_at`, `banned_by`, `first_name`, `last_name`, `bio`, `website`, `location`, `privacy_settings`, `notification_settings`, `theme_settings`, `language_settings`, `account_settings`) VALUES
('5dbd3dff-c4d5-40f4-a807-64a2a5721286', 'admin', 'admin@example.com', 'Administrador', '$2b$12$NjnqwveuOUcjvwL8EEZKS.1jGmwSxHJIe.c9JYM/UFgRkp4nnxTXu', NULL, 'super_admin', 1, 0, NULL, '2025-09-08 20:16:22', '2025-09-08 19:48:36', '2025-09-08 20:16:45', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `user_stats`
-- (Veja abaixo para a visão atual)
--
CREATE TABLE `user_stats` (
);

-- --------------------------------------------------------

--
-- Estrutura para tabela `user_timeouts`
--

CREATE TABLE `user_timeouts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `reason` varchar(255) NOT NULL,
  `severity` enum('low','medium','high') DEFAULT 'medium',
  `timeout_until` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `views`
--

CREATE TABLE `views` (
  `id` varchar(36) NOT NULL,
  `mod_id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `ip_address` varchar(45) NOT NULL,
  `user_agent` text DEFAULT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Acionadores `views`
--
DELIMITER $$
CREATE TRIGGER `after_view_insert` AFTER INSERT ON `views` FOR EACH ROW BEGIN
    UPDATE mods 
    SET view_count = view_count + 1 
    WHERE id = NEW.mod_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `vip_subscriptions`
--

CREATE TABLE `vip_subscriptions` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `plan_type` enum('monthly','yearly','lifetime') NOT NULL,
  `status` enum('active','cancelled','expired','pending') DEFAULT 'pending',
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'BRL',
  `payment_method` varchar(100) DEFAULT NULL,
  `payment_id` varchar(255) DEFAULT NULL,
  `starts_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para view `mod_stats`
--
DROP TABLE IF EXISTS `mod_stats`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `mod_stats`  AS SELECT `m`.`id` AS `id`, `m`.`title` AS `title`, `m`.`download_count` AS `download_count`, `m`.`view_count` AS `view_count`, `m`.`like_count` AS `like_count`, count(`c`.`id`) AS `comment_count`, `u`.`username` AS `author_name`, `cat`.`name` AS `category_name` FROM (((`mods` `m` left join `users` `u` on(`m`.`author_id` = `u`.`id`)) left join `categories` `cat` on(`m`.`category_id` = `cat`.`id`)) left join `comments` `c` on(`m`.`id` = `c`.`mod_id` and `c`.`is_approved` = 1)) GROUP BY `m`.`id` ;

-- --------------------------------------------------------

--
-- Estrutura para view `user_stats`
--
DROP TABLE IF EXISTS `user_stats`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `user_stats`  AS SELECT `u`.`id` AS `id`, `u`.`username` AS `username`, `u`.`role` AS `role`, `u`.`vip_status` AS `vip_status`, count(distinct `m`.`id`) AS `mods_created`, count(distinct `d`.`id`) AS `total_downloads`, count(distinct `f`.`id`) AS `total_favorites`, `u`.`created_at` AS `created_at` FROM (((`users` `u` left join `mods` `m` on(`u`.`id` = `m`.`author_id`)) left join `downloads` `d` on(`u`.`id` = `d`.`user_id`)) left join `favorites` `f` on(`u`.`id` = `f`.`user_id`)) GROUP BY `u`.`id` ;

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `activities`
--
ALTER TABLE `activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_activities` (`user_id`,`created_at`),
  ADD KEY `idx_activity_type` (`activity_type`),
  ADD KEY `idx_mod_activities` (`mod_id`,`activity_type`);

--
-- Índices de tabela `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_resource` (`resource_type`,`resource_id`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_level` (`level`);

--
-- Índices de tabela `ads`
--
ALTER TABLE `ads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_is_active` (`is_active`),
  ADD KEY `idx_ad_type` (`ad_type`);

--
-- Índices de tabela `ads_config`
--
ALTER TABLE `ads_config`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_slug` (`slug`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Índices de tabela `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_mod_id` (`mod_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_parent_id` (`parent_id`),
  ADD KEY `idx_is_approved` (`is_approved`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_comments_is_approved` (`is_approved`),
  ADD KEY `idx_comments_rejection_reason` (`rejection_reason`(768)),
  ADD KEY `idx_comments_rejected_at` (`rejected_at`),
  ADD KEY `idx_comments_rejected_by` (`rejected_by`),
  ADD KEY `idx_comments_updated_at` (`updated_at`),
  ADD KEY `idx_comments_parent_id` (`parent_id`),
  ADD KEY `idx_comments_is_reply` (`is_reply`),
  ADD KEY `idx_comments_reply_to_user_id` (`reply_to_user_id`);

--
-- Índices de tabela `comment_votes`
--
ALTER TABLE `comment_votes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_vote` (`comment_id`,`user_id`),
  ADD KEY `idx_comment_id` (`comment_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Índices de tabela `content_types`
--
ALTER TABLE `content_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Índices de tabela `downloads`
--
ALTER TABLE `downloads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_mod_id` (`mod_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Índices de tabela `email_verification_tokens`
--
ALTER TABLE `email_verification_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_evt_user` (`user_id`),
  ADD KEY `idx_evt_token` (`token`),
  ADD KEY `idx_evt_expires` (`expires_at`);

--
-- Índices de tabela `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_mod` (`user_id`,`mod_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_mod_id` (`mod_id`);

--
-- Índices de tabela `forbidden_words`
--
ALTER TABLE `forbidden_words`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `word` (`word`),
  ADD KEY `idx_word` (`word`),
  ADD KEY `idx_severity` (`severity`);

--
-- Índices de tabela `mods`
--
ALTER TABLE `mods`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_slug` (`slug`),
  ADD KEY `idx_minecraft_version` (`minecraft_version`),
  ADD KEY `idx_mod_loader` (`mod_loader`),
  ADD KEY `idx_is_published` (`is_published`),
  ADD KEY `idx_is_featured` (`is_featured`),
  ADD KEY `idx_approval_status` (`approval_status`),
  ADD KEY `idx_author_id` (`author_id`),
  ADD KEY `idx_category_id` (`category_id`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_download_count` (`download_count`),
  ADD KEY `idx_view_count` (`view_count`),
  ADD KEY `idx_download_url_pc` (`download_url_pc`),
  ADD KEY `idx_download_url_mobile` (`download_url_mobile`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_mods_content_type` (`content_type_id`),
  ADD KEY `idx_mods_published_type` (`is_published`,`content_type_id`),
  ADD KEY `idx_version` (`version`),
  ADD KEY `idx_is_archived` (`is_archived`),
  ADD KEY `idx_content_type_id` (`content_type_id`);

--
-- Índices de tabela `mod_favorites`
--
ALTER TABLE `mod_favorites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_mod_user` (`mod_id`,`user_id`);

--
-- Índices de tabela `mod_tags`
--
ALTER TABLE `mod_tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_mod_tag` (`mod_id`,`tag_name`),
  ADD KEY `idx_mod_id` (`mod_id`),
  ADD KEY `idx_tag_name` (`tag_name`);

--
-- Índices de tabela `mod_views`
--
ALTER TABLE `mod_views`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_mod_ip` (`mod_id`,`ip_address`),
  ADD KEY `idx_ip_count` (`ip_address`,`view_count`);

--
-- Índices de tabela `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_token` (`token`),
  ADD KEY `idx_expires_at` (`expires_at`);

--
-- Índices de tabela `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `moderator_id` (`moderator_id`),
  ADD KEY `idx_reporter_id` (`reporter_id`),
  ADD KEY `idx_reported_content` (`reported_content_type`,`reported_content_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Índices de tabela `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`),
  ADD KEY `idx_setting_key` (`setting_key`),
  ADD KEY `idx_is_public` (`is_public`);

--
-- Índices de tabela `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Índices de tabela `user_timeouts`
--
ALTER TABLE `user_timeouts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_timeout_until` (`timeout_until`),
  ADD KEY `idx_severity` (`severity`);

--
-- Índices de tabela `views`
--
ALTER TABLE `views`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_mod_id` (`mod_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_ip_address` (`ip_address`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_session_id` (`session_id`);

--
-- Índices de tabela `vip_subscriptions`
--
ALTER TABLE `vip_subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_expires_at` (`expires_at`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `ads_config`
--
ALTER TABLE `ads_config`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `content_types`
--
ALTER TABLE `content_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `downloads`
--
ALTER TABLE `downloads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de tabela `forbidden_words`
--
ALTER TABLE `forbidden_words`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT de tabela `mod_favorites`
--
ALTER TABLE `mod_favorites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de tabela `mod_views`
--
ALTER TABLE `mod_views`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `user_timeouts`
--
ALTER TABLE `user_timeouts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `activities`
--
ALTER TABLE `activities`
  ADD CONSTRAINT `activities_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `activities_ibfk_2` FOREIGN KEY (`mod_id`) REFERENCES `mods` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`mod_id`) REFERENCES `mods` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comments_ibfk_3` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`mod_id`) REFERENCES `mods` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `mods`
--
ALTER TABLE `mods`
  ADD CONSTRAINT `fk_mods_content_type` FOREIGN KEY (`content_type_id`) REFERENCES `content_types` (`id`),
  ADD CONSTRAINT `mods_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mods_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `mod_tags`
--
ALTER TABLE `mod_tags`
  ADD CONSTRAINT `mod_tags_ibfk_1` FOREIGN KEY (`mod_id`) REFERENCES `mods` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD CONSTRAINT `password_reset_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`moderator_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `views`
--
ALTER TABLE `views`
  ADD CONSTRAINT `views_ibfk_1` FOREIGN KEY (`mod_id`) REFERENCES `mods` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `views_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `vip_subscriptions`
--
ALTER TABLE `vip_subscriptions`
  ADD CONSTRAINT `vip_subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
