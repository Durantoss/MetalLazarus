/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `BackupCode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Consent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RefreshToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StepUp` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WebAuthnCredential` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."BackupCode" DROP CONSTRAINT "BackupCode_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Consent" DROP CONSTRAINT "Consent_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RefreshToken" DROP CONSTRAINT "RefreshToken_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StepUp" DROP CONSTRAINT "StepUp_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WebAuthnCredential" DROP CONSTRAINT "WebAuthnCredential_userId_fkey";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "deletedAt",
ADD COLUMN     "stagename" TEXT,
ALTER COLUMN "email" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."BackupCode";

-- DropTable
DROP TABLE "public"."Consent";

-- DropTable
DROP TABLE "public"."RefreshToken";

-- DropTable
DROP TABLE "public"."Session";

-- DropTable
DROP TABLE "public"."StepUp";

-- DropTable
DROP TABLE "public"."WebAuthnCredential";

-- CreateTable
CREATE TABLE "public"."Passkey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,
    "transports" TEXT,
    "deviceName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Passkey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WebAuthnChallenge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "challenge" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebAuthnChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Passkey_userId_idx" ON "public"."Passkey"("userId");

-- CreateIndex
CREATE INDEX "WebAuthnChallenge_userId_type_idx" ON "public"."WebAuthnChallenge"("userId", "type");

-- CreateIndex
CREATE INDEX "WebAuthnChallenge_createdAt_idx" ON "public"."WebAuthnChallenge"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."Passkey" ADD CONSTRAINT "Passkey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
