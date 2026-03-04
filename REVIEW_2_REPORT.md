# Review 2: Schema Design & Database Implementation

**Project:** College Management System (CMS)  
**Database:** PostgreSQL (hosted on Supabase)  
**ORM:** Sequelize v6  
**Date:** March 4, 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Relational Schema](#2-relational-schema)
3. [Entity-Relationship Diagram (Textual)](#3-entity-relationship-diagram)
4. [Table Definitions (DDL)](#4-table-definitions-ddl)
5. [Normalization up to 3NF](#5-normalization-up-to-3nf)
6. [SQL Queries](#6-sql-queries)
7. [Data Population](#7-data-population)
8. [Database Functions, Triggers & Stored Procedures](#8-database-functions-triggers--stored-procedures)
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

#### Query 11: Admin dashboard — All stats via single DB function call
```sql
-- Single call to the database function (replaces 6+ parallel queries)
SELECT get_admin_dashboard_stats() AS stats;
-- Returns JSON:
-- { totalStudents, totalFaculty, totalDepartments, totalPrograms,
--   totalCourses, activeStudents, activeFaculty, activeSemesters,
--   totalEnrollments, totalExams }

-- Department-wise statistics via set-returning function
SELECT * FROM get_department_statistics();
-- Returns: department_id, department_name, student_count, faculty_count, program_count, course_count

-- Student academic summary
SELECT get_student_academic_summary(1) AS summary;
-- Returns JSON: cgpa, totalCreditsEarned, averageAttendance, averageMarks, etc.
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

## 8. Database Functions, Triggers & Stored Procedures

All business logic has been implemented as **native PostgreSQL functions, triggers, and stored procedures** directly in the Supabase database. These are visible in the **Supabase Dashboard → Database → Functions** and **Database → Triggers** panels.

The migration file is located at `backend/migrations/supabase_functions_triggers.sql` and can be applied by running `npm run migrate`.

---

### 8.1 Utility Functions

#### `update_updated_at_column()` — Auto-timestamp trigger function
**Purpose:** Automatically sets `updatedAt` to the current time before any row update. Applied to all 12 tables.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Applied with one trigger per table, for example:
```sql
CREATE TRIGGER trg_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

> This trigger fires on all 12 tables: `users`, `departments`, `programs`, `faculties`, `students`, `semesters`, `courses`, `enrollments`, `attendances`, `exams`, `marks`, `announcements`.

#### `generate_academic_code(prefix TEXT, seq_num INTEGER)` — Code generator
```sql
CREATE OR REPLACE FUNCTION generate_academic_code(prefix TEXT, seq_num INTEGER)
RETURNS TEXT AS $$
BEGIN
    RETURN prefix || '-' || LPAD(seq_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;
```

---

### 8.2 Mark Calculation Functions & Trigger

#### `calculate_grade(percentage NUMERIC)` → VARCHAR(2)
**Purpose:** Returns the letter grade for a given percentage score.

```sql
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
```

#### `calculate_grade_points(grade VARCHAR)` → NUMERIC
**Purpose:** Returns the grade point value (0–10) for a letter grade.

```sql
CREATE OR REPLACE FUNCTION calculate_grade_points(grade VARCHAR)
RETURNS NUMERIC AS $$
BEGIN
    CASE grade
        WHEN 'A+' THEN RETURN 10;  WHEN 'A'  THEN RETURN 9;
        WHEN 'B+' THEN RETURN 8;   WHEN 'B'  THEN RETURN 7;
        WHEN 'C+' THEN RETURN 6;   WHEN 'C'  THEN RETURN 5;
        WHEN 'D'  THEN RETURN 4;   ELSE RETURN 0;
    END CASE;
END;
$$ LANGUAGE plpgsql;
```

#### `trg_calculate_mark_fields()` — Trigger on `marks`
**Purpose:** Automatically calculates `percentage`, `grade`, and `isPassed` whenever a mark is inserted or updated.

```sql
CREATE OR REPLACE FUNCTION trg_calculate_mark_fields()
RETURNS TRIGGER AS $$
DECLARE
    v_max_marks NUMERIC;
    v_passing_marks NUMERIC;
    v_percentage NUMERIC;
BEGIN
    SELECT "maxMarks", "passingMarks"
    INTO v_max_marks, v_passing_marks
    FROM exams WHERE id = NEW."examId";

    IF NEW."maxMarks" IS NULL OR NEW."maxMarks" = 0 THEN
        NEW."maxMarks" = v_max_marks;
    END IF;

    v_percentage := ROUND((NEW."marksObtained"::NUMERIC / NEW."maxMarks"::NUMERIC) * 100);
    NEW.percentage = v_percentage;
    NEW.grade = calculate_grade(v_percentage);
    NEW."isPassed" = (NEW."marksObtained" >= v_passing_marks);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_marks_auto_calculate
    BEFORE INSERT OR UPDATE OF "marksObtained"
    ON marks
    FOR EACH ROW
    EXECUTE FUNCTION trg_calculate_mark_fields();
```

#### `trg_validate_mark_value()` — Validation trigger on `marks`
**Purpose:** Prevents marks from exceeding the exam's maximum marks.

```sql
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

CREATE TRIGGER trg_mark_value_validation
    BEFORE INSERT OR UPDATE ON marks
    FOR EACH ROW
    EXECUTE FUNCTION trg_validate_mark_value();
```

---

### 8.3 Enrollment Functions & Triggers

#### `trg_update_course_enrollment_count()` — Auto-sync enrollment count
**Purpose:** Keeps `courses.currentEnrollment` accurate by recalculating it whenever an enrollment is inserted, updated, or deleted.

```sql
CREATE OR REPLACE FUNCTION trg_update_course_enrollment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE courses
        SET "currentEnrollment" = (
            SELECT COUNT(*) FROM enrollments
            WHERE "courseId" = OLD."courseId" AND status = 'Enrolled'
        ) WHERE id = OLD."courseId";
        RETURN OLD;
    ELSE
        IF TG_OP = 'UPDATE' AND OLD."courseId" IS DISTINCT FROM NEW."courseId" THEN
            UPDATE courses
            SET "currentEnrollment" = (
                SELECT COUNT(*) FROM enrollments
                WHERE "courseId" = OLD."courseId" AND status = 'Enrolled'
            ) WHERE id = OLD."courseId";
        END IF;
        UPDATE courses
        SET "currentEnrollment" = (
            SELECT COUNT(*) FROM enrollments
            WHERE "courseId" = NEW."courseId" AND status = 'Enrolled'
        ) WHERE id = NEW."courseId";
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enrollment_count_update
    AFTER INSERT OR UPDATE OR DELETE ON enrollments
    FOR EACH ROW
    EXECUTE FUNCTION trg_update_course_enrollment_count();
```

#### `trg_check_enrollment_capacity()` — Capacity guard trigger
**Purpose:** Prevents enrollment if a course has reached its `maxCapacity`.

```sql
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

CREATE TRIGGER trg_enrollment_capacity_check
    BEFORE INSERT ON enrollments
    FOR EACH ROW
    EXECUTE FUNCTION trg_check_enrollment_capacity();
```

#### `trg_update_student_cgpa()` — CGPA auto-update trigger
**Purpose:** Recalculates and updates a student's `cgpa` and `totalCreditsEarned` whenever an enrollment is marked as Completed with a grade.

```sql
CREATE OR REPLACE FUNCTION trg_update_student_cgpa()
RETURNS TRIGGER AS $$
DECLARE
    v_cgpa NUMERIC;
    v_total_credits INTEGER;
BEGIN
    v_cgpa := calculate_student_cgpa(NEW."studentId");

    SELECT COALESCE(SUM(c.credits), 0) INTO v_total_credits
    FROM enrollments e
    JOIN courses c ON c.id = e."courseId"
    WHERE e."studentId" = NEW."studentId"
      AND e.status = 'Completed'
      AND e.grade NOT IN ('F', 'I', 'W');

    UPDATE students
    SET cgpa = v_cgpa, "totalCreditsEarned" = v_total_credits
    WHERE id = NEW."studentId";

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enrollment_cgpa_update
    AFTER UPDATE OF grade, "gradePoints", status ON enrollments
    FOR EACH ROW
    WHEN (NEW.status = 'Completed')
    EXECUTE FUNCTION trg_update_student_cgpa();
```

---

### 8.4 Attendance Functions & Triggers

#### `calculate_attendance_percentage(p_student_id, p_course_id)` → NUMERIC
**Purpose:** Returns the attendance percentage for a student in a specific course.

```sql
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

    IF v_total = 0 THEN RETURN 0; END IF;

    SELECT COUNT(*) INTO v_present
    FROM attendances
    WHERE "studentId" = p_student_id
      AND "courseId" = p_course_id
      AND status IN ('Present', 'Late');

    RETURN ROUND((v_present::NUMERIC / v_total::NUMERIC) * 100, 2);
END;
$$ LANGUAGE plpgsql;
```

**Called from backend:**
```javascript
const [result] = await sequelize.query(
  'SELECT calculate_attendance_percentage(:studentId, :courseId) as percentage',
  { replacements: { studentId, courseId } }
);
```

#### `trg_update_enrollment_attendance()` — Auto-update attendance % on enrollment
**Purpose:** After every attendance INSERT/UPDATE/DELETE, recalculates and stores the attendance percentage in the `enrollments` table.

```sql
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

    v_attendance_pct := calculate_attendance_percentage(v_student_id, v_course_id);

    UPDATE enrollments
    SET "attendancePercentage" = v_attendance_pct
    WHERE "studentId" = v_student_id
      AND "courseId" = v_course_id
      AND status = 'Enrolled';

    IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_attendance_update_enrollment
    AFTER INSERT OR UPDATE OR DELETE ON attendances
    FOR EACH ROW
    EXECUTE FUNCTION trg_update_enrollment_attendance();
```

---

### 8.5 Validation Triggers

#### `trg_validate_semester_dates()` — Date range validation
**Purpose:** Ensures semester end date is always after start date.

```sql
CREATE OR REPLACE FUNCTION trg_validate_semester_dates()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW."endDate" <= NEW."startDate" THEN
        RAISE EXCEPTION 'Semester end date must be after start date';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_semester_date_validation
    BEFORE INSERT OR UPDATE ON semesters
    FOR EACH ROW
    EXECUTE FUNCTION trg_validate_semester_dates();
```

#### `trg_ensure_single_current_semester()` — Single active semester
**Purpose:** Ensures only one semester can be marked as `isCurrent = true` at any time.

```sql
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

CREATE TRIGGER trg_single_current_semester
    BEFORE INSERT OR UPDATE OF "isCurrent" ON semesters
    FOR EACH ROW
    WHEN (NEW."isCurrent" = true)
    EXECUTE FUNCTION trg_ensure_single_current_semester();
```

#### `trg_validate_exam_marks()` — Exam mark validation
**Purpose:** Prevents passing marks from exceeding the exam's maximum marks.

```sql
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

CREATE TRIGGER trg_exam_marks_validation
    BEFORE INSERT OR UPDATE ON exams
    FOR EACH ROW
    EXECUTE FUNCTION trg_validate_exam_marks();
```

---

### 8.6 Dashboard & Statistics Functions

#### `get_admin_dashboard_stats()` → JSON
**Purpose:** Returns all admin dashboard counts (students, faculty, departments, etc.) in a single JSON object from one DB call.

```sql
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'totalStudents',     (SELECT COUNT(*) FROM students),
        'totalFaculty',      (SELECT COUNT(*) FROM faculties),
        'totalDepartments',  (SELECT COUNT(*) FROM departments),
        'totalPrograms',     (SELECT COUNT(*) FROM programs),
        'totalCourses',      (SELECT COUNT(*) FROM courses),
        'activeStudents',    (SELECT COUNT(*) FROM students WHERE status = 'Active'),
        'activeFaculty',     (SELECT COUNT(*) FROM faculties WHERE "isActive" = true),
        'activeSemesters',   (SELECT COUNT(*) FROM semesters WHERE "isCurrent" = true),
        'totalEnrollments',  (SELECT COUNT(*) FROM enrollments),
        'totalExams',        (SELECT COUNT(*) FROM exams)
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql;
```

**Called from backend dashboard controller:**
```javascript
const [statsResult] = await sequelize.query('SELECT get_admin_dashboard_stats() as stats');
const overview = statsResult[0].stats;
```

#### `get_department_statistics()` → TABLE
**Purpose:** Returns department-wise counts for students, faculty, programs, and courses.

```sql
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
    SELECT d.id,
           d.name::VARCHAR, d.code::VARCHAR,
           (SELECT COUNT(*) FROM students s WHERE s."departmentId" = d.id),
           (SELECT COUNT(*) FROM faculties f WHERE f."departmentId" = d.id),
           (SELECT COUNT(*) FROM programs p WHERE p."departmentId" = d.id),
           (SELECT COUNT(*) FROM courses c WHERE c."departmentId" = d.id)
    FROM departments d WHERE d."isActive" = true
    ORDER BY d.name;
END;
$$ LANGUAGE plpgsql;
```

#### `get_student_academic_summary(p_student_id INTEGER)` → JSON
**Purpose:** Returns a complete academic profile for a student — CGPA, attendance, marks average, and credit counts.

```sql
CREATE OR REPLACE FUNCTION get_student_academic_summary(p_student_id INTEGER)
RETURNS JSON AS $$
DECLARE result JSON;
BEGIN
    SELECT json_build_object(
        'studentId',          s.id,
        'name',               s.name,
        'cgpa',               s.cgpa,
        'totalCreditsEarned', s."totalCreditsEarned",
        'totalCoursesEnrolled', (SELECT COUNT(*) FROM enrollments e WHERE e."studentId" = p_student_id),
        'completedCourses',   (SELECT COUNT(*) FROM enrollments e WHERE e."studentId" = p_student_id AND e.status = 'Completed'),
        'averageAttendance',  (SELECT COALESCE(ROUND(AVG(e."attendancePercentage"), 2), 0)
                               FROM enrollments e WHERE e."studentId" = p_student_id AND e.status = 'Enrolled'),
        'averageMarks',       (SELECT COALESCE(ROUND(AVG(m.percentage), 2), 0)
                               FROM marks m WHERE m."studentId" = p_student_id)
    ) INTO result
    FROM students s WHERE s.id = p_student_id;
    RETURN result;
END;
$$ LANGUAGE plpgsql;
```

#### `calculate_student_cgpa(p_student_id INTEGER)` → NUMERIC
**Purpose:** Computes CGPA using weighted average of grade points across all completed courses.

```sql
CREATE OR REPLACE FUNCTION calculate_student_cgpa(p_student_id INTEGER)
RETURNS NUMERIC AS $$
DECLARE
    v_total_credits NUMERIC := 0;
    v_weighted_points NUMERIC := 0;
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

    IF v_total_credits = 0 THEN RETURN 0; END IF;
    RETURN ROUND(v_weighted_points / v_total_credits, 2);
END;
$$ LANGUAGE plpgsql;
```

---

### 8.7 Stored Procedures

#### Procedure 1: `enroll_student` — Enroll with full validation
**Purpose:** Validates student status, course availability, capacity, and duplicate enrollment before inserting.

```sql
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
    SELECT status INTO v_student_status FROM students WHERE id = p_student_id;
    IF v_student_status IS NULL THEN
        p_message := 'Student not found'; p_enrollment_id := NULL; RETURN;
    END IF;
    IF v_student_status <> 'Active' THEN
        p_message := 'Student is not active'; p_enrollment_id := NULL; RETURN;
    END IF;

    SELECT "isActive", "maxCapacity" INTO v_course_active, v_max_capacity
    FROM courses WHERE id = p_course_id;
    IF NOT v_course_active THEN
        p_message := 'Course is not active'; p_enrollment_id := NULL; RETURN;
    END IF;

    SELECT id INTO v_existing FROM enrollments
    WHERE "studentId" = p_student_id AND "courseId" = p_course_id AND "semesterId" = p_semester_id;
    IF v_existing IS NOT NULL THEN
        p_message := 'Student is already enrolled'; p_enrollment_id := v_existing; RETURN;
    END IF;

    SELECT COUNT(*) INTO v_current_count FROM enrollments
    WHERE "courseId" = p_course_id AND status = 'Enrolled';
    IF v_current_count >= v_max_capacity THEN
        p_message := 'Course has reached maximum capacity'; p_enrollment_id := NULL; RETURN;
    END IF;

    INSERT INTO enrollments ("studentId", "courseId", "semesterId", "enrollmentDate", status, "createdAt", "updatedAt")
    VALUES (p_student_id, p_course_id, p_semester_id, CURRENT_DATE, 'Enrolled', NOW(), NOW())
    RETURNING id INTO p_enrollment_id;
    p_message := 'Student enrolled successfully';
END;
$$;
```

#### Procedure 2: `update_enrollment_grade` — Set grade with auto grade-point calculation
```sql
CREATE OR REPLACE PROCEDURE update_enrollment_grade(
    p_enrollment_id INTEGER,
    p_grade VARCHAR,
    OUT p_message TEXT
)
LANGUAGE plpgsql AS $$
DECLARE v_grade_points NUMERIC;
BEGIN
    v_grade_points := calculate_grade_points(p_grade);
    UPDATE enrollments
    SET grade = p_grade, "gradePoints" = v_grade_points,
        status = CASE WHEN p_grade IN ('F', 'I', 'W') THEN status ELSE 'Completed' END,
        "updatedAt" = NOW()
    WHERE id = p_enrollment_id;
    IF NOT FOUND THEN
        p_message := 'Enrollment not found';
    ELSE
        p_message := 'Grade updated. Grade: ' || p_grade || ', Points: ' || v_grade_points;
    END IF;
END;
$$;
```

#### Procedure 3: `mark_bulk_attendance` — Bulk attendance entry
**Purpose:** Processes a JSON array of `{ studentId, status }` records and upserts attendance for a given course, date, and session.

```sql
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
    p_successful := 0; p_updated := 0; p_failed := 0;
    FOR v_record IN SELECT * FROM jsonb_array_elements(p_records) LOOP
        BEGIN
            v_student_id := (v_record->>'studentId')::INTEGER;
            v_status := v_record->>'status';
            SELECT id INTO v_existing_id FROM attendances
            WHERE "studentId" = v_student_id AND "courseId" = p_course_id
              AND date = p_date AND session = p_session;
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
```

#### Procedure 4: `enter_bulk_marks` — Bulk mark entry
**Purpose:** Processes a JSON array of `{ studentId, marksObtained }` records and upserts marks for a given exam.

```sql
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
    p_successful := 0; p_updated := 0; p_failed := 0;
    SELECT "maxMarks" INTO v_max_marks FROM exams WHERE id = p_exam_id;
    FOR v_record IN SELECT * FROM jsonb_array_elements(p_marks) LOOP
        BEGIN
            v_student_id := (v_record->>'studentId')::INTEGER;
            v_marks_obtained := (v_record->>'marksObtained')::NUMERIC;
            SELECT id INTO v_existing_id FROM marks
            WHERE "studentId" = v_student_id AND "examId" = p_exam_id;
            IF v_existing_id IS NOT NULL THEN
                UPDATE marks
                SET "marksObtained" = v_marks_obtained, "enteredBy" = p_entered_by, "updatedAt" = NOW()
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
```

---

### 8.8 Summary of All Database Objects

| Type | Name | Table | Purpose |
|---|---|---|---|
| **TRIGGER** | `trg_marks_auto_calculate` | marks | Auto-fills percentage, grade, isPassed |
| **TRIGGER** | `trg_mark_value_validation` | marks | Validates marks ≤ exam max marks |
| **TRIGGER** | `trg_enrollment_count_update` | enrollments | Keeps course currentEnrollment in sync |
| **TRIGGER** | `trg_enrollment_capacity_check` | enrollments | Blocks over-enrollment |
| **TRIGGER** | `trg_enrollment_cgpa_update` | enrollments | Recalculates student CGPA on grade change |
| **TRIGGER** | `trg_attendance_update_enrollment` | attendances | Updates attendance % on enrollment record |
| **TRIGGER** | `trg_semester_date_validation` | semesters | Validates end date > start date |
| **TRIGGER** | `trg_single_current_semester` | semesters | Ensures only one current semester |
| **TRIGGER** | `trg_exam_marks_validation` | exams | passingMarks ≤ maxMarks |
| **TRIGGER** | `trg_*_updated_at` (×12) | all tables | Auto-sets updatedAt timestamp |
| **FUNCTION** | `calculate_grade` | — | Letter grade from percentage |
| **FUNCTION** | `calculate_grade_points` | — | Grade points from letter grade |
| **FUNCTION** | `calculate_attendance_percentage` | — | Attendance % for student+course |
| **FUNCTION** | `calculate_student_cgpa` | — | CGPA from completed enrollments |
| **FUNCTION** | `get_admin_dashboard_stats` | — | All dashboard counts as JSON |
| **FUNCTION** | `get_department_statistics` | — | Dept-wise stats table |
| **FUNCTION** | `get_student_academic_summary` | — | Full student academic profile |
| **FUNCTION** | `get_faculty_course_summary` | — | Faculty course stats table |
| **FUNCTION** | `update_updated_at_column` | — | Utility for updatedAt triggers |
| **FUNCTION** | `generate_academic_code` | — | Formatted code generator |
| **PROCEDURE** | `enroll_student` | — | Validated enrollment with capacity check |
| **PROCEDURE** | `update_enrollment_grade` | — | Grade update with auto grade-point calc |
| **PROCEDURE** | `mark_bulk_attendance` | — | Bulk attendance upsert from JSON |
| **PROCEDURE** | `enter_bulk_marks` | — | Bulk marks upsert from JSON |

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
| **DB Functions** | 15 PostgreSQL functions (grade calc, CGPA, attendance %, dashboard stats, etc.) |
| **DB Triggers** | 21 triggers across all tables (auto-calculation, validation, sync, timestamps) |
| **Stored Procedures** | 4 procedures (enroll_student, update_enrollment_grade, mark_bulk_attendance, enter_bulk_marks) |
| **Indexes** | 5 custom + all PK/UNIQUE auto-created indexes |
| **Migration** | `backend/migrations/supabase_functions_triggers.sql` — run via `npm run migrate` |
| **Seed Data** | 1000+ records across all tables |
| **Query Types** | SELECT with JOINs (up to 4 tables), GROUP BY, COUNT, ILIKE search, UPSERT, bulk UPDATE, DB function calls |

### Key Design Decisions

1. **Surrogate Keys:** All tables use auto-incrementing integer `id` as the primary key instead of natural keys, ensuring consistency and simplifying JOINs.

2. **ENUM Types:** Used PostgreSQL ENUM for constrained fields (role, status, gender, grade, etc.) — enforces data integrity at the database level.

3. **Controlled Denormalization:** `departmentId` in students and courses tables is denormalized (derivable from `programId`) for query performance in frequently accessed dashboard and listing pages.

4. **Composite Unique Constraints:** Used on junction/transaction tables (enrollments, attendances, marks) to prevent duplicate entries.

5. **Native PostgreSQL Triggers & Functions:** Business logic (grade computation, attendance sync, CGPA recalculation, enrollment capacity checks) is implemented directly as PostgreSQL database functions and triggers in Supabase. These are visible in **Supabase Dashboard → Database → Functions** and **Database → Triggers**. Sequelize hooks serve as an application-layer fallback only.

6. **Stored Procedures for Complex Operations:** Bulk operations (bulk attendance, bulk marks, enrollment with validation) are encapsulated as PostgreSQL stored procedures, ensuring data consistency within a single database transaction.

7. **Connection Pooling:** PostgreSQL connection pool configured with max 10 connections, 30s acquire timeout, 10s idle timeout — handles concurrent requests efficiently.

---

*Report prepared for Review 2: Schema Design & Database Implementation*  
*College Management System — DBMS Project*
