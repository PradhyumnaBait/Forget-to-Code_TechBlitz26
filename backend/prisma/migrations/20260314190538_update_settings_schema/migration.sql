/*
  Warnings:

  - You are about to drop the column `slotDuration` on the `clinic_settings` table. All the data in the column will be lost.
  - You are about to drop the column `workingDays` on the `clinic_settings` table. All the data in the column will be lost.
  - You are about to drop the column `workingHourEnd` on the `clinic_settings` table. All the data in the column will be lost.
  - You are about to drop the column `workingHourStart` on the `clinic_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "clinic_settings" DROP COLUMN "slotDuration",
DROP COLUMN "workingDays",
DROP COLUMN "workingHourEnd",
DROP COLUMN "workingHourStart",
ADD COLUMN     "locationLink" TEXT,
ALTER COLUMN "clinicName" SET DEFAULT 'MedDesk Clinic',
ALTER COLUMN "phone" DROP NOT NULL;

-- CreateTable
CREATE TABLE "doctor_schedule" (
    "id" TEXT NOT NULL,
    "workingDays" TEXT[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday']::TEXT[],
    "startTime" TEXT NOT NULL DEFAULT '09:00',
    "endTime" TEXT NOT NULL DEFAULT '18:00',
    "breakStartTime" TEXT NOT NULL DEFAULT '13:00',
    "breakEndTime" TEXT NOT NULL DEFAULT '14:00',
    "appointmentDuration" INTEGER NOT NULL DEFAULT 30,
    "bufferTime" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointment_rules" (
    "id" TEXT NOT NULL,
    "maxAppointmentsPerDay" INTEGER NOT NULL DEFAULT 40,
    "allowWalkIns" BOOLEAN NOT NULL DEFAULT true,
    "cancellationTimeLimit" INTEGER NOT NULL DEFAULT 2,
    "rescheduleLimit" INTEGER NOT NULL DEFAULT 3,
    "advanceBookingDays" INTEGER NOT NULL DEFAULT 30,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointment_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_settings" (
    "id" TEXT NOT NULL,
    "whatsappEnabled" BOOLEAN NOT NULL DEFAULT false,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "reminderTime" INTEGER NOT NULL DEFAULT 24,
    "confirmationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_settings" (
    "id" TEXT NOT NULL,
    "defaultConsultationFee" DECIMAL(10,2) NOT NULL DEFAULT 500,
    "taxPercentage" DECIMAL(5,2) NOT NULL DEFAULT 18,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'INR',
    "paymentMethods" TEXT[] DEFAULT ARRAY['cash', 'upi', 'card']::TEXT[],
    "autoGenerateInvoice" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "settingKey" VARCHAR(255) NOT NULL,
    "settingValue" TEXT,
    "settingType" VARCHAR(50) NOT NULL DEFAULT 'string',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_settingKey_key" ON "system_settings"("settingKey");
