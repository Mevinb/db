require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  logging: false,
});

(async () => {
  await sequelize.authenticate();
  console.log('✓ Connected to Supabase\n');

  // 1. Foreign Keys
  const [fks] = await sequelize.query(`
    SELECT tc.table_name, kcu.column_name,
           ccu.table_name AS foreign_table, rc.delete_rule,
           tc.is_deferrable
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
    JOIN information_schema.referential_constraints rc
      ON rc.constraint_name = tc.constraint_name AND rc.constraint_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
    ORDER BY tc.table_name, kcu.column_name;
  `);

  console.log(`FOREIGN KEYS (${fks.length} total):`);
  fks.forEach(r => {
    const defer = r.is_deferrable === 'YES' ? ' [DEFERRABLE]' : '';
    console.log(`  ${r.table_name}.${r.column_name} -> ${r.foreign_table}  ON DELETE ${r.delete_rule}${defer}`);
  });

  // 2. Unique constraints
  const [uqs] = await sequelize.query(`
    SELECT tc.table_name, tc.constraint_name,
           string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) AS columns
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'UNIQUE' AND tc.table_schema = 'public'
      AND tc.constraint_name LIKE 'uq_%'
    GROUP BY tc.table_name, tc.constraint_name
    ORDER BY tc.table_name;
  `);

  console.log(`\nCUSTOM UNIQUE CONSTRAINTS (${uqs.length}):`);
  uqs.forEach(r => console.log(`  ${r.table_name}(${r.columns})`));

  // 3. Check constraints
  const [chks] = await sequelize.query(`
    SELECT table_name, constraint_name
    FROM information_schema.table_constraints
    WHERE constraint_type = 'CHECK' AND table_schema = 'public'
      AND constraint_name LIKE 'chk_%'
    ORDER BY table_name;
  `);

  console.log(`\nCHECK CONSTRAINTS (${chks.length}):`);
  chks.forEach(r => console.log(`  ${r.constraint_name}`));

  // 4. Indexes
  const [idxs] = await sequelize.query(`
    SELECT indexname, tablename
    FROM pg_indexes
    WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
    ORDER BY tablename, indexname;
  `);

  console.log(`\nINDEXES (${idxs.length}):`);
  idxs.forEach(r => console.log(`  ${r.indexname}  [${r.tablename}]`));

  // 5. ENUM types
  const [enums] = await sequelize.query(`
    SELECT typname FROM pg_type
    WHERE typtype = 'e'
      AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ORDER BY typname;
  `);

  console.log(`\nENUM TYPES (${enums.length}):`);
  enums.forEach(r => console.log(`  ${r.typname}`));

  // 6. Quick data check
  const tables = ['users','departments','programs','faculties','students','courses','semesters','enrollments','attendances','exams','marks','announcements'];
  console.log('\nROW COUNTS:');
  for (const t of tables) {
    const [[row]] = await sequelize.query(`SELECT COUNT(*) as c FROM public.${t}`);
    console.log(`  ${t.padEnd(16)} ${row.c} rows`);
  }

  console.log('\n✅ Schema verification complete!');
  await sequelize.close();
})().catch(e => { console.error('Error:', e.message); process.exit(1); });
