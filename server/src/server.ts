import app from './app';
import { env } from './config/env';
import { prisma } from './config/database';

async function main() {
  await prisma.$connect();
  console.log('Connected to database');

  app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
