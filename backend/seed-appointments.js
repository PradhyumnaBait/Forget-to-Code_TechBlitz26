// Seed script to add patients and appointments for March 13, 2026
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedAppointments() {
  console.log('🌱 Seeding patients and appointments for March 13, 2026...');

  const targetDate = new Date('2026-03-13');
  const dateStr = '2026-03-13';

  try {
    // Create sample patients
    const patients = await Promise.all([
      prisma.patient.upsert({
        where: { phone: '+919876543210' },
        update: {},
        create: {
          name: 'Rajesh Kumar',
          phone: '+919876543210',
          age: 45,
          gender: 'Male',
          bloodGroup: 'B+',
          medicalHistory: 'Diabetes, Hypertension',
          allergies: 'Penicillin'
        }
      }),
      prisma.patient.upsert({
        where: { phone: '+919876543211' },
        update: {},
        create: {
          name: 'Priya Sharma',
          phone: '+919876543211',
          age: 32,
          gender: 'Female',
          bloodGroup: 'A+',
          medicalHistory: 'Asthma',
          allergies: 'Dust, Pollen'
        }
      }),
      prisma.patient.upsert({
        where: { phone: '+919876543212' },
        update: {},
        create: {
          name: 'Amit Patel',
          phone: '+919876543212',
          age: 28,
          gender: 'Male',
          bloodGroup: 'O+',
          medicalHistory: 'None',
          allergies: 'None'
        }
      }),
      prisma.patient.upsert({
        where: { phone: '+919876543213' },
        update: {},
        create: {
          name: 'Sunita Gupta',
          phone: '+919876543213',
          age: 55,
          gender: 'Female',
          bloodGroup: 'AB+',
          medicalHistory: 'Arthritis, High Cholesterol',
          allergies: 'Shellfish'
        }
      }),
      prisma.patient.upsert({
        where: { phone: '+919876543214' },
        update: {},
        create: {
          name: 'Vikram Singh',
          phone: '+919876543214',
          age: 38,
          gender: 'Male',
          bloodGroup: 'B-',
          medicalHistory: 'Migraine',
          allergies: 'None'
        }
      }),
      prisma.patient.upsert({
        where: { phone: '+919876543215' },
        update: {},
        create: {
          name: 'Meera Joshi',
          phone: '+919876543215',
          age: 29,
          gender: 'Female',
          bloodGroup: 'A-',
          medicalHistory: 'None',
          allergies: 'Latex'
        }
      })
    ]);

    console.log(`✅ Created ${patients.length} patients`);

    // Create time slots for March 13, 2026
    const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
    
    for (const timeSlot of timeSlots) {
      await prisma.slot.upsert({
        where: {
          date_timeSlot: {
            date: targetDate,
            timeSlot: timeSlot
          }
        },
        update: {},
        create: {
          date: targetDate,
          timeSlot: timeSlot,
          status: 'AVAILABLE'
        }
      });
    }

    console.log(`✅ Created ${timeSlots.length} time slots for ${dateStr}`);

    // Create appointments for March 13, 2026
    const appointments = [
      {
        patientId: patients[0].id,
        timeSlot: '09:00',
        reason: 'Regular checkup for diabetes',
        status: 'BOOKED',
        queuePos: 1
      },
      {
        patientId: patients[1].id,
        timeSlot: '09:30',
        reason: 'Asthma follow-up',
        status: 'BOOKED',
        queuePos: 2
      },
      {
        patientId: patients[2].id,
        timeSlot: '10:00',
        reason: 'General consultation',
        status: 'BOOKED',
        queuePos: 3
      },
      {
        patientId: patients[3].id,
        timeSlot: '10:30',
        reason: 'Arthritis pain management',
        status: 'BOOKED',
        queuePos: 4
      },
      {
        patientId: patients[4].id,
        timeSlot: '14:00',
        reason: 'Migraine consultation',
        status: 'BOOKED',
        queuePos: 5
      },
      {
        patientId: patients[5].id,
        timeSlot: '14:30',
        reason: 'Routine health checkup',
        status: 'BOOKED',
        queuePos: 6
      }
    ];

    const createdAppointments = [];
    for (const appt of appointments) {
      const appointment = await prisma.appointment.create({
        data: {
          patientId: appt.patientId,
          date: targetDate,
          timeSlot: appt.timeSlot,
          reason: appt.reason,
          status: appt.status,
          queuePos: appt.queuePos,
          duration: 30
        }
      });
      createdAppointments.push(appointment);

      // Update slot status to BOOKED
      await prisma.slot.update({
        where: {
          date_timeSlot: {
            date: targetDate,
            timeSlot: appt.timeSlot
          }
        },
        data: { status: 'BOOKED' }
      });
    }

    console.log(`✅ Created ${createdAppointments.length} appointments for ${dateStr}`);

    // Create some billing records
    for (let i = 0; i < 3; i++) {
      await prisma.billing.create({
        data: {
          appointmentId: createdAppointments[i].id,
          consultationFee: 500,
          medicineCost: Math.floor(Math.random() * 200) + 50,
          total: 500 + Math.floor(Math.random() * 200) + 50,
          paymentStatus: i < 2 ? 'PAID' : 'PENDING',
          paymentMethod: i % 2 === 0 ? 'CASH' : 'CARD',
          paidAt: i < 2 ? new Date() : null
        }
      });
    }

    console.log('✅ Created billing records');

    // Summary
    console.log('\n📊 Summary:');
    console.log(`   Patients: ${patients.length}`);
    console.log(`   Appointments: ${createdAppointments.length}`);
    console.log(`   Date: ${dateStr}`);
    console.log(`   Time slots: ${timeSlots.join(', ')}`);
    
    console.log('\n👥 Patients created:');
    patients.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} (${p.phone}) - ${p.age}y ${p.gender}`);
    });

    console.log('\n📅 Appointments created:');
    createdAppointments.forEach((a, i) => {
      const patient = patients.find(p => p.id === a.patientId);
      console.log(`   ${i + 1}. ${a.timeSlot} - ${patient.name} (${appointments[i].reason})`);
    });

    console.log('\n🎉 Seed completed successfully!');
    console.log('You can now view appointments in both doctor and receptionist dashboards.');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedAppointments();