-- ============================================================
-- College Management System - PostgreSQL Functions & Triggers
-- For Supabase Database
-- ============================================================
-- This migration creates database-level functions, triggers,
-- and stored procedures that appear in the Supabase Dashboard
-- under Database > Functions and Database > Triggers.
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. UTILITY FUNCTIONS
-- ============================================================

-- 1a. Function to auto-update "updatedAt" timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1b. Function to generate a formatted academic code
CREATE OR REPLACE FUNCTION generate_academic_code(prefix TEXT, seq_num INTEGER)
RETURNS TEXT AS $$
BEGIN
    RETURN prefix || '-' || LPAD(seq_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 2. MARK / GRADE FUNCTIONS & TRIGGERS
-- ============================================================

-- 2a. Function: Calculate grade from percentage
CREATE OR REPLACE FUNCTION calculate_grade(percentage NUMERIC)
RETURNS VARCHAR(2) AS $$
BEGIN
    IF percentage >= 90 THEN RETURN 'A+';
    ELSIF percentage >= 80 THEN RETURN 'A';
    ELSIF percentage >= 70 THEN RETURN 'B+';
    ELSIF percentage >= 60 THEN RETURN 'B';
    ELSIF percentage >= 50 THEN RETURN 'C+';
    ELSIF percentage >= 45 THEN RETURN 'C';
    ELSIF percentage >= 40 THEN RETURN 'D';
    ELSE RETURN 'F';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 2b. Function: Calculate grade points from letter grade
CREATE OR REPLACE FUNCTION calculate_grade_points(grade VARCHAR)
RETURNS NUMERIC AS $$
BEGIN
    CASE grade
        WHEN 'A+' THEN RETURN 10;
        WHEN 'A'  THEN RETURN 9;
        WHEN 'B+' THEN RETURN 8;
        WHEN 'B'  THEN RETURN 7;
        WHEN 'C+' THEN RETURN 6;
        WHEN 'C'  THEN RETURN 5;
        WHEN 'D'  THEN RETURN 4;
        WHEN 'F'  THEN RETURN 0;
        WHEN 'I'  THEN RETURN 0;
        WHEN 'W'  THEN RETURN 0;
        ELSE RETURN 0;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- 2c. Trigger function: Auto-calculate percentage, grade, isPassed on marks insert/update
CREATE OR REPLACE FUNCTION trg_calculate_mark_fields()
RETURNS TRIGGER AS $$
DECLARE
    v_max_marks NUMERIC;
    v_passing_marks NUMERIC;
    v_percentage NUMERIC;
BEGIN
    -- Get max marks from the related exam
    SELECT "maxMarks", "passingMarks" 
    INTO v_max_marks, v_passing_marks
    FROM exams WHERE id = NEW."examId";

    -- Set maxMarks from exam if not provided
    IF NEW."maxMarks" IS NULL OR NEW."maxMarks" = 0 THEN
        NEW."maxMarks" = v_max_marks;
    END IF;

    -- Calculate percentage
    IF NEW."maxMarks" > 0 THEN
        v_percentage := ROUND((NEW."marksObtained"::NUMERIC / NEW."maxMarks"::NUMERIC) * 100);
    ELSE
        v_percentage := 0;
    END IF;
    NEW.percentage = v_percentage;

    -- Calculate grade using the grade function
    NEW.grade = calculate_grade(v_percentage);

    -- Determine pass/fail
    IF v_passing_marks IS NOT NULL THEN
        NEW."isPassed" = (NEW."marksObtained" >= v_passing_marks);
    ELSE
        NEW."isPassed" = (v_percentage >= 40);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on marks table
DROP TRIGGER IF EXISTS trg_marks_auto_calculate ON marks;
CREATE TRIGGER trg_marks_auto_calculate
    BEFORE INSERT OR UPDATE OF "marksObtained"
    ON marks
    FOR EACH ROW
    EXECUTE FUNCTION trg_calculate_mark_fields();


-- ============================================================
-- 3. ENROLLMENT FUNCTIONS & TRIGGERS
-- ============================================================

-- 3a. Trigger function: Update course enrollment count on enrollment changes
CREATE OR REPLACE FUNCTION trg_update_course_enrollment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE courses 
        SET "currentEnrollment" = (
            SELECT COUNT(*) FROM enrollments 
            WHERE "courseId" = NEW."courseId" AND status = 'Enrolled'
        )
        WHERE id = NEW."courseId";
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Update old course count if courseId changed
        IF OLD."courseId" IS DISTINCT FROM NEW."courseId" THEN
            UPDATE courses 
            SET "currentEnrollment" = (
                SELECT COUNT(*) FROM enrollments 
                WHERE "courseId" = OLD."courseId" AND status = 'Enrolled'
            )
            WHERE id = OLD."courseId";
        END IF;
        -- Update new course count
        UPDATE courses 
        SET "currentEnrollment" = (
            SELECT COUNT(*) FROM enrollments 
            WHERE "courseId" = NEW."courseId" AND status = 'Enrolled'
        )
        WHERE id = NEW."courseId";
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE courses 
        SET "currentEnrollment" = (
            SELECT COUNT(*) FROM enrollments 
            WHERE "courseId" = OLD."courseId" AND status = 'Enrolled'
        )
        WHERE id = OLD."courseId";
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on enrollments table
DROP TRIGGER IF EXISTS trg_enrollment_count_update ON enrollments;
CREATE TRIGGER trg_enrollment_count_update
    AFTER INSERT OR UPDATE OR DELETE
    ON enrollments
    FOR EACH ROW
    EXECUTE FUNCTION trg_update_course_enrollment_count();


-- 3b. Function: Check enrollment capacity before allowing enrollment
CREATE OR REPLACE FUNCTION trg_check_enrollment_capacity()
RETURNS TRIGGER AS $$
DECLARE
    v_max_capacity INTEGER;
    v_current_count INTEGER;
BEGIN
    SELECT "maxCapacity" INTO v_max_capacity FROM courses WHERE id = NEW."courseId";
    SELECT COUNT(*) INTO v_current_count FROM enrollments 
    WHERE "courseId" = NEW."courseId" AND status = 'Enrolled';
    
    IF v_current_count >= v_max_capacity THEN
        RAISE EXCEPTION 'Course enrollment capacity (%) has been reached', v_max_capacity;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to check capacity before enrollment
DROP TRIGGER IF EXISTS trg_enrollment_capacity_check ON enrollments;
CREATE TRIGGER trg_enrollment_capacity_check
    BEFORE INSERT
    ON enrollments
    FOR EACH ROW
    EXECUTE FUNCTION trg_check_enrollment_capacity();


-- ============================================================
-- 4. ATTENDANCE FUNCTIONS & TRIGGERS
-- ============================================================

-- 4a. Function: Calculate attendance percentage for a student in a course
CREATE OR REPLACE FUNCTION calculate_attendance_percentage(
    p_student_id INTEGER,
    p_course_id INTEGER
)
RETURNS NUMERIC AS $$
DECLARE
    v_total INTEGER;
    v_present INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total
    FROM attendances
    WHERE "studentId" = p_student_id AND "courseId" = p_course_id;

    IF v_total = 0 THEN
        RETURN 0;
    END IF;

    SELECT COUNT(*) INTO v_present
    FROM attendances
    WHERE "studentId" = p_student_id 
      AND "courseId" = p_course_id
      AND status IN ('Present', 'Late');

    RETURN ROUND((v_present::NUMERIC / v_total::NUMERIC) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- 4b. Trigger function: Update enrollment attendance percentage after attendance change
CREATE OR REPLACE FUNCTION trg_update_enrollment_attendance()
RETURNS TRIGGER AS $$
DECLARE
    v_attendance_pct NUMERIC;
    v_student_id INTEGER;
    v_course_id INTEGER;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_student_id := OLD."studentId";
        v_course_id := OLD."courseId";
    ELSE
        v_student_id := NEW."studentId";
        v_course_id := NEW."courseId";
    END IF;

    -- Calculate the new attendance percentage using our function
    v_attendance_pct := calculate_attendance_percentage(v_student_id, v_course_id);

    -- Update the enrollment record
    UPDATE enrollments 
    SET "attendancePercentage" = v_attendance_pct
    WHERE "studentId" = v_student_id 
      AND "courseId" = v_course_id
      AND status = 'Enrolled';

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on attendances table
DROP TRIGGER IF EXISTS trg_attendance_update_enrollment ON attendances;
CREATE TRIGGER trg_attendance_update_enrollment
    AFTER INSERT OR UPDATE OR DELETE
    ON attendances
    FOR EACH ROW
    EXECUTE FUNCTION trg_update_enrollment_attendance();


-- ============================================================
-- 5. STUDENT CGPA FUNCTIONS & TRIGGERS
-- ============================================================

-- 5a. Function: Calculate and return CGPA for a student
CREATE OR REPLACE FUNCTION calculate_student_cgpa(p_student_id INTEGER)
RETURNS NUMERIC AS $$
DECLARE
    v_total_credits NUMERIC := 0;
    v_weighted_points NUMERIC := 0;
    v_cgpa NUMERIC;
    rec RECORD;
BEGIN
    FOR rec IN
        SELECT e."gradePoints", c.credits
        FROM enrollments e
        JOIN courses c ON c.id = e."courseId"
        WHERE e."studentId" = p_student_id
          AND e.status = 'Completed'
          AND e."gradePoints" IS NOT NULL
    LOOP
        v_weighted_points := v_weighted_points + (rec."gradePoints" * rec.credits);
        v_total_credits := v_total_credits + rec.credits;
    END LOOP;

    IF v_total_credits = 0 THEN
        RETURN 0;
    END IF;

    v_cgpa := ROUND(v_weighted_points / v_total_credits, 2);
    RETURN v_cgpa;
END;
$$ LANGUAGE plpgsql;

-- 5b. Trigger function: Auto-update student CGPA when enrollment grade changes
CREATE OR REPLACE FUNCTION trg_update_student_cgpa()
RETURNS TRIGGER AS $$
DECLARE
    v_cgpa NUMERIC;
    v_total_credits INTEGER;
BEGIN
    -- Calculate new CGPA
    v_cgpa := calculate_student_cgpa(NEW."studentId");

    -- Calculate total credits earned
    SELECT COALESCE(SUM(c.credits), 0) INTO v_total_credits
    FROM enrollments e
    JOIN courses c ON c.id = e."courseId"
    WHERE e."studentId" = NEW."studentId"
      AND e.status = 'Completed'
      AND e.grade IS NOT NULL
      AND e.grade NOT IN ('F', 'I', 'W');

    -- Update student record
    UPDATE students 
    SET cgpa = v_cgpa,
        "totalCreditsEarned" = v_total_credits
    WHERE id = NEW."studentId";

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on enrollments table for CGPA update
DROP TRIGGER IF EXISTS trg_enrollment_cgpa_update ON enrollments;
CREATE TRIGGER trg_enrollment_cgpa_update
    AFTER UPDATE OF grade, "gradePoints", status
    ON enrollments
    FOR EACH ROW
    WHEN (NEW.status = 'Completed')
    EXECUTE FUNCTION trg_update_student_cgpa();


-- ============================================================
-- 6. DASHBOARD / STATISTICS FUNCTIONS
-- ============================================================

-- 6a. Function: Get admin dashboard overview statistics
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'totalStudents', (SELECT COUNT(*) FROM students),
        'totalFaculty', (SELECT COUNT(*) FROM faculties),
        'totalDepartments', (SELECT COUNT(*) FROM departments),
        'totalPrograms', (SELECT COUNT(*) FROM programs),
        'totalCourses', (SELECT COUNT(*) FROM courses),
        'activeStudents', (SELECT COUNT(*) FROM students WHERE status = 'Active'),
        'activeFaculty', (SELECT COUNT(*) FROM faculties WHERE "isActive" = true),
        'activeSemesters', (SELECT COUNT(*) FROM semesters WHERE "isCurrent" = true),
        'totalEnrollments', (SELECT COUNT(*) FROM enrollments),
        'totalExams', (SELECT COUNT(*) FROM exams)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 6b. Function: Get department-wise statistics
CREATE OR REPLACE FUNCTION get_department_statistics()
RETURNS TABLE(
    department_id INTEGER,
    department_name VARCHAR,
    department_code VARCHAR,
    student_count BIGINT,
    faculty_count BIGINT,
    program_count BIGINT,
    course_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id AS department_id,
        d.name::VARCHAR AS department_name,
        d.code::VARCHAR AS department_code,
        (SELECT COUNT(*) FROM students s WHERE s."departmentId" = d.id) AS student_count,
        (SELECT COUNT(*) FROM faculties f WHERE f."departmentId" = d.id) AS faculty_count,
        (SELECT COUNT(*) FROM programs p WHERE p."departmentId" = d.id) AS program_count,
        (SELECT COUNT(*) FROM courses c WHERE c."departmentId" = d.id) AS course_count
    FROM departments d
    WHERE d."isActive" = true
    ORDER BY d.name;
END;
$$ LANGUAGE plpgsql;

-- 6c. Function: Get student academic summary
CREATE OR REPLACE FUNCTION get_student_academic_summary(p_student_id INTEGER)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'studentId', s.id,
        'name', s.name,
        'rollNumber', s."rollNumber",
        'cgpa', s.cgpa,
        'totalCreditsEarned', s."totalCreditsEarned",
        'currentSemester', s."currentSemester",
        'status', s.status,
        'totalCoursesEnrolled', (
            SELECT COUNT(*) FROM enrollments e WHERE e."studentId" = p_student_id
        ),
        'completedCourses', (
            SELECT COUNT(*) FROM enrollments e 
            WHERE e."studentId" = p_student_id AND e.status = 'Completed'
        ),
        'averageAttendance', (
            SELECT COALESCE(ROUND(AVG(e."attendancePercentage"), 2), 0) 
            FROM enrollments e 
            WHERE e."studentId" = p_student_id AND e.status = 'Enrolled'
        ),
        'averageMarks', (
            SELECT COALESCE(ROUND(AVG(m.percentage), 2), 0) 
            FROM marks m WHERE m."studentId" = p_student_id
        )
    ) INTO result
    FROM students s
    WHERE s.id = p_student_id;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 6d. Function: Get faculty course summary
CREATE OR REPLACE FUNCTION get_faculty_course_summary(p_faculty_id INTEGER)
RETURNS TABLE(
    course_id INTEGER,
    course_name VARCHAR,
    course_code VARCHAR,
    enrolled_students BIGINT,
    avg_attendance NUMERIC,
    total_exams BIGINT,
    avg_marks NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id AS course_id,
        c.name::VARCHAR AS course_name,
        c.code::VARCHAR AS course_code,
        (SELECT COUNT(*) FROM enrollments e WHERE e."courseId" = c.id AND e.status = 'Enrolled') AS enrolled_students,
        (SELECT COALESCE(ROUND(AVG(e."attendancePercentage"), 2), 0) 
         FROM enrollments e WHERE e."courseId" = c.id AND e.status = 'Enrolled') AS avg_attendance,
        (SELECT COUNT(*) FROM exams ex WHERE ex."courseId" = c.id) AS total_exams,
        (SELECT COALESCE(ROUND(AVG(m.percentage), 2), 0) 
         FROM marks m WHERE m."courseId" = c.id) AS avg_marks
    FROM courses c
    WHERE c."facultyId" = p_faculty_id AND c."isActive" = true
    ORDER BY c.name;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 7. STORED PROCEDURES (using PROCEDURE syntax)
-- ============================================================

-- 7a. Procedure: Enroll a student in a course with validation
CREATE OR REPLACE PROCEDURE enroll_student(
    p_student_id INTEGER,
    p_course_id INTEGER,
    p_semester_id INTEGER,
    OUT p_enrollment_id INTEGER,
    OUT p_message TEXT
)
LANGUAGE plpgsql AS $$
DECLARE
    v_existing INTEGER;
    v_student_status VARCHAR;
    v_course_active BOOLEAN;
    v_max_capacity INTEGER;
    v_current_count INTEGER;
BEGIN
    -- Check student status
    SELECT status INTO v_student_status FROM students WHERE id = p_student_id;
    IF v_student_status IS NULL THEN
        p_message := 'Student not found';
        p_enrollment_id := NULL;
        RETURN;
    END IF;
    IF v_student_status <> 'Active' THEN
        p_message := 'Student is not active (status: ' || v_student_status || ')';
        p_enrollment_id := NULL;
        RETURN;
    END IF;

    -- Check course is active
    SELECT "isActive", "maxCapacity" INTO v_course_active, v_max_capacity 
    FROM courses WHERE id = p_course_id;
    IF v_course_active IS NULL THEN
        p_message := 'Course not found';
        p_enrollment_id := NULL;
        RETURN;
    END IF;
    IF NOT v_course_active THEN
        p_message := 'Course is not active';
        p_enrollment_id := NULL;
        RETURN;
    END IF;

    -- Check duplicate enrollment
    SELECT id INTO v_existing FROM enrollments 
    WHERE "studentId" = p_student_id 
      AND "courseId" = p_course_id 
      AND "semesterId" = p_semester_id;
    IF v_existing IS NOT NULL THEN
        p_message := 'Student is already enrolled in this course for this semester';
        p_enrollment_id := v_existing;
        RETURN;
    END IF;

    -- Check capacity
    SELECT COUNT(*) INTO v_current_count FROM enrollments 
    WHERE "courseId" = p_course_id AND status = 'Enrolled';
    IF v_current_count >= v_max_capacity THEN
        p_message := 'Course has reached maximum capacity (' || v_max_capacity || ')';
        p_enrollment_id := NULL;
        RETURN;
    END IF;

    -- Create enrollment
    INSERT INTO enrollments ("studentId", "courseId", "semesterId", "enrollmentDate", status, "createdAt", "updatedAt")
    VALUES (p_student_id, p_course_id, p_semester_id, CURRENT_DATE, 'Enrolled', NOW(), NOW())
    RETURNING id INTO p_enrollment_id;

    p_message := 'Student enrolled successfully';
END;
$$;

-- 7b. Procedure: Update enrollment grade and auto-calculate grade points
CREATE OR REPLACE PROCEDURE update_enrollment_grade(
    p_enrollment_id INTEGER,
    p_grade VARCHAR,
    OUT p_message TEXT
)
LANGUAGE plpgsql AS $$
DECLARE
    v_grade_points NUMERIC;
BEGIN
    -- Calculate grade points using our function
    v_grade_points := calculate_grade_points(p_grade);

    -- Update enrollment
    UPDATE enrollments 
    SET grade = p_grade,
        "gradePoints" = v_grade_points,
        status = CASE WHEN p_grade IN ('F', 'I', 'W') THEN status ELSE 'Completed' END,
        "updatedAt" = NOW()
    WHERE id = p_enrollment_id;

    IF NOT FOUND THEN
        p_message := 'Enrollment not found';
    ELSE
        p_message := 'Grade updated successfully. Grade: ' || p_grade || ', Points: ' || v_grade_points;
    END IF;
END;
$$;

-- 7c. Procedure: Bulk mark attendance for a course
CREATE OR REPLACE PROCEDURE mark_bulk_attendance(
    p_course_id INTEGER,
    p_date DATE,
    p_session VARCHAR,
    p_marked_by INTEGER,
    p_records JSONB,
    OUT p_successful INTEGER,
    OUT p_updated INTEGER,
    OUT p_failed INTEGER
)
LANGUAGE plpgsql AS $$
DECLARE
    v_record JSONB;
    v_student_id INTEGER;
    v_status VARCHAR;
    v_existing_id INTEGER;
BEGIN
    p_successful := 0;
    p_updated := 0;
    p_failed := 0;

    FOR v_record IN SELECT * FROM jsonb_array_elements(p_records)
    LOOP
        BEGIN
            v_student_id := (v_record->>'studentId')::INTEGER;
            v_status := v_record->>'status';

            -- Check if attendance already exists
            SELECT id INTO v_existing_id FROM attendances
            WHERE "studentId" = v_student_id 
              AND "courseId" = p_course_id 
              AND date = p_date 
              AND session = p_session;

            IF v_existing_id IS NOT NULL THEN
                UPDATE attendances 
                SET status = v_status, "markedBy" = p_marked_by, "updatedAt" = NOW()
                WHERE id = v_existing_id;
                p_updated := p_updated + 1;
            ELSE
                INSERT INTO attendances ("studentId", "courseId", date, session, status, "markedBy", "createdAt", "updatedAt")
                VALUES (v_student_id, p_course_id, p_date, p_session, v_status, p_marked_by, NOW(), NOW());
                p_successful := p_successful + 1;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            p_failed := p_failed + 1;
        END;
    END LOOP;
END;
$$;

-- 7d. Procedure: Bulk enter marks for an exam
CREATE OR REPLACE PROCEDURE enter_bulk_marks(
    p_exam_id INTEGER,
    p_course_id INTEGER,
    p_entered_by INTEGER,
    p_marks JSONB,
    OUT p_successful INTEGER,
    OUT p_updated INTEGER,
    OUT p_failed INTEGER
)
LANGUAGE plpgsql AS $$
DECLARE
    v_record JSONB;
    v_student_id INTEGER;
    v_marks_obtained NUMERIC;
    v_existing_id INTEGER;
    v_max_marks NUMERIC;
BEGIN
    p_successful := 0;
    p_updated := 0;
    p_failed := 0;

    -- Get max marks from exam
    SELECT "maxMarks" INTO v_max_marks FROM exams WHERE id = p_exam_id;

    FOR v_record IN SELECT * FROM jsonb_array_elements(p_marks)
    LOOP
        BEGIN
            v_student_id := (v_record->>'studentId')::INTEGER;
            v_marks_obtained := (v_record->>'marksObtained')::NUMERIC;

            -- Check if mark already exists
            SELECT id INTO v_existing_id FROM marks
            WHERE "studentId" = v_student_id AND "examId" = p_exam_id;

            IF v_existing_id IS NOT NULL THEN
                UPDATE marks 
                SET "marksObtained" = v_marks_obtained, 
                    "enteredBy" = p_entered_by, 
                    "updatedAt" = NOW()
                WHERE id = v_existing_id;
                p_updated := p_updated + 1;
            ELSE
                INSERT INTO marks ("studentId", "courseId", "examId", "marksObtained", "maxMarks", "enteredBy", "isPublished", "createdAt", "updatedAt")
                VALUES (v_student_id, p_course_id, p_exam_id, v_marks_obtained, v_max_marks, p_entered_by, false, NOW(), NOW());
                p_successful := p_successful + 1;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            p_failed := p_failed + 1;
        END;
    END LOOP;
END;
$$;


-- ============================================================
-- 8. UPDATEDATCOLUMN TRIGGERS (for all major tables)
-- ============================================================

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_departments_updated_at ON departments;
CREATE TRIGGER trg_departments_updated_at
    BEFORE UPDATE ON departments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_programs_updated_at ON programs;
CREATE TRIGGER trg_programs_updated_at
    BEFORE UPDATE ON programs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_faculties_updated_at ON faculties;
CREATE TRIGGER trg_faculties_updated_at
    BEFORE UPDATE ON faculties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_students_updated_at ON students;
CREATE TRIGGER trg_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_semesters_updated_at ON semesters;
CREATE TRIGGER trg_semesters_updated_at
    BEFORE UPDATE ON semesters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_courses_updated_at ON courses;
CREATE TRIGGER trg_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_enrollments_updated_at ON enrollments;
CREATE TRIGGER trg_enrollments_updated_at
    BEFORE UPDATE ON enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_attendances_updated_at ON attendances;
CREATE TRIGGER trg_attendances_updated_at
    BEFORE UPDATE ON attendances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_exams_updated_at ON exams;
CREATE TRIGGER trg_exams_updated_at
    BEFORE UPDATE ON exams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_marks_updated_at ON marks;
CREATE TRIGGER trg_marks_updated_at
    BEFORE UPDATE ON marks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_announcements_updated_at ON announcements;
CREATE TRIGGER trg_announcements_updated_at
    BEFORE UPDATE ON announcements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- 9. VALIDATION TRIGGERS
-- ============================================================

-- 9a. Validate exam passing marks don't exceed max marks
CREATE OR REPLACE FUNCTION trg_validate_exam_marks()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW."passingMarks" > NEW."maxMarks" THEN
        RAISE EXCEPTION 'Passing marks (%) cannot exceed maximum marks (%)', 
            NEW."passingMarks", NEW."maxMarks";
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_exam_marks_validation ON exams;
CREATE TRIGGER trg_exam_marks_validation
    BEFORE INSERT OR UPDATE
    ON exams
    FOR EACH ROW
    EXECUTE FUNCTION trg_validate_exam_marks();

-- 9b. Validate semester end date is after start date
CREATE OR REPLACE FUNCTION trg_validate_semester_dates()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW."endDate" <= NEW."startDate" THEN
        RAISE EXCEPTION 'Semester end date must be after start date';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_semester_date_validation ON semesters;
CREATE TRIGGER trg_semester_date_validation
    BEFORE INSERT OR UPDATE
    ON semesters
    FOR EACH ROW
    EXECUTE FUNCTION trg_validate_semester_dates();

-- 9c. Ensure only one current semester at a time
CREATE OR REPLACE FUNCTION trg_ensure_single_current_semester()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW."isCurrent" = true THEN
        UPDATE semesters SET "isCurrent" = false 
        WHERE "isCurrent" = true AND id <> NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_single_current_semester ON semesters;
CREATE TRIGGER trg_single_current_semester
    BEFORE INSERT OR UPDATE OF "isCurrent"
    ON semesters
    FOR EACH ROW
    WHEN (NEW."isCurrent" = true)
    EXECUTE FUNCTION trg_ensure_single_current_semester();

-- 9d. Validate marks don't exceed max marks
CREATE OR REPLACE FUNCTION trg_validate_mark_value()
RETURNS TRIGGER AS $$
DECLARE
    v_max_marks NUMERIC;
BEGIN
    SELECT "maxMarks" INTO v_max_marks FROM exams WHERE id = NEW."examId";
    IF v_max_marks IS NOT NULL AND NEW."marksObtained" > v_max_marks THEN
        RAISE EXCEPTION 'Marks obtained (%) cannot exceed maximum marks (%) for this exam', 
            NEW."marksObtained", v_max_marks;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_mark_value_validation ON marks;
CREATE TRIGGER trg_mark_value_validation
    BEFORE INSERT OR UPDATE
    ON marks
    FOR EACH ROW
    EXECUTE FUNCTION trg_validate_mark_value();



-- ============================================================
-- SUMMARY OF CREATED OBJECTS
-- ============================================================
-- FUNCTIONS (visible in Supabase Dashboard > Database > Functions):
--   1.  update_updated_at_column()
--   2.  generate_academic_code(prefix, seq_num)
--   3.  calculate_grade(percentage)
--   4.  calculate_grade_points(grade)
--   5.  trg_calculate_mark_fields()
--   6.  trg_update_course_enrollment_count()
--   7.  trg_check_enrollment_capacity()
--   8.  calculate_attendance_percentage(student_id, course_id)
--   9.  trg_update_enrollment_attendance()
--   10. calculate_student_cgpa(student_id)
--   11. trg_update_student_cgpa()
--   12. get_admin_dashboard_stats()
--   13. get_department_statistics()
--   14. get_student_academic_summary(student_id)
--   15. get_faculty_course_summary(faculty_id)
--   16. trg_validate_exam_marks()
--   17. trg_validate_semester_dates()
--   18. trg_ensure_single_current_semester()
--   19. trg_validate_mark_value()
--
-- TRIGGERS (visible in Supabase Dashboard > Database > Triggers):
--   1.  trg_marks_auto_calculate (on marks)
--   2.  trg_enrollment_count_update (on enrollments)
--   3.  trg_enrollment_capacity_check (on enrollments)
--   4.  trg_attendance_update_enrollment (on attendances)
--   5.  trg_enrollment_cgpa_update (on enrollments)
--   6.  trg_users_updated_at (on users)
--   7.  trg_departments_updated_at (on departments)
--   8.  trg_programs_updated_at (on programs)
--   9.  trg_faculties_updated_at (on faculties)
--   10. trg_students_updated_at (on students)
--   11. trg_semesters_updated_at (on semesters)
--   12. trg_courses_updated_at (on courses)
--   13. trg_enrollments_updated_at (on enrollments)
--   14. trg_attendances_updated_at (on attendances)
--   15. trg_exams_updated_at (on exams)
--   16. trg_marks_updated_at (on marks)
--   17. trg_announcements_updated_at (on announcements)
--   18. trg_exam_marks_validation (on exams)
--   19. trg_semester_date_validation (on semesters)
--   20. trg_single_current_semester (on semesters)
--   21. trg_mark_value_validation (on marks)
--
-- STORED PROCEDURES:
--   1. enroll_student(student_id, course_id, semester_id)
--   2. update_enrollment_grade(enrollment_id, grade)
--   3. mark_bulk_attendance(course_id, date, session, marked_by, records)
--   4. enter_bulk_marks(exam_id, course_id, entered_by, marks)
-- ============================================================
