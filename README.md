# 🎓 College Management System

A full-stack web application for managing college operations including departments, programs, faculty, students, courses, semesters, attendance, and examinations.

![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![React](https://img.shields.io/badge/React-v18+-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-v5+-blue)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Running the Application](#-running-the-application)
- [Demo Credentials](#-demo-credentials)
- [API Endpoints](#-api-endpoints)
- [Screenshots](#-screenshots)

## ✨ Features

### Admin Dashboard
- 📊 Overview statistics (departments, students, faculty, courses)
- 🏢 Department management (CRUD operations)
- 📚 Program management
- 👨‍🏫 Faculty management
- 👨‍🎓 Student management
- 📖 Course management
- 📅 Semester management
- 📢 Announcements

### Faculty Dashboard
- 📚 View assigned courses
- ✅ Mark student attendance
- 📝 Enter exam marks
- 📊 View student performance analytics

### Student Dashboard
- 📖 View enrolled courses
- 📅 Check attendance percentage
- 📊 View marks and grades
- 📢 View announcements

## 🛠 Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **Validation:** express-validator

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI / shadcn/ui
- **Routing:** React Router v6
- **State Management:** React Context API
- **Notifications:** Sonner (Toast)
- **Icons:** Lucide React

## 📁 Project Structure

```
dbmsv4/
├── backend/
│   ├── config/
│   │   └── db.js              # Database connection
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
│   │   ├── auth.js            # JWT authentication
│   │   ├── validation.js      # Request validation
│   │   └── errorHandler.js    # Error handling
│   ├── models/                # Mongoose schemas
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
│   │   └── Announcement.js
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
│   │   │   │   └── DashboardLayout.tsx
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
│   │   │   └── App.tsx        # Main app component
│   │   ├── styles/
│   │   └── main.tsx           # Entry point
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── package.json
│   └── .env                   # Frontend environment
│
└── README.md
```

## 📋 Prerequisites

- Node.js v18 or higher
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

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
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/college_management
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Seed the Database (Optional)

To populate the database with sample data:

```bash
cd backend
node seeds/seedData.js
```

## 🏃 Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
# or
node server.js
```

Backend runs on: `http://localhost:5000`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

Frontend runs on: `http://localhost:5173`

## 🔑 Demo Credentials

| Role    | Email                        | Password      |
|---------|------------------------------|---------------|
| Admin   | admin@college.edu            | Admin@123     |
| Faculty | rajesh.kumar@college.edu     | Faculty@123   |
| Student | rahul.verma@college.edu      | Student@123   |

## 📡 API Endpoints

### Authentication
| Method | Endpoint           | Description          |
|--------|-------------------|----------------------|
| POST   | `/api/auth/login` | User login           |
| GET    | `/api/auth/me`    | Get current user     |
| POST   | `/api/auth/logout`| User logout          |

### Departments
| Method | Endpoint              | Description           |
|--------|-----------------------|-----------------------|
| GET    | `/api/departments`    | Get all departments   |
| GET    | `/api/departments/:id`| Get department by ID  |
| POST   | `/api/departments`    | Create department     |
| PUT    | `/api/departments/:id`| Update department     |
| DELETE | `/api/departments/:id`| Delete department     |

### Programs
| Method | Endpoint           | Description        |
|--------|-------------------|--------------------|
| GET    | `/api/programs`   | Get all programs   |
| GET    | `/api/programs/:id`| Get program by ID |
| POST   | `/api/programs`   | Create program     |
| PUT    | `/api/programs/:id`| Update program    |
| DELETE | `/api/programs/:id`| Delete program    |

### Faculty
| Method | Endpoint          | Description       |
|--------|-------------------|-------------------|
| GET    | `/api/faculty`    | Get all faculty   |
| GET    | `/api/faculty/:id`| Get faculty by ID |
| POST   | `/api/faculty`    | Create faculty    |
| PUT    | `/api/faculty/:id`| Update faculty    |
| DELETE | `/api/faculty/:id`| Delete faculty    |

### Students
| Method | Endpoint           | Description        |
|--------|-------------------|--------------------|
| GET    | `/api/students`   | Get all students   |
| GET    | `/api/students/:id`| Get student by ID |
| POST   | `/api/students`   | Create student     |
| PUT    | `/api/students/:id`| Update student    |
| DELETE | `/api/students/:id`| Delete student    |

### Courses
| Method | Endpoint          | Description      |
|--------|-------------------|------------------|
| GET    | `/api/courses`    | Get all courses  |
| GET    | `/api/courses/:id`| Get course by ID |
| POST   | `/api/courses`    | Create course    |
| PUT    | `/api/courses/:id`| Update course    |
| DELETE | `/api/courses/:id`| Delete course    |

### Semesters
| Method | Endpoint            | Description        |
|--------|--------------------|--------------------|
| GET    | `/api/semesters`   | Get all semesters  |
| GET    | `/api/semesters/:id`| Get semester by ID|
| POST   | `/api/semesters`   | Create semester    |
| PUT    | `/api/semesters/:id`| Update semester   |
| DELETE | `/api/semesters/:id`| Delete semester   |

### Dashboard
| Method | Endpoint                 | Description              |
|--------|-------------------------|--------------------------|
| GET    | `/api/dashboard/admin`  | Admin dashboard stats    |
| GET    | `/api/dashboard/faculty`| Faculty dashboard stats  |
| GET    | `/api/dashboard/student`| Student dashboard stats  |

### Additional Endpoints
- `/api/enrollments` - Student enrollments
- `/api/attendance` - Attendance records
- `/api/exams` - Exam management
- `/api/marks` - Mark/Grade management
- `/api/announcements` - Announcements

## 🔒 Authentication

The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 📊 Database Schema

### Core Entities
- **User** - Authentication and authorization
- **Department** - Academic departments
- **Program** - Degree programs (B.Tech, M.Tech, etc.)
- **Faculty** - Teaching staff
- **Student** - Student records
- **Course** - Course catalog
- **Semester** - Academic semesters
- **Enrollment** - Student-course enrollments
- **Attendance** - Attendance records
- **Exam** - Exam schedules
- **Mark** - Student marks/grades
- **Announcement** - System announcements

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
