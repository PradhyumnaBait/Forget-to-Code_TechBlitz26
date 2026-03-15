#!/bin/bash

# MedDesk Production Setup Script
# Run this script to prepare your application for production deployment

echo "🚀 Preparing MedDesk for Production Deployment..."

# Create production environment files
echo "📝 Creating production environment files..."

# Frontend production env
cat > .env.production << EOF
# Production Frontend Environment
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api
EOF

# Backend production env template
cat > backend/.env.production << EOF
# Production Backend Environment
NODE_ENV=production
PORT=3000

# Database (Your existing Neon DB)
DATABASE_URL=postgresql://neondb_owner:npg_YfZqVc9Jga2R@ep-quiet-leaf-ad0b77rp-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

# JWT Security (CHANGE THIS!)
JWT_SECRET=CHANGE_THIS_TO_A_SECURE_SECRET_IN_PRODUCTION

# Frontend URL (Update after Vercel deployment)
FRONTEND_URL=https://your-frontend-url.vercel.app

# Twilio for Real SMS (Get from twilio.com)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# OpenAI (Optional)
OPENAI_API_KEY=your_openai_api_key

# Staff Credentials (Consider moving to database)
DOCTOR_USERNAME=doctor
DOCTOR_PASSWORD="<Any Password>"
RECEPTION_USERNAME=reception
RECEPTION_PASSWORD="<Any Password>"
EOF

# Create Railway deployment config
cat > backend/railway.toml << EOF
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[env]
NODE_ENV = "production"
EOF

# Create Vercel deployment config
cat > vercel.json << EOF
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "@next_public_api_url"
  }
}
EOF

# Update package.json scripts for production
echo "📦 Updating package.json for production..."

# Backend package.json updates
cd backend
npm pkg set scripts.start="node dist/index.js"
npm pkg set scripts.build="tsc"
npm pkg set engines.node=">=18.0.0"
cd ..

# Frontend package.json updates  
npm pkg set engines.node=">=18.0.0"

echo "✅ Production setup complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Update .env.production files with your actual values"
echo "2. Get Twilio credentials from twilio.com"
echo "3. Deploy backend to Railway"
echo "4. Deploy frontend to Vercel"
echo "5. Update CORS settings with production URLs"
echo ""
echo "🔗 Useful Links:"
echo "- Railway: https://railway.app"
echo "- Vercel: https://vercel.com"
echo "- Twilio: https://twilio.com"
echo ""
echo "📖 See DEPLOYMENT_GUIDE.md for detailed instructions"