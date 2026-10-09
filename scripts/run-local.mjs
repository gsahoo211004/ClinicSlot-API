import { spawn } from 'node:child_process';
import { PostgresMemoryServer } from 'postgres-memory-server';

const PORT = process.env.PORT || '3000';

function run(cmd, args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, ...env },
    });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(' ')} exited with ${code}`));
    });
  });
}

async function waitForHealth(maxAttempts = 30) {
  const url = `http://127.0.0.1:${PORT}/health`;
  for (let i = 0; i < maxAttempts; i += 1) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch {
      // server still starting
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('Server did not become healthy in time');
}

console.log('Starting embedded PostgreSQL...');
const db = await PostgresMemoryServer.create();
const databaseUrl = db.getUri();
process.env.DATABASE_URL = databaseUrl;
console.log('Embedded Postgres ready.');

await run('npx', ['prisma', 'migrate', 'deploy'], { DATABASE_URL: databaseUrl });
await run('node', ['prisma/seed.js'], { DATABASE_URL: databaseUrl });

console.log(`Starting API on port ${PORT}...`);
const server = spawn('node', ['src/server.js'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, DATABASE_URL: databaseUrl, PORT },
});

const shutdown = async () => {
  server.kill();
  await db.stop();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

const health = await waitForHealth();
console.log('Health check:', health);

const clinicsRes = await fetch(`http://127.0.0.1:${PORT}/clinics?city=Bangalore`);
const clinics = await clinicsRes.json();
console.log(`Clinics (Bangalore): ${clinics.total} found`);

const loginRes = await fetch(`http://127.0.0.1:${PORT}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'patient@example.com',
    password: 'PatientPass123!',
  }),
});
const login = await loginRes.json();
console.log('Patient login:', login.user ? 'OK' : login);

console.log('\nClinicSlot API is running. Press Ctrl+C to stop.\n');
