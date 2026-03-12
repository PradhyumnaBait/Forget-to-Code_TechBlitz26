import { PrismaClient } from '@prisma/client';
import { env } from './environment';

const prisma = new PrismaClient({
  log: env.IS_DEV ? ['warn', 'error'] : ['error'],
});

export default prisma;
