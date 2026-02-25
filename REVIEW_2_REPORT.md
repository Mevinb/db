# Review 2: Schema Design & Database Implementation

**Project:** College Management System (CMS)  
**Database:** PostgreSQL (hosted on Supabase)  
**ORM:** Sequelize v6  
**Date:** February 26, 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Relational Schema](#2-relational-schema)
3. [Entity-Relationship Diagram (Textual)](#3-entity-relationship-diagram)
4. [Table Definitions (DDL)](#4-table-definitions-ddl)
5. [Normalization up to 3NF](#5-normalization-up-to-3nf)
6. [SQL Queries](#6-sql-queries)
7. [Data Population](#7-data-population)
8. [Triggers & Hooks (Stored Procedure Equivalents)](#8-triggers--hooks)
9. [Indexes & Constraints](#9-indexes--constraints)
10. [Summary](#10-summary)

---

## 1. Project Overview

The College Management System is a full-stack web application for managing academic operations of an engineering college. It handles:

- **User Authentication** — Role-based access (Admin, Faculty, Student)
- **Departments & Programs** — Academic structure management
- **Faculty & Students** — Profile management with linked user accounts
- **Courses & Semesters** — Course offerings per semester with faculty assignments
- **Enrollments** — Student-course enrollment tracking
- **Attendance** — Daily attendance marking with Present/Absent/Late/Excused
- **Exams & Marks** — Exam scheduling, mark entry, and grade computation
- **Announcements** — Targeted notifications to roles/departments

**Tech Stack:**
- **Backend:** Node.js + Express.js + Sequelize ORM
- **Database:** PostgreSQL (Supabase)
- **Frontend:** Next.js + React + TypeScript + Tailwind CSS

---

## 2. Relational Schema

The database consists of **12 relations (tables)**. Below is the complete relational schema in standard notation.

### 2.1 Users
```
users (
    id          INTEGER  PRIMARY KEY  AUTO_INCREMENT,
    email       VARCHAR  NOT NULL  UNIQUE,
    password    VARCHAR  NOT NULL,
    role        ENUM('admin', 'faculty', 'student')  NOT NULL,
    name        VARCHAR  NOT NULL,
    profileId   INTEGER  NULL,
    profileModel ENUM('Student', 'Faculty')  NULL,
    isActive    BOOLEAN  DEFAULT TRUE,
    lastLogin   TIMESTAMP  NULL,
    resetPasswordToken  VARCHAR  NULL,
    resetPasswordExpire TIMESTAMP  NULL,
    createdAt   TIMESTAMP,
    updatedAt   TIMESTAMP
)
```

### 2.2 Departments
```
departments (
    id                INTEGER  PRIMARY KEY  AUTO_INCREMENT,
    name              VARCHAR  NOT NULL  UNIQUE,
    code              VARCHAR(10)  NOT NULL  UNIQUE,
    description       TEXT  NULL,
    headOfDepartment  INTEGER  NULL  REFERENCES faculties(id),
    establishedYear   INTEGER  NULL,
    isActive          BOOLEAN  DEFAULT TRUE,
    createdAt         TIMESTAMP,
    updatedAt         TIMESTAMP
)
```

### 2.3 Programs
```
programs (
    id              INTEGER  PRIMARY KEY  AUTO_INCREMENT,
    name            VARCHAR  NOT NULL,
    code            VARCHAR(15)  NOT NULL  UNIQUE,
    departmentId    INTEGER  NOT NULL  REFERENCES departments(id),
    duration        INTEGER  NOT NULL  CHECK(1..6),
    degreeType      ENUM('Bachelor','Master','Doctorate','Diploma','Certificate')  NOT NULL,
    totalCredits    INTEGER  NOT NULL  CHECK(>=0),
    totalSemesters  INTEGER  NOT NULL  CHECK(>=1),
    description     TEXT  NULL,
    eligibility     TEXT  NULL,
    fees            DECIMAL(10,2)  NULL  CHECK(>=0),
    isActive        BOOLEAN  DEFAULT TRUE,
    createdAt       TIMESTAMP,
    updatedAt       TIMESTAMP,
    UNIQUE(name, departmentId)
)
```

### 2.4 Faculties
```
faculties (
    id              INTEGER  PRIMARY KEY  AUTO_INCREMENT,
    employeeId      VARCHAR  NOT NULL  UNIQUE,
    name            VARCHAR  NOT NULL,
    email           VARCHAR  NOT NULL  UNIQUE,
    phone           VARCHAR  NULL,
    departmentId    INTEGER  NOT NULL  REFERENCES departments(id),
    designation     ENUM('Professor','Associate Professor','Assistant Professor','Lecturer','Teaching Assistant')  NOT NULL,
    specialization  VARCHAR  NULL,
    qualification   VARCHAR  NULL,
    experience      INTEGER  NULL  CHECK(>=0),
    dateOfJoining   DATE  NOT NULL,
    dateOfBirth     DATE  NULL,
    gender          ENUM('Male','Female','Other')  NULL,
    addressStreet   VARCHAR  NULL,
    addressCity     VARCHAR  NULL,
    addressState    VARCHAR  NULL,
    addressPincode  VARCHAR  NULL,
    salary          DECIMAL(10,2)  NULL  CHECK(>=0),
    userId          INTEGER  NULL  REFERENCES users(id),
    isActive        BOOLEAN  DEFAULT TRUE,
    createdAt       TIMESTAMP,
    updatedAt       TIMESTAMP
)
```

### 2.5 Students
```
students (
    id                INTEGER  PRIMARY KEY  AUTO_INCREMENT,
    rollNumber        VARCHAR  NOT NULL  UNIQUE,
    name              VARCHAR  NOT NULL,
    email             VARCHAR  NOT NULL  UNIQUE,
    phone             VARCHAR  NULL,
    programId         INTEGER  NOT NULL  REFERENCES programs(id),
    departmentId      INTEGER  NOT NULL  REFERENCES departments(id),
    currentSemester   INTEGER  NOT NULL  CHECK(1..12),
    admissionYear     INTEGER  NOT NULL,
    batchYear         VARCHAR  NULL,
    dateOfBirth       DATE  NULL,
    gender            ENUM('Male','Female','Other')  NULL,
    bloodGroup        ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-')  NULL,
    addressStreet     VARCHAR  NULL,
    addressCity       VARCHAR  NULL,
    addressState      VARCHAR  NULL,
    addressPincode    VARCHAR  NULL,
    guardianName      VARCHAR  NULL,
    guardianPhone     VARCHAR  NULL,
    guardianRelation  VARCHAR  NULL,
    cgpa              DECIMAL(4,2)  DEFAULT 0  CHECK(0..10),
    totalCreditsEarned INTEGER  DEFAULT 0,
    userId            INTEGER  NULL  REFERENCES users(id),
    status            ENUM('Active','Graduated','Dropped','Suspended')  DEFAULT 'Active',
    createdAt         TIMESTAMP,
    updatedAt         TIMESTAMP
)
```

### 2.6 Semesters
```
semesters (
    id                      INTEGER  PRIMARY KEY  AUTO_INCREMENT,
    name                    VARCHAR  NOT NULL,
    code                    VARCHAR  NOT NULL  UNIQUE,
    academicYear            VARCHAR  NOT NULL  CHECK(format: YYYY-YYYY),
    semesterNumber          INTEGER  NOT NULL  CHECK(IN [1,2]),
    startDate               DATE  NOT NULL,
    endDate                 DATE  NOT NULL,
    registrationStartDate   DATE  NULL,
    registrationEndDate     DATE  NULL,
    isCurrent               BOOLEAN  DEFAULT FALSE,
    status                  ENUM('Upcoming','Ongoing','Completed')  DEFAULT 'Upcoming',
    createdAt               TIMESTAMP,
    updatedAt               TIMESTAMP,
    CHECK(endDate > startDate)
)
```

### 2.7 Courses
```
courses (
    id                  INTEGER  PRIMARY KEY  AUTO_INCREMENT,
    name                VARCHAR  NOT NULL,
    code                VARCHAR  NOT NULL,
    departmentId        INTEGER  NOT NULL  REFERENCES departments(id),
    programId           INTEGER  NOT NULL  REFERENCES programs(id),
    semesterId          INTEGER  NOT NULL  REFERENCES semesters(id),
    facultyId           INTEGER  NULL  REFERENCES faculties(id),
    semesterNumber      INTEGER  NOT NULL  CHECK(>=1),
    credits             INTEGER  NOT NULL  CHECK(1..10),
    type                ENUM('Core','Elective','Lab','Project','Seminar')  NOT NULL,
    description         TEXT  NULL,
    syllabus            TEXT  NULL,
    lectureHours        INTEGER  DEFAULT 3,
    tutorialHours       INTEGER  DEFAULT 1,
    practicalHours      INTEGER  DEFAULT 0,
    internalMarks       INTEGER  DEFAULT 40,
    externalMarks       INTEGER  DEFAULT 60,
    totalMarks          INTEGER  DEFAULT 100,
    passingMarks        INTEGER  DEFAULT 40,
    maxCapacity         INTEGER  DEFAULT 60,
    currentEnrollment   INTEGER  DEFAULT 0,
    isActive            BOOLEAN  DEFAULT TRUE,
    createdAt           TIMESTAMP,
    updatedAt           TIMESTAMP
)
```

### 2.8 Enrollments
```
enrollments (
    id                      INTEGER  PRIMARY KEY  AUTO_INCREMENT,
    studentId               INTEGER  NOT NULL  REFERENCES students(id),
    courseId                 INTEGER  NOT NULL  REFERENCES courses(id),
    semesterId              INTEGER  NOT NULL  REFERENCES semesters(id),
    enrollmentDate          DATE  DEFAULT CURRENT_DATE,
    status                  ENUM('Enrolled','Dropped','Completed','Withdrawn')  DEFAULT 'Enrolled',
    grade                   ENUM('A+','A','B+','B','C+','C','D','F','I','W')  NULL,
    gradePoints             DECIMAL(4,2)  NULL  CHECK(0..10),
    attendancePercentage    DECIMAL(5,2)  DEFAULT 0  CHECK(0..100),
    internalMarks           DECIMAL(6,2)  DEFAULT 0,
    externalMarks           DECIMAL(6,2)  DEFAULT 0,
    totalMarks              DECIMAL(6,2)  DEFAULT 0,
    remarks                 TEXT  NULL,
    createdAt               TIMESTAMP,
    updatedAt               TIMESTAMP,
    UNIQUE(studentId, courseId, semesterId)
)
```

### 2.9 Attendances
```
attendances (
    id          INTEGER  PRIMARY KEY  AUTO_INCREMENT,
    studentId   INTEGER  NOT NULL  REFERENCES students(id),
    courseId     INTEGER  NOT NULL  REFERENCES courses(id),
    date        DATE  NOT NULL,
    status      ENUM('Present','Absent','Late','Excused')  NOT NULL,
    session     VARCHAR  DEFAULT 'Morning',
    markedBy    INTEGER  NOT NULL  REFERENCES faculties(id),
    remarks     TEXT  NULL,
    createdAt   TIMESTAMP,
    updatedAt   TIMESTAMP,
    UNIQUE(studentId, courseId, date, session),
    INDEX(courseId, date),
    INDEX(studentId, date)
)
```

### 2.10 Exams
```
exams (
    id              INTEGER  PRIMARY KEY  AUTO_INCREMENT,
    name            VARCHAR  NOT NULL,
    courseId         INTEGER  NOT NULL  REFERENCES courses(id),
    semesterId      INTEGER  NOT NULL  REFERENCES semesters(id),
    type            ENUM('Quiz','Assignment','Mid-Term','End-Term','Lab','Project','Viva','Practical')  NOT NULL,
    category        ENUM('Internal','External')  NOT NULL,
    maxMarks        INTEGER  NOT NULL  CHECK(>=1),
    passingMarks    INTEGER  NOT NULL  CHECK(>=0),
    weightage       DECIMAL(5,2)  NULL  CHECK(0..100),
    date            DATE  NULL,
    startTime       VARCHAR  NULL,
    endTime         VARCHAR  NULL,
    duration        INTEGER  NULL  CHECK(>=1),
    venue           VARCHAR  NULL,
    instructions    TEXT  NULL,
    status          ENUM('Scheduled','Ongoing','Completed','Cancelled')  DEFAULT 'Scheduled',
    isPublished     BOOLEAN  DEFAULT FALSE,
    createdAt       TIMESTAMP,
    updatedAt       TIMESTAMP,
    CHECK(passingMarks <= maxMarks)
)
```

### 2.11 Marks
```
marks (
    id              INTEGER  PRIMARY KEY  AUTO_INCREMENT,
    studentId       INTEGER  NOT NULL  REFERENCES students(id),
    courseId         INTEGER  NOT NULL  REFERENCES courses(id),
    examId          INTEGER  NOT NULL  REFERENCES exams(id),
    marksObtained   DECIMAL(6,2)  NOT NULL  CHECK(>=0),
    maxMarks        DECIMAL(6,2)  NOT NULL,
    percentage      DECIMAL(5,2)  NULL,
    grade           VARCHAR(2)  NULL,
    isPassed        BOOLEAN  NULL,
    remarks         TEXT  NULL,
    enteredBy       INTEGER  NULL  REFERENCES faculties(id),
    isPublished     BOOLEAN  DEFAULT FALSE,
    createdAt       TIMESTAMP,
    updatedAt       TIMESTAMP,
    UNIQUE(studentId, examId),
    INDEX(courseId, examId),
    INDEX(studentId, courseId)
)
```

### 2.12 Announcements
```
announcements (
    id                  INTEGER  PRIMARY KEY  AUTO_INCREMENT,
    title               VARCHAR(200)  NOT NULL,
    content             TEXT  NOT NULL,
    category            ENUM('General','Academic','Exam','Event','Holiday','Urgent','Other')  DEFAULT 'General',
    priority            ENUM('Low','Normal','High','Urgent')  DEFAULT 'Normal',
    targetRoles         JSON  DEFAULT [],
    targetDepartments   JSON  DEFAULT [],
    targetPrograms      JSON  DEFAULT [],
    attachments         JSON  DEFAULT [],
    createdBy           INTEGER  NOT NULL  REFERENCES users(id),
    publishDate         TIMESTAMP  DEFAULT NOW,
    expiryDate          TIMESTAMP  NULL,
    isActive            BOOLEAN  DEFAULT TRUE,
    isPinned            BOOLEAN  DEFAULT FALSE,
    views               INTEGER  DEFAULT 0,
    createdAt           TIMESTAMP,
    updatedAt           TIMESTAMP,
    INDEX(isActive, publishDate)
)
```

---

## 3. Entity-Relationship Diagram

```
┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│    USERS     │          │  DEPARTMENTS │          │   PROGRAMS   │
│──────────────│          │──────────────│          │──────────────│
│ PK id        │          │ PK id        │◄─────────│ FK departmentId│
│    email     │          │    name      │ 1     N  │    name      │
│    password  │          │    code      │          │    code      │
│    role      │          │    description│          │    degreeType│
│    name      │          │ FK headOfDept│─────┐    │    duration  │
│    profileId │          │    isActive  │     │    │    totalCredits│
│    profileModel│        └──────────────┘     │    └──────────────┘
└──────────────┘               │    │          │          │
       │  │                    │    │          │          │
       │  │              1..N  │    │ 1..N     │          │ 1..N
       │  │                    ▼    ▼          │          ▼
       │  │            ┌──────────────┐        │   ┌──────────────┐
       │  └────────────│  FACULTIES   │◄───────┘   │   STUDENTS   │
       │     1      1  │──────────────│            │──────────────│
       └───────────────│ FK userId    │            │ FK userId    │
              1     1  │ FK departmentId│           │ FK programId │
                       │    employeeId│            │ FK departmentId│
                       │    name      │            │    rollNumber│
                       │    designation│            │    cgpa      │
                       └──────────────┘            └──────────────┘
                              │                          │
                         1..N │                     1..N │
                              ▼                          ▼
                       ┌──────────────┐          ┌──────────────┐
                       │   COURSES    │          │  ENROLLMENTS │
                       │──────────────│◄─────────│──────────────│
                       │ FK departmentId│  1   N  │ FK studentId │
                       │ FK programId │          │ FK courseId  │
                       │ FK semesterId│          │ FK semesterId│
                       │ FK facultyId │          │    grade     │
                       │    code      │          │    status    │
                       │    credits   │          └──────────────┘
                       └──────────────┘
                         │       │
                    1..N │       │ 1..N
                         ▼       ▼
                  ┌──────────┐  ┌──────────────┐
                  │  EXAMS   │  │ ATTENDANCES  │
                  │──────────│  │──────────────│
                  │FK courseId│  │ FK studentId │
                  │FK semesterId│ FK courseId   │
                  │   type   │  │ FK markedBy  │
                  │   maxMarks│  │    date      │
                  └──────────┘  │    status    │
                       │        └──────────────┘
                  1..N │
                       ▼
                  ┌──────────────┐      ┌──────────────────┐
                  │    MARKS     │      │  ANNOUNCEMENTS   │
                  │──────────────│      │──────────────────│
                  │ FK studentId │      │ FK createdBy     │
                  │ FK courseId  │      │    title         │
                  │ FK examId   │      │    targetRoles   │
                  │ FK enteredBy │      │    category      │
                  │  marksObtained│     │    priority      │
                  │  grade       │      └──────────────────┘
                  └──────────────┘
```

### Relationship Summary

| Relationship | Type | Description |
|---|---|---|
| Department → Faculty (HOD) | 1:1 (optional) | Each department may have one Head of Department |
| Department → Programs | 1:N | A department offers multiple programs |
| Department → Faculties | 1:N | A department has multiple faculty members |
| Department → Courses | 1:N | A department manages multiple courses |
| Department → Students | 1:N | Students belong to a department |
| Program → Students | 1:N | A program has many enrolled students |
| Program → Courses | 1:N | A program contains multiple courses |
| Faculty → User | 1:1 | Each faculty has one login account |
| Student → User | 1:1 | Each student has one login account |
| Faculty → Courses | 1:N | A faculty teaches multiple courses |
| Semester → Courses | 1:N | Courses are offered in a semester |
| Semester → Enrollments | 1:N | Enrollments belong to a semester |
| Semester → Exams | 1:N | Exams are conducted in a semester |
| Student ↔ Course (via Enrollment) | M:N | Students enroll in many courses; courses have many students |
| Student ↔ Course (via Attendance) | M:N | Attendance tracked per student-course-date |
| Course → Exams | 1:N | A course has multiple exams |
| Exam → Marks | 1:N | An exam has marks for each student |
| Student → Marks | 1:N | A student has marks in multiple exams |
| Faculty → Attendance (markedBy) | 1:N | Faculty marks attendance |
| Faculty → Marks (enteredBy) | 1:N | Faculty enters marks |
| User → Announcements (createdBy) | 1:N | Admin/faculty create announcements |

---

## 4. Table Definitions (DDL)

Below are the equivalent SQL `CREATE TABLE` statements for all 12 tables:

```sql
-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE users (
    id              SERIAL          PRIMARY KEY,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    password        VARCHAR(255)    NOT NULL,
    role            VARCHAR(10)     NOT NULL CHECK (role IN ('admin', 'faculty', 'student')),
    name            VARCHAR(255)    NOT NULL,
    "profileId"     INTEGER,
    "profileModel"  VARCHAR(10)     CHECK ("profileModel" IN ('Student', 'Faculty')),
    "isActive"      BOOLEAN         DEFAULT TRUE,
    "lastLogin"     TIMESTAMP,
    "resetPasswordToken"  VARCHAR(255),
    "resetPasswordExpire" TIMESTAMP,
    "createdAt"     TIMESTAMP       NOT NULL DEFAULT NOW(),
    "updatedAt"     TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ============================================
-- 2. DEPARTMENTS TABLE
-- ============================================
CREATE TABLE departments (
    id                  SERIAL          PRIMARY KEY,
    name                VARCHAR(255)    NOT NULL UNIQUE,
    code                VARCHAR(10)     NOT NULL UNIQUE,
    description         TEXT,
    "headOfDepartment"  INTEGER,
    "establishedYear"   INTEGER,
    "isActive"          BOOLEAN         DEFAULT TRUE,
    "createdAt"         TIMESTAMP       NOT NULL DEFAULT NOW(),
    "updatedAt"         TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ============================================
-- 3. PROGRAMS TABLE
-- ============================================
CREATE TABLE programs (
    id              SERIAL          PRIMARY KEY,
    name            VARCHAR(255)    NOT NULL,
    code            VARCHAR(15)     NOT NULL UNIQUE,
    "departmentId"  INTEGER         NOT NULL REFERENCES departments(id),
    duration        INTEGER         NOT NULL CHECK (duration BETWEEN 1 AND 6),
    "degreeType"    VARCHAR(15)     NOT NULL CHECK ("degreeType" IN ('Bachelor','Master','Doctorate','Diploma','Certificate')),
    "totalCredits"  INTEGER         NOT NULL CHECK ("totalCredits" >= 0),
    "totalSemesters" INTEGER        NOT NULL CHECK ("totalSemesters" >= 1),
    description     TEXT,
    eligibility     TEXT,
    fees            DECIMAL(10,2)   CHECK (fees >= 0),
    "isActive"      BOOLEAN         DEFAULT TRUE,
    "createdAt"     TIMESTAMP       NOT NULL DEFAULT NOW(),
    "updatedAt"     TIMESTAMP       NOT NULL DEFAULT NOW(),
    UNIQUE(name, "departmentId")
);

-- ============================================
-- 4. SEMESTERS TABLE
-- ============================================
CREATE TABLE semesters (
    id                          SERIAL          PRIMARY KEY,
    name                        VARCHAR(255)    NOT NULL,
    code                        VARCHAR(255)    NOT NULL UNIQUE,
    "academicYear"              VARCHAR(9)      NOT NULL,
    "semesterNumber"            INTEGER         NOT NULL CHECK ("semesterNumber" IN (1, 2)),
    "startDate"                 DATE            NOT NULL,
    "endDate"                   DATE            NOT NULL,
    "registrationStartDate"     DATE,
    "registrationEndDate"       DATE,
    "isCurrent"                 BOOLEAN         DEFAULT FALSE,
    status                      VARCHAR(15)     DEFAULT 'Upcoming' CHECK (status IN ('Upcoming','Ongoing','Completed')),
    "createdAt"                 TIMESTAMP       NOT NULL DEFAULT NOW(),
    "updatedAt"                 TIMESTAMP       NOT NULL DEFAULT NOW(),
    CHECK ("endDate" > "startDate")
);

-- ============================================
-- 5. FACULTIES TABLE
-- ============================================
CREATE TABLE faculties (
    id              SERIAL          PRIMARY KEY,
    "employeeId"    VARCHAR(255)    NOT NULL UNIQUE,
    name            VARCHAR(255)    NOT NULL,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    phone           VARCHAR(255),
    "departmentId"  INTEGER         NOT NULL REFERENCES departments(id),
    designation     VARCHAR(25)     NOT NULL CHECK (designation IN ('Professor','Associate Professor','Assistant Professor','Lecturer','Teaching Assistant')),
    specialization  VARCHAR(255),
    qualification   VARCHAR(255),
    experience      INTEGER         CHECK (experience >= 0),
    "dateOfJoining" DATE            NOT NULL,
    "dateOfBirth"   DATE,
    gender          VARCHAR(6)      CHECK (gender IN ('Male','Female','Other')),
    "addressStreet" VARCHAR(255),
    "addressCity"   VARCHAR(255),
    "addressState"  VARCHAR(255),
    "addressPincode" VARCHAR(255),
    salary          DECIMAL(10,2)   CHECK (salary >= 0),
    "userId"        INTEGER         REFERENCES users(id),
    "isActive"      BOOLEAN         DEFAULT TRUE,
    "createdAt"     TIMESTAMP       NOT NULL DEFAULT NOW(),
    "updatedAt"     TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- Add FK for departments.headOfDepartment after faculties table exists
ALTER TABLE departments
    ADD CONSTRAINT fk_departments_hod
    FOREIGN KEY ("headOfDepartment") REFERENCES faculties(id);

-- ============================================
-- 6. STUDENTS TABLE
-- ============================================
CREATE TABLE students (
    id                  SERIAL          PRIMARY KEY,
    "rollNumber"        VARCHAR(255)    NOT NULL UNIQUE,
    name                VARCHAR(255)    NOT NULL,
    email               VARCHAR(255)    NOT NULL UNIQUE,
    phone               VARCHAR(255),
    "programId"         INTEGER         NOT NULL REFERENCES programs(id),
    "departmentId"      INTEGER         NOT NULL REFERENCES departments(id),
    "currentSemester"   INTEGER         NOT NULL CHECK ("currentSemester" BETWEEN 1 AND 12),
    "admissionYear"     INTEGER         NOT NULL,
    "batchYear"         VARCHAR(255),
    "dateOfBirth"       DATE,
    gender              VARCHAR(6)      CHECK (gender IN ('Male','Female','Other')),
    "bloodGroup"        VARCHAR(3)      CHECK ("bloodGroup" IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
    "addressStreet"     VARCHAR(255),
    "addressCity"       VARCHAR(255),
    "addressState"      VARCHAR(255),
    "addressPincode"    VARCHAR(255),
    "guardianName"      VARCHAR(255),
    "guardianPhone"     VARCHAR(255),
    "guardianRelation"  VARCHAR(255),
    cgpa                DECIMAL(4,2)    DEFAULT 0 CHECK (cgpa BETWEEN 0 AND 10),
    "totalCreditsEarned" INTEGER        DEFAULT 0,
    "userId"            INTEGER         REFERENCES users(id),
    status              VARCHAR(10)     DEFAULT 'Active' CHECK (status IN ('Active','Graduated','Dropped','Suspended')),
    "createdAt"         TIMESTAMP       NOT NULL DEFAULT NOW(),
    "updatedAt"         TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ============================================
-- 7. COURSES TABLE
-- ============================================
CREATE TABLE courses (
    id                  SERIAL          PRIMARY KEY,
    name                VARCHAR(255)    NOT NULL,
    code                VARCHAR(255)    NOT NULL,
    "departmentId"      INTEGER         NOT NULL REFERENCES departments(id),
    "programId"         INTEGER         NOT NULL REFERENCES programs(id),
    "semesterId"        INTEGER         NOT NULL REFERENCES semesters(id),
    "facultyId"         INTEGER         REFERENCES faculties(id),
    "semesterNumber"    INTEGER         NOT NULL CHECK ("semesterNumber" >= 1),
    credits             INTEGER         NOT NULL CHECK (credits BETWEEN 1 AND 10),
    type                VARCHAR(10)     NOT NULL CHECK (type IN ('Core','Elective','Lab','Project','Seminar')),
    description         TEXT,
    syllabus            TEXT,
    "lectureHours"      INTEGER         DEFAULT 3,
    "tutorialHours"     INTEGER         DEFAULT 1,
    "practicalHours"    INTEGER         DEFAULT 0,
    "internalMarks"     INTEGER         DEFAULT 40,
    "externalMarks"     INTEGER         DEFAULT 60,
    "totalMarks"        INTEGER         DEFAULT 100,
    "passingMarks"      INTEGER         DEFAULT 40,
    "maxCapacity"       INTEGER         DEFAULT 60,
    "currentEnrollment" INTEGER         DEFAULT 0,
    "isActive"          BOOLEAN         DEFAULT TRUE,
    "createdAt"         TIMESTAMP       NOT NULL DEFAULT NOW(),
    "updatedAt"         TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ============================================
-- 8. ENROLLMENTS TABLE
-- ============================================
CREATE TABLE enrollments (
    id                      SERIAL          PRIMARY KEY,
    "studentId"             INTEGER         NOT NULL REFERENCES students(id),
    "courseId"              INTEGER         NOT NULL REFERENCES courses(id),
    "semesterId"            INTEGER         NOT NULL REFERENCES semesters(id),
    "enrollmentDate"        DATE            DEFAULT CURRENT_DATE,
    status                  VARCHAR(10)     DEFAULT 'Enrolled' CHECK (status IN ('Enrolled','Dropped','Completed','Withdrawn')),
    grade                   VARCHAR(2)      CHECK (grade IN ('A+','A','B+','B','C+','C','D','F','I','W')),
    "gradePoints"           DECIMAL(4,2)    CHECK ("gradePoints" BETWEEN 0 AND 10),
    "attendancePercentage"  DECIMAL(5,2)    DEFAULT 0 CHECK ("attendancePercentage" BETWEEN 0 AND 100),
    "internalMarks"         DECIMAL(6,2)    DEFAULT 0,
    "externalMarks"         DECIMAL(6,2)    DEFAULT 0,
    "totalMarks"            DECIMAL(6,2)    DEFAULT 0,
    remarks                 TEXT,
    "createdAt"             TIMESTAMP       NOT NULL DEFAULT NOW(),
    "updatedAt"             TIMESTAMP       NOT NULL DEFAULT NOW(),
    UNIQUE("studentId", "courseId", "semesterId")
);

-- ============================================
-- 9. ATTENDANCES TABLE
-- ============================================
CREATE TABLE attendances (
    id          SERIAL          PRIMARY KEY,
    "studentId" INTEGER         NOT NULL REFERENCES students(id),
    "courseId"   INTEGER         NOT NULL REFERENCES courses(id),
    date        DATE            NOT NULL,
    status      VARCHAR(10)     NOT NULL CHECK (status IN ('Present','Absent','Late','Excused')),
    session     VARCHAR(255)    DEFAULT 'Morning',
    "markedBy"  INTEGER         NOT NULL REFERENCES faculties(id),
    remarks     TEXT,
    "createdAt" TIMESTAMP       NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP       NOT NULL DEFAULT NOW(),
    UNIQUE("studentId", "courseId", date, session)
);

CREATE INDEX idx_attendance_course_date ON attendances("courseId", date);
CREATE INDEX idx_attendance_student_date ON attendances("studentId", date);

-- ============================================
-- 10. EXAMS TABLE
-- ============================================
CREATE TABLE exams (
    id              SERIAL          PRIMARY KEY,
    name            VARCHAR(255)    NOT NULL,
    "courseId"      INTEGER         NOT NULL REFERENCES courses(id),
    "semesterId"    INTEGER         NOT NULL REFERENCES semesters(id),
    type            VARCHAR(15)     NOT NULL CHECK (type IN ('Quiz','Assignment','Mid-Term','End-Term','Lab','Project','Viva','Practical')),
    category        VARCHAR(10)     NOT NULL CHECK (category IN ('Internal','External')),
    "maxMarks"      INTEGER         NOT NULL CHECK ("maxMarks" >= 1),
    "passingMarks"  INTEGER         NOT NULL CHECK ("passingMarks" >= 0),
    weightage       DECIMAL(5,2)    CHECK (weightage BETWEEN 0 AND 100),
    date            DATE,
    "startTime"     VARCHAR(255),
    "endTime"       VARCHAR(255),
    duration        INTEGER         CHECK (duration >= 1),
    venue           VARCHAR(255),
    instructions    TEXT,
    status          VARCHAR(15)     DEFAULT 'Scheduled' CHECK (status IN ('Scheduled','Ongoing','Completed','Cancelled')),
    "isPublished"   BOOLEAN         DEFAULT FALSE,
    "createdAt"     TIMESTAMP       NOT NULL DEFAULT NOW(),
    "updatedAt"     TIMESTAMP       NOT NULL DEFAULT NOW(),
    CHECK ("passingMarks" <= "maxMarks")
);

-- ============================================
-- 11. MARKS TABLE
-- ============================================
CREATE TABLE marks (
    id              SERIAL          PRIMARY KEY,
    "studentId"     INTEGER         NOT NULL REFERENCES students(id),
    "courseId"      INTEGER         NOT NULL REFERENCES courses(id),
    "examId"        INTEGER         NOT NULL REFERENCES exams(id),
    "marksObtained" DECIMAL(6,2)    NOT NULL CHECK ("marksObtained" >= 0),
    "maxMarks"      DECIMAL(6,2)    NOT NULL,
    percentage      DECIMAL(5,2),
    grade           VARCHAR(2),
    "isPassed"      BOOLEAN,
    remarks         TEXT,
    "enteredBy"     INTEGER         REFERENCES faculties(id),
    "isPublished"   BOOLEAN         DEFAULT FALSE,
    "createdAt"     TIMESTAMP       NOT NULL DEFAULT NOW(),
    "updatedAt"     TIMESTAMP       NOT NULL DEFAULT NOW(),
    UNIQUE("studentId", "examId")
);

CREATE INDEX idx_marks_course_exam ON marks("courseId", "examId");
CREATE INDEX idx_marks_student_course ON marks("studentId", "courseId");

-- ============================================
-- 12. ANNOUNCEMENTS TABLE
-- ============================================
CREATE TABLE announcements (
    id                  SERIAL          PRIMARY KEY,
    title               VARCHAR(200)    NOT NULL,
    content             TEXT            NOT NULL,
    category            VARCHAR(10)     DEFAULT 'General' CHECK (category IN ('General','Academic','Exam','Event','Holiday','Urgent','Other')),
    priority            VARCHAR(6)      DEFAULT 'Normal' CHECK (priority IN ('Low','Normal','High','Urgent')),
    "targetRoles"       JSON            DEFAULT '[]',
    "targetDepartments" JSON            DEFAULT '[]',
    "targetPrograms"    JSON            DEFAULT '[]',
    attachments         JSON            DEFAULT '[]',
    "createdBy"         INTEGER         NOT NULL REFERENCES users(id),
    "publishDate"       TIMESTAMP       DEFAULT NOW(),
    "expiryDate"        TIMESTAMP,
    "isActive"          BOOLEAN         DEFAULT TRUE,
    "isPinned"          BOOLEAN         DEFAULT FALSE,
    views               INTEGER         DEFAULT 0,
    "createdAt"         TIMESTAMP       NOT NULL DEFAULT NOW(),
    "updatedAt"         TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_announcements_active_publish ON announcements("isActive", "publishDate");
```

---

## 5. Normalization up to 3NF

### 5.1 First Normal Form (1NF) — Achieved ✅

**Requirements:** All attributes must be atomic (single-valued), each row uniquely identifiable.

| Verification | Status |
|---|---|
| Every table has a single-column primary key (`id` — SERIAL) | ✅ |
| No repeating groups — each column holds one value | ✅ |
| No multi-valued attributes stored as comma-separated strings | ✅ |
| JSON columns (`targetRoles`, `targetDepartments`, etc. in `announcements`) store arrays but are used only for filtering, not as relational data — acceptable trade-off | ✅ (pragmatic) |

**Example:**
- Student address is decomposed into `addressStreet`, `addressCity`, `addressState`, `addressPincode` — fully atomic.
- Faculty address follows the same decomposition.

### 5.2 Second Normal Form (2NF) — Achieved ✅

**Requirements:** Must be in 1NF + no partial dependencies (non-key attributes must depend on the entire primary key).

Since all tables use a single-column surrogate primary key (`id`), **partial dependencies are impossible by definition**. Every non-key attribute depends on the whole key (which is just `id`).

| Table | Primary Key | All non-key attrs depend on `id`? |
|---|---|---|
| users | id | ✅ |
| departments | id | ✅ |
| programs | id | ✅ |
| faculties | id | ✅ |
| students | id | ✅ |
| semesters | id | ✅ |
| courses | id | ✅ |
| enrollments | id | ✅ (candidate key: studentId+courseId+semesterId is UNIQUE) |
| attendances | id | ✅ (candidate key: studentId+courseId+date+session is UNIQUE) |
| exams | id | ✅ |
| marks | id | ✅ (candidate key: studentId+examId is UNIQUE) |
| announcements | id | ✅ |

### 5.3 Third Normal Form (3NF) — Achieved ✅

**Requirements:** Must be in 2NF + no transitive dependencies (non-key attributes must not depend on other non-key attributes).

**Analysis of each table:**

| Table | Potential Transitive Dependency? | Resolution |
|---|---|---|
| **students** | `departmentId` could be derived from `programId → departmentId` | Stored redundantly for query performance; program always belongs to a department. This is a **controlled denormalization** for avoiding extra JOINs in frequent queries. |
| **courses** | `departmentId` could be derived from `programId → departmentId` | Same controlled denormalization as above for query performance. |
| **marks** | `percentage` and `grade` can be computed from `marksObtained` and `maxMarks` | These are **computed/cached fields** — auto-calculated by a `beforeSave` hook (acts as a trigger). Stored to avoid repeated computation. |
| **marks** | `isPassed` can be derived from `marksObtained >= exam.passingMarks` | Same — cached via hook for performance. |
| **enrollments** | `totalMarks` = `internalMarks + externalMarks` | Cached aggregation; updated by application logic. |
| **All other tables** | No transitive dependencies | ✅ Fully in 3NF |

**Conclusion:** The schema is in **3NF with controlled denormalization** in specific cases for performance. The denormalized fields (`departmentId` in students/courses, computed fields in marks) are kept consistent through application-level logic and hooks (equivalent to triggers).

### Normalization Walkthrough Example — `students` table

```
STEP 1 (Unnormalized):
Student { rollNumber, name, email, phone, program_name, program_code, 
          dept_name, dept_code, semester, addresses[], guardian_info }

STEP 2 (1NF - Remove multi-valued & repeating groups):
Student { id, rollNumber, name, email, phone, programId, departmentId, 
          currentSemester, admissionYear, batchYear, dateOfBirth, gender,
          bloodGroup, addressStreet, addressCity, addressState, addressPincode,
          guardianName, guardianPhone, guardianRelation, cgpa, totalCreditsEarned,
          userId, status }
→ program info moved to separate Programs table
→ department info moved to separate Departments table  
→ address decomposed into atomic fields

STEP 3 (2NF - No partial dependencies):
→ Single PK (id) so already in 2NF

STEP 4 (3NF - No transitive dependencies):
→ departmentId kept for performance (denormalized)
→ All other attributes depend directly on the student id
```

---

## 6. SQL Queries

### 6.1 Data Retrieval Queries (SELECT)

#### Query 1: Get all students with their program and department details (JOIN)
```sql
SELECT s.id, s."rollNumber", s.name, s.email, s."currentSemester", s.cgpa, s.status,
       p.name AS "programName", p.code AS "programCode",
       d.name AS "departmentName", d.code AS "departmentCode"
FROM students s
INNER JOIN programs p ON s."programId" = p.id
INNER JOIN departments d ON s."departmentId" = d.id
WHERE s.status = 'Active'
ORDER BY s."rollNumber" ASC;
```

#### Query 2: Get course details with faculty, department, program, and semester (4-table JOIN)
```sql
SELECT c.id, c.name, c.code, c.credits, c.type, c."semesterNumber",
       d.name AS "departmentName",
       p.name AS "programName",
       sem.name AS "semesterName",
       f.name AS "facultyName", f."employeeId"
FROM courses c
INNER JOIN departments d ON c."departmentId" = d.id
INNER JOIN programs p ON c."programId" = p.id
INNER JOIN semesters sem ON c."semesterId" = sem.id
LEFT JOIN faculties f ON c."facultyId" = f.id
WHERE c."isActive" = TRUE;
```

#### Query 3: Get student enrollment with course and faculty details (Nested JOIN)
```sql
SELECT e.id, e.status, e.grade, e."gradePoints", e."attendancePercentage",
       s."rollNumber", s.name AS "studentName",
       c.name AS "courseName", c.code AS "courseCode", c.credits,
       f.name AS "facultyName",
       sem.name AS "semesterName"
FROM enrollments e
INNER JOIN students s ON e."studentId" = s.id
INNER JOIN courses c ON e."courseId" = c.id
LEFT JOIN faculties f ON c."facultyId" = f.id
INNER JOIN semesters sem ON e."semesterId" = sem.id
WHERE e."semesterId" = 1 AND e.status = 'Enrolled'
ORDER BY s."rollNumber";
```

#### Query 4: Get marks with student, course, and exam details (4-table JOIN)
```sql
SELECT m.id, m."marksObtained", m."maxMarks", m.percentage, m.grade, m."isPassed",
       s."rollNumber", s.name AS "studentName",
       c.name AS "courseName", c.code AS "courseCode",
       ex.name AS "examName", ex.type AS "examType", ex.category,
       f.name AS "enteredByFaculty"
FROM marks m
INNER JOIN students s ON m."studentId" = s.id
INNER JOIN courses c ON m."courseId" = c.id
INNER JOIN exams ex ON m."examId" = ex.id
LEFT JOIN faculties f ON m."enteredBy" = f.id
WHERE m."isPublished" = TRUE
ORDER BY s."rollNumber" ASC, c.code ASC;
```

#### Query 5: Search students by name using case-insensitive pattern matching
```sql
SELECT s.id, s."rollNumber", s.name, s.email, s.cgpa,
       p.name AS "programName", d.name AS "departmentName"
FROM students s
INNER JOIN programs p ON s."programId" = p.id
INNER JOIN departments d ON s."departmentId" = d.id
WHERE s.name ILIKE '%sharma%'
   OR s."rollNumber" ILIKE '%sharma%'
   OR s.email ILIKE '%sharma%'
ORDER BY s.name;
```

### 6.2 Aggregation Queries

#### Query 6: Department-wise student count (GROUP BY + COUNT)
```sql
SELECT d.id, d.name AS "departmentName",
       COUNT(s.id) AS "studentCount"
FROM departments d
LEFT JOIN students s ON d.id = s."departmentId"
GROUP BY d.id, d.name
ORDER BY "studentCount" DESC;
```

#### Query 7: Department-wise faculty count
```sql
SELECT d.id, d.name AS "departmentName",
       COUNT(f.id) AS "facultyCount"
FROM departments d
LEFT JOIN faculties f ON d.id = f."departmentId"
GROUP BY d.id, d.name;
```

#### Query 8: Enrollments per semester (trend analysis)
```sql
SELECT sem.name AS "semesterName",
       COUNT(e.id) AS "enrollmentCount"
FROM semesters sem
LEFT JOIN enrollments e ON sem.id = e."semesterId"
GROUP BY sem.id, sem.name
ORDER BY sem."startDate";
```

#### Query 9: Attendance summary for a course (per date)
```sql
SELECT a.date,
       COUNT(CASE WHEN a.status = 'Present' THEN 1 END) AS "presentCount",
       COUNT(CASE WHEN a.status = 'Absent' THEN 1 END) AS "absentCount",
       COUNT(CASE WHEN a.status = 'Late' THEN 1 END) AS "lateCount",
       COUNT(a.id) AS "totalCount"
FROM attendances a
WHERE a."courseId" = 1
GROUP BY a.date
ORDER BY a.date;
```

#### Query 10: Calculate attendance percentage for a student in a course
```sql
SELECT 
    COUNT(*) AS "totalClasses",
    COUNT(CASE WHEN status IN ('Present', 'Late') THEN 1 END) AS "attended",
    ROUND(
        (COUNT(CASE WHEN status IN ('Present', 'Late') THEN 1 END)::DECIMAL / COUNT(*)) * 100, 
        2
    ) AS "attendancePercentage"
FROM attendances
WHERE "studentId" = 1 AND "courseId" = 1;
```

### 6.3 Dashboard Analytics Queries

#### Query 11: Admin dashboard — Total counts (used with Promise.all)
```sql
-- These are run in parallel for the dashboard
SELECT COUNT(*) AS "totalStudents" FROM students WHERE status = 'Active';
SELECT COUNT(*) AS "totalFaculty" FROM faculties WHERE "isActive" = TRUE;
SELECT COUNT(*) AS "totalCourses" FROM courses WHERE "isActive" = TRUE;
SELECT COUNT(*) AS "totalDepartments" FROM departments WHERE "isActive" = TRUE;
SELECT COUNT(*) AS "totalPrograms" FROM programs WHERE "isActive" = TRUE;
SELECT COUNT(*) AS "totalEnrollments" FROM enrollments WHERE status = 'Enrolled';
```

#### Query 12: Top courses by enrollment count
```sql
SELECT c.id, c.name, c.code,
       COUNT(e.id) AS "enrollmentCount"
FROM courses c
LEFT JOIN enrollments e ON c.id = e."courseId" AND e.status = 'Enrolled'
GROUP BY c.id, c.name, c.code
ORDER BY "enrollmentCount" DESC
LIMIT 10;
```

### 6.4 Data Modification Queries

#### Query 13: Upsert attendance (find or create/update)
```sql
-- Check if attendance already exists
SELECT id FROM attendances 
WHERE "studentId" = 1 AND "courseId" = 1 AND date = '2026-02-10' AND session = 'Morning';

-- If exists: UPDATE
UPDATE attendances 
SET status = 'Present', "markedBy" = 1, "updatedAt" = NOW()
WHERE id = 1;

-- If not exists: INSERT
INSERT INTO attendances ("studentId", "courseId", date, status, session, "markedBy", "createdAt", "updatedAt")
VALUES (1, 1, '2026-02-10', 'Present', 'Morning', 1, NOW(), NOW());
```

#### Query 14: Bulk publish exam results
```sql
UPDATE marks 
SET "isPublished" = TRUE, "updatedAt" = NOW()
WHERE "examId" = 5;

UPDATE exams 
SET "isPublished" = TRUE, "updatedAt" = NOW()
WHERE id = 5;
```

#### Query 15: Reset current semester and set new one
```sql
-- Reset all semesters
UPDATE semesters SET "isCurrent" = FALSE;

-- Set specific semester as current
UPDATE semesters SET "isCurrent" = TRUE WHERE id = 3;
```

#### Query 16: Safe delete with referential integrity check
```sql
-- Before deleting a department, check for dependencies
SELECT COUNT(*) AS "programCount" FROM programs WHERE "departmentId" = 1;
SELECT COUNT(*) AS "facultyCount" FROM faculties WHERE "departmentId" = 1;
SELECT COUNT(*) AS "studentCount" FROM students WHERE "departmentId" = 1;

-- Only if all counts are 0:
DELETE FROM departments WHERE id = 1;
```

#### Query 17: Cascading delete (Student + associated User)
```sql
-- Check enrollment dependencies first
SELECT COUNT(*) FROM enrollments WHERE "studentId" = 5;

-- If no enrollments, cascade delete:
DELETE FROM students WHERE id = 5;
DELETE FROM users WHERE id = 10;  -- associated user account
```

---

## 7. Data Population

The database is populated with comprehensive seed data via `npm run seed`. Below is the data summary:

### 7.1 Seeded Data Volume

| Entity | Count | Details |
|---|---|---|
| **Users** | 26 | 1 Admin + 7 Faculty + 18 Students |
| **Departments** | 5 | CSE, ECE, ME, CE, EE |
| **Programs** | 4 | B.Tech CSE, M.Tech CSE, B.Tech ECE, B.Tech ME |
| **Semesters** | 3 | Fall 2025 (Completed), Spring 2026 (Current), Fall 2026 (Upcoming) |
| **Faculty** | 7 | 4 CSE, 2 ECE, 1 ME — with Professor to Assistant Professor designations |
| **Students** | 18 | 13 CSE (across Semesters 2, 4, 6) + 5 ECE (Semesters 2, 4) |
| **Courses** | 14 | 9 CSE + 4 ECE + 1 Elective — Core, Lab, and Elective types |
| **Enrollments** | ~70 | All students enrolled in their semester courses |
| **Exams** | 56 | 4 per course (Quiz, Assignment, Mid-Term, End-Term) |
| **Marks** | ~140 | Marks for all completed exams (Quiz 1, Assignment 1) |
| **Attendance** | ~700 | 15 class days with Morning sessions |
| **Announcements** | 8 | Academic, Exam, Event, and General categories |

### 7.2 Sample Data

**Sample Departments:**
```sql
INSERT INTO departments (name, code, description, "establishedYear", "isActive")
VALUES 
('Computer Science & Engineering', 'CSE', 'Department of Computer Science and Engineering', 2000, TRUE),
('Electronics & Communication Engineering', 'ECE', 'Department of Electronics and Communication Engineering', 2000, TRUE),
('Mechanical Engineering', 'ME', 'Department of Mechanical Engineering', 2005, TRUE),
('Civil Engineering', 'CE', 'Department of Civil Engineering', 2005, TRUE),
('Electrical Engineering', 'EE', 'Department of Electrical Engineering', 2010, TRUE);
```

**Sample Students:**
```sql
INSERT INTO students ("rollNumber", name, email, "programId", "departmentId", "currentSemester", "admissionYear", "batchYear", gender, cgpa, status)
VALUES
('2024CSE001', 'Aarav Sharma', 'aarav.sharma@student.college.edu', 1, 1, 2, 2024, '2024-2028', 'Male', 8.50, 'Active'),
('2024CSE002', 'Diya Patel', 'diya.patel@student.college.edu', 1, 1, 2, 2024, '2024-2028', 'Female', 9.10, 'Active'),
('2024ECE001', 'Riya Banerjee', 'riya.banerjee@student.college.edu', 3, 2, 2, 2024, '2024-2028', 'Female', 8.60, 'Active');
```

**Sample Courses:**
```sql
INSERT INTO courses (name, code, "departmentId", "programId", "semesterId", "facultyId", "semesterNumber", credits, type, "internalMarks", "externalMarks", "totalMarks")
VALUES
('Programming in C', 'CSE201', 1, 1, 1, 4, 2, 4, 'Core', 40, 60, 100),
('Data Structures and Algorithms', 'CSE401', 1, 1, 1, 1, 4, 4, 'Core', 40, 60, 100),
('Database Management Systems', 'CSE402', 1, 1, 1, 2, 4, 4, 'Core', 40, 60, 100),
('Machine Learning', 'CSE601', 1, 1, 1, 1, 6, 4, 'Core', 40, 60, 100);
```

### 7.3 Login Credentials for Demo

| Role | Email | Password |
|---|---|---|
| Admin | admin@college.edu | Admin@123 |
| Faculty (CSE HOD) | rajesh.kumar@college.edu | Faculty@123 |
| Faculty (CSE) | priya.sharma@college.edu | Faculty@123 |
| Student (CSE, Sem 2) | aarav.sharma@student.college.edu | Student@123 |
| Student (CSE, Sem 4) | rahul.verma@student.college.edu | Student@123 |
| Student (ECE, Sem 2) | riya.banerjee@student.college.edu | Student@123 |

---

## 8. Triggers & Hooks (Stored Procedure Equivalents)

Since the project uses Sequelize ORM, traditional SQL triggers and stored procedures are implemented as **Sequelize Hooks** — these are the ORM equivalent and execute the same logic at the database interaction layer.

### 8.1 Password Hashing Trigger (beforeCreate / beforeUpdate on Users)

**Purpose:** Automatically hash the password before storing it in the database.

**Equivalent SQL Trigger:**
```sql
CREATE OR REPLACE FUNCTION hash_password()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.password <> OLD.password) THEN
        NEW.password := crypt(NEW.password, gen_salt('bf', 10));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_hash_password
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION hash_password();
```

**Sequelize Hook Implementation:**
```javascript
hooks: {
    beforeCreate: async (user) => {
        if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
        }
    },
    beforeUpdate: async (user) => {
        if (user.changed('password')) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
        }
    }
}
```

### 8.2 Auto-Calculate Marks Percentage & Grade (beforeSave on Marks)

**Purpose:** Automatically compute percentage, letter grade, and pass/fail status when marks are entered or updated.

**Equivalent SQL Trigger:**
```sql
CREATE OR REPLACE FUNCTION calculate_mark_grade()
RETURNS TRIGGER AS $$
DECLARE
    v_passing_marks INTEGER;
BEGIN
    -- Calculate percentage
    NEW.percentage := ROUND((NEW."marksObtained" / NEW."maxMarks") * 100);
    
    -- Assign grade based on percentage
    NEW.grade := CASE
        WHEN NEW.percentage >= 90 THEN 'A+'
        WHEN NEW.percentage >= 80 THEN 'A'
        WHEN NEW.percentage >= 70 THEN 'B+'
        WHEN NEW.percentage >= 60 THEN 'B'
        WHEN NEW.percentage >= 50 THEN 'C+'
        WHEN NEW.percentage >= 45 THEN 'C'
        WHEN NEW.percentage >= 40 THEN 'D'
        ELSE 'F'
    END;
    
    -- Determine pass/fail from exam's passing marks
    SELECT "passingMarks" INTO v_passing_marks FROM exams WHERE id = NEW."examId";
    IF v_passing_marks IS NOT NULL THEN
        NEW."isPassed" := (NEW."marksObtained" >= v_passing_marks);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_mark_grade
BEFORE INSERT OR UPDATE ON marks
FOR EACH ROW
EXECUTE FUNCTION calculate_mark_grade();
```

**Sequelize Hook Implementation:**
```javascript
hooks: {
    beforeSave: async (mark) => {
        mark.percentage = Math.round((mark.marksObtained / mark.maxMarks) * 100);
        const p = mark.percentage;
        if (p >= 90) mark.grade = 'A+';
        else if (p >= 80) mark.grade = 'A';
        // ... (full grading scale)
        else mark.grade = 'F';
        
        const exam = await Exam.findByPk(mark.examId);
        if (exam) {
            mark.isPassed = mark.marksObtained >= exam.passingMarks;
        }
    }
}
```

### 8.3 Semester Validation Trigger (validate on Semesters)

**Purpose:** Ensure end date is always after start date.

**Equivalent SQL Trigger:**
```sql
CREATE OR REPLACE FUNCTION validate_semester_dates()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW."endDate" <= NEW."startDate" THEN
        RAISE EXCEPTION 'End date must be after start date';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_semester_dates
BEFORE INSERT OR UPDATE ON semesters
FOR EACH ROW
EXECUTE FUNCTION validate_semester_dates();
```

### 8.4 Exam Validation Trigger (validate on Exams)

**Purpose:** Ensure passing marks never exceed maximum marks.

**Equivalent SQL Trigger:**
```sql
CREATE OR REPLACE FUNCTION validate_exam_marks()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW."passingMarks" > NEW."maxMarks" THEN
        RAISE EXCEPTION 'Passing marks cannot exceed maximum marks';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_exam_marks
BEFORE INSERT OR UPDATE ON exams
FOR EACH ROW
EXECUTE FUNCTION validate_exam_marks();
```

### 8.5 Global Hook — Auto-inject `_id` field (afterFind)

**Purpose:** Maintain compatibility between PostgreSQL integer IDs and frontend expectations (string `_id` field from MongoDB migration).

```javascript
sequelize.addHook('afterFind', (results) => {
    // Recursively adds _id = String(id) to all model instances
    // and their nested associations
});
```

### 8.6 Stored Procedure Equivalents

#### Procedure 1: Calculate Attendance Percentage (Static Method)
```sql
-- Equivalent stored procedure
CREATE OR REPLACE FUNCTION calculate_attendance(
    p_student_id INTEGER,
    p_course_id INTEGER
) RETURNS INTEGER AS $$
DECLARE
    v_total INTEGER;
    v_present INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total
    FROM attendances WHERE "studentId" = p_student_id AND "courseId" = p_course_id;
    
    SELECT COUNT(*) INTO v_present
    FROM attendances 
    WHERE "studentId" = p_student_id AND "courseId" = p_course_id 
      AND status IN ('Present', 'Late');
    
    IF v_total = 0 THEN RETURN 0; END IF;
    RETURN ROUND((v_present::DECIMAL / v_total) * 100);
END;
$$ LANGUAGE plpgsql;
```

**Application Implementation (Attendance model static method):**
```javascript
Attendance.calculateAttendance = async function(studentId, courseId) {
    const total = await this.count({ where: { studentId, courseId } });
    const present = await this.count({
        where: { studentId, courseId, status: { [Op.in]: ['Present', 'Late'] } }
    });
    if (total === 0) return 0;
    return Math.round((present / total) * 100);
};
```

#### Procedure 2: Calculate Grade Points (Instance Method)
```sql
CREATE OR REPLACE FUNCTION calculate_grade_points(p_grade VARCHAR)
RETURNS DECIMAL AS $$
BEGIN
    RETURN CASE p_grade
        WHEN 'A+' THEN 10  WHEN 'A' THEN 9  WHEN 'B+' THEN 8  WHEN 'B' THEN 7
        WHEN 'C+' THEN 6   WHEN 'C' THEN 5  WHEN 'D' THEN 4   ELSE 0
    END;
END;
$$ LANGUAGE plpgsql;
```

#### Procedure 3: Referential Integrity Check Before Delete
```sql
-- Used before deleting departments, courses, students, etc.
CREATE OR REPLACE FUNCTION check_department_dependencies(p_dept_id INTEGER)
RETURNS TABLE(programs_count BIGINT, faculty_count BIGINT, student_count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM programs WHERE "departmentId" = p_dept_id),
        (SELECT COUNT(*) FROM faculties WHERE "departmentId" = p_dept_id),
        (SELECT COUNT(*) FROM students WHERE "departmentId" = p_dept_id);
END;
$$ LANGUAGE plpgsql;
```

---

## 9. Indexes & Constraints

### 9.1 Primary Keys
Every table has `id SERIAL PRIMARY KEY` — auto-incrementing integer.

### 9.2 Unique Constraints

| Table | Unique Constraint | Purpose |
|---|---|---|
| users | email | No duplicate user accounts |
| departments | name | Department names are unique |
| departments | code | Department codes are unique |
| programs | code | Program codes are unique |
| programs | (name, departmentId) | Program name unique within a department |
| faculties | employeeId | Employee IDs are unique |
| faculties | email | Faculty emails are unique |
| students | rollNumber | Roll numbers are unique |
| students | email | Student emails are unique |
| semesters | code | Semester codes are unique |
| enrollments | (studentId, courseId, semesterId) | A student can only enroll once in a course per semester |
| attendances | (studentId, courseId, date, session) | One attendance record per student-course-date-session |
| marks | (studentId, examId) | One mark entry per student per exam |

### 9.3 Foreign Key Constraints

| Table | Foreign Key | References |
|---|---|---|
| departments | headOfDepartment | faculties(id) |
| programs | departmentId | departments(id) |
| faculties | departmentId | departments(id) |
| faculties | userId | users(id) |
| students | programId | programs(id) |
| students | departmentId | departments(id) |
| students | userId | users(id) |
| courses | departmentId | departments(id) |
| courses | programId | programs(id) |
| courses | semesterId | semesters(id) |
| courses | facultyId | faculties(id) |
| enrollments | studentId | students(id) |
| enrollments | courseId | courses(id) |
| enrollments | semesterId | semesters(id) |
| attendances | studentId | students(id) |
| attendances | courseId | courses(id) |
| attendances | markedBy | faculties(id) |
| exams | courseId | courses(id) |
| exams | semesterId | semesters(id) |
| marks | studentId | students(id) |
| marks | courseId | courses(id) |
| marks | examId | exams(id) |
| marks | enteredBy | faculties(id) |
| announcements | createdBy | users(id) |

**Total: 23 foreign key relationships**

### 9.4 Additional Indexes

| Table | Index | Type | Purpose |
|---|---|---|---|
| attendances | (courseId, date) | B-tree | Fast lookup of attendance by course and date |
| attendances | (studentId, date) | B-tree | Fast lookup of student's daily attendance |
| marks | (courseId, examId) | B-tree | Fast mark retrieval by course and exam |
| marks | (studentId, courseId) | B-tree | Fast grade lookup for a student in a course |
| announcements | (isActive, publishDate) | B-tree | Fast retrieval of active announcements by date |

### 9.5 CHECK Constraints

| Table | Column | Constraint |
|---|---|---|
| programs | duration | BETWEEN 1 AND 6 |
| programs | totalCredits | >= 0 |
| programs | fees | >= 0 |
| students | currentSemester | BETWEEN 1 AND 12 |
| students | cgpa | BETWEEN 0 AND 10 |
| courses | credits | BETWEEN 1 AND 10 |
| courses | semesterNumber | >= 1 |
| exams | maxMarks | >= 1 |
| exams | passingMarks <= maxMarks | Cross-column check |
| semesters | endDate > startDate | Cross-column check |
| semesters | semesterNumber | IN (1, 2) |
| marks | marksObtained | >= 0 |
| enrollments | gradePoints | BETWEEN 0 AND 10 |
| enrollments | attendancePercentage | BETWEEN 0 AND 100 |

---

## 10. Summary

### What We Built

| Aspect | Details |
|---|---|
| **Database** | PostgreSQL on Supabase (cloud-hosted) |
| **Tables** | 12 fully normalized relations |
| **Relationships** | 23 foreign keys, 13 unique constraints |
| **Normalization** | 3NF with controlled denormalization for performance |
| **Triggers/Hooks** | 5 hooks (password hashing, grade calculation, date validation, mark validation, ID injection) |
| **Stored Procedures** | 3 equivalent functions (attendance calc, grade points, dependency check) |
| **Indexes** | 5 custom + all PK/UNIQUE auto-created indexes |
| **Seed Data** | 1000+ records across all tables |
| **Query Types** | SELECT with JOINs (up to 4 tables), GROUP BY, COUNT, ILIKE search, UPSERT, bulk UPDATE |

### Key Design Decisions

1. **Surrogate Keys:** All tables use auto-incrementing integer `id` as the primary key instead of natural keys, ensuring consistency and simplifying JOINs.

2. **ENUM Types:** Used PostgreSQL ENUM for constrained fields (role, status, gender, grade, etc.) — enforces data integrity at the database level.

3. **Controlled Denormalization:** `departmentId` in students and courses tables is denormalized (derivable from `programId`) for query performance in frequently accessed dashboard and listing pages.

4. **Composite Unique Constraints:** Used on junction/transaction tables (enrollments, attendances, marks) to prevent duplicate entries.

5. **Sequelize Hooks as Triggers:** Business logic (password hashing, grade computation) is implemented as ORM hooks that execute before/after database operations — functionally equivalent to SQL triggers.

6. **Connection Pooling:** PostgreSQL connection pool configured with max 10 connections, 30s acquire timeout, 10s idle timeout — handles concurrent requests efficiently.

---

*Report prepared for Review 2: Schema Design & Database Implementation*  
*College Management System — DBMS Project*
