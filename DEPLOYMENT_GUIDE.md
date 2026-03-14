# 🚀 MedDesk Live Deployment Guide

## 📋 **Deployment Overview**

We'll deploy your MedDesk application using modern, reliable platforms:

- **Frontend (Next.js)**: Vercel (Free tier)
- **Backend (Node.js/Express)**: Railway (Free tier)
- **Database**: Already on Neon PostgreSQL (Cloud)
- **Domain**: Custom domain (optional)

## 🏗️ **Architecture After Deployment**

```
Internet → Vercel (Frontend) → Railway (Backend) → Neon (Database)
```

---

## 🎯 **Step 1: Prepare for Production**

### **1.1 Remove Demo Features (Important!)**

Before deploying, we need to remove/modify demo features for production:

#### **Remove Demo OTP Endpoint**
- The `getCurrentOTP` endpoint should be disabled in production
- Demo credentials should be replaced with real authentication

#### **Environment Variables Setup**
Create production environment files:

**Frontend (.env.production)**:
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api
```

**Backend (.env.production)**:
```env
NODE_ENV=production
DATABASE_URL=your_neon_database_url
JWT_SECRET=your_super_secure_jwt_secret_here
FRONTEND_URL=https://your-frontend-url.vercel.app

# Twilio (for real SMS)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone

# OpenAI (optional)
OPENAI_API_KEY=your_openai_key
```

---

## 🚀 **Step 2: Deploy Backend to Railway**

### **2.1 Prepare Backend for Railway**

1. **Create Railway Account**:
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub account

2. **Prepare Backend Code**:
   ```bash
   cd backend
   
   # Create production start script
   npm run build
   ```

3. **Update package.json** (if needed):
   ```json
   {
     "scripts": {
       "start": "node dist/index.js",
       "build": "tsc",
       "dev": "nodemon --watch src --ext ts --exec ts-node src/index.ts"
     }
   }
   ```

### **2.2 Deploy to Railway**

1. **Create New Project**:
   - Click "New Project" in Railway dashboard
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account
   - Select your MedDesk repository

2. **Configure Build Settings**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

3. **Set Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=postgresql://neondb_owner:npg_YfZqVc9Jga2R@ep-quiet-leaf-ad0b77rp-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
   JWT_SECRET=SojnGKFemudI2J8k1HwXY7qAlCPMBExz
   FRONTEND_URL=https://meddesk.vercel.app
   
   # Add your Twilio credentials for real SMS
   TWILIO_ACCOUNT_SID=
   TWILIO_AUTH_TOKEN=
   TWILIO_PHONE_NUMBER=
   ```

4. **Deploy**:
   - Railway will automatically build and deploy
   - You'll get a URL like: `https://meddesk-backend-production.up.railway.app`

---

## 🌐 **Step 3: Deploy Frontend to Vercel**

### **3.1 Prepare Frontend for Vercel**

1. **Create Vercel Account**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub account

2. **Update Environment Variables**:
   Create `.env.production`:
   ```env
   NEXT_PUBLIC_API_URL=https://your-railway-backend-url.railway.app/api
   ```

### **3.2 Deploy to Vercel**

1. **Import Project**:
   - Click "New Project" in Vercel dashboard
   - Import from GitHub
   - Select your MedDesk repository

2. **Configure Build Settings**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `.` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

3. **Set Environment Variables**:
   ```env
   NEXT_PUBLIC_API_URL=https://your-railway-backend-url.railway.app/api
   ```

4. **Deploy**:
   - Vercel will automatically build and deploy
   - You'll get a URL like: `https://meddesk.vercel.app`

---

## 🔧 **Step 4: Production Configuration**

### **4.1 Update CORS Settings**

Update backend CORS configuration:

```typescript
// backend/src/server.ts
app.use(
  cors({
    origin: [
      'https://meddesk.vercel.app', // Your Vercel URL
      'https://your-custom-domain.com', // If you have one
      ...(env.NODE_ENV === 'development' ? ['http://localhost:3000'] : [])
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
```

### **4.2 Disable Demo Features in Production**

Update the OTP controller:

```typescript
// backend/src/controllers/authController.ts
export const getCurrentOTP = async (req, res, next) => {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json(errorResponse('This endpoint is not available in production'));
  }
  // ... rest of the code
};
```

### **4.3 Update Frontend for Production**

Remove or modify demo features:

```typescript
// src/app/book/verify-otp/page.tsx
useEffect(() => {
  const fetchCurrentOtp = async () => {
    // Only fetch in development
    if (process.env.NODE_ENV === 'development') {
      try {
        const response = await authApi.getCurrentOtp(phone);
        if (response.success) {
          setDemoOtp(response.data.otp);
        }
      } catch (error) {
        console.log('Could not fetch current OTP');
      }
    }
  };
  
  fetchCurrentOtp();
}, [phone]);
```

---

## 📱 **Step 5: Setup Real SMS (Twilio)**

### **5.1 Create Twilio Account**

1. Go to [twilio.com](https://twilio.com)
2. Sign up for free account
3. Get $15 free credit

### **5.2 Get Twilio Credentials**

1. **Account SID**: From Twilio Console
2. **Auth Token**: From Twilio Console  
3. **Phone Number**: Purchase a phone number ($1/month)

### **5.3 Configure Twilio**

Add to Railway environment variables:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

---

## 🌍 **Step 6: Custom Domain (Optional)**

### **6.1 Purchase Domain**

Recommended registrars:
- **Namecheap** (affordable)
- **Google Domains** (reliable)
- **Cloudflare** (with free SSL)

### **6.2 Configure Domain**

**For Vercel (Frontend)**:
1. Go to Vercel project settings
2. Add custom domain
3. Update DNS records as instructed

**For Railway (Backend)**:
1. Go to Railway project settings
2. Add custom domain
3. Update DNS records

---

## 🔒 **Step 7: Security & Performance**

### **7.1 Security Headers**

Already configured with Helmet.js in your backend.

### **7.2 SSL Certificates**

Both Vercel and Railway provide free SSL certificates automatically.

### **7.3 Environment Security**

- Never commit `.env` files
- Use strong JWT secrets
- Rotate API keys regularly

---

## 📊 **Step 8: Monitoring & Analytics**

### **8.1 Error Monitoring**

Add Sentry for error tracking:
```bash
npm install @sentry/nextjs @sentry/node
```

### **8.2 Analytics**

Add Google Analytics or Vercel Analytics:
```bash
npm install @vercel/analytics
```

---

## 🚀 **Step 9: Deployment Checklist**

### **Pre-Deployment**
- [ ] Remove demo OTP endpoint in production
- [ ] Update CORS settings
- [ ] Set up Twilio for real SMS
- [ ] Configure environment variables
- [ ] Test build process locally

### **Backend Deployment (Railway)**
- [ ] Create Railway account
- [ ] Connect GitHub repository
- [ ] Set environment variables
- [ ] Configure build settings
- [ ] Deploy and test

### **Frontend Deployment (Vercel)**
- [ ] Create Vercel account
- [ ] Import GitHub repository
- [ ] Set environment variables
- [ ] Configure build settings
- [ ] Deploy and test

### **Post-Deployment**
- [ ] Test all functionality
- [ ] Verify SMS sending works
- [ ] Check database connections
- [ ] Test staff login
- [ ] Verify appointment booking flow
- [ ] Set up monitoring
- [ ] Configure custom domain (optional)

---

## 💰 **Cost Breakdown**

### **Free Tier Limits**:
- **Vercel**: 100GB bandwidth, unlimited deployments
- **Railway**: $5 credit/month, 500 hours runtime
- **Neon**: 10GB storage, 100 hours compute

### **Paid Options** (if needed):
- **Vercel Pro**: $20/month (more bandwidth)
- **Railway**: $5-20/month (more resources)
- **Twilio**: $1/month phone + $0.0075/SMS
- **Custom Domain**: $10-15/year

---

## 🎯 **Expected URLs After Deployment**

- **Frontend**: `https://meddesk.vercel.app`
- **Backend**: `https://meddesk-backend-production.up.railway.app`
- **API Health**: `https://meddesk-backend-production.up.railway.app/health`

---

## 🆘 **Troubleshooting**

### **Common Issues**:

1. **CORS Errors**: Update CORS configuration with production URLs
2. **Environment Variables**: Double-check all env vars are set
3. **Build Failures**: Check Node.js version compatibility
4. **Database Connection**: Verify DATABASE_URL is correct
5. **SMS Not Working**: Check Twilio credentials and phone number

### **Debug Steps**:
1. Check deployment logs in Railway/Vercel
2. Test API endpoints individually
3. Verify environment variables
4. Check database connectivity
5. Test CORS with browser dev tools

---

## 🎉 **Success Metrics**

After successful deployment, you should have:
- ✅ Live website accessible globally
- ✅ Real SMS OTP delivery
- ✅ Staff login working
- ✅ Appointment booking functional
- ✅ Database operations working
- ✅ Professional production setup

**Your MedDesk clinic management system will be live and ready for real users!**