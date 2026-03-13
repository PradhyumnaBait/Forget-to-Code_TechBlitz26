# 🔐 MedDesk Login Credentials

## 📋 All Login Methods

MedDesk has **3 different login methods** for different user types:

1. **Patient Login** - OTP-based (Passwordless)
2. **Doctor Login** - Email/Password
3. **Receptionist Login** - Email/Password

---

## 👨‍⚕️ Doctor Login

### Access URL
```
http://localhost:3000/login/doctor
```

### Credentials
```
Email:    doctor@meddesk.in
Password: MedDesk@2026
```

### Dashboard Features
After login, you get access to:
- **Consultations** - View and manage patient consultations
- **Patients** - Access patient records and history
- **Prescriptions** - Create and manage prescriptions
- **Analytics** - View clinic statistics and reports
- **Queue Management** - See waiting patients

### How to Login
1. Go to http://localhost:3000
2. Click "Doctor Login" or go directly to `/login/doctor`
3. Enter email: `doctor@meddesk.in`
4. Enter password: `MedDesk@2026`
5. Click "Sign In"
6. ✅ Redirected to Doctor Dashboard

---

## 👩‍💼 Receptionist Login

### Access URL
```
http://localhost:3000/login/reception
```

### Credentials
```
Email:    reception@meddesk.in
Password: MedDesk@2026
```

### Dashboard Features
After login, you get access to:
- **Appointments** - Book, view, and manage appointments
- **Walk-in Registration** - Register walk-in patients
- **Waitlist/Queue** - Manage patient queue
- **Billing** - Process payments and generate receipts
- **Patients** - View and update patient records
- **Analytics** - View daily statistics and revenue

### How to Login
1. Go to http://localhost:3000
2. Click "Receptionist Login" or go directly to `/login/reception`
3. Enter email: `reception@meddesk.in`
4. Enter password: `MedDesk@2026`
5. Click "Sign In"
6. ✅ Redirected to Reception Dashboard

---

## 👤 Patient Login (OTP-Based)

### Access URL
```
http://localhost:3000
```

### No Fixed Credentials!
Patients login using their phone number + OTP (One-Time Password)

### Demo Patient Account
```
Phone: +919999999999
Name:  Demo Patient
Age:   30
Gender: Male
```

### How to Login

**Step 1:** Go to http://localhost:3000

**Step 2:** Enter phone number:
- Use demo: `+919999999999`
- Or any phone: `+919876543210` (creates new account)

**Step 3:** Click "Send OTP"

**Step 4:** Check backend console for OTP:
```bash
# Backend console will show:
📱 [DEV MODE] OTP for +919999999999: 123456
```

**Step 5:** Enter the 6-digit OTP (e.g., `123456`)

**Step 6:** ✅ Logged in! Can now:
- Book appointments
- View appointment history
- Update profile
- Check queue status

### Create New Patient Account
Simply enter ANY phone number that doesn't exist:
- System automatically creates new patient account
- Default name: "New Patient"
- Can update profile after login

---

## 🔄 Login Flow Comparison

| Feature | Patient | Doctor | Receptionist |
|---------|---------|--------|--------------|
| **Login Method** | OTP (SMS) | Email/Password | Email/Password |
| **URL** | `/` | `/login/doctor` | `/login/reception` |
| **Credentials** | Phone + OTP | Fixed email/password | Fixed email/password |
| **Auto-Create Account** | ✅ Yes | ❌ No | ❌ No |
| **Session Duration** | 7 days | Until logout | Until logout |
| **Dashboard** | Patient Portal | Doctor Dashboard | Reception Dashboard |

---

## 🧪 Testing All Login Types

### Test 1: Patient Login
```bash
1. Open: http://localhost:3000
2. Enter: +919999999999
3. Click: "Send OTP"
4. Check backend console for OTP
5. Enter OTP
6. ✅ Logged in as patient
```

### Test 2: Doctor Login
```bash
1. Open: http://localhost:3000/login/doctor
2. Email: doctor@meddesk.in
3. Password: MedDesk@2026
4. Click: "Sign In"
5. ✅ Logged in as doctor
```

### Test 3: Receptionist Login
```bash
1. Open: http://localhost:3000/login/reception
2. Email: reception@meddesk.in
3. Password: MedDesk@2026
4. Click: "Sign In"
5. ✅ Logged in as receptionist
```

---

## 🔒 Security Notes

### Patient Login (OTP)
- OTP expires in **5 minutes**
- Maximum **3 attempts** per OTP
- JWT token valid for **7 days**
- New OTP required after expiry

### Staff Login (Email/Password)
- Credentials are **hardcoded** in frontend (for demo)
- Session persists until logout
- No password reset functionality (demo mode)

### Development Mode
⚠️ **Current Status:**
- OTPs are **logged to console** (not sent via SMS)
- For production, configure Twilio credentials
- Staff credentials should be moved to database

---

## 🚀 Quick Access Links

### Patient Portal
- **Home:** http://localhost:3000
- **Book Appointment:** http://localhost:3000/book
- **Login:** http://localhost:3000 (enter phone)

### Doctor Dashboard
- **Login:** http://localhost:3000/login/doctor
- **Dashboard:** http://localhost:3000/doctor
- **Consultations:** http://localhost:3000/doctor/consultation
- **Patients:** http://localhost:3000/doctor/patients
- **Analytics:** http://localhost:3000/doctor/analytics

### Reception Dashboard
- **Login:** http://localhost:3000/login/reception
- **Dashboard:** http://localhost:3000/reception
- **Appointments:** http://localhost:3000/reception/appointments
- **Walk-in:** http://localhost:3000/reception/walk-in
- **Waitlist:** http://localhost:3000/reception/waitlist
- **Billing:** http://localhost:3000/reception/billing
- **Patients:** http://localhost:3000/reception/patients
- **Analytics:** http://localhost:3000/reception/analytics

---

## 📝 Important Notes

### For Production Deployment

**Patient Login:**
1. Configure Twilio credentials in backend/.env
2. OTPs will be sent via real SMS
3. Consider adding email OTP option

**Staff Login:**
1. Move credentials to database
2. Add User/Staff table to Prisma schema
3. Implement password hashing (bcrypt)
4. Add password reset functionality
5. Implement role-based access control (RBAC)

### Current Limitations (Demo Mode)

❌ Staff credentials are hardcoded in frontend  
❌ No password reset for staff  
❌ No multi-doctor/receptionist support  
❌ No role permissions system  
❌ OTPs logged to console (not sent via SMS)

✅ Patient OTP system fully functional  
✅ JWT authentication working  
✅ Session management implemented  
✅ All dashboards accessible

---

## 🆘 Troubleshooting

### Can't Login as Patient
- Check backend console for OTP
- Verify phone format includes country code (+91...)
- Ensure backend server is running on port 3001
- Check if OTP hasn't expired (5 min limit)

### Can't Login as Doctor/Receptionist
- Verify exact credentials (case-sensitive)
- Email: `doctor@meddesk.in` or `reception@meddesk.in`
- Password: `MedDesk@2026`
- Check browser console (F12) for errors
- Ensure frontend is running on port 3000

### Session Expired
- Patient: Login again with phone + OTP
- Staff: Login again with email/password
- Clear browser cache if issues persist

---

**Last Updated:** March 13, 2026  
**System Version:** 1.0.0  
**Mode:** Development
