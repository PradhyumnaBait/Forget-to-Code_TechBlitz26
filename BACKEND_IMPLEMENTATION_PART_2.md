# ClinicOS Backend Implementation - Part 2
## Routes, Server Setup & Utilities

---

## Continuing from Part 1...

## `src/routes/appointmentRoutes.ts`
```typescript
import { Router } from 'express';
import { Response } from 'express';
import { AuthRequest } from '../types';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import { bookingService } from '../services/bookingService';
import prisma from '../config/database';

const router = Router();

// Get all appointments (receptionist & admin)
router.get('/', authMiddleware, roleMiddleware(['RECEPTIONIST', 'ADMIN']), 
  async (req: AuthRequest, res: Response) => {
    try {
      const { status, date, patientId } = req.query;

      const appointments = await bookingService.getAppointments({
        status: status as string,
        date: date as string,
        patientId: patientId as string,
      });

      res.json({
        success: true,
        message: 'Appointments retrieved',
        data: appointments,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Get doctor's appointments
router.get('/doctor/my-appointments', authMiddleware, roleMiddleware(['DOCTOR']), 
  async (req: AuthRequest, res: Response) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextDate = new Date(today);
      nextDate.setDate(nextDate.getDate() + 1);

      const appointments = await prisma.appointment.findMany({
        where: {
          date: { gte: today, lt: nextDate },
          status: { in: ['BOOKED', 'CHECKED_IN', 'IN_CONSULTATION', 'COMPLETED'] },
        },
        include: { patient: true, consultation: true },
        orderBy: { timeSlot: 'asc' },
      });

      res.json({
        success: true,
        message: 'Doctor appointments retrieved',
        data: appointments,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Get appointment details
router.get('/:appointmentId', authMiddleware, 
  async (req: AuthRequest, res: Response) => {
    try {
      const { appointmentId } = req.params;
      const appointment = await bookingService.getAppointmentById(appointmentId);

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found',
        });
      }

      res.json({
        success: true,
        message: 'Appointment retrieved',
        data: appointment,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export default router;
```

## `src/routes/queueRoutes.ts`
```typescript
import { Router } from 'express';
import { Response } from 'express';
import { AuthRequest } from '../types';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import { queueService } from '../services/queueService';

const router = Router();

// Check-in patient (receptionist)
router.post('/check-in/:appointmentId', authMiddleware, roleMiddleware(['RECEPTIONIST']), 
  async (req: AuthRequest, res: Response) => {
    try {
      const { appointmentId } = req.params;
      const result = await queueService.checkInPatient(appointmentId);

      res.json({
        success: true,
        message: 'Patient checked in',
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Get queue status (doctor & receptionist)
router.get('/status', authMiddleware, roleMiddleware(['DOCTOR', 'RECEPTIONIST']), 
  async (req: AuthRequest, res: Response) => {
    try {
      const queueStatus = await queueService.getQueueStatus();

      res.json({
        success: true,
        message: 'Queue status retrieved',
        data: queueStatus,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Get estimated wait time
router.get('/wait-time/:appointmentId', authMiddleware, 
  async (req: AuthRequest, res: Response) => {
    try {
      const { appointmentId } = req.params;
      const waitTime = await queueService.getEstimatedWaitTime(appointmentId);

      res.json({
        success: true,
        message: 'Wait time calculated',
        data: { estimatedMinutes: waitTime },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Start consultation (doctor)
router.post('/start-consultation/:appointmentId', authMiddleware, roleMiddleware(['DOCTOR']), 
  async (req: AuthRequest, res: Response) => {
    try {
      const { appointmentId } = req.params;
      const result = await queueService.startConsultation(appointmentId);

      res.json({
        success: true,
        message: 'Consultation started',
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Complete appointment (doctor)
router.post('/complete/:appointmentId', authMiddleware, roleMiddleware(['DOCTOR']), 
  async (req: AuthRequest, res: Response) => {
    try {
      const { appointmentId } = req.params;
      const result = await queueService.completeAppointment(appointmentId);

      res.json({
        success: true,
        message: 'Appointment completed',
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Mark no-show (receptionist)
router.post('/no-show/:appointmentId', authMiddleware, roleMiddleware(['RECEPTIONIST']), 
  async (req: AuthRequest, res: Response) => {
    try {
      const { appointmentId } = req.params;
      const result = await queueService.markNoShow(appointmentId);

      res.json({
        success: true,
        message: 'Appointment marked as no-show',
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export default router;
```

## `src/routes/consultationRoutes.ts`
```typescript
import { Router } from 'express';
import { Response } from 'express';
import { AuthRequest } from '../types';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import { consultationService } from '../services/consultationService';

const router = Router();

// Save/update consultation (doctor)
router.post('/', authMiddleware, roleMiddleware(['DOCTOR']), 
  async (req: AuthRequest, res: Response) => {
    try {
      const { appointmentId, notes, diagnosis, advice, treatmentPlan } = req.body;

      if (!appointmentId) {
        return res.status(400).json({
          success: false,
          message: 'Appointment ID required',
        });
      }

      const consultation = await consultationService.saveConsultation({
        appointmentId,
        notes,
        diagnosis,
        advice,
        treatmentPlan,
      });

      res.json({
        success: true,
        message: 'Consultation saved',
        data: consultation,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Get consultation
router.get('/:appointmentId', authMiddleware, 
  async (req: AuthRequest, res: Response) => {
    try {
      const { appointmentId } = req.params;
      const consultation = await consultationService.getConsultation(appointmentId);

      if (!consultation) {
        return res.status(404).json({
          success: false,
          message: 'Consultation not found',
        });
      }

      res.json({
        success: true,
        message: 'Consultation retrieved',
        data: consultation,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Get patient medical history
router.get('/patient/:patientId/history', authMiddleware, 
  async (req: AuthRequest, res: Response) => {
    try {
      const { patientId } = req.params;
      const history = await consultationService.getPatientHistory(patientId);

      res.json({
        success: true,
        message: 'Patient history retrieved',
        data: history,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export default router;
```

## `src/routes/prescriptionRoutes.ts`
```typescript
import { Router } from 'express';
import { Response } from 'express';
import { AuthRequest } from '../types';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import { prescriptionService } from '../services/prescriptionService';

const router = Router();

// Create prescription (doctor)
router.post('/', authMiddleware, roleMiddleware(['DOCTOR']), 
  async (req: AuthRequest, res: Response) => {
    try {
      const { consultationId, medicine, dose, frequency, duration, notes } = req.body;

      if (!consultationId || !medicine || !dose || !frequency || !duration) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields',
        });
      }

      const prescription = await prescriptionService.createPrescription({
        consultationId,
        medicine,
        dose,
        frequency,
        duration,
        notes,
      });

      res.json({
        success: true,
        message: 'Prescription created',
        data: prescription,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Get prescription
router.get('/:prescriptionId', authMiddleware, 
  async (req: AuthRequest, res: Response) => {
    try {
      const { prescriptionId } = req.params;
      const prescription = await prescriptionService.getPrescription(prescriptionId);

      if (!prescription) {
        return res.status(404).json({
          success: false,
          message: 'Prescription not found',
        });
      }

      res.json({
        success: true,
        message: 'Prescription retrieved',
        data: prescription,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Get consultation prescriptions
router.get('/consultation/:consultationId/list', authMiddleware, 
  async (req: AuthRequest, res: Response) => {
    try {
      const { consultationId } = req.params;
      const prescriptions = await prescriptionService.getConsultationPrescriptions(
        consultationId
      );

      res.json({
        success: true,
        message: 'Prescriptions retrieved',
        data: prescriptions,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Update prescription (doctor)
router.put('/:prescriptionId', authMiddleware, roleMiddleware(['DOCTOR']), 
  async (req: AuthRequest, res: Response) => {
    try {
      const { prescriptionId } = req.params;
      const updateData = req.body;

      const prescription = await prescriptionService.updatePrescription(
        prescriptionId,
        updateData
      );

      res.json({
        success: true,
        message: 'Prescription updated',
        data: prescription,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Delete prescription (doctor)
router.delete('/:prescriptionId', authMiddleware, roleMiddleware(['DOCTOR']), 
  async (req: AuthRequest, res: Response) => {
    try {
      const { prescriptionId } = req.params;
      await prescriptionService.deletePrescription(prescriptionId);

      res.json({
        success: true,
        message: 'Prescription deleted',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export default router;
```

## `src/routes/billingRoutes.ts`
```typescript
import { Router } from 'express';
import { Response } from 'express';
import { AuthRequest } from '../types';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import { billingService } from '../services/billingService';

const router = Router();

// Create/update billing
router.post('/', authMiddleware, roleMiddleware(['RECEPTIONIST', 'ADMIN']), 
  async (req: AuthRequest, res: Response) => {
    try {
      const { appointmentId, consultationFee, medicineCost } = req.body;

      if (!appointmentId || consultationFee === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields',
        });
      }

      const billing = await billingService.createBilling({
        appointmentId,
        consultationFee: parseFloat(consultationFee),
        medicineCost: parseFloat(medicineCost || 0),
      });

      res.json({
        success: true,
        message: 'Billing created',
        data: billing,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Get billing for appointment
router.get('/:appointmentId', authMiddleware, 
  async (req: AuthRequest, res: Response) => {
    try {
      const { appointmentId } = req.params;
      const billing = await billingService.getBilling(appointmentId);

      if (!billing) {
        return res.status(404).json({
          success: false,
          message: 'Billing not found',
        });
      }

      res.json({
        success: true,
        message: 'Billing retrieved',
        data: billing,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Record payment
router.post('/:billingId/payment', authMiddleware, roleMiddleware(['RECEPTIONIST', 'ADMIN']), 
  async (req: AuthRequest, res: Response) => {
    try {
      const { billingId } = req.params;
      const { paymentMethod, transactionId } = req.body;

      if (!paymentMethod) {
        return res.status(400).json({
          success: false,
          message: 'Payment method required',
        });
      }

      const billing = await billingService.recordPayment(
        billingId,
        paymentMethod,
        transactionId
      );

      res.json({
        success: true,
        message: 'Payment recorded',
        data: billing,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Get daily revenue
router.get('/revenue/today', authMiddleware, roleMiddleware(['ADMIN', 'RECEPTIONIST']), 
  async (req: AuthRequest, res: Response) => {
    try {
      const revenue = await billingService.getDailyRevenue();

      res.json({
        success: true,
        message: 'Daily revenue retrieved',
        data: revenue,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export default router;
```

## `src/routes/analyticsRoutes.ts`
```typescript
import { Router } from 'express';
import { Response } from 'express';
import { AuthRequest } from '../types';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import { analyticsService } from '../services/analyticsService';

const router = Router();

// Get today's metrics
router.get('/today', authMiddleware, roleMiddleware(['ADMIN', 'RECEPTIONIST']), 
  async (req: AuthRequest, res: Response) => {
    try {
      const metrics = await analyticsService.getTodayMetrics();

      res.json({
        success: true,
        message: 'Today metrics retrieved',
        data: metrics,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Get monthly metrics
router.get('/monthly', authMiddleware, roleMiddleware(['ADMIN', 'RECEPTIONIST']), 
  async (req: AuthRequest, res: Response) => {
    try {
      const metrics = await analyticsService.getMonthlyMetrics();

      res.json({
        success: true,
        message: 'Monthly metrics retrieved',
        data: metrics,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Get no-show rate
router.get('/no-show-rate', authMiddleware, roleMiddleware(['ADMIN']), 
  async (req: AuthRequest, res: Response) => {
    try {
      const noShowData = await analyticsService.getNoShowRate();

      res.json({
        success: true,
        message: 'No-show rate retrieved',
        data: noShowData,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Get peak hours
router.get('/peak-hours', authMiddleware, roleMiddleware(['ADMIN', 'RECEPTIONIST']), 
  async (req: AuthRequest, res: Response) => {
    try {
      const peakHours = await analyticsService.getPeakHours();

      res.json({
        success: true,
        message: 'Peak hours retrieved',
        data: peakHours,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export default router;
```

## `src/routes/patientRoutes.ts`
```typescript
import { Router } from 'express';
import { Response } from 'express';
import { AuthRequest } from '../types';
import { authMiddleware } from '../middlewares/authMiddleware';
import prisma from '../config/database';

const router = Router();

// Get all patients (admin/receptionist)
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const patients = await prisma.patient.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        age: true,
        gender: true,
        bloodGroup: true,
      },
    });

    res.json({
      success: true,
      message: 'Patients retrieved',
      data: patients,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get patient by ID
router.get('/:patientId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.params;

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        appointments: { orderBy: { date: 'desc' } },
        consultations: true,
        prescriptions: true,
      },
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    res.json({
      success: true,
      message: 'Patient retrieved',
      data: patient,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update patient
router.put('/:patientId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.params;
    const { name, email, age, gender, bloodGroup, medicalHistory, allergies } = req.body;

    const patient = await prisma.patient.update({
      where: { id: patientId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(age && { age }),
        ...(gender && { gender }),
        ...(bloodGroup && { bloodGroup }),
        ...(medicalHistory && { medicalHistory }),
        ...(allergies && { allergies }),
      },
    });

    res.json({
      success: true,
      message: 'Patient updated',
      data: patient,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
```

## `src/routes/index.ts`
```typescript
import { Router } from 'express';
import authRoutes from './authRoutes';
import bookingRoutes from './bookingRoutes';
import appointmentRoutes from './appointmentRoutes';
import queueRoutes from './queueRoutes';
import consultationRoutes from './consultationRoutes';
import prescriptionRoutes from './prescriptionRoutes';
import billingRoutes from './billingRoutes';
import analyticsRoutes from './analyticsRoutes';
import patientRoutes from './patientRoutes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/api/auth', authRoutes);
router.use('/api/bookings', bookingRoutes);
router.use('/api/appointments', appointmentRoutes);
router.use('/api/queue', queueRoutes);
router.use('/api/consultations', consultationRoutes);
router.use('/api/prescriptions', prescriptionRoutes);
router.use('/api/billing', billingRoutes);
router.use('/api/analytics', analyticsRoutes);
router.use('/api/patients', patientRoutes);

// 404 handler
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

export default router;
```

---

## Part 10: Express Server

### `src/server.ts`
```typescript
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { generalLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorMiddleware';
import { env } from './config/environment';

const app: Express = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));

// Rate limiting
app.use(generalLimiter);

// Routes
app.use(routes);

// Error handling
app.use(errorHandler);

export default app;
```

### `src/index.ts`
```typescript
import app from './server';
import { env } from './config/environment';
import { slotService } from './services/slotService';
import cron from 'node-cron';

const PORT = env.PORT;

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║     ClinicOS Backend Server Started   ║
╚══════════════════════════════════════╝
  
  Server: http://localhost:${PORT}
  Health: http://localhost:${PORT}/health
  Env: ${env.NODE_ENV}
  
  Available Endpoints:
  ✓ POST   /api/auth/send-otp
  ✓ POST   /api/auth/verify-otp
  ✓ GET    /api/bookings/available-dates
  ✓ GET    /api/bookings/slots
  ✓ POST   /api/bookings/create
  ✓ POST   /api/bookings/cancel/:id
  ✓ POST   /api/bookings/reschedule/:id
  ✓ GET    /api/appointments
  ✓ GET    /api/appointments/doctor/my-appointments
  ✓ POST   /api/queue/check-in/:id
  ✓ GET    /api/queue/status
  ✓ POST   /api/consultations
  ✓ POST   /api/prescriptions
  ✓ POST   /api/billing
  ✓ GET    /api/analytics/today
  
  `);
});

// Cron jobs
// Release expired slot reservations every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log('🔄 Running: Release expired slot reservations');
  await slotService.releaseExpiredReservations();
});

// Log server startup
console.log(`✅ ClinicOS Backend initialized at ${new Date().toISOString()}`);
```

---

## Part 11: Utilities

### `src/utils/validation.ts`
```typescript
export const validatePhone = (phone: string): boolean => {
  return /^\+?[1-9]\d{1,14}$/.test(phone);
};

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validateDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

export const validateTimeSlot = (timeSlot: string): boolean => {
  return /^([0-1]\d|2[0-3]):[0-5]\d$/.test(timeSlot);
};

export const validateAppointmentReason = (reason: string): boolean => {
  return reason && reason.length > 0 && reason.length <= 500;
};

export const validateConsultationData = (data: any): boolean => {
  if (!data.appointmentId) return false;
  // All other fields are optional
  return true;
};
```

### `src/utils/dateUtils.ts`
```typescript
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const formatDateTime = (date: Date): string => {
  return date.toISOString();
};

export const getDateString = (date: Date): string => {
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const getTimeString = (timeSlot: string): string => {
  return timeSlot; // Already in HH:mm format
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const isTomorrow = (date: Date): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
};

export const hoursUntilAppointment = (appointmentDate: Date, timeSlot: string): number => {
  const [hours, minutes] = timeSlot.split(':').map(Number);
  const appointmentTime = new Date(appointmentDate);
  appointmentTime.setHours(hours, minutes, 0, 0);

  const now = new Date();
  const diff = appointmentTime.getTime() - now.getTime();
  return Math.floor(diff / (1000 * 60 * 60));
};
```

### `.gitignore`
```
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Environment variables
.env
.env.local
.env.*.local

# Build output
dist/
build/
*.tsbuildinfo

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS files
.DS_Store
Thumbs.db

# IDEs
.vscode/
.idea/
*.swp
*.swo

# Testing
coverage/
.nyc_output/

# Prisma
prisma/migrations/
```

---

## Part 12: Running the Backend

### Setup Instructions
```bash
# 1. Clone and install
git clone <repo>
cd clinic-backend
npm install

# 2. Setup Prisma
npx prisma init

# 3. Copy schema from Part 1
# Copy entire prisma/schema.prisma content

# 4. Create database and run migrations
npx prisma migrate dev --name init

# 5. Generate Prisma client
npx prisma generate

# 6. Copy .env template and update with your values
cp .env.example .env

# 7. Start development server
npm run dev

# 8. Server will be running at http://localhost:3000
```

### Testing Endpoints
```bash
# Test OTP send
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}'

# Test OTP verify (use code from SMS)
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210", "code": "123456"}'

# Get available slots (save JWT from verify response)
curl "http://localhost:3000/api/bookings/slots?date=2024-01-20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create booking
curl -X POST http://localhost:3000/api/bookings/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "patientName": "John Doe",
    "patientPhone": "+919876543210",
    "date": "2024-01-20",
    "timeSlot": "09:00",
    "reason": "General checkup"
  }'
```

---

## Next Steps

1. ✅ Copy all code from Part 1 & Part 2
2. ✅ Setup project structure
3. ✅ Configure environment variables
4. ✅ Create Prisma schema & migrations
5. ✅ Start development server
6. ✅ Test all endpoints
7. ⏳ Integrate with frontend (built separately)
8. ⏳ Deploy to production

All backend APIs are now ready to be consumed by your frontend!
