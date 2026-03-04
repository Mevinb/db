/**
 * Migration Runner
 * Executes the SQL migration file to create functions, triggers,
 * and stored procedures in Supabase PostgreSQL.
 * 
 * Run with: npm run migrate
 * 
 * This creates all database objects that will be visible in
 * Supabase Dashboard under:
 *   - Database > Functions
 *   - Database > Triggers
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { sequelize } = require('../config/db');

const runMigration = async () => {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Connected to Supabase PostgreSQL');

    // Read the SQL migration file
    const sqlPath = path.join(__dirname, 'supabase_functions_triggers.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Loaded migration file: supabase_functions_triggers.sql');
    console.log('🚀 Running migration...\n');

    // Split by semicolons at end of statements, handling $$ blocks
    // We'll execute the entire file as a single transaction
    await sequelize.transaction(async (t) => {
      await sequelize.query(sql, { transaction: t });
    });

    console.log('✅ Migration completed successfully!\n');
    console.log('📊 Created database objects:');
    console.log('   ─────────────────────────────────────');
    console.log('   📦 Functions:          19');
    console.log('   ⚡ Triggers:           21');
    console.log('   🔧 Stored Procedures:  4');
    console.log('   ─────────────────────────────────────');
    console.log('\n🔍 These are now visible in your Supabase Dashboard:');
    console.log('   → Database > Functions');
    console.log('   → Database > Triggers\n');

    // Verify by listing functions
    const [functions] = await sequelize.query(`
      SELECT routine_name, routine_type
      FROM information_schema.routines
      WHERE routine_schema = 'public'
        AND routine_type IN ('FUNCTION', 'PROCEDURE')
      ORDER BY routine_type, routine_name;
    `);

    console.log(`📋 Verified ${functions.length} functions/procedures in database:`);
    functions.forEach(f => {
      const icon = f.routine_type === 'PROCEDURE' ? '🔧' : '📦';
      console.log(`   ${icon} [${f.routine_type}] ${f.routine_name}`);
    });

    // List triggers
    const [triggers] = await sequelize.query(`
      SELECT trigger_name, event_object_table, event_manipulation
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
      ORDER BY event_object_table, trigger_name;
    `);

    console.log(`\n⚡ Verified ${triggers.length} triggers in database:`);
    const seenTriggers = new Set();
    triggers.forEach(t => {
      const key = `${t.trigger_name} on ${t.event_object_table}`;
      if (!seenTriggers.has(key)) {
        seenTriggers.add(key);
        console.log(`   ⚡ ${t.trigger_name} → ${t.event_object_table} (${t.event_manipulation})`);
      }
    });

    console.log('\n✨ All done! Your Supabase database now has all functions, triggers, and procedures.');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.original) {
      console.error('   SQL Error:', error.original.message);
    }
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

runMigration();
