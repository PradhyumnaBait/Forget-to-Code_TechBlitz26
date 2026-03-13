# 🏥 MedDesk System Status & User Guide

## ✅ System Status

### Backend Server
- **Status:** ✅ Running
- **URL:** http://localhost:3001
- **Database:** ✅ Connected (Neon PostgreSQL)
- **API Endpoints:** 40+ available

### Frontend Server
- **Status:** ✅ Running  
- **URL:** http://localhost:3000
- **Framework:** Next.js 14

---

## 🤖 AI Assistant

### Status: ✅ FULLY ENABLED

**OpenAI Configuration:**
- Model: GPT-4o-mini
- API Key: Configured ✅
- Features: All AI features active

**AI Capabilities:**
1. **Intent Detection** - Understands booking, cancellation, info requests
2. **Smart Chat** - Conversational AI assistant
3. **WhatsApp Integration** - AI-powered message responses
4. **Appointment Assistant** - Guides users through booking
5. **Multi-language** - Responds in user's language

**API Endpoints:**
```
POST /api/ai/chat
POST /api/ai/intent  
POST /api/whatsapp/webhook
```

**Example AI Interactions:**
- "I want to book an appointment" → AI suggests available dates
- "What are your clinic hours?" → AI provides clinic info
- "Cancel my appointment" → AI guides through cancellation

---

## 📱 OTP Verification System

### Current Mode: ⚠️ DEVELOPMENT (Console Logging)

**How It Works:**
1. User enters phone number on login page
2. Backend generates 6-digit OTP
3. **OTP is printed in backend console** (not sent via SMS)
4. User enters OTP from console
5. System creates JWT token (valid 7 days)

**To Enable Real SMS:**

1. **Get Twilio Account:**
   - Sign up: https://www.twilio.com/try-twilio
   - Verify your phone
   - Add $10-20 credit

2. **Get Credentials:**
   - Dashboard → Account Info
   - Copy Account SID
   - Copy Auth Token
   - Buy a phone number with SMS capability

3. **Update backend/.env:**
   ```env
   TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxx"
   TWILIO_AUTH_TOKEN="your_auth_token"
   TWILIO_PHONE_NUMBER="+1234567890"
   ```

4. **Restart backend** - OTPs will now be sent via SMS!

---

## 💬 WhatsApp Messaging System

### Current Mode: ⚠️ DEVELOPMENT (Console Logging)

**Features:**
- Appointment confirmations
- Cancellation notifications
- Reminders (24h and 1h before)
- Payment receipts
- AI-powered chat responses

**Current Behavior:**
All messages are logged to backend console instead of being sent.

**To Enable Real WhatsApp:**

### Option 1: Twilio Sandbox (Free Testing)

1. Go to: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
2. Follow instructions to join sandbox
3. Send "join [code]" to Twilio's WhatsApp number
4. Update .env:
   ```env
   TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"
   ```
5. Set webhook in Twilio Console:
   - URL: `https://your-domain.com/api/whatsapp/webhook`
   - For local: Use ngrok → `ngrok http 3001`

### Option 2: Production WhatsApp (Requires Approval)

1. Facebook Business Manager account
2. WhatsApp Business API application
3. Business verification (1-2 weeks)
4. Approved message templates

---

## 🔐 Authentication & Login

### System Type: OTP-Based (Passwordless)

**NO traditional username/password!**

### How to Login

**Step 1:** Go to http://localhost:3000

**Step 2:** Enter phone number (any format):
- `+919999999999` (demo patient)
- `+919876543210` (creates new account)
- `9999999999` (also works)

**Step 3:** Click "Send OTP"

**Step 4:** Check backend console for OTP:
```
📱 [DEV MODE] OTP for +919999999999: 123456
```

**Step 5:** Enter the OTP (e.g., `123456`)

**Step 6:** You're logged in! Token valid for 7 days

### Pre-existing Test Account

**Demo Patient:**
- Phone: `+919999999999`
- Name: Demo Patient
- Age: 30
- Gender: Male

**Any New Phone Number:**
- System auto-creates new patient account
- Default name: "New Patient"
- User can update profile after login

---

## 🧪 Testing the System

### Test OTP Login

1. Open http://localhost:3000
2. Enter: `+919999999999`
3. Click "Send OTP"
4. Watch backend console:
   ```
   📱 [DEV MODE] OTP for +919999999999: 654321
   ```
5. Enter OTP: `654321`
6. ✅ Logged in!

### Test AI Assistant

**Via API:**
```bash
curl -X POST http://localhost:3001/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "I want to book an appointment"}'
```

**Expected Response:**
AI will suggest available dates and guide you through booking.

### Test Appointment Booking

1. Login with phone number
2. Go to "Book Appointment" page
3. Select date
4. Choose time slot
5. Fill patient details
6. Confirm booking
7. Check backend console for confirmation message

### Test WhatsApp (Dev Mode)

When appointment is booked, backend console shows:
```
📲 [DEV MSG → +919999999999]:
✅ Hello Demo Patient!

Your appointment at MedDesk Clinic has been *confirmed*.

📅 Date: 2026-03-14
🕐 Time: 10:00

Please arrive 10 minutes early.
```

---

## 📊 Database Tables

**9 Main Tables:**
1. `patients` - Patient records
2. `appointments` - Appointment bookings
3. `slots` - Available time slots
4. `consultations` - Doctor consultation records
5. `prescriptions` - Medicine prescriptions
6. `billing` - Payment records
7. `notifications` - Message logs
8. `otps` - OTP verification codes
9. `clinic_settings` - Clinic configuration

**View in Neon Dashboard:**
- Go to: https://console.neon.tech
- Select your "meddesk" project
- Click "Tables" to view data

---

## 🔧 Configuration Summary

### Environment Variables (backend/.env)

```env
# Database
DATABASE_URL="postgresql://..." ✅ Connected

# Authentication
JWT_SECRET="..." ✅ Configured
JWT_EXPIRY="7d" ✅ Set

# Twilio (SMS/WhatsApp)
TWILIO_ACCOUNT_SID="" ⚠️ Empty (Dev Mode)
TWILIO_AUTH_TOKEN="" ⚠️ Empty (Dev Mode)
TWILIO_PHONE_NUMBER="" ⚠️ Empty (Dev Mode)

# OpenAI (AI Assistant)
OPENAI_API_KEY="sk-proj-..." ✅ Configured

# App
NODE_ENV="development" ✅ Set
PORT=3001 ✅ Set
FRONTEND_URL="http://localhost:3000" ✅ Set
```

---

## 🚀 Quick Start Commands

### Start Both Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

### Access Points
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Health Check: http://localhost:3001/health

### Stop Servers
- Press `Ctrl+C` in each terminal

---

## 📝 Important Notes

### Development Mode Features
✅ Database connected (Neon PostgreSQL)
✅ AI Assistant fully functional
✅ All API endpoints working
⚠️ OTPs logged to console (not sent via SMS)
⚠️ WhatsApp messages logged to console (not sent)

### To Enable Production Features
1. Add Twilio credentials for real SMS/WhatsApp
2. Set up ngrok or deploy to get public URL for webhooks
3. Configure WhatsApp Business API
4. Update FRONTEND_URL to production domain

### Security Notes
- JWT tokens expire after 7 days
- OTPs expire after 5 minutes
- Maximum 3 OTP attempts per request
- All passwords/secrets should be changed for production

---

## 🆘 Troubleshooting

### Backend won't start
- Check if port 3001 is available
- Verify DATABASE_URL in .env
- Run: `npm install` in backend folder

### Frontend won't start
- Check if port 3000 is available
- Run: `npm install` in root folder
- Clear .next folder: `rm -rf .next`

### OTP not showing
- Check backend console output
- Verify phone number format includes country code
- Check if OTP table has entries in database

### AI not responding
- Verify OPENAI_API_KEY is set
- Check OpenAI account has credits
- AI will fallback to mock mode if key is invalid

---

## 📞 Support

For issues or questions:
1. Check backend console for error messages
2. Check frontend browser console (F12)
3. Verify all environment variables are set
4. Ensure both servers are running

---

**Last Updated:** March 13, 2026
**System Version:** 1.0.0
**Status:** ✅ Fully Operational (Development Mode)
