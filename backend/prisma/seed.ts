import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding MedDesk database...');

  // Create clinic settings
  const settings = await prisma.clinicSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      clinicName: process.env.CLINIC_NAME || 'MedDesk Clinic',
      phone: process.env.CLINIC_PHONE || '+910000000000',
      workingHourStart: process.env.WORKING_HOUR_START || '09:00',
      workingHourEnd: process.env.WORKING_HOUR_END || '18:00',
      slotDuration: parseInt(process.env.SLOT_DURATION_MINUTES || '30'),
      consultationFee: parseFloat(process.env.CONSULTATION_FEE || '500'),
      workingDays: '1,2,3,4,5,6',
    },
  });

  console.log(`✅ Clinic settings: "${settings.clinicName}"`);
  console.log(`   Hours: ${settings.workingHourStart} – ${settings.workingHourEnd}`);
  console.log(`   Slot: ${settings.slotDuration}min | Fee: ₹${settings.consultationFee}`);

  // Create a demo patient
  const demoPatient = await prisma.patient.upsert({
    where: { phone: '+919999999999' },
    update: {},
    create: {
      name: 'Demo Patient',
      phone: '+919999999999',
      age: 30,
      gender: 'Male',
    },
  });

  console.log(`✅ Demo patient: ${demoPatient.name} (${demoPatient.phone})`);
  console.log('\n🎉 Seed complete! You can now start the server with: npm run dev');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
