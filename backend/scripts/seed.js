import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import supabase from '../config/db.js';

dotenv.config();

async function seed() {
  console.log('🌱 Seeding database via Supabase JS...\n');

  try {
    // ─── Clean existing data (order matters for FK constraints) ──
    console.log('🧹 Cleaning existing data...');
    await supabase.from('audit_logs').delete().not('id', 'is', null);
    await supabase.from('expenditures').delete().not('id', 'is', null);
    await supabase.from('assignments').delete().not('id', 'is', null);
    await supabase.from('transfers').delete().not('id', 'is', null);
    await supabase.from('purchases').delete().not('id', 'is', null);
    await supabase.from('users').delete().not('id', 'is', null);
    await supabase.from('equipment_types').delete().not('id', 'is', null);
    await supabase.from('bases').delete().not('id', 'is', null);
    console.log('   ✓ Cleaned\n');

    // ─── 1. BASES ──────────────────────────────────────────
    console.log('📍 Creating bases...');
    const { data: bases, error: bErr } = await supabase
      .from('bases')
      .insert([
        { name: 'Fort Alpha', location: 'Northern Command Zone, Sector 1' },
        { name: 'Fort Bravo', location: 'Eastern Command Zone, Sector 4' },
        { name: 'Fort Charlie', location: 'Southern Command Zone, Sector 7' },
      ])
      .select();
    if (bErr) throw bErr;
    const [base1, base2, base3] = bases;
    console.log(`   ✓ ${bases.map(b => b.name).join(', ')}`);

    // ─── 2. USERS ──────────────────────────────────────────
    console.log('👤 Creating users...');
    const [adminHash, cmdHash, logHash] = await Promise.all([
      bcrypt.hash('AdminPass123!', 12),
      bcrypt.hash('CommandPass123!', 12),
      bcrypt.hash('LogisticsPass123!', 12),
    ]);

    const { data: users, error: uErr } = await supabase
      .from('users')
      .insert([
        { username: 'admin_user',        password_hash: adminHash, role: 'ADMIN',              base_id: null },
        { username: 'commander_alpha',   password_hash: cmdHash,   role: 'BASE_COMMANDER',     base_id: base1.id },
        { username: 'logistics_officer', password_hash: logHash,   role: 'LOGISTICS_OFFICER',  base_id: base1.id },
      ])
      .select();
    if (uErr) throw uErr;
    const adminUser = users.find(u => u.username === 'admin_user');
    const cmdUser   = users.find(u => u.username === 'commander_alpha');
    const logUser   = users.find(u => u.username === 'logistics_officer');
    console.log(`   ✓ ${users.map(u => u.username).join(', ')}`);

    // ─── 3. EQUIPMENT TYPES ───────────────────────────────
    console.log('🔫 Creating equipment types...');
    const { data: equipment, error: eErr } = await supabase
      .from('equipment_types')
      .insert([
        { name: 'M4 Carbine',         category: 'WEAPON'     },
        { name: 'M249 SAW',           category: 'WEAPON'     },
        { name: 'Humvee',             category: 'VEHICLE'    },
        { name: 'M1A2 Abrams Tank',   category: 'VEHICLE'    },
        { name: '5.56mm Ammunition',  category: 'AMMUNITION' },
        { name: '7.62mm Ammunition',  category: 'AMMUNITION' },
      ])
      .select();
    if (eErr) throw eErr;
    const m4      = equipment.find(e => e.name === 'M4 Carbine');
    const m249    = equipment.find(e => e.name === 'M249 SAW');
    const humvee  = equipment.find(e => e.name === 'Humvee');
    const ammo556 = equipment.find(e => e.name === '5.56mm Ammunition');
    console.log(`   ✓ ${equipment.map(e => e.name).join(', ')}`);

    // ─── 4. PURCHASES ─────────────────────────────────────
    console.log('🛒 Creating purchases...');
    const now = new Date();
    const daysAgo = (d) => new Date(now - d * 86400000).toISOString();

    const { error: pErr } = await supabase.from('purchases').insert([
      { base_id: base1.id, equipment_type_id: m4.id,      quantity: 50,    notes: 'Initial procurement batch Q1',   purchased_by: adminUser.id, created_at: daysAgo(60) },
      { base_id: base1.id, equipment_type_id: ammo556.id, quantity: 10000, notes: 'Ammunition stock replenishment',  purchased_by: adminUser.id, created_at: daysAgo(55) },
      { base_id: base2.id, equipment_type_id: m4.id,      quantity: 30,    notes: 'Fort Bravo initial stock',        purchased_by: adminUser.id, created_at: daysAgo(50) },
      { base_id: base2.id, equipment_type_id: humvee.id,  quantity: 5,     notes: 'Vehicle procurement',             purchased_by: adminUser.id, created_at: daysAgo(45) },
      { base_id: base3.id, equipment_type_id: m4.id,      quantity: 40,    notes: 'Fort Charlie weapons batch',      purchased_by: adminUser.id, created_at: daysAgo(40) },
      { base_id: base1.id, equipment_type_id: m249.id,    quantity: 20,    notes: 'SAW rifles procurement',          purchased_by: logUser.id,   created_at: daysAgo(30) },
      { base_id: base2.id, equipment_type_id: ammo556.id, quantity: 5000,  notes: 'Ammo resupply Q2',               purchased_by: logUser.id,   created_at: daysAgo(20) },
      { base_id: base3.id, equipment_type_id: humvee.id,  quantity: 8,     notes: 'Fort Charlie vehicles',           purchased_by: adminUser.id, created_at: daysAgo(15) },
      { base_id: base1.id, equipment_type_id: m4.id,      quantity: 25,    notes: 'Recent M4 purchase',              purchased_by: logUser.id,   created_at: daysAgo(5)  },
      { base_id: base1.id, equipment_type_id: ammo556.id, quantity: 8000,  notes: 'Large ammo procurement',          purchased_by: adminUser.id, created_at: daysAgo(2)  },
    ]);
    if (pErr) throw pErr;
    console.log('   ✓ 10 purchases');

    // ─── 5. TRANSFERS ─────────────────────────────────────
    console.log('🔄 Creating transfers...');
    const { error: tErr } = await supabase.from('transfers').insert([
      { source_base_id: base1.id, destination_base_id: base2.id, equipment_type_id: m4.id,      quantity: 10,   status: 'COMPLETED',  notes: 'Rebalancing M4 stock to Fort Bravo',       initiated_by: logUser.id, created_at: daysAgo(45) },
      { source_base_id: base2.id, destination_base_id: base3.id, equipment_type_id: humvee.id,  quantity: 2,    status: 'COMPLETED',  notes: 'Vehicle support for Fort Charlie ops',      initiated_by: logUser.id, created_at: daysAgo(35) },
      { source_base_id: base1.id, destination_base_id: base3.id, equipment_type_id: ammo556.id, quantity: 2000, status: 'COMPLETED',  notes: 'Ammo support transfer',                    initiated_by: logUser.id, created_at: daysAgo(25) },
      { source_base_id: base3.id, destination_base_id: base1.id, equipment_type_id: m4.id,      quantity: 5,    status: 'COMPLETED',  notes: 'Return of excess weapons',                 initiated_by: logUser.id, created_at: daysAgo(10) },
      { source_base_id: base2.id, destination_base_id: base1.id, equipment_type_id: humvee.id,  quantity: 1,    status: 'IN_TRANSIT', notes: 'Vehicle maintenance rotation',              initiated_by: logUser.id, created_at: daysAgo(1)  },
    ]);
    if (tErr) throw tErr;
    console.log('   ✓ 5 transfers');

    // ─── 6. ASSIGNMENTS ───────────────────────────────────
    console.log('📋 Creating assignments...');
    const { error: aErr } = await supabase.from('assignments').insert([
      { base_id: base1.id, equipment_type_id: m4.id,      quantity: 15,   assigned_to: 'Alpha Company, 1st Platoon', notes: 'Combat patrol assignment',      assigned_by: cmdUser.id, created_at: daysAgo(40) },
      { base_id: base1.id, equipment_type_id: ammo556.id, quantity: 3000, assigned_to: 'Alpha Company',              notes: 'Training exercise allocation',  assigned_by: cmdUser.id, created_at: daysAgo(30) },
      { base_id: base2.id, equipment_type_id: m4.id,      quantity: 10,   assigned_to: 'Bravo Company, 2nd Platoon', notes: 'Perimeter defense',              assigned_by: cmdUser.id, created_at: daysAgo(20) },
      { base_id: base3.id, equipment_type_id: m249.id,    quantity: 5,    assigned_to: 'Charlie Company',            notes: 'Night patrol assignment',        assigned_by: cmdUser.id, created_at: daysAgo(10) },
    ]);
    if (aErr) throw aErr;
    console.log('   ✓ 4 assignments');

    // ─── 7. EXPENDITURES ──────────────────────────────────
    console.log('💥 Creating expenditures...');
    const { error: exErr } = await supabase.from('expenditures').insert([
      { base_id: base1.id, equipment_type_id: ammo556.id, quantity: 500,  reason: 'Live fire training exercise',  recorded_by: cmdUser.id, created_at: daysAgo(30) },
      { base_id: base2.id, equipment_type_id: ammo556.id, quantity: 200,  reason: 'Combat qualification test',    recorded_by: cmdUser.id, created_at: daysAgo(20) },
      { base_id: base3.id, equipment_type_id: ammo556.id, quantity: 300,  reason: 'Range day training',           recorded_by: cmdUser.id, created_at: daysAgo(10) },
      { base_id: base1.id, equipment_type_id: ammo556.id, quantity: 1000, reason: 'Large scale training op',      recorded_by: cmdUser.id, created_at: daysAgo(3)  },
    ]);
    if (exErr) throw exErr;
    console.log('   ✓ 4 expenditures');

    // ─── 8. AUDIT LOGS ────────────────────────────────────
    console.log('📝 Creating audit logs...');
    const { error: alErr } = await supabase.from('audit_logs').insert([
      { user_id: adminUser.id, action: 'PURCHASE',    details: 'Purchased 50 M4 Carbines for Fort Alpha',                    created_at: daysAgo(60) },
      { user_id: adminUser.id, action: 'PURCHASE',    details: 'Purchased 10000 rounds of 5.56mm for Fort Alpha',            created_at: daysAgo(55) },
      { user_id: logUser.id,   action: 'TRANSFER',    details: 'Transferred 10 M4 Carbines from Fort Alpha to Fort Bravo',   created_at: daysAgo(45) },
      { user_id: adminUser.id, action: 'ASSIGNMENT',  details: 'Assigned 15 M4 Carbines to Alpha Company 1st Platoon',      created_at: daysAgo(40) },
      { user_id: adminUser.id, action: 'EXPENDITURE', details: 'Recorded 500 rounds of 5.56mm expended at Fort Alpha',      created_at: daysAgo(30) },
      { user_id: logUser.id,   action: 'TRANSFER',    details: 'Transferred 2000 rounds from Fort Alpha to Fort Charlie',    created_at: daysAgo(25) },
      { user_id: logUser.id,   action: 'PURCHASE',    details: 'Purchased 25 M4 Carbines for Fort Alpha',                   created_at: daysAgo(5)  },
      { user_id: logUser.id,   action: 'TRANSFER',    details: 'Transfer of 1 Humvee from Fort Bravo to Fort Alpha',        created_at: daysAgo(1)  },
    ]);
    if (alErr) throw alErr;
    console.log('   ✓ 8 audit logs');

    console.log('\n✅ Database seeded successfully!\n');
    console.log('📋 Test Credentials:');
    console.log('   Admin:              admin_user        / AdminPass123!');
    console.log('   Base Commander:     commander_alpha   / CommandPass123!');
    console.log('   Logistics Officer:  logistics_officer / LogisticsPass123!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seed();
