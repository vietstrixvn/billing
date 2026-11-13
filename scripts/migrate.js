const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Parse .env if DATABASE_URL is not present in process.env
if (!process.env.DATABASE_URL) {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...vals] = trimmed.split('=');
        process.env[key.trim()] = vals.join('=').trim();
      }
    });
  }
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ ERROR: DATABASE_URL is not defined in .env file!');
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function runMigrations() {
  try {
    console.log('🔌 Connecting to Neon PostgreSQL database...');
    await client.connect();
    console.log('✅ Connected to Neon database successfully!\n');

    const rootDir = path.join(__dirname, '..');
    const tablesDir = path.join(rootDir, 'migrations', 'tables');
    const indexsDir = path.join(rootDir, 'migrations', 'indexs');
    const seedFile = path.join(rootDir, 'migrations', 'seed_data.sql');

    // 1. Execute Table Migrations
    if (fs.existsSync(tablesDir)) {
      console.log('📦 Executing Table Migrations (migrations/tables/*)...');
      const tableFiles = fs
        .readdirSync(tablesDir)
        .filter((f) => f.endsWith('.sql'))
        .sort();

      for (const file of tableFiles) {
        const filePath = path.join(tablesDir, file);
        console.log(`   ⏳ Running: ${file}`);
        const sql = fs.readFileSync(filePath, 'utf8');
        await client.query(sql);
        console.log(`   ✅ Completed: ${file}`);
      }
      console.log('--------------------------------------------------');
    }

    // 2. Execute Index Migrations
    if (fs.existsSync(indexsDir)) {
      console.log('⚡ Executing Index Migrations (migrations/indexs/*)...');
      const indexFiles = fs
        .readdirSync(indexsDir)
        .filter((f) => f.endsWith('.sql'))
        .sort();

      for (const file of indexFiles) {
        const filePath = path.join(indexsDir, file);
        console.log(`   ⏳ Running: ${file}`);
        const sql = fs.readFileSync(filePath, 'utf8');
        await client.query(sql);
        console.log(`   ✅ Completed: ${file}`);
      }
      console.log('--------------------------------------------------');
    }

    // 3. Execute Seed Data
    if (fs.existsSync(seedFile)) {
      console.log('🌱 Executing Seed Data (migrations/seed_data.sql)...');
      console.log(`   ⏳ Running: seed_data.sql`);
      const sql = fs.readFileSync(seedFile, 'utf8');
      await client.query(sql);
      console.log(`   ✅ Seed data executed successfully!`);
      console.log('--------------------------------------------------');
    }

    console.log('🎉 All table migrations and seed data executed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
