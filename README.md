# 🎓 College Management System

A comprehensive full-stack College Management System built with **React**, **Node.js**, **Express**, and **MongoDB**. This DBMS project demonstrates advanced database design concepts including normalization, referential integrity, indexing, and complex queries.

---

## 📑 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Database Architecture](#database-architecture)
- [Entity-Relationship Diagram](#entity-relationship-diagram)
- [Database Schema Design](#database-schema-design)
- [Data Models Reference](#data-models-reference)
- [Database Relationships](#database-relationships)
- [Indexing Strategy](#indexing-strategy)
- [Data Validation Rules](#data-validation-rules)
- [Database Operations (CRUD)](#database-operations-crud)
- [Query Examples](#query-examples)
- [Normalization Analysis](#normalization-analysis)
- [Data Integrity Constraints](#data-integrity-constraints)
- [Installation & Setup](#installation--setup)
- [API Endpoints](#api-endpoints)

---

## Overview

This College Management System manages:
- **Departments** - Academic departments/branches
- **Programs** - Degree programs (B.Tech, M.Tech, MBA, etc.)
- **Faculty** - Teachers and staff
- **Students** - Enrolled students
- **Courses** - Subjects offered
- **Semesters** - Academic terms
- **Enrollments** - Student-Course registrations
- **Attendance** - Daily attendance tracking
- **Exams** - Assessments and examinations
- **Marks** - Student grades and scores
- **Announcements** - Notifications and notices
- **Users** - Authentication and authorization

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Vite |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (NoSQL Document Database) |
| **ODM** | Mongoose 8.x |
| **Authentication** | JWT (JSON Web Tokens), bcrypt |

---

## Database Architecture

### Why MongoDB?

MongoDB was chosen for this project due to:

1. **Flexible Schema** - Easily accommodate varying student/course attributes
2. **Document Model** - Natural fit for hierarchical data (address, guardian info)
3. **Horizontal Scaling** - Handle large student populations
4. **Rich Query Language** - Support complex aggregations for reports
5. **Mongoose ODM** - Schema validation, middleware, and population

### Database Connection

```javascript
// backend/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGODB_URI);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
  console.log(`Database: ${conn.connection.name}`);
};
```

### Connection String Format
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
```

---

## Entity-Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        COLLEGE MANAGEMENT SYSTEM - ER DIAGRAM                        │
└─────────────────────────────────────────────────────────────────────────────────────┘

                                    ┌──────────────┐
                                    │     USER     │
                                    │──────────────│
                                    │ _id (PK)     │
                                    │ email        │
                                    │ password     │
                                    │ role         │
                                    │ profileId    │
                                    └──────┬───────┘
                                           │
                          ┌────────────────┴────────────────┐
                          │                                 │
                          ▼                                 ▼
                   ┌──────────────┐                  ┌──────────────┐
                   │   FACULTY    │                  │   STUDENT    │
                   │──────────────│                  │──────────────│
                   │ _id (PK)     │                  │ _id (PK)     │
                   │ employeeId   │                  │ rollNumber   │
                   │ name         │                  │ name         │
                   │ email        │                  │ email        │
                   │ department   │◄─────────────────│ department   │
                   │ designation  │                  │ program      │
                   └──────┬───────┘                  │ currentSem   │
                          │                          └──────┬───────┘
                          │                                 │
     ┌────────────────────┼─────────────────────────────────┼────────────────────┐
     │                    │                                 │                    │
     ▼                    ▼                                 ▼                    ▼
┌──────────┐      ┌──────────────┐                  ┌──────────────┐     ┌──────────────┐
│DEPARTMENT│◄─────│   PROGRAM    │                  │  ENROLLMENT  │     │  ATTENDANCE  │
│──────────│      │──────────────│                  │──────────────│     │──────────────│
│ _id (PK) │      │ _id (PK)     │                  │ _id (PK)     │     │ _id (PK)     │
│ name     │      │ name         │                  │ student (FK) │     │ student (FK) │
│ code     │      │ code         │                  │ course (FK)  │     │ course (FK)  │
│ HOD      │      │ department   │                  │ semester(FK) │     │ date         │
└────┬─────┘      │ degreeType   │                  │ status       │     │ status       │
     │            │ duration     │                  │ grade        │     │ markedBy(FK) │
     │            └──────────────┘                  └──────────────┘     └──────────────┘
     │                                                     │
     │            ┌──────────────┐                         │
     └───────────►│    COURSE    │◄────────────────────────┘
                  │──────────────│
                  │ _id (PK)     │         ┌──────────────┐
                  │ code         │         │   SEMESTER   │
                  │ name         │         │──────────────│
                  │ department   │◄────────│ _id (PK)     │
                  │ program      │         │ name         │
                  │ semester     │         │ code         │
                  │ faculty      │         │ academicYear │
                  │ credits      │         │ isCurrent    │
                  │ type         │         └──────────────┘
                  └──────┬───────┘
                         │
           ┌─────────────┴─────────────┐
           │                           │
           ▼                           ▼
    ┌──────────────┐           ┌──────────────┐
    │     EXAM     │           │     MARK     │
    │──────────────│           │──────────────│
    │ _id (PK)     │           │ _id (PK)     │
    │ name         │           │ student (FK) │
    │ course (FK)  │◄──────────│ exam (FK)    │
    │ semester(FK) │           │ course (FK)  │
    │ type         │           │ marks        │
    │ maxMarks     │           │ grade        │
    │ date         │           │ isPassed     │
    └──────────────┘           └──────────────┘

                  ┌──────────────┐
                  │ ANNOUNCEMENT │
                  │──────────────│
                  │ _id (PK)     │
                  │ title        │
                  │ content      │
                  │ category     │
                  │ targetRoles  │
                  │ createdBy    │
                  └──────────────┘

LEGEND:
────────
PK = Primary Key
FK = Foreign Key
──► = References / Foreign Key Relationship
◄── = Referenced By
```

---

## Database Schema Design

### Collection Overview

| Collection | Documents | Purpose | Key Indexes |
|------------|-----------|---------|-------------|
| `users` | Authentication records | Login/Auth | `email` (unique) |
| `departments` | ~10-20 | Academic departments | `code` (unique), `name` (unique) |
| `programs` | ~30-50 | Degree programs | `code` (unique), `{name, department}` (compound) |
| `faculty` | ~100-500 | Teaching staff | `employeeId` (unique), `email` (unique) |
| `students` | ~1000-10000 | Enrolled students | `rollNumber` (unique), `email` (unique) |
| `semesters` | ~20-40 | Academic terms | `code` (unique), `isCurrent` |
| `courses` | ~200-500 | Subjects | `{code, semester}` (compound) |
| `enrollments` | ~10000+ | Student registrations | `{student, course, semester}` (compound unique) |
| `attendance` | ~100000+ | Daily records | `{student, course, date, session}` (compound unique) |
| `exams` | ~500-1000 | Assessments | `{course, semester}` |
| `marks` | ~50000+ | Grades | `{student, exam}` (compound unique) |
| `announcements` | ~100-500 | Notifications | `{isActive, publishDate}` |

---

## Data Models Reference

### 1. Department Model

```javascript
const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    maxlength: 10
  },
  description: String,
  headOfDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty'
  },
  establishedYear: Number,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Virtual populations
departmentSchema.virtual('programs', { ref: 'Program', localField: '_id', foreignField: 'department' });
departmentSchema.virtual('facultyMembers', { ref: 'Faculty', localField: '_id', foreignField: 'department' });
departmentSchema.virtual('courses', { ref: 'Course', localField: '_id', foreignField: 'department' });
```

**Sample Document:**
```json
{
  "_id": "ObjectId('...')",
  "name": "Computer Science and Engineering",
  "code": "CSE",
  "description": "Department of Computer Science and Engineering",
  "headOfDepartment": "ObjectId('faculty_id')",
  "establishedYear": 2010,
  "isActive": true,
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

---

### 2. Program Model

```javascript
const programSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, maxlength: 15 },
  department: { type: ObjectId, ref: 'Department', required: true },
  duration: { type: Number, required: true, min: 1, max: 6 },
  degreeType: {
    type: String,
    enum: ['Bachelor', 'Master', 'Doctorate', 'Diploma', 'Certificate'],
    required: true
  },
  totalCredits: { type: Number, required: true, min: 0 },
  totalSemesters: { type: Number, required: true, min: 1 },
  description: String,
  eligibility: String,
  fees: { type: Number, min: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Compound unique index
programSchema.index({ name: 1, department: 1 }, { unique: true });
```

**Sample Document:**
```json
{
  "_id": "ObjectId('...')",
  "name": "Bachelor of Technology in Computer Science",
  "code": "BTECH-CSE",
  "department": "ObjectId('dept_id')",
  "duration": 4,
  "degreeType": "Bachelor",
  "totalCredits": 160,
  "totalSemesters": 8,
  "description": "4-year undergraduate program",
  "eligibility": "10+2 with PCM, minimum 60%",
  "fees": 150000
}
```

---

### 3. Student Model

```javascript
const studentSchema = new mongoose.Schema({
  rollNumber: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
  },
  phone: String,
  program: { type: ObjectId, ref: 'Program', required: true },
  department: { type: ObjectId, ref: 'Department', required: true },
  currentSemester: { type: Number, required: true, min: 1, max: 12 },
  admissionYear: { type: Number, required: true },
  batchYear: String,
  dateOfBirth: Date,
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  
  // Embedded sub-document for address
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  
  // Embedded sub-document for guardian
  guardian: {
    name: String,
    phone: String,
    relation: String
  },
  
  user: { type: ObjectId, ref: 'User' },
  status: { type: String, enum: ['Active', 'Inactive', 'Graduated', 'Suspended'], default: 'Active' }
}, { timestamps: true });
```

**Sample Document:**
```json
{
  "_id": "ObjectId('...')",
  "rollNumber": "2022CSE001",
  "name": "John Doe",
  "email": "john.doe@college.edu",
  "phone": "9876543210",
  "program": "ObjectId('program_id')",
  "department": "ObjectId('dept_id')",
  "currentSemester": 5,
  "admissionYear": 2022,
  "batchYear": "2022-2026",
  "dateOfBirth": "2004-05-15T00:00:00.000Z",
  "gender": "Male",
  "bloodGroup": "B+",
  "address": {
    "street": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "guardian": {
    "name": "James Doe",
    "phone": "9876543211",
    "relation": "Father"
  },
  "status": "Active"
}
```

---

### 4. Faculty Model

```javascript
const facultySchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: String,
  department: { type: ObjectId, ref: 'Department', required: true },
  designation: {
    type: String,
    enum: ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Teaching Assistant'],
    required: true
  },
  specialization: String,
  qualification: String,
  experience: { type: Number, min: 0 },
  dateOfJoining: { type: Date, required: true },
  dateOfBirth: Date,
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  address: { street: String, city: String, state: String, pincode: String },
  salary: { type: Number, min: 0 },
  user: { type: ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Virtual for courses taught
facultySchema.virtual('coursesTaught', { ref: 'Course', localField: '_id', foreignField: 'faculty' });
```

---

### 5. Course Model

```javascript
const courseSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, uppercase: true },
  department: { type: ObjectId, ref: 'Department', required: true },
  program: { type: ObjectId, ref: 'Program', required: true },
  semester: { type: ObjectId, ref: 'Semester', required: true },
  faculty: { type: ObjectId, ref: 'Faculty' },
  semesterNumber: { type: Number, required: true, min: 1 },
  credits: { type: Number, required: true, min: 1, max: 10 },
  type: {
    type: String,
    enum: ['Core', 'Elective', 'Lab', 'Project', 'Seminar'],
    required: true
  },
  description: String,
  syllabus: String,
  
  // Hours per week
  lectureHours: { type: Number, default: 3 },
  tutorialHours: { type: Number, default: 1 },
  practicalHours: { type: Number, default: 0 },
  
  // Evaluation scheme
  internalMarks: { type: Number, default: 40 },
  externalMarks: { type: Number, default: 60 },
  totalMarks: { type: Number, default: 100 },
  passingMarks: { type: Number, default: 40 },
  
  // Capacity management
  maxCapacity: { type: Number, default: 60 },
  currentEnrollment: { type: Number, default: 0 },
  
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Compound unique index
courseSchema.index({ code: 1, semester: 1 }, { unique: true });
```

---

### 6. Semester Model

```javascript
const semesterSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  academicYear: {
    type: String,
    required: true,
    match: [/^\d{4}-\d{4}$/, 'Format: YYYY-YYYY']
  },
  semesterNumber: { type: Number, required: true, enum: [1, 2] },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  registrationStartDate: Date,
  registrationEndDate: Date,
  isCurrent: { type: Boolean, default: false },
  status: { type: String, enum: ['Upcoming', 'Ongoing', 'Completed'], default: 'Upcoming' }
}, { timestamps: true });

// Pre-save hook: Only one current semester
semesterSchema.pre('save', async function(next) {
  if (this.isCurrent) {
    await this.constructor.updateMany({ _id: { $ne: this._id } }, { isCurrent: false });
  }
  next();
});

// Validation: End date must be after start date
semesterSchema.pre('validate', function(next) {
  if (this.endDate && this.startDate && this.endDate <= this.startDate) {
    this.invalidate('endDate', 'End date must be after start date');
  }
  next();
});
```

---

### 7. Enrollment Model (Junction Table)

```javascript
const enrollmentSchema = new mongoose.Schema({
  student: { type: ObjectId, ref: 'Student', required: true },
  course: { type: ObjectId, ref: 'Course', required: true },
  semester: { type: ObjectId, ref: 'Semester', required: true },
  enrollmentDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['Enrolled', 'Dropped', 'Completed', 'Withdrawn'],
    default: 'Enrolled'
  },
  grade: { type: String, enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F', 'I', 'W', null] },
  gradePoints: { type: Number, min: 0, max: 10 },
  attendancePercentage: { type: Number, min: 0, max: 100, default: 0 },
  internalMarks: { type: Number, default: 0 },
  externalMarks: { type: Number, default: 0 },
  totalMarks: { type: Number, default: 0 },
  remarks: String
}, { timestamps: true });

// Compound unique index - prevents duplicate enrollments
enrollmentSchema.index({ student: 1, course: 1, semester: 1 }, { unique: true });

// Automatically update course enrollment count
enrollmentSchema.post('save', async function() {
  const Course = mongoose.model('Course');
  const count = await this.constructor.countDocuments({ course: this.course, status: 'Enrolled' });
  await Course.findByIdAndUpdate(this.course, { currentEnrollment: count });
});
```

---

### 8. Attendance Model

```javascript
const attendanceSchema = new mongoose.Schema({
  student: { type: ObjectId, ref: 'Student', required: true },
  course: { type: ObjectId, ref: 'Course', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Late', 'Excused'], required: true },
  session: { type: Number, default: 1, min: 1 },
  markedBy: { type: ObjectId, ref: 'Faculty', required: true },
  remarks: String
}, { timestamps: true });

// Compound unique index - one record per student/course/date/session
attendanceSchema.index({ student: 1, course: 1, date: 1, session: 1 }, { unique: true });

// Additional indexes for fast queries
attendanceSchema.index({ course: 1, date: 1 });
attendanceSchema.index({ student: 1, date: 1 });

// Static method to calculate attendance percentage
attendanceSchema.statics.calculateAttendance = async function(studentId, courseId) {
  const total = await this.countDocuments({ student: studentId, course: courseId });
  const present = await this.countDocuments({
    student: studentId,
    course: courseId,
    status: { $in: ['Present', 'Late'] }
  });
  return total === 0 ? 0 : Math.round((present / total) * 100);
};

// Auto-update enrollment attendance after marking
attendanceSchema.post('save', async function() {
  const Enrollment = mongoose.model('Enrollment');
  const percentage = await this.constructor.calculateAttendance(this.student, this.course);
  await Enrollment.findOneAndUpdate(
    { student: this.student, course: this.course },
    { attendancePercentage: percentage }
  );
});
```

---

### 9. Exam Model

```javascript
const examSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  course: { type: ObjectId, ref: 'Course', required: true },
  semester: { type: ObjectId, ref: 'Semester', required: true },
  type: {
    type: String,
    enum: ['Quiz', 'Assignment', 'Mid-Term', 'End-Term', 'Lab', 'Project', 'Viva', 'Practical'],
    required: true
  },
  category: { type: String, enum: ['Internal', 'External'], required: true },
  maxMarks: { type: Number, required: true, min: 1 },
  passingMarks: { type: Number, required: true, min: 0 },
  weightage: { type: Number, min: 0, max: 100 },
  date: Date,
  startTime: String,
  endTime: String,
  duration: Number, // minutes
  venue: String,
  instructions: String,
  status: { type: String, enum: ['Scheduled', 'Ongoing', 'Completed', 'Cancelled'], default: 'Scheduled' },
  isPublished: { type: Boolean, default: false }
}, { timestamps: true });

// Validation: Passing marks cannot exceed max marks
examSchema.pre('validate', function(next) {
  if (this.passingMarks > this.maxMarks) {
    this.invalidate('passingMarks', 'Passing marks cannot exceed maximum marks');
  }
  next();
});
```

---

### 10. Mark Model

```javascript
const markSchema = new mongoose.Schema({
  student: { type: ObjectId, ref: 'Student', required: true },
  course: { type: ObjectId, ref: 'Course', required: true },
  exam: { type: ObjectId, ref: 'Exam', required: true },
  marksObtained: { type: Number, required: true, min: 0 },
  maxMarks: { type: Number, required: true },
  percentage: Number,
  grade: String,
  isPassed: Boolean,
  remarks: String,
  enteredBy: { type: ObjectId, ref: 'Faculty' },
  isPublished: { type: Boolean, default: false }
}, { timestamps: true });

// Compound unique index - one mark per student per exam
markSchema.index({ student: 1, exam: 1 }, { unique: true });
markSchema.index({ course: 1, exam: 1 });
markSchema.index({ student: 1, course: 1 });

// Pre-save: Calculate percentage, grade, and pass/fail status
markSchema.pre('save', async function(next) {
  this.percentage = Math.round((this.marksObtained / this.maxMarks) * 100);
  
  const Exam = mongoose.model('Exam');
  const exam = await Exam.findById(this.exam);
  if (exam) {
    this.isPassed = this.marksObtained >= exam.passingMarks;
  }
  
  // Grade calculation
  const p = this.percentage;
  this.grade = p >= 90 ? 'A+' : p >= 80 ? 'A' : p >= 70 ? 'B+' : 
               p >= 60 ? 'B' : p >= 50 ? 'C+' : p >= 40 ? 'C' : 
               p >= 33 ? 'D' : 'F';
  
  next();
});
```

---

### 11. User Model (Authentication)

```javascript
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false  // Never return password by default
  },
  role: { type: String, enum: ['admin', 'faculty', 'student'], required: true },
  name: { type: String, required: true, trim: true },
  profileId: { type: ObjectId, refPath: 'profileModel' },
  profileModel: { type: String, enum: ['Student', 'Faculty'] },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { timestamps: true });

// Pre-save: Hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method: Compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method: Generate JWT
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};
```

---

### 12. Announcement Model

```javascript
const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  content: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['General', 'Academic', 'Exam', 'Event', 'Holiday', 'Urgent', 'Other'],
    default: 'General'
  },
  priority: { type: String, enum: ['Low', 'Normal', 'High', 'Urgent'], default: 'Normal' },
  targetRoles: [{ type: String, enum: ['admin', 'faculty', 'student'] }],
  targetDepartments: [{ type: ObjectId, ref: 'Department' }],
  targetPrograms: [{ type: ObjectId, ref: 'Program' }],
  attachments: [{ name: String, url: String }],
  createdBy: { type: ObjectId, ref: 'User', required: true },
  publishDate: { type: Date, default: Date.now },
  expiryDate: Date,
  isActive: { type: Boolean, default: true },
  isPinned: { type: Boolean, default: false },
  views: { type: Number, default: 0 }
}, { timestamps: true });

// Indexes for efficient querying
announcementSchema.index({ isActive: 1, publishDate: -1 });
announcementSchema.index({ targetRoles: 1 });
```

---

## Database Relationships

### Relationship Types

| Relationship | Type | Implementation |
|--------------|------|----------------|
| Department → Programs | One-to-Many | `program.department` references Department |
| Department → Faculty | One-to-Many | `faculty.department` references Department |
| Department → Courses | One-to-Many | `course.department` references Department |
| Program → Students | One-to-Many | `student.program` references Program |
| Program → Courses | One-to-Many | `course.program` references Program |
| Faculty → Courses | One-to-Many | `course.faculty` references Faculty |
| Student ↔ Courses | Many-to-Many | Through `Enrollment` collection |
| Student → Attendance | One-to-Many | `attendance.student` references Student |
| Course → Exams | One-to-Many | `exam.course` references Course |
| Student → Marks | One-to-Many | `mark.student` references Student |
| Exam → Marks | One-to-Many | `mark.exam` references Exam |
| User → Student/Faculty | One-to-One | Dynamic reference via `profileId` |

### Population (JOIN equivalent)

```javascript
// Populate single reference
const student = await Student.findById(id)
  .populate('department')
  .populate('program');

// Populate nested references
const enrollment = await Enrollment.findById(id)
  .populate({
    path: 'student',
    populate: { path: 'department program' }
  })
  .populate({
    path: 'course',
    populate: { path: 'faculty' }
  });

// Virtual population
const department = await Department.findById(id)
  .populate('programs')
  .populate('facultyMembers');
```

---

## Indexing Strategy

### Index Types Used

| Collection | Index | Type | Purpose |
|------------|-------|------|---------|
| `users` | `email` | Unique | Fast login lookups |
| `departments` | `code` | Unique | Quick code searches |
| `programs` | `{name, department}` | Compound Unique | Prevent duplicates |
| `students` | `rollNumber` | Unique | Roll number lookups |
| `students` | `email` | Unique | Email uniqueness |
| `courses` | `{code, semester}` | Compound Unique | Course identification |
| `enrollments` | `{student, course, semester}` | Compound Unique | Prevent re-enrollment |
| `attendance` | `{student, course, date, session}` | Compound Unique | One record per session |
| `attendance` | `{course, date}` | Compound | Class attendance queries |
| `marks` | `{student, exam}` | Compound Unique | One mark per exam |
| `announcements` | `{isActive, publishDate}` | Compound | Active announcements |

### Index Creation Examples

```javascript
// Unique index
studentSchema.index({ rollNumber: 1 }, { unique: true });

// Compound unique index
enrollmentSchema.index({ student: 1, course: 1, semester: 1 }, { unique: true });

// Regular index for queries
attendanceSchema.index({ course: 1, date: 1 });

// Text index for search
courseSchema.index({ name: 'text', description: 'text' });
```

---

## Data Validation Rules

### Mongoose Validators

```javascript
// Required field
name: { type: String, required: [true, 'Name is required'] }

// String length
code: { type: String, minlength: 2, maxlength: 10 }

// Number range
credits: { type: Number, min: [1, 'Min 1 credit'], max: [10, 'Max 10 credits'] }

// Enum validation
gender: { type: String, enum: ['Male', 'Female', 'Other'] }

// Regex pattern
email: { type: String, match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email'] }
academicYear: { type: String, match: [/^\d{4}-\d{4}$/, 'Format: YYYY-YYYY'] }

// Custom validator
password: {
  type: String,
  validate: {
    validator: (v) => v.length >= 6,
    message: 'Password must be at least 6 characters'
  }
}
```

### Express-Validator (API Layer)

```javascript
// backend/middleware/validation.js
const validationRules = {
  student: [
    body('rollNumber').trim().notEmpty().withMessage('Roll number required'),
    body('email').isEmail().withMessage('Invalid email'),
    body('currentSemester').isInt({ min: 1, max: 12 }).withMessage('Semester 1-12'),
    body('admissionYear').isInt({ min: 2000 }).withMessage('Valid year required'),
    body('department').isMongoId().withMessage('Valid department ID required'),
    body('program').isMongoId().withMessage('Valid program ID required')
  ],
  
  semester: [
    body('academicYear').matches(/^\d{4}-\d{4}$/).withMessage('Format YYYY-YYYY'),
    body('semesterNumber').isIn([1, 2]).withMessage('Must be 1 or 2'),
    body('startDate').isISO8601().withMessage('Valid date required'),
    body('endDate').isISO8601().withMessage('Valid date required')
  ]
};
```

---

## Database Operations (CRUD)

### Create Operations

```javascript
// Create single document
const student = await Student.create({
  rollNumber: '2025CSE001',
  name: 'Alice Smith',
  email: 'alice@college.edu',
  department: departmentId,
  program: programId,
  currentSemester: 1,
  admissionYear: 2025
});

// Create multiple documents
const courses = await Course.insertMany([
  { code: 'CS101', name: 'Programming', ... },
  { code: 'CS102', name: 'Data Structures', ... }
]);
```

### Read Operations

```javascript
// Find all with filters
const activeStudents = await Student.find({ status: 'Active' })
  .populate('department program')
  .sort({ rollNumber: 1 })
  .limit(100);

// Find one
const student = await Student.findOne({ rollNumber: '2025CSE001' });

// Find by ID
const course = await Course.findById(courseId);

// Aggregation pipeline
const departmentStats = await Student.aggregate([
  { $match: { status: 'Active' } },
  { $group: { 
    _id: '$department', 
    count: { $sum: 1 },
    avgSemester: { $avg: '$currentSemester' }
  }},
  { $lookup: { 
    from: 'departments', 
    localField: '_id', 
    foreignField: '_id', 
    as: 'dept' 
  }},
  { $unwind: '$dept' },
  { $project: { 
    department: '$dept.name', 
    studentCount: '$count',
    avgSemester: { $round: ['$avgSemester', 1] }
  }}
]);
```

### Update Operations

```javascript
// Update one
await Student.findByIdAndUpdate(id, { currentSemester: 2 }, { new: true });

// Update many
await Enrollment.updateMany(
  { semester: semesterId, status: 'Enrolled' },
  { status: 'Completed' }
);

// Atomic operations
await Course.findByIdAndUpdate(id, { $inc: { currentEnrollment: 1 } });
```

### Delete Operations

```javascript
// Delete one
await Student.findByIdAndDelete(id);

// Delete many
await Attendance.deleteMany({ date: { $lt: oneYearAgo } });

// Soft delete (preferred)
await Student.findByIdAndUpdate(id, { status: 'Inactive', isActive: false });
```

---

## Query Examples

### 1. Get Students with Low Attendance

```javascript
const lowAttendance = await Enrollment.find({
  attendancePercentage: { $lt: 75 },
  status: 'Enrolled'
})
.populate('student', 'rollNumber name email')
.populate('course', 'code name')
.sort({ attendancePercentage: 1 });
```

### 2. Course-wise Grade Distribution

```javascript
const gradeDistribution = await Mark.aggregate([
  { $match: { course: courseId, isPublished: true } },
  { $group: {
    _id: '$grade',
    count: { $sum: 1 }
  }},
  { $sort: { _id: 1 } }
]);
```

### 3. Faculty Workload (Courses per Faculty)

```javascript
const workload = await Course.aggregate([
  { $match: { isActive: true, faculty: { $ne: null } } },
  { $group: {
    _id: '$faculty',
    courseCount: { $sum: 1 },
    totalCredits: { $sum: '$credits' }
  }},
  { $lookup: {
    from: 'faculties',
    localField: '_id',
    foreignField: '_id',
    as: 'faculty'
  }},
  { $unwind: '$faculty' },
  { $project: {
    name: '$faculty.name',
    employeeId: '$faculty.employeeId',
    courses: '$courseCount',
    credits: '$totalCredits'
  }},
  { $sort: { credits: -1 } }
]);
```

### 4. Student Semester Results

```javascript
const results = await Enrollment.aggregate([
  { $match: { student: studentId, semester: semesterId } },
  { $lookup: {
    from: 'courses',
    localField: 'course',
    foreignField: '_id',
    as: 'courseDetails'
  }},
  { $unwind: '$courseDetails' },
  { $project: {
    courseCode: '$courseDetails.code',
    courseName: '$courseDetails.name',
    credits: '$courseDetails.credits',
    grade: 1,
    gradePoints: 1,
    attendance: '$attendancePercentage'
  }},
  { $group: {
    _id: null,
    courses: { $push: '$$ROOT' },
    totalCredits: { $sum: '$credits' },
    sgpa: { 
      $avg: { $multiply: ['$gradePoints', '$credits'] }
    }
  }}
]);
```

### 5. Department-wise Statistics Dashboard

```javascript
const stats = await Department.aggregate([
  { $lookup: { from: 'programs', localField: '_id', foreignField: 'department', as: 'programs' } },
  { $lookup: { from: 'faculties', localField: '_id', foreignField: 'department', as: 'faculty' } },
  { $lookup: { from: 'students', localField: '_id', foreignField: 'department', as: 'students' } },
  { $lookup: { from: 'courses', localField: '_id', foreignField: 'department', as: 'courses' } },
  { $project: {
    name: 1,
    code: 1,
    programCount: { $size: '$programs' },
    facultyCount: { $size: '$faculty' },
    studentCount: { $size: '$students' },
    courseCount: { $size: '$courses' }
  }}
]);
```

---

## Normalization Analysis

### First Normal Form (1NF) ✓
- All tables have primary keys (`_id`)
- All columns contain atomic values
- No repeating groups (arrays are used intentionally for multi-valued attributes like `targetRoles`)

### Second Normal Form (2NF) ✓
- All non-key attributes fully depend on the primary key
- Junction tables (`Enrollment`, `Attendance`, `Mark`) properly handle many-to-many relationships

### Third Normal Form (3NF) ✓
- No transitive dependencies
- Calculated fields (`percentage`, `grade`) are computed on-save for performance but derived from stored data

### Denormalization Decisions

| Field | Location | Reason |
|-------|----------|--------|
| `attendancePercentage` | Enrollment | Avoid recalculating on every read |
| `currentEnrollment` | Course | Fast capacity checks |
| `percentage`, `grade` | Mark | Avoid repeated calculations |

---

## Data Integrity Constraints

### Referential Integrity

```javascript
// Pre-delete hooks to check references
departmentSchema.pre('remove', async function(next) {
  const programCount = await Program.countDocuments({ department: this._id });
  if (programCount > 0) {
    throw new Error('Cannot delete department with associated programs');
  }
  next();
});
```

### Business Rules

1. **One Current Semester**: Only one semester can be `isCurrent: true`
2. **Enrollment Uniqueness**: Student can enroll once per course per semester
3. **Attendance Uniqueness**: One attendance record per student/course/date/session
4. **Mark Uniqueness**: One mark record per student/exam
5. **Passing Marks ≤ Max Marks**: Enforced via pre-validate hook
6. **End Date > Start Date**: Enforced via pre-validate hook

---

## Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your values:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/college_management
# JWT_SECRET=your-secret-key
# JWT_EXPIRE=7d
# PORT=5000

# Run development server
npm run dev

# Seed sample data
npm run seed
```

### Frontend Setup

```bash
npm install
npm run dev
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Auth** | | |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | Register user (admin) |
| GET | `/api/auth/me` | Get current user |
| **Departments** | | |
| GET | `/api/departments` | List all departments |
| POST | `/api/departments` | Create department |
| GET | `/api/departments/:id` | Get department |
| PUT | `/api/departments/:id` | Update department |
| DELETE | `/api/departments/:id` | Delete department |
| **Programs** | | |
| GET | `/api/programs` | List all programs |
| POST | `/api/programs` | Create program |
| GET | `/api/programs/:id` | Get program |
| PUT | `/api/programs/:id` | Update program |
| DELETE | `/api/programs/:id` | Delete program |
| **Students** | | |
| GET | `/api/students` | List students (paginated) |
| POST | `/api/students` | Create student |
| GET | `/api/students/:id` | Get student |
| PUT | `/api/students/:id` | Update student |
| DELETE | `/api/students/:id` | Delete student |
| **Faculty** | | |
| GET | `/api/faculty` | List faculty |
| POST | `/api/faculty` | Create faculty |
| GET | `/api/faculty/:id` | Get faculty |
| PUT | `/api/faculty/:id` | Update faculty |
| DELETE | `/api/faculty/:id` | Delete faculty |
| **Courses** | | |
| GET | `/api/courses` | List courses |
| POST | `/api/courses` | Create course |
| GET | `/api/courses/:id` | Get course |
| PUT | `/api/courses/:id` | Update course |
| DELETE | `/api/courses/:id` | Delete course |
| **Semesters** | | |
| GET | `/api/semesters` | List semesters |
| GET | `/api/semesters/current` | Get current semester |
| POST | `/api/semesters` | Create semester |
| PUT | `/api/semesters/:id/set-current` | Set current semester |
| **Enrollments** | | |
| GET | `/api/enrollments` | List enrollments |
| POST | `/api/enrollments` | Enroll student |
| PUT | `/api/enrollments/:id` | Update enrollment |
| **Attendance** | | |
| GET | `/api/attendance` | Get attendance records |
| POST | `/api/attendance` | Mark attendance |
| POST | `/api/attendance/bulk` | Bulk mark attendance |
| **Exams** | | |
| GET | `/api/exams` | List exams |
| POST | `/api/exams` | Create exam |
| PUT | `/api/exams/:id` | Update exam |
| **Marks** | | |
| GET | `/api/marks` | Get marks |
| POST | `/api/marks` | Enter marks |
| POST | `/api/marks/bulk` | Bulk enter marks |

---

## License

MIT License - Feel free to use for educational purposes.

---

## Contributors

- Database Design & Backend: College Management System Team
- Frontend Development: React + TypeScript Implementation
