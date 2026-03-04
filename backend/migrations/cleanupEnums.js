require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  logging: false,
});

// These lowercase ones are duplicates — columns actually use the camelCase originals created by Sequelize
const dupes = [
  'enum_programs_degreetype',
  'enum_students_bloodgroup',
  'enum_users_profilemodel',
];

(async () => {
  await sequelize.authenticate();
  for (const t of dupes) {
    try {
      await sequelize.query(`DROP TYPE IF EXISTS public.${t}`);
      console.log(`Dropped duplicate: ${t}`);
    } catch (e) {
      console.log(`Skip ${t}: ${e.message}`);
    }
  }
  // Confirm remaining
  const [enums] = await sequelize.query(`
    SELECT typname FROM pg_type
    WHERE typtype = 'e'
      AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ORDER BY typname;
  `);
  console.log(`\nRemaining ENUM types (${enums.length}):`);
  enums.forEach(r => console.log(`  ${r.typname}`));
  await sequelize.close();
})().catch(e => { console.error(e.message); process.exit(1); });
