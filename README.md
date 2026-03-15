# 🏥 MedDesk — Smart Clinic Appointment System

MedDesk is an intelligent, end-to-end clinic management and appointment booking system designed to streamline healthcare operations. Built during TechBlitz26, this platform bridges the gap between chaotic clinic waiting rooms and modern digital efficiency.

## 🌟 The Problem
Walk-in clinics in developing regions suffer from severe queue management issues. Patients routinely wait hours for 10-minute consultations, while receptionists are overwhelmed by ringing phones and paper logbooks. The result is high patient friction, lost revenue due to no-shows, and physician burnout.

## 🚀 Our Innovation
MedDesk digitizes the entire patient journey:
- **For Patients:** Book appointments online in under 2 minutes, verified securely with OTP. Receive instant WhatsApp/SMS confirmations.
- **For Receptionists:** A live queue management dashboard that instantly flags arrived patients and predicts wait times accurately.
- **For Doctors:** An AI-enhanced consultation interface that predicts clinical diagnoses based on Chief Complaints, speeding up note-taking and auto-generating digital prescriptions.

### Real-World Impact
Through precise scheduling and AI assistance, MedDesk has the potential to:
1. **Reduce Wait Times by 40%** by balancing pre-booked slots with walk-ins.
2. **Eliminate Prescription Errors** through standardized digital medication logs.
3. **Decrease No-shows** via automated SMS reminders using Twilio.

## 🛠️ Technology Stack
- **Frontend:** Next.js 15 (App Router), Tailwind CSS, Lucide React
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL (Neon Serverless), Prisma ORM
- **AI Integration:** OpenAI API for clinical diagnosis suggestions
- **Communications:** Twilio API for SMS/WhatsApp

## 🧗 Challenges Faced During the Hackathon
1. **Real-time Queue Synchronization:** Designing a data flow where the receptionist checking in a patient immediately updates the doctor's active patient view without constant page reloads.
2. **Mobile-First Complex UIs:** Migrating complex desktop data grids (like the Doctor's Consultation view) into a responsive, swipe-friendly format for tablets and phones without losing functionality.
3. **Deployment Orchestration:** Splitting the architecture across Vercel (Edge Frontend) and Render (Persistent Backend) to ensure background cron-jobs (like SMS reminders) don't timeout, while navigating tricky Cross-Origin Resource Sharing (CORS) security rules.

## 🚦 Deployment & Access
To view this project locally:
1. Clone this repository.
2. Run `npm install` in the root and `cd backend && npm install`.
3. Set your PostgeSQL URL in `backend/.env`.
4. Run `npm run dev` to launch the full-stack system.