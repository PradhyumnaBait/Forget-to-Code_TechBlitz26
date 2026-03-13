// Simple connection test
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('📍 DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));
    
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('📊 PostgreSQL version:', result);
    
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    console.log('📋 Tables found:', tables.length);
    tables.forEach(t => console.log('   -', t.table_name));
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('💡 Error code:', error.code);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
