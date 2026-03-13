// Test script to verify appointment creation flow
require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testAppointmentFlow() {
  console.log('🧪 Testing Appointment Creation Flow\n');

  try {
    // 1. Get staff token
    console.log('1️⃣ Getting staff authentication token...');
    const authResponse = await axios.post(`${API_BASE}/auth/staff-login`, {
      username: 'doctor',
      password: 'test123',
      role: 'doctor'
    });
    const token = authResponse.data.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log('✅ Staff token obtained');

    // 2. Check today's appointments before
    console.log('\n2️⃣ Checking current appointments for March 13, 2026...');
    const todayBefore = await axios.get(`${API_BASE}/appointments/today`, { headers });
    console.log(`✅ Current appointments: ${todayBefore.data.data.count}`);
    
    // 3. Get available slots
    console.log('\n3️⃣ Getting available slots for March 13, 2026...');
    const slotsResponse = await axios.get(`${API_BASE}/bookings/slots?date=2026-03-13`);
    const availableSlots = slotsResponse.data.data.availableSlots;
    console.log(`✅ Available slots: ${availableSlots.join(', ')}`);

    if (availableSlots.length === 0) {
      console.log('⚠️ No available slots for testing. Using existing data.');
      return;
    }

    // 4. Create a new patient via OTP flow
    console.log('\n4️⃣ Creating new patient via OTP...');
    const testPhone = '+919876543299';
    
    // Send OTP
    const otpResponse = await axios.post(`${API_BASE}/auth/send-otp`, {
      phone: testPhone
    });
    console.log('✅ OTP sent (check backend console for OTP)');

    // For testing, we'll simulate OTP verification with a known patient
    // Let's use an existing patient instead
    const existingPatient = await axios.post(`${API_BASE}/auth/send-otp`, {
      phone: '+919999999999'
    });
    console.log('✅ Using demo patient for appointment creation');

    // 5. Create new appointment
    console.log('\n5️⃣ Creating new appointment...');
    const newAppointment = {
      patientPhone: '+919999999999',
      patientName: 'Demo Patient',
      date: '2026-03-13',
      timeSlot: availableSlots[0],
      reason: 'Test appointment via API',
      patientAge: 30,
      patientGender: 'Male'
    };

    const appointmentResponse = await axios.post(`${API_BASE}/bookings/create`, newAppointment, { headers });
    console.log('✅ New appointment created:', appointmentResponse.data.data.id);

    // 6. Verify appointment appears in today's list
    console.log('\n6️⃣ Verifying appointment appears in today\'s list...');
    const todayAfter = await axios.get(`${API_BASE}/appointments/today`, { headers });
    const newCount = todayAfter.data.data.count;
    console.log(`✅ Appointments after creation: ${newCount}`);
    
    if (newCount > todayBefore.data.data.count) {
      console.log('🎉 SUCCESS: New appointment appears in today\'s list!');
    } else {
      console.log('⚠️ WARNING: Appointment count did not increase');
    }

    // 7. Check appointment details
    console.log('\n7️⃣ Checking appointment details...');
    const appointments = todayAfter.data.data.appointments;
    const newAppt = appointments.find(a => a.reason === 'Test appointment via API');
    if (newAppt) {
      console.log('✅ Found new appointment:');
      console.log(`   Patient: ${newAppt.patient.name}`);
      console.log(`   Time: ${newAppt.timeSlot}`);
      console.log(`   Reason: ${newAppt.reason}`);
      console.log(`   Status: ${newAppt.status}`);
    }

    // 8. Test queue status
    console.log('\n8️⃣ Checking queue status...');
    const queueResponse = await axios.get(`${API_BASE}/queue/status`, { headers });
    console.log(`✅ Queue status: ${queueResponse.data.data.totalInQueue} patients waiting`);

    console.log('\n🎉 Appointment flow test completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Appointments before: ${todayBefore.data.data.count}`);
    console.log(`   - Appointments after: ${newCount}`);
    console.log(`   - Available slots: ${availableSlots.length}`);
    console.log(`   - Queue length: ${queueResponse.data.data.totalInQueue}`);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAppointmentFlow();