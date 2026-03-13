require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function inspectDates() {
  // Get all appointments sorted by date
  const appts = await p.appointment.findMany({
    include: { patient: true },
    orderBy: { date: 'desc' },
    take: 20,
  });

  console.log('Total appointments in DB:', appts.length > 0 ? '(showing latest 20)' : '0');
  appts.forEach(a => {
    console.log(`  Date stored: ${a.date.toISOString()} | Local: ${a.date.toLocaleDateString('en-CA')} | TimeSlot: ${a.timeSlot} | Patient: ${a.patient.name} | Status: ${a.status}`);
  });

  await p.$disconnect();
}

inspectDates().catch(e => { console.error('Error:', e.message); p.$disconnect(); });
