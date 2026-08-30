/*
  Warnings:

  - You are about to alter the column `expiresAt` on the `users` table. The data in that column could be lost. The data in that column will be cast from `String` to `DateTime`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email_id" TEXT NOT NULL,
    "otp" INTEGER NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "upi_id" TEXT,
    "role" TEXT NOT NULL DEFAULT 'buyer',
    "username" TEXT,
    "profile_photo" TEXT,
    "wa_number" TEXT,
    "description" TEXT,
    "socials" TEXT DEFAULT '[]',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_users" ("created_at", "description", "email_id", "expiresAt", "id", "otp", "profile_photo", "role", "socials", "updated_at", "upi_id", "username", "wa_number") SELECT "created_at", "description", "email_id", "expiresAt", "id", "otp", "profile_photo", "role", "socials", "updated_at", "upi_id", "username", "wa_number" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_id_key" ON "users"("email_id");
CREATE UNIQUE INDEX "users_otp_key" ON "users"("otp");
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
