#!/bin/bash
# Apply subscription migration manually

echo "Applying subscription migration..."

# Read DATABASE_URL from .env
source .env 2>/dev/null || true

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL not found in .env"
  exit 1
fi

# Apply the migration SQL
psql "$DATABASE_URL" << 'SQL'
-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE_TRIAL', 'BASIC', 'PREMIUM');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING_PAYMENT');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AlterEnum (add new notification types if not exists)
DO $$ BEGIN
  ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'SUBSCRIPTION_EXPIRED';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'SUBSCRIPTION_RENEWED';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "Subscription" (
    "id" TEXT NOT NULL,
    "technicianProfileId" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "SubscriptionPayment" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "receiptUrl" TEXT,
    "transactionId" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SubscriptionPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (only if table exists)
CREATE INDEX IF NOT EXISTS "Subscription_technicianProfileId_idx" ON "Subscription"("technicianProfileId");
CREATE INDEX IF NOT EXISTS "Subscription_status_idx" ON "Subscription"("status");
CREATE INDEX IF NOT EXISTS "Subscription_endDate_idx" ON "Subscription"("endDate");
CREATE INDEX IF NOT EXISTS "SubscriptionPayment_subscriptionId_idx" ON "SubscriptionPayment"("subscriptionId");
CREATE INDEX IF NOT EXISTS "SubscriptionPayment_paymentStatus_idx" ON "SubscriptionPayment"("paymentStatus");

-- AddForeignKey (only if not exists)
DO $$ BEGIN
  ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_technicianProfileId_fkey" 
    FOREIGN KEY ("technicianProfileId") REFERENCES "TechnicianProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "SubscriptionPayment" ADD CONSTRAINT "SubscriptionPayment_subscriptionId_fkey" 
    FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
SQL

echo "✅ Migration applied successfully!"
echo "Now run: npm run prisma:generate"
