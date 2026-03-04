require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  logging: false,
});

const views = [
  {
    name: 'v_student_report',
    sql: `
CREATE OR REPLACE VIEW public.v_student_report AS
SELECT
  s.id            AS student_id,
  s."rollNumber",
  s.name          AS student_name,
  s.email         AS student_email,
  s."currentSemester",
  s.cgpa,
  s."totalCreditsEarned",
  s.status        AS student_status,
  d.name          AS department_name,
  p.name          AS program_name,
  p."degreeType",
  c.id            AS course_id,
  c.name          AS course_name,
  c.code          AS course_code,
  c.credits,
  sem.name        AS semester_name,
  sem."academicYear",
  e."enrollmentDate",
  e.status        AS enrollment_status,
  e.grade,
  e."gradePoints",
  e."attendancePercentage",
  e."internalMarks",
  e."externalMarks",
  e."totalMarks"
FROM public.students s
JOIN public.departments d   ON d.id = s."departmentId"
JOIN public.programs p      ON p.id = s."programId"
LEFT JOIN public.enrollments e ON e."studentId" = s.id
LEFT JOIN public.courses c  ON c.id = e."courseId"
LEFT JOIN public.semesters sem ON sem.id = e."semesterId";
    `,
  },
  {
    name: 'v_course_summary',
    sql: `
CREATE OR REPLACE VIEW public.v_course_summary AS
SELECT
  c.id            AS course_id,
  c.code          AS course_code,
  c.name          AS course_name,
  c.type          AS course_type,
  c.credits,
  c."maxCapacity",
  c."currentEnrollment",
  c."maxCapacity" - c."currentEnrollment" AS seats_available,
  c."isActive",
  d.name          AS department_name,
  p.name          AS program_name,
  sem.name        AS semester_name,
  sem."academicYear",
  sem."isCurrent"  AS is_current_semester,
  f.name          AS faculty_name,
  f."employeeId"  AS faculty_employee_id,
  f.designation   AS faculty_designation,
  COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'Enrolled') AS active_enrollments,
  COUNT(DISTINCT ex.id) AS total_exams,
  ROUND(AVG(e."attendancePercentage"), 2) AS avg_attendance_pct
FROM public.courses c
JOIN public.departments d   ON d.id = c."departmentId"
JOIN public.programs p      ON p.id = c."programId"
JOIN public.semesters sem   ON sem.id = c."semesterId"
LEFT JOIN public.faculties f ON f.id = c."facultyId"
LEFT JOIN public.enrollments e ON e."courseId" = c.id
LEFT JOIN public.exams ex   ON ex."courseId" = c.id
GROUP BY c.id, d.name, p.name, sem.name, sem."academicYear", sem."isCurrent",
         f.name, f."employeeId", f.designation;
    `,
  },
  {
    name: 'v_faculty_workload',
    sql: `
CREATE OR REPLACE VIEW public.v_faculty_workload AS
SELECT
  f.id              AS faculty_id,
  f."employeeId",
  f.name            AS faculty_name,
  f.email,
  f.designation,
  f.specialization,
  d.name            AS department_name,
  COUNT(DISTINCT c.id)  AS total_courses,
  SUM(c.credits)        AS total_credit_hours,
  COUNT(DISTINCT e."studentId") AS total_students,
  COUNT(DISTINCT ex.id) AS total_exams_created,
  COUNT(DISTINCT a.id)  AS total_attendance_records
FROM public.faculties f
JOIN public.departments d   ON d.id = f."departmentId"
LEFT JOIN public.courses c  ON c."facultyId" = f.id AND c."isActive" = true
LEFT JOIN public.enrollments e ON e."courseId" = c.id
LEFT JOIN public.exams ex   ON ex."courseId" = c.id
LEFT JOIN public.attendances a ON a."markedBy" = f.id
GROUP BY f.id, d.name;
    `,
  },
  {
    name: 'v_attendance_summary',
    sql: `
CREATE OR REPLACE VIEW public.v_attendance_summary AS
SELECT
  s.id            AS student_id,
  s."rollNumber",
  s.name          AS student_name,
  c.id            AS course_id,
  c.code          AS course_code,
  c.name          AS course_name,
  sem.name        AS semester_name,
  COUNT(a.id)                                           AS total_classes,
  COUNT(a.id) FILTER (WHERE a.status = 'Present')      AS present,
  COUNT(a.id) FILTER (WHERE a.status = 'Absent')       AS absent,
  COUNT(a.id) FILTER (WHERE a.status = 'Late')         AS late,
  COUNT(a.id) FILTER (WHERE a.status = 'Excused')      AS excused,
  ROUND(
    CASE WHEN COUNT(a.id) > 0
         THEN COUNT(a.id) FILTER (WHERE a.status IN ('Present','Late'))::numeric / COUNT(a.id) * 100
         ELSE 0 END, 2
  ) AS attendance_percentage,
  CASE
    WHEN COUNT(a.id) = 0 THEN 'No Data'
    WHEN ROUND(COUNT(a.id) FILTER (WHERE a.status IN ('Present','Late'))::numeric / COUNT(a.id) * 100, 2) >= 75 THEN 'Eligible'
    ELSE 'Shortage'
  END AS eligibility_status
FROM public.students s
JOIN public.enrollments e   ON e."studentId" = s.id
JOIN public.courses c       ON c.id = e."courseId"
JOIN public.semesters sem   ON sem.id = e."semesterId"
LEFT JOIN public.attendances a ON a."studentId" = s.id AND a."courseId" = c.id
GROUP BY s.id, s."rollNumber", s.name, c.id, c.code, c.name, sem.name;
    `,
  },
  {
    name: 'v_exam_results',
    sql: `
CREATE OR REPLACE VIEW public.v_exam_results AS
SELECT
  ex.id           AS exam_id,
  ex.name         AS exam_name,
  ex.type         AS exam_type,
  ex.category     AS exam_category,
  ex."maxMarks",
  ex."passingMarks",
  ex.date         AS exam_date,
  ex.status       AS exam_status,
  c.code          AS course_code,
  c.name          AS course_name,
  sem.name        AS semester_name,
  sem."academicYear",
  s.id            AS student_id,
  s."rollNumber",
  s.name          AS student_name,
  m."marksObtained",
  m."maxMarks"    AS marks_max,
  m.percentage,
  m.grade,
  m."isPassed",
  m."isPublished",
  RANK() OVER (PARTITION BY ex.id ORDER BY m."marksObtained" DESC NULLS LAST) AS rank_in_exam
FROM public.exams ex
JOIN public.courses c     ON c.id = ex."courseId"
JOIN public.semesters sem ON sem.id = ex."semesterId"
LEFT JOIN public.marks m  ON m."examId" = ex.id
LEFT JOIN public.students s ON s.id = m."studentId";
    `,
  },
  {
    name: 'v_department_overview',
    sql: `
CREATE OR REPLACE VIEW public.v_department_overview AS
SELECT
  d.id              AS department_id,
  d.code,
  d.name            AS department_name,
  d."establishedYear",
  d."isActive",
  hod.name          AS head_of_department,
  hod.email         AS hod_email,
  hod.designation   AS hod_designation,
  COUNT(DISTINCT f.id)  AS total_faculty,
  COUNT(DISTINCT s.id)  AS total_students,
  COUNT(DISTINCT p.id)  AS total_programs,
  COUNT(DISTINCT c.id) FILTER (WHERE c."isActive" = true) AS active_courses,
  ROUND(AVG(s.cgpa), 2) AS avg_student_cgpa
FROM public.departments d
LEFT JOIN public.faculties hod ON hod.id = d."headOfDepartment"
LEFT JOIN public.faculties f   ON f."departmentId" = d.id AND f."isActive" = true
LEFT JOIN public.students s    ON s."departmentId" = d.id AND s.status = 'Active'
LEFT JOIN public.programs p    ON p."departmentId" = d.id AND p."isActive" = true
LEFT JOIN public.courses c     ON c."departmentId" = d.id
GROUP BY d.id, hod.name, hod.email, hod.designation;
    `,
  },
  {
    name: 'v_marks_summary',
    sql: `
CREATE OR REPLACE VIEW public.v_marks_summary AS
SELECT
  s.id            AS student_id,
  s."rollNumber",
  s.name          AS student_name,
  c.id            AS course_id,
  c.code          AS course_code,
  c.name          AS course_name,
  sem.name        AS semester_name,
  COUNT(m.id)                                           AS total_exams_appeared,
  ROUND(AVG(m.percentage), 2)                          AS avg_percentage,
  MAX(m."marksObtained")                               AS highest_marks,
  MIN(m."marksObtained")                               AS lowest_marks,
  COUNT(m.id) FILTER (WHERE m."isPassed" = true)       AS exams_passed,
  COUNT(m.id) FILTER (WHERE m."isPassed" = false)      AS exams_failed,
  e."attendancePercentage",
  e.grade         AS final_grade,
  e."gradePoints",
  e.status        AS enrollment_status
FROM public.students s
JOIN public.enrollments e   ON e."studentId" = s.id
JOIN public.courses c       ON c.id = e."courseId"
JOIN public.semesters sem   ON sem.id = e."semesterId"
LEFT JOIN public.marks m    ON m."studentId" = s.id AND m."courseId" = c.id
GROUP BY s.id, s."rollNumber", s.name, c.id, c.code, c.name,
         sem.name, e."attendancePercentage", e.grade, e."gradePoints", e.status;
    `,
  },
];

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Connected to Supabase\n');

    for (const v of views) {
      try {
        await sequelize.query(v.sql);
        console.log(`✓ Created view: ${v.name}`);
      } catch (err) {
        console.error(`✗ Failed: ${v.name} — ${err.message}`);
      }
    }

    // Verify
    const [result] = await sequelize.query(`
      SELECT table_name
      FROM information_schema.views
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log(`\n--- Verification: ${result.length} views in DB ---`);
    result.forEach(r => console.log(`  • ${r.table_name}`));

    // Quick row count test for each view
    console.log('\n--- Row counts ---');
    for (const r of result) {
      try {
        const [[row]] = await sequelize.query(`SELECT COUNT(*) AS c FROM public.${r.table_name}`);
        console.log(`  ${r.table_name.padEnd(30)} ${row.c} rows`);
      } catch (e) {
        console.log(`  ${r.table_name.padEnd(30)} ERROR: ${e.message}`);
      }
    }

    console.log('\n✅ All views created and verified!');
  } catch (err) {
    console.error('Fatal:', err.message);
  } finally {
    await sequelize.close();
  }
})();
