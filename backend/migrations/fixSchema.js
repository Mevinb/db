require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  logging: false,
});

const steps = [
  {
    name: 'Step 1: Drop circular FK (departments → faculties)',
    sql: `ALTER TABLE public.departments DROP CONSTRAINT IF EXISTS "departments_headOfDepartment_fkey";`,
  },
  {
    name: 'Step 2: Create ENUM types',
    sql: `
DO $$ BEGIN CREATE TYPE enum_users_role AS ENUM ('Admin', 'Faculty', 'Student'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "enum_users_profileModel" AS ENUM ('Faculty', 'Student'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE enum_faculties_designation AS ENUM ('Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'HOD', 'Dean', 'Visiting Faculty'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE enum_faculties_gender AS ENUM ('Male', 'Female', 'Other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE enum_students_gender AS ENUM ('Male', 'Female', 'Other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "enum_students_bloodGroup" AS ENUM ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE enum_students_status AS ENUM ('Active', 'Inactive', 'Graduated', 'Dropped', 'Suspended'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE enum_courses_type AS ENUM ('Theory', 'Practical', 'Theory+Practical', 'Project', 'Seminar'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE enum_enrollments_status AS ENUM ('Enrolled', 'Completed', 'Failed', 'Withdrawn', 'Repeat'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE enum_enrollments_grade AS ENUM ('O', 'A+', 'A', 'B+', 'B', 'C', 'D', 'F', 'Ab'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE enum_attendances_status AS ENUM ('Present', 'Absent', 'Late', 'Excused'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE enum_exams_type AS ENUM ('Internal', 'External', 'Practical', 'Viva', 'Assignment'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE enum_exams_category AS ENUM ('Mid Term', 'End Term', 'Unit Test', 'Lab Exam', 'Project'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE enum_exams_status AS ENUM ('Scheduled', 'Ongoing', 'Completed', 'Cancelled', 'Postponed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE enum_semesters_status AS ENUM ('Upcoming', 'Active', 'Completed', 'Archived'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "enum_programs_degreeType" AS ENUM ('B.Tech', 'M.Tech', 'BCA', 'MCA', 'B.Sc', 'M.Sc', 'BBA', 'MBA', 'B.Com', 'M.Com', 'PhD'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE enum_announcements_category AS ENUM ('General', 'Academic', 'Exam', 'Event', 'Holiday', 'Fee', 'Placement', 'Sports', 'Cultural'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE enum_announcements_priority AS ENUM ('Low', 'Normal', 'High', 'Urgent'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `,
  },
  {
    name: 'Step 3: Add CHECK constraints',
    sql: `
ALTER TABLE public.courses  DROP CONSTRAINT IF EXISTS chk_courses_enrollment_positive;
ALTER TABLE public.courses  ADD CONSTRAINT chk_courses_enrollment_positive  CHECK ("currentEnrollment" >= 0);
ALTER TABLE public.courses  DROP CONSTRAINT IF EXISTS chk_courses_enrollment_capacity;
ALTER TABLE public.courses  ADD CONSTRAINT chk_courses_enrollment_capacity  CHECK ("currentEnrollment" <= "maxCapacity");
ALTER TABLE public.courses  DROP CONSTRAINT IF EXISTS chk_courses_credits_positive;
ALTER TABLE public.courses  ADD CONSTRAINT chk_courses_credits_positive  CHECK (credits > 0);
ALTER TABLE public.marks    DROP CONSTRAINT IF EXISTS chk_marks_obtained_valid;
ALTER TABLE public.marks    ADD CONSTRAINT chk_marks_obtained_valid  CHECK ("marksObtained" >= 0 AND "marksObtained" <= "maxMarks");
ALTER TABLE public.marks    DROP CONSTRAINT IF EXISTS chk_marks_percentage_valid;
ALTER TABLE public.marks    ADD CONSTRAINT chk_marks_percentage_valid  CHECK (percentage >= 0 AND percentage <= 100);
ALTER TABLE public.enrollments DROP CONSTRAINT IF EXISTS chk_enrollment_attendance_valid;
ALTER TABLE public.enrollments ADD CONSTRAINT chk_enrollment_attendance_valid CHECK ("attendancePercentage" >= 0 AND "attendancePercentage" <= 100);
ALTER TABLE public.enrollments DROP CONSTRAINT IF EXISTS chk_enrollment_gradepoints_valid;
ALTER TABLE public.enrollments ADD CONSTRAINT chk_enrollment_gradepoints_valid CHECK ("gradePoints" >= 0 AND "gradePoints" <= 10);
ALTER TABLE public.students DROP CONSTRAINT IF EXISTS chk_students_cgpa_valid;
ALTER TABLE public.students ADD CONSTRAINT chk_students_cgpa_valid CHECK (cgpa >= 0 AND cgpa <= 10);
ALTER TABLE public.semesters DROP CONSTRAINT IF EXISTS chk_semesters_dates_valid;
ALTER TABLE public.semesters ADD CONSTRAINT chk_semesters_dates_valid CHECK ("startDate" < "endDate");
ALTER TABLE public.exams DROP CONSTRAINT IF EXISTS chk_exams_marks_valid;
ALTER TABLE public.exams ADD CONSTRAINT chk_exams_marks_valid CHECK ("passingMarks" < "maxMarks" AND "passingMarks" > 0);
    `,
  },
  {
    name: 'Step 4: Re-add circular FK as DEFERRABLE',
    sql: `
ALTER TABLE public.departments
  ADD CONSTRAINT "departments_headOfDepartment_fkey"
  FOREIGN KEY ("headOfDepartment")
  REFERENCES public.faculties(id)
  ON DELETE SET NULL
  DEFERRABLE INITIALLY DEFERRED;
    `,
  },
  {
    name: 'Step 5: Fix ON DELETE rules on all FKs',
    sql: `
-- announcements
ALTER TABLE public.announcements DROP CONSTRAINT IF EXISTS "announcements_createdBy_fkey";
ALTER TABLE public.announcements ADD CONSTRAINT "announcements_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON DELETE CASCADE;

-- attendances
ALTER TABLE public.attendances DROP CONSTRAINT IF EXISTS "attendances_studentId_fkey";
ALTER TABLE public.attendances ADD CONSTRAINT "attendances_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public.students(id) ON DELETE CASCADE;
ALTER TABLE public.attendances DROP CONSTRAINT IF EXISTS "attendances_courseId_fkey";
ALTER TABLE public.attendances ADD CONSTRAINT "attendances_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public.courses(id) ON DELETE CASCADE;
ALTER TABLE public.attendances DROP CONSTRAINT IF EXISTS "attendances_markedBy_fkey";
ALTER TABLE public.attendances ADD CONSTRAINT "attendances_markedBy_fkey" FOREIGN KEY ("markedBy") REFERENCES public.faculties(id) ON DELETE RESTRICT;

-- enrollments
ALTER TABLE public.enrollments DROP CONSTRAINT IF EXISTS "enrollments_studentId_fkey";
ALTER TABLE public.enrollments ADD CONSTRAINT "enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public.students(id) ON DELETE CASCADE;
ALTER TABLE public.enrollments DROP CONSTRAINT IF EXISTS "enrollments_courseId_fkey";
ALTER TABLE public.enrollments ADD CONSTRAINT "enrollments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public.courses(id) ON DELETE CASCADE;
ALTER TABLE public.enrollments DROP CONSTRAINT IF EXISTS "enrollments_semesterId_fkey";
ALTER TABLE public.enrollments ADD CONSTRAINT "enrollments_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES public.semesters(id) ON DELETE RESTRICT;

-- marks
ALTER TABLE public.marks DROP CONSTRAINT IF EXISTS "marks_studentId_fkey";
ALTER TABLE public.marks ADD CONSTRAINT "marks_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public.students(id) ON DELETE CASCADE;
ALTER TABLE public.marks DROP CONSTRAINT IF EXISTS "marks_courseId_fkey";
ALTER TABLE public.marks ADD CONSTRAINT "marks_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public.courses(id) ON DELETE CASCADE;
ALTER TABLE public.marks DROP CONSTRAINT IF EXISTS "marks_examId_fkey";
ALTER TABLE public.marks ADD CONSTRAINT "marks_examId_fkey" FOREIGN KEY ("examId") REFERENCES public.exams(id) ON DELETE CASCADE;
ALTER TABLE public.marks DROP CONSTRAINT IF EXISTS "marks_enteredBy_fkey";
ALTER TABLE public.marks ADD CONSTRAINT "marks_enteredBy_fkey" FOREIGN KEY ("enteredBy") REFERENCES public.faculties(id) ON DELETE SET NULL;

-- courses
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS "courses_facultyId_fkey";
ALTER TABLE public.courses ADD CONSTRAINT "courses_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES public.faculties(id) ON DELETE SET NULL;

-- students
ALTER TABLE public.students DROP CONSTRAINT IF EXISTS "students_userId_fkey";
ALTER TABLE public.students ADD CONSTRAINT "students_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE SET NULL;

-- faculties
ALTER TABLE public.faculties DROP CONSTRAINT IF EXISTS "faculties_userId_fkey";
ALTER TABLE public.faculties ADD CONSTRAINT "faculties_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE SET NULL;

-- courses remaining FKs
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS "courses_departmentId_fkey";
ALTER TABLE public.courses ADD CONSTRAINT "courses_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES public.departments(id) ON DELETE RESTRICT;
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS "courses_programId_fkey";
ALTER TABLE public.courses ADD CONSTRAINT "courses_programId_fkey" FOREIGN KEY ("programId") REFERENCES public.programs(id) ON DELETE RESTRICT;
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS "courses_semesterId_fkey";
ALTER TABLE public.courses ADD CONSTRAINT "courses_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES public.semesters(id) ON DELETE RESTRICT;

-- faculties
ALTER TABLE public.faculties DROP CONSTRAINT IF EXISTS "faculties_departmentId_fkey";
ALTER TABLE public.faculties ADD CONSTRAINT "faculties_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES public.departments(id) ON DELETE RESTRICT;

-- students
ALTER TABLE public.students DROP CONSTRAINT IF EXISTS "students_programId_fkey";
ALTER TABLE public.students ADD CONSTRAINT "students_programId_fkey" FOREIGN KEY ("programId") REFERENCES public.programs(id) ON DELETE RESTRICT;
ALTER TABLE public.students DROP CONSTRAINT IF EXISTS "students_departmentId_fkey";
ALTER TABLE public.students ADD CONSTRAINT "students_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES public.departments(id) ON DELETE RESTRICT;

-- exams
ALTER TABLE public.exams DROP CONSTRAINT IF EXISTS "exams_courseId_fkey";
ALTER TABLE public.exams ADD CONSTRAINT "exams_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public.courses(id) ON DELETE CASCADE;
ALTER TABLE public.exams DROP CONSTRAINT IF EXISTS "exams_semesterId_fkey";
ALTER TABLE public.exams ADD CONSTRAINT "exams_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES public.semesters(id) ON DELETE RESTRICT;

-- programs
ALTER TABLE public.programs DROP CONSTRAINT IF EXISTS "programs_departmentId_fkey";
ALTER TABLE public.programs ADD CONSTRAINT "programs_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES public.departments(id) ON DELETE RESTRICT;
    `,
  },
  {
    name: 'Step 6: Add indexes on foreign key columns',
    sql: `
CREATE INDEX IF NOT EXISTS idx_students_programId    ON public.students("programId");
CREATE INDEX IF NOT EXISTS idx_students_departmentId ON public.students("departmentId");
CREATE INDEX IF NOT EXISTS idx_students_userId       ON public.students("userId");
CREATE INDEX IF NOT EXISTS idx_students_status       ON public.students("status");
CREATE INDEX IF NOT EXISTS idx_faculties_departmentId ON public.faculties("departmentId");
CREATE INDEX IF NOT EXISTS idx_faculties_userId       ON public.faculties("userId");
CREATE INDEX IF NOT EXISTS idx_courses_departmentId  ON public.courses("departmentId");
CREATE INDEX IF NOT EXISTS idx_courses_programId     ON public.courses("programId");
CREATE INDEX IF NOT EXISTS idx_courses_semesterId    ON public.courses("semesterId");
CREATE INDEX IF NOT EXISTS idx_courses_facultyId     ON public.courses("facultyId");
CREATE INDEX IF NOT EXISTS idx_enrollments_studentId ON public.enrollments("studentId");
CREATE INDEX IF NOT EXISTS idx_enrollments_courseId  ON public.enrollments("courseId");
CREATE INDEX IF NOT EXISTS idx_enrollments_semesterId ON public.enrollments("semesterId");
CREATE INDEX IF NOT EXISTS idx_enrollments_status    ON public.enrollments("status");
CREATE INDEX IF NOT EXISTS idx_attendances_studentId ON public.attendances("studentId");
CREATE INDEX IF NOT EXISTS idx_attendances_courseId  ON public.attendances("courseId");
CREATE INDEX IF NOT EXISTS idx_attendances_date      ON public.attendances("date");
CREATE INDEX IF NOT EXISTS idx_attendances_markedBy  ON public.attendances("markedBy");
CREATE INDEX IF NOT EXISTS idx_marks_studentId ON public.marks("studentId");
CREATE INDEX IF NOT EXISTS idx_marks_courseId  ON public.marks("courseId");
CREATE INDEX IF NOT EXISTS idx_marks_examId    ON public.marks("examId");
CREATE INDEX IF NOT EXISTS idx_exams_courseId  ON public.exams("courseId");
CREATE INDEX IF NOT EXISTS idx_exams_semesterId ON public.exams("semesterId");
CREATE INDEX IF NOT EXISTS idx_programs_departmentId ON public.programs("departmentId");
CREATE INDEX IF NOT EXISTS idx_announcements_createdBy ON public.announcements("createdBy");
CREATE INDEX IF NOT EXISTS idx_announcements_isActive  ON public.announcements("isActive");
    `,
  },
  {
    name: 'Step 7: Add UNIQUE constraints',
    sql: `
ALTER TABLE public.enrollments DROP CONSTRAINT IF EXISTS uq_enrollment_student_course_semester;
ALTER TABLE public.enrollments ADD CONSTRAINT uq_enrollment_student_course_semester UNIQUE ("studentId", "courseId", "semesterId");
ALTER TABLE public.attendances DROP CONSTRAINT IF EXISTS uq_attendance_student_course_date;
ALTER TABLE public.attendances ADD CONSTRAINT uq_attendance_student_course_date UNIQUE ("studentId", "courseId", "date");
ALTER TABLE public.marks DROP CONSTRAINT IF EXISTS uq_marks_student_exam;
ALTER TABLE public.marks ADD CONSTRAINT uq_marks_student_exam UNIQUE ("studentId", "examId");
    `,
  },
];

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Connected to Supabase\n');

    for (const step of steps) {
      try {
        await sequelize.query(step.sql);
        console.log(`✓ ${step.name}`);
      } catch (err) {
        console.error(`✗ ${step.name}`);
        console.error(`  Error: ${err.message}\n`);
      }
    }

    // Verification
    console.log('\n--- Verification ---');
    const [constraints] = await sequelize.query(`
      SELECT COUNT(*) as count FROM information_schema.table_constraints
      WHERE constraint_schema = 'public'
        AND constraint_type IN ('FOREIGN KEY', 'CHECK', 'UNIQUE');
    `);
    console.log(`✓ Total constraints in DB: ${constraints[0].count}`);

    const [indexes] = await sequelize.query(`
      SELECT COUNT(*) as count FROM pg_indexes
      WHERE schemaname = 'public' AND indexname LIKE 'idx_%';
    `);
    console.log(`✓ Custom indexes: ${indexes[0].count}`);

    const [enums] = await sequelize.query(`
      SELECT COUNT(*) as count FROM pg_type
      WHERE typtype = 'e' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    `);
    console.log(`✓ ENUM types: ${enums[0].count}`);

    console.log('\n✅ Schema fix complete!');
  } catch (err) {
    console.error('Fatal error:', err.message);
  } finally {
    await sequelize.close();
  }
})();
