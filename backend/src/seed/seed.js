require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Module = require('../models/Module');
const fireModule = require('./fireModule.data');
const gasModule = require('./gasModule.data');

async function seed() {
  await connectDB();

  await Module.deleteMany({ moduleId: { $in: [fireModule.moduleId, gasModule.moduleId] } });
  await Module.create(fireModule);
  await Module.create(gasModule);
  console.log('[seed] Modules seeded: fire-explosion, gas-confined-space');

  const adminWorkerId = (process.env.SEED_ADMIN_WORKER_ID || 'ADMIN001').toUpperCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';

  const existingAdmin = await User.findOne({ workerId: adminWorkerId });
  if (!existingAdmin) {
    await User.create({
      name: 'Compliance Admin',
      workerId: adminWorkerId,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: 'admin',
      sector: 'Mining',
      language: 'en',
    });
    console.log(`[seed] Admin created — workerId: ${adminWorkerId}, password: ${adminPassword}`);
  } else {
    console.log('[seed] Admin already exists, skipping');
  }

  const demoWorkerId = 'WORKER001';
  const existingWorker = await User.findOne({ workerId: demoWorkerId });
  if (!existingWorker) {
    await User.create({
      name: 'Ravi Kumar',
      workerId: demoWorkerId,
      passwordHash: await bcrypt.hash('Worker@123', 10),
      role: 'worker',
      sector: 'Mining',
      language: 'hi',
      phone: '9800000000',
    });
    console.log(`[seed] Demo worker created — workerId: ${demoWorkerId}, password: Worker@123`);
  } else {
    console.log('[seed] Demo worker already exists, skipping');
  }

  console.log('[seed] Done.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
