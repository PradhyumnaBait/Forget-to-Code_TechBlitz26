# 🚀 MedDesk Quick Reference

## 🔗 Access URLs
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001/api
- **Health Check:** http://localhost:3001/health

## 👤 Test Login Credentials
**Phone:** `+919999999999` (Demo Patient)  
**OTP:** Check backend console after clicking "Send OTP"

Example console output:
```
📱 [DEV MODE] OTP for +919999999999: 123456
```

## ✅ What's Working

| Feature | Status | Notes |
|---------|--------|-------|
| Database | ✅ Connected | Neon PostgreSQL |
| Backend API | ✅ Running | Port 3001 |
| Frontend | ✅ Running | Port 3000 |
| AI Assistant | ✅ Enabled | GPT-4o-mini |
| OTP Login | ✅ Working | Console logging |
| SMS | ⚠️ Dev Mode | Logged to console |
| WhatsApp | ⚠️ Dev Mode | Logged to console |
| Appointments | ✅ Working | Full CRUD |
| Queue System | ✅ Working | Real-time |
| Billing | ✅ Working | Payment tracking |
| Analytics | ✅ Working | Dashboard ready |

## 🤖 AI Features

**Enabled Capabilities:**
- Intent detection (booking, cancellation, info)
- Smart conversational chat
- WhatsApp message handling
- Multi-language support
- Appointment suggestions

**Test AI:**
```bash
curl -X POST http://localhost:3001/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "I want to book an appointment"}'
```

## 📱 Enable Real SMS/WhatsApp

**Quick Setup:**
1. Get Twilio account: https://www.twilio.com/try-twilio
2. Add credentials to `backend/.env`:
   ```env
   TWILIO_ACCOUNT_SID="ACxxxxx"
   TWILIO_AUTH_TOKEN="xxxxx"
   TWILIO_PHONE_NUMBER="+1234567890"
   ```
3. Restart backend
4. ✅ Real SMS enabled!

## 🔑 Key API Endpoints

### Authentication
```
POST /api/auth/send-otp        # Send OTP to phone
POST /api/auth/verify-otp      # Verify OTP & login
GET  /api/auth/profile         # Get user profile
PUT  /api/auth/profile         # Update profile
```

### Bookings
```
GET  /api/bookings/available-dates
GET  /api/bookings/slots?date=YYYY-MM-DD
POST /api/bookings/create
GET  /api/bookings/my-appointments
```

### AI Assistant
```
POST /api/ai/chat              # Chat with AI
POST /api/ai/intent            # Detect intent
```

### WhatsApp
```
POST /api/whatsapp/webhook     # Receive messages
POST /api/whatsapp/send        # Send message
```

## 🧪 Quick Tests

### 1. Test Health
```bash
curl http://localhost:3001/health
```

### 2. Test OTP Send
```bash
curl -X POST http://localhost:3001/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919999999999"}'
```

### 3. Test Available Dates
```bash
curl http://localhost:3001/api/bookings/available-dates
```

### 4. Test AI Chat
```bash
curl -X POST http://localhost:3001/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are your clinic hours?"}'
```

## 🛠️ Common Commands

### Start Servers
```bash
# Backend
cd backend && npm run dev

# Frontend (new terminal)
npm run dev
```

### Database Commands
```bash
cd backend

# View database in browser
npx prisma studio

# Create migration
npx prisma migrate dev --name description

# Reset database
npm run prisma:reset

# Seed data
npm run prisma:seed
```

### View Logs
- Backend logs: Check terminal running `backend/npm run dev`
- Frontend logs: Check browser console (F12)

## 📊 Database Access

**Neon Dashboard:** https://console.neon.tech
- View tables
- Run SQL queries
- Monitor usage

**Prisma Studio (Local):**
```bash
cd backend
npx prisma studio
```
Opens at: http://localhost:5555

## 🔐 Security Notes

- JWT tokens valid for 7 days
- OTPs expire in 5 minutes
- Max 3 OTP attempts
- All API keys should be kept secret
- Change JWT_SECRET for production

## 🆘 Troubleshooting

**Backend not starting?**
```bash
cd backend
rm -rf node_modules
npm install
npm run dev
```

**Frontend not starting?**
```bash
rm -rf node_modules .next
npm install
npm run dev
```

**Database connection error?**
- Check DATABASE_URL in backend/.env
- Verify Neon project is active
- Test connection: `cd backend && node test-connection.js`

**OTP not showing?**
- Check backend console output
- Verify phone format: `+[country][number]`
- Check backend/.env has correct settings

## 📞 Need Help?

1. Check `SYSTEM_STATUS_AND_CREDENTIALS.md` for detailed info
2. View backend console for error messages
3. Check browser console (F12) for frontend errors
4. Verify all environment variables are set

---

**System Status:** ✅ Operational  
**Mode:** Development  
**Last Updated:** March 13, 2026
