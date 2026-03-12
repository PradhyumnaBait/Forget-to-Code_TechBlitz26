import { createApp } from './server';
import { env } from './config/environment';
import prisma from './config/database';
import { startScheduler } from './scheduler/reminderCron';

async function main() {
  // Test database connection
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    console.log('💡 Make sure DATABASE_URL is set in .env and PostgreSQL is running');
    // Don't exit — allow server to start for non-DB routes
  }

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.log('');
    console.log('╔═══════════════════════════════════════════╗');
    console.log(`║   🏥  MedDesk API  — Port ${env.PORT}            ║`);
    console.log(`║   Environment: ${env.NODE_ENV.padEnd(27)}║`);
    console.log('╚═══════════════════════════════════════════╝');
    console.log('');
    console.log(`📡 Health:    http://localhost:${env.PORT}/health`);
    console.log(`📡 API Base:  http://localhost:${env.PORT}/api`);
    console.log('');
    console.log('Endpoints:');
    console.log(`  POST /api/auth/send-otp`);
    console.log(`  POST /api/auth/verify-otp`);
    console.log(`  GET  /api/bookings/available-dates`);
    console.log(`  GET  /api/bookings/slots?date=YYYY-MM-DD`);
    console.log(`  POST /api/bookings/create`);
    console.log(`  GET  /api/queue/status`);
    console.log(`  GET  /api/analytics/today`);
    console.log('  ... (40+ total endpoints)');
    console.log('');
  });

  // Start cron jobs
  startScheduler();

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n[${signal}] Shutting down gracefully...`);
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
