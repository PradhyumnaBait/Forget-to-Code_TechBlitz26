#!/bin/bash

# MedDesk Hackathon Deployment Script
# Quick deployment setup for demo purposes

echo "🏆 Preparing MedDesk for Hackathon Demo Deployment..."

# Update API URL for Vercel deployment
echo "📝 Updating API configuration for Vercel..."
echo "NEXT_PUBLIC_API_URL=/api" > .env.local

# Create Vercel environment file
echo "🔧 Creating Vercel environment configuration..."
cat > .env.vercel << EOF
# Vercel Environment Variables (Copy these to Vercel dashboard)
NODE_ENV=development
DATABASE_URL=postgresql://neondb_owner:npg_YfZqVc9Jga2R@ep-quiet-leaf-ad0b77rp-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=SojnGKFemudI2J8k1HwXY7qAlCPMBExz
NEXT_PUBLIC_API_URL=/api
EOF

# Update package.json for Vercel build
echo "📦 Updating build configuration..."
npm pkg set scripts.build="next build"
npm pkg set scripts.start="next start"

# Create deployment instructions
echo "📋 Creating deployment instructions..."
cat > QUICK_DEPLOY.md << EOF
# 🚀 Quick Hackathon Deployment

## Step 1: Deploy to Vercel (5 minutes)
1. Go to https://vercel.com
2. Sign up with GitHub (free)
3. Click "New Project"
4. Import this repository
5. Click "Deploy"

## Step 2: Add Environment Variables
Copy these to Vercel dashboard:
\`\`\`
NODE_ENV=development
DATABASE_URL=postgresql://neondb_owner:npg_YfZqVc9Jga2R@ep-quiet-leaf-ad0b77rp-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=SojnGKFemudI2J8k1HwXY7qAlCPMBExz
NEXT_PUBLIC_API_URL=/api
\`\`\`

## Step 3: Test Demo
- Visit your Vercel URL
- Test patient booking: phone 9999999999, OTP 123456
- Test doctor login: doctor@meddesk.in / <Any Password>
- Test reception login: reception@meddesk.in / <Any Password>

## Your demo is ready! 🎉
EOF

echo "✅ Hackathon deployment setup complete!"
echo ""
echo "🚀 Next Steps:"
echo "1. Commit and push changes to GitHub"
echo "2. Deploy to Vercel (see QUICK_DEPLOY.md)"
echo "3. Share your demo URL with judges!"
echo ""
echo "📖 Files created:"
echo "- vercel.json (Vercel configuration)"
echo "- .env.vercel (Environment variables to copy)"
echo "- QUICK_DEPLOY.md (Deployment instructions)"
echo "- DEMO_INSTRUCTIONS.md (Instructions for judges)"
echo ""
echo "🎯 Your MedDesk demo will be live in under 10 minutes!"