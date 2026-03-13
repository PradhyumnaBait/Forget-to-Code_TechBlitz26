require('dotenv').config();

/** @type {import('prisma/config').PrismaConfig} */
const config = {
  datasourceUrl: process.env.DATABASE_URL,
};

module.exports = config;
