import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

async function testConnection() {
  // Try direct IP connection to bypass DNS issues
  const configs = [
    {
      name: 'Direct IPv4 (52.77.146.31) Session pooler port 5432',
      host: '52.77.146.31',
      port: 5432,
      user: 'postgres.qtcirqwjztuedbvqvxvj',
      password: process.env.DB_PASSWORD,
      database: 'postgres',
    },
    {
      name: 'Direct IPv4 Transaction pooler port 6543',
      host: '52.77.146.31',
      port: 6543,
      user: 'postgres.qtcirqwjztuedbvqvxvj',
      password: process.env.DB_PASSWORD,
      database: 'postgres',
    },
    {
      name: 'Standard user on pooler',
      host: 'aws-0-ap-southeast-1.pooler.supabase.com',
      port: 5432,
      user: 'postgres',
      password: process.env.DB_PASSWORD,
      database: 'postgres',
    },
  ];

  for (const config of configs) {
    const { name, ...clientConfig } = config;
    console.log(`\nTrying: ${name}`);
    const client = new Client({ ...clientConfig, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000 });
    try {
      await client.connect();
      const res = await client.query('SELECT current_database(), current_user');
      console.log('✅ SUCCESS!', res.rows[0]);
      await client.end();
      console.log(`\n📝 Working config: host=${clientConfig.host}, port=${clientConfig.port}, user=${clientConfig.user}`);
      break;
    } catch (err) {
      console.error(`❌ Failed: ${err.message}`);
      try { await client.end(); } catch {}
    }
  }

  process.exit(0);
}

testConnection();
