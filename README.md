# 🎓 College Management System

A full-stack web application for managing college operations including departments, programs, faculty, students, courses, semesters, attendance, examinations, and marks — with **role-based access control** ensuring faculty members can only access data for courses assigned to them.

![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![Next.js](https://img.shields.io/badge/Next.js-v15-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E)
![TypeScript](https://img.shields.io/badge/TypeScript-v5+-blue)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Security & Access Control](#-security--access-control)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Running the Application](#-running-the-application)
- [Demo Credentials](#-demo-credentials)
- [API Endpoints](#-api-endpoints)

## ✨ Features

### Admin Dashboard
- 📊 Overview statistics (departments, students, faculty, courses)
- 🏢 Department management (CRUD operations)
- 📚 Program management
- 👨‍🏫 Faculty management
- 👨‍🎓 Student management
- 📖 Course management with faculty assignment
- 📅 Semester management
- 📝 Exam & marks management
- ✅ Attendance management
- 📢 Announcements
- 🔓 Full access to all data across all courses

### Faculty Dashboard
- 📚 View **only** assigned courses
- ✅ Mark student attendance (own courses only)
- 📝 Create exams & enter marks (own courses only)
- 📊 View student performance analytics (own courses only)
- 🔒 Cannot see or modify data for other faculty's courses

### Student Dashboard
- 📖 View enrolled courses
- 📅 Check attendance percentage
- 📊 View marks and grades
- 📢 View announcements

## 🛠 Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (Supabase)
- **ORM:** Sequelize v6
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **Validation:** express-validator

### Frontend
- **Framework:** Next.js 15 with TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI / shadcn/ui
- **Routing:** React Router v6 (client-side within Next.js)
- **State Management:** React Context API
- **Notifications:** Sonner (Toast)
- **Icons:** Lucide React

## 📁 Project Structure

```
dbmsv4/
├── run.bat                    # One-click launcher (Windows)
├── backend/
│   ├── config/
│   │   └── db.js              # PostgreSQL/Sequelize connection
│   ├── controllers/           # Route controllers
│   │   ├── authController.js
│   │   ├── departmentController.js
│   │   ├── programController.js
│   │   ├── facultyController.js
│   │   ├── studentController.js
│   │   ├── courseController.js
│   │   ├── semesterController.js
│   │   ├── enrollmentController.js
│   │   ├── attendanceController.js
│   │   ├── examController.js
│   │   ├── markController.js
│   │   ├── announcementController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication & role authorization
│   │   ├── facultyOwnership.js # Faculty course-ownership checks
│   │   ├── validation.js      # Request validation
│   │   ├── errorHandler.js    # Error handling
│   │   └── logCapture.js      # Request logging
│   ├── models/                # Sequelize models
│   │   ├── User.js
│   │   ├── Department.js
│   │   ├── Program.js
│   │   ├── Faculty.js
│   │   ├── Student.js
│   │   ├── Course.js
│   │   ├── Semester.js
│   │   ├── Enrollment.js
│   │   ├── Attendance.js
│   │   ├── Exam.js
│   │   ├── Mark.js
│   │   ├── Announcement.js
│   │   └── index.js           # Model associations
│   ├── routes/                # API routes
│   ├── seeds/
│   │   └── seedData.js        # Database seeding
│   ├── server.js              # Entry point
│   ├── package.json
│   └── .env                   # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # Reusable components
│   │   │   │   ├── ui/        # UI components (shadcn)
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── DashboardLayout.tsx
│   │   │   │   └── GenericTable.tsx
│   │   │   ├── context/
│   │   │   │   └── AuthContext.tsx
│   │   │   ├── pages/
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── admin/     # Admin pages
│   │   │   │   ├── faculty/   # Faculty pages
│   │   │   │   └── student/   # Student pages
│   │   │   ├── services/
│   │   │   │   └── api.ts     # API service layer
│   │   │   ├── types/
│   │   │   │   └── index.ts   # TypeScript types
│   │   │   ├── ClientApp.tsx  # Client-side router
│   │   │   ├── layout.tsx     # Root layout
│   │   │   └── page.tsx       # Entry page
│   │   └── styles/
│   ├── next.config.mjs
│   ├── tsconfig.json
│   ├── postcss.config.mjs
│   └── package.json
│
└── README.md
```

## 🔒 Security & Access Control

### Role-Based Authorization

The system enforces **three levels of access**:

| Role | Data Access | Write Access |
|------|-------------|--------------|
| **Admin** | All data across all courses | Full CRUD on everything |
| **Faculty** | Only courses assigned to them | Create/edit exams, marks, attendance for own courses only |
| **Student** | Own enrollment, marks, attendance | Read-only |

### Faculty Ownership Enforcement (Backend)

Faculty access is enforced **at the API level** — not just the frontend. The `facultyOwnership.js` middleware provides three helpers:

- **`getFacultyCourseIds(user)`** — Returns course IDs assigned to the faculty; used to filter list endpoints
- **`facultyOwnsCourse(user, courseId)`** — Verifies a specific course belongs to the faculty; used before create/update operations
- **`facultyOwnsExam(user, examId)`** — Verifies an exam's course belongs to the faculty

**Secured endpoints for faculty:**

| Area | Filtered Listing | Ownership-Checked Mutations |
|------|------------------|-----------------------------|
| Exams | `GET /api/exams` | Create, update, publish, get-by-course |
| Attendance | `GET /api/attendance` | Mark, bulk-mark, update, course-summary |
| Marks | `GET /api/marks` | Enter, bulk-enter, update, get-exam-marks |
| Enrollments | `GET /api/enrollments` | Create, update |
| Courses | — | `GET /:id/students` |

Admins bypass all ownership checks automatically.

## 📋 Prerequisites

- Node.js v18 or higher
- npm or yarn
- PostgreSQL database (Supabase recommended, or local PostgreSQL)

## 🚀 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd dbmsv4
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<database>
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. Seed the Database (Optional)

To populate the database with sample data:

```bash
cd backend
npm run seed
```

## 🏃 Running the Application

### Quick Start (Windows)

Double-click `run.bat` to launch both backend and frontend together.

### Manual Start

**Backend:**
```bash
cd backend
npm run dev
# or
node server.js
```
Backend runs on: `http://localhost:5000`

**Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:3000`

## 🔑 Demo Credentials

| Role    | Email                        | Password      |
|---------|------------------------------|---------------|
| Admin   | admin@college.edu            | Admin@123     |
| Faculty | rajesh.kumar@college.edu     | Faculty@123   |
| Student | rahul.verma@college.edu      | Student@123   |

## 📡 API Endpoints

### Authentication
| Method | Endpoint           | Description          | Access |
|--------|-------------------|----------------------|--------|
| POST   | `/api/auth/login` | User login           | Public |
| GET    | `/api/auth/me`    | Get current user     | Auth   |
| POST   | `/api/auth/logout`| User logout          | Auth   |

### Departments
| Method | Endpoint              | Description           | Access |
|--------|-----------------------|-----------------------|--------|
| GET    | `/api/departments`    | Get all departments   | Auth   |
| GET    | `/api/departments/:id`| Get department by ID  | Auth   |
| POST   | `/api/departments`    | Create department     | Admin  |
| PUT    | `/api/departments/:id`| Update department     | Admin  |
| DELETE | `/api/departments/:id`| Delete department     | Admin  |

### Programs
| Method | Endpoint           | Description        | Access |
|--------|-------------------|--------------------|--------|
| GET    | `/api/programs`   | Get all programs   | Auth   |
| GET    | `/api/programs/:id`| Get program by ID | Auth   |
| POST   | `/api/programs`   | Create program     | Admin  |
| PUT    | `/api/programs/:id`| Update program    | Admin  |
| DELETE | `/api/programs/:id`| Delete program    | Admin  |

### Faculty
| Method | Endpoint          | Description       | Access |
|--------|-------------------|-------------------|--------|
| GET    | `/api/faculty`    | Get all faculty   | Auth   |
| GET    | `/api/faculty/:id`| Get faculty by ID | Auth   |
| POST   | `/api/faculty`    | Create faculty    | Admin  |
| PUT    | `/api/faculty/:id`| Update faculty    | Admin  |
| DELETE | `/api/faculty/:id`| Delete faculty    | Admin  |

### Students
| Method | Endpoint           | Description        | Access |
|--------|-------------------|--------------------|--------|
| GET    | `/api/students`   | Get all students   | Auth   |
| GET    | `/api/students/:id`| Get student by ID | Auth   |
| POST   | `/api/students`   | Create student     | Admin  |
| PUT    | `/api/students/:id`| Update student    | Admin  |
| DELETE | `/api/students/:id`| Delete student    | Admin  |

### Courses
| Method | Endpoint                       | Description              | Access        |
|--------|--------------------------------|--------------------------|---------------|
| GET    | `/api/courses`                 | Get all courses          | Auth          |
| GET    | `/api/courses/:id`             | Get course by ID         | Auth          |
| GET    | `/api/courses/:id/students`    | Get enrolled students    | Admin/Own Faculty |
| POST   | `/api/courses`                 | Create course            | Admin         |
| PUT    | `/api/courses/:id`             | Update course            | Admin         |
| PUT    | `/api/courses/:id/assign-faculty` | Assign faculty to course | Admin      |
| DELETE | `/api/courses/:id`             | Delete course            | Admin         |

### Semesters
| Method | Endpoint            | Description        | Access |
|--------|--------------------|--------------------|--------|
| GET    | `/api/semesters`   | Get all semesters  | Auth   |
| GET    | `/api/semesters/:id`| Get semester by ID| Auth   |
| POST   | `/api/semesters`   | Create semester    | Admin  |
| PUT    | `/api/semesters/:id`| Update semester   | Admin  |
| DELETE | `/api/semesters/:id`| Delete semester   | Admin  |

### Exams
| Method | Endpoint                      | Description           | Access              |
|--------|-------------------------------|-----------------------|---------------------|
| GET    | `/api/exams`                  | Get exams             | Auth (filtered for faculty) |
| GET    | `/api/exams/:id`              | Get exam by ID        | Auth                |
| GET    | `/api/exams/course/:courseId` | Get exams by course   | Admin/Own Faculty   |
| POST   | `/api/exams`                  | Create exam           | Admin/Own Faculty   |
| PUT    | `/api/exams/:id`              | Update exam           | Admin/Own Faculty   |
| PUT    | `/api/exams/:id/publish`      | Publish results       | Admin/Own Faculty   |
| DELETE | `/api/exams/:id`              | Delete exam           | Admin               |

### Attendance
| Method | Endpoint                              | Description              | Access              |
|--------|---------------------------------------|--------------------------|---------------------|
| GET    | `/api/attendance`                     | Get attendance           | Auth (filtered for faculty) |
| GET    | `/api/attendance/course/:id/date/:d`  | Get course attendance    | Admin/Own Faculty   |
| GET    | `/api/attendance/summary/course/:id`  | Course attendance summary| Admin/Own Faculty   |
| GET    | `/api/attendance/summary/student/:id` | Student attendance summary| Auth               |
| POST   | `/api/attendance`                     | Mark attendance          | Admin/Own Faculty   |
| POST   | `/api/attendance/bulk`                | Bulk mark attendance     | Admin/Own Faculty   |
| PUT    | `/api/attendance/:id`                 | Update attendance        | Admin/Own Faculty   |
| DELETE | `/api/attendance/:id`                 | Delete attendance        | Admin               |

### Marks
| Method | Endpoint                          | Description           | Access              |
|--------|-----------------------------------|-----------------------|---------------------|
| GET    | `/api/marks`                      | Get marks             | Auth (filtered for faculty) |
| GET    | `/api/marks/exam/:examId`         | Get exam marks        | Admin/Own Faculty   |
| GET    | `/api/marks/student/:id/summary`  | Student grades summary| Auth                |
| POST   | `/api/marks`                      | Enter mark            | Admin/Own Faculty   |
| POST   | `/api/marks/bulk`                 | Bulk enter marks      | Admin/Own Faculty   |
| PUT    | `/api/marks/:id`                  | Update mark           | Admin/Own Faculty   |
| DELETE | `/api/marks/:id`                  | Delete mark           | Admin               |

### Enrollments
| Method | Endpoint                                    | Description           | Access              |
|--------|---------------------------------------------|-----------------------|---------------------|
| GET    | `/api/enrollments`                          | Get enrollments       | Auth (filtered for faculty) |
| GET    | `/api/enrollments/:id`                      | Get enrollment by ID  | Auth                |
| GET    | `/api/enrollments/student/:sid/course/:cid` | Get specific enrollment| Auth               |
| POST   | `/api/enrollments`                          | Create enrollment     | Admin/Own Faculty   |
| POST   | `/api/enrollments/bulk`                     | Bulk enroll           | Admin               |
| PUT    | `/api/enrollments/:id`                      | Update enrollment     | Admin/Own Faculty   |
| DELETE | `/api/enrollments/:id`                      | Delete enrollment     | Admin               |

### Announcements
| Method | Endpoint                          | Description             | Access |
|--------|-----------------------------------|-------------------------|--------|
| GET    | `/api/announcements`              | Get all announcements   | Auth   |
| GET    | `/api/announcements/active`       | Get active announcements| Auth   |
| GET    | `/api/announcements/:id`          | Get announcement by ID  | Auth   |
| POST   | `/api/announcements`              | Create announcement     | Admin  |
| PUT    | `/api/announcements/:id`          | Update announcement     | Admin  |
| PUT    | `/api/announcements/:id/toggle-pin`| Toggle pin status      | Admin  |
| DELETE | `/api/announcements/:id`          | Delete announcement     | Admin  |

### Dashboard
| Method | Endpoint                 | Description              | Access  |
|--------|-------------------------|--------------------------|---------|
| GET    | `/api/dashboard/admin`  | Admin dashboard stats    | Admin   |
| GET    | `/api/dashboard/faculty`| Faculty dashboard stats  | Faculty |
| GET    | `/api/dashboard/student`| Student dashboard stats  | Student |

## 🔐 Authentication

The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 📊 Database Schema (PostgreSQL)

### Core Entities & Relationships

```
User (auth) ─── Faculty ──┬── Course ──┬── Exam ──── Mark
                           │            ├── Enrollment
                           │            └── Attendance
             ─── Student ──┘
Department ──── Program
             ─── Faculty
Semester ────── Course
```

- **User** — Authentication (email, password, role, profileId)
- **Department** — Academic departments with head-of-department
- **Program** — Degree programs (B.Tech, M.Tech, etc.)
- **Faculty** — Teaching staff, linked to User & Department
- **Student** — Student records, linked to User, Department & Program
- **Course** — Course catalog with assigned faculty (`facultyId`)
- **Semester** — Academic semesters
- **Enrollment** — Student ↔ Course ↔ Semester junction
- **Attendance** — Per-student, per-course, per-date records
- **Exam** — Exam schedules linked to Course & Semester
- **Mark** — Student marks per exam
- **Announcement** — System announcements with targeting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Mevin Benty - Initial work

---

⭐ Star this repository if you found it helpful!
