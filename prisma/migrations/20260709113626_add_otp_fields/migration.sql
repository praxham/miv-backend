-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email_id" TEXT NOT NULL,
    "otp" INTEGER NOT NULL,
    "expiresAt" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "artifacts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "by_artist" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "images" TEXT NOT NULL DEFAULT '[]',
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "deliverable_file_formats" TEXT NOT NULL DEFAULT '[]',
    "deliverable_files" TEXT NOT NULL DEFAULT '[]',
    "is_published" TEXT NOT NULL DEFAULT 'false',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "artifacts_by_artist_fkey" FOREIGN KEY ("by_artist") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "artifact" TEXT NOT NULL,
    "sold_by" TEXT NOT NULL,
    "bought_by" TEXT NOT NULL,
    "seller_upi_id" TEXT NOT NULL,
    "buyer_upi_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "utr_number" TEXT NOT NULL,
    "payment_status" TEXT NOT NULL DEFAULT 'pending_seller_confirmation',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "orders_artifact_fkey" FOREIGN KEY ("artifact") REFERENCES "artifacts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "orders_sold_by_fkey" FOREIGN KEY ("sold_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "orders_bought_by_fkey" FOREIGN KEY ("bought_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_id_key" ON "users"("email_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_otp_key" ON "users"("otp");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "artifacts_slug_key" ON "artifacts"("slug");
