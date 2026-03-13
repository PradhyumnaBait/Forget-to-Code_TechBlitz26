require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function testToday() {
  // New fixed approach — same as the updated bookingService
  const todayStr = new Date().toLocaleDateString('en-CA');
  const start = new Date(todayStr + 'T00:00:00.000Z');
  const end = new Date(todayStr + 'T00:00:00.000Z');
  end.setUTCDate(end.getUTCDate() + 1);

  console.log('Local date string:', todayStr);
  console.log('Query window:', start.toISOString(), '->', end.toISOString());

  const appts = await p.appointment.findMany({
    where: { date: { gte: start, lt: end } },
    include: { patient: true },
    orderBy: { timeSlot: 'asc' },
  });

  console.log('\nFound', appts.length, 'appointments today:');
  appts.forEach(a => console.log(` - ${a.timeSlot}  ${a.patient.name}  [${a.status}]`));

  await p.$disconnect();
}

testToday().catch(e => { console.error('Error:', e.message); p.$disconnect(); });
