/**
 * Seed Data Script
 * Populates the database with comprehensive test data
 * 
 * Run with: npm run seed
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { sequelize } = require('../config/db');
const {
  User, Department, Program, Faculty, Student,
  Semester, Course, Enrollment, Attendance,
  Exam, Mark, Announcement
} = require('../models');

const seedData = async () => {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL');

    // Sync all models (force: true drops and recreates tables)
    console.log('🗑️  Dropping and recreating all tables...');
    await sequelize.sync({ force: true });

    // ============================================
    // Create Admin User
    // ============================================
    console.log('👤 Creating admin user...');
    const adminUser = await User.create({
      email: 'admin@college.edu',
      password: 'Admin@123',
      name: 'System Administrator',
      role: 'admin',
      isActive: true
    });

    // ============================================
    // Create Departments
    // ============================================
    console.log('🏢 Creating departments...');
    const departments = await Department.bulkCreate([
      {
        name: 'Computer Science & Engineering',
        code: 'CSE',
        description: 'Department of Computer Science and Engineering',
        establishedYear: 2000,
        isActive: true
      },
      {
        name: 'Electronics & Communication Engineering',
        code: 'ECE',
        description: 'Department of Electronics and Communication Engineering',
        establishedYear: 2000,
        isActive: true
      },
      {
        name: 'Mechanical Engineering',
        code: 'ME',
        description: 'Department of Mechanical Engineering',
        establishedYear: 2005,
        isActive: true
      },
      {
        name: 'Civil Engineering',
        code: 'CE',
        description: 'Department of Civil Engineering',
        establishedYear: 2005,
        isActive: true
      },
      {
        name: 'Electrical Engineering',
        code: 'EE',
        description: 'Department of Electrical Engineering',
        establishedYear: 2010,
        isActive: true
      }
    ], { returning: true });

    const cseDept = departments[0];
    const eceDept = departments[1];
    const meDept = departments[2];

    // ============================================
    // Create Programs
    // ============================================
    console.log('📚 Creating programs...');
    const programs = await Program.bulkCreate([
      {
        name: 'Bachelor of Technology in Computer Science',
        code: 'BTECH-CSE',
        departmentId: cseDept.id,
        duration: 4,
        degreeType: 'Bachelor',
        totalCredits: 160,
        totalSemesters: 8,
        description: 'B.Tech program in Computer Science & Engineering',
        fees: 150000,
        isActive: true
      },
      {
        name: 'Master of Technology in Computer Science',
        code: 'MTECH-CSE',
        departmentId: cseDept.id,
        duration: 2,
        degreeType: 'Master',
        totalCredits: 80,
        totalSemesters: 4,
        description: 'M.Tech program in Computer Science & Engineering',
        fees: 100000,
        isActive: true
      },
      {
        name: 'Bachelor of Technology in Electronics',
        code: 'BTECH-ECE',
        departmentId: eceDept.id,
        duration: 4,
        degreeType: 'Bachelor',
        totalCredits: 160,
        totalSemesters: 8,
        description: 'B.Tech program in Electronics & Communication',
        fees: 150000,
        isActive: true
      },
      {
        name: 'Bachelor of Technology in Mechanical',
        code: 'BTECH-ME',
        departmentId: meDept.id,
        duration: 4,
        degreeType: 'Bachelor',
        totalCredits: 160,
        totalSemesters: 8,
        description: 'B.Tech program in Mechanical Engineering',
        fees: 140000,
        isActive: true
      }
    ], { returning: true });

    const btechCSE = programs[0];
    const btechECE = programs[2];

    // ============================================
    // Create Semesters
    // ============================================
    console.log('📅 Creating semesters...');
    const semesters = await Semester.bulkCreate([
      {
        name: 'Spring 2026',
        code: 'SPRING-2026',
        academicYear: '2025-2026',
        semesterNumber: 2,
        startDate: new Date('2026-01-15'),
        endDate: new Date('2026-05-30'),
        registrationStartDate: new Date('2026-01-01'),
        registrationEndDate: new Date('2026-01-14'),
        isCurrent: true,
        status: 'Ongoing'
      },
      {
        name: 'Fall 2025',
        code: 'FALL-2025',
        academicYear: '2025-2026',
        semesterNumber: 1,
        startDate: new Date('2025-08-01'),
        endDate: new Date('2025-12-15'),
        registrationStartDate: new Date('2025-07-15'),
        registrationEndDate: new Date('2025-07-31'),
        isCurrent: false,
        status: 'Completed'
      },
      {
        name: 'Fall 2026',
        code: 'FALL-2026',
        academicYear: '2026-2027',
        semesterNumber: 1,
        startDate: new Date('2026-08-01'),
        endDate: new Date('2026-12-15'),
        registrationStartDate: new Date('2026-07-15'),
        registrationEndDate: new Date('2026-07-31'),
        isCurrent: false,
        status: 'Upcoming'
      }
    ], { returning: true });

    const currentSemester = semesters[0];

    // ============================================
    // Create Faculty
    // ============================================
    console.log('👨‍🏫 Creating faculty...');
    const facultyData = [
      {
        employeeId: 'FAC001',
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh.kumar@college.edu',
        phone: '9876543210',
        departmentId: cseDept.id,
        designation: 'Professor',
        specialization: 'Artificial Intelligence & Machine Learning',
        qualification: 'Ph.D. in Computer Science from IIT Delhi',
        experience: 15,
        dateOfJoining: new Date('2010-06-01'),
        gender: 'Male',
        isActive: true
      },
      {
        employeeId: 'FAC002',
        name: 'Dr. Priya Sharma',
        email: 'priya.sharma@college.edu',
        phone: '9876543211',
        departmentId: cseDept.id,
        designation: 'Associate Professor',
        specialization: 'Database Systems & Data Mining',
        qualification: 'Ph.D. in Computer Science from IISc Bangalore',
        experience: 10,
        dateOfJoining: new Date('2015-01-15'),
        gender: 'Female',
        isActive: true
      },
      {
        employeeId: 'FAC003',
        name: 'Dr. Amit Singh',
        email: 'amit.singh@college.edu',
        phone: '9876543212',
        departmentId: cseDept.id,
        designation: 'Assistant Professor',
        specialization: 'Computer Networks & Security',
        qualification: 'Ph.D. in Computer Engineering from NIT Trichy',
        experience: 8,
        dateOfJoining: new Date('2017-07-01'),
        gender: 'Male',
        isActive: true
      },
      {
        employeeId: 'FAC004',
        name: 'Dr. Kavitha Nair',
        email: 'kavitha.nair@college.edu',
        phone: '9876543213',
        departmentId: cseDept.id,
        designation: 'Assistant Professor',
        specialization: 'Operating Systems & Distributed Computing',
        qualification: 'Ph.D. in Computer Science from BITS Pilani',
        experience: 6,
        dateOfJoining: new Date('2019-08-01'),
        gender: 'Female',
        isActive: true
      },
      {
        employeeId: 'FAC005',
        name: 'Prof. Suresh Menon',
        email: 'suresh.menon@college.edu',
        phone: '9876543214',
        departmentId: eceDept.id,
        designation: 'Professor',
        specialization: 'Digital Signal Processing',
        qualification: 'Ph.D. in Electronics from IIT Bombay',
        experience: 18,
        dateOfJoining: new Date('2008-01-01'),
        gender: 'Male',
        isActive: true
      },
      {
        employeeId: 'FAC006',
        name: 'Dr. Anjali Deshmukh',
        email: 'anjali.deshmukh@college.edu',
        phone: '9876543215',
        departmentId: eceDept.id,
        designation: 'Associate Professor',
        specialization: 'VLSI Design & Embedded Systems',
        qualification: 'Ph.D. in Electronics from IIT Kanpur',
        experience: 12,
        dateOfJoining: new Date('2013-06-15'),
        gender: 'Female',
        isActive: true
      },
      {
        employeeId: 'FAC007',
        name: 'Dr. Ramesh Iyer',
        email: 'ramesh.iyer@college.edu',
        phone: '9876543216',
        departmentId: meDept.id,
        designation: 'Professor',
        specialization: 'Thermodynamics & Heat Transfer',
        qualification: 'Ph.D. in Mechanical Engineering from IIT Madras',
        experience: 20,
        dateOfJoining: new Date('2006-02-01'),
        gender: 'Male',
        isActive: true
      }
    ];

    const faculty = [];
    for (const fData of facultyData) {
      const fac = await Faculty.create(fData);

      // Create user account for faculty
      const user = await User.create({
        email: fData.email,
        password: 'Faculty@123',
        name: fData.name,
        role: 'faculty',
        profileId: fac.id,
        profileModel: 'Faculty',
        isActive: true
      });

      await fac.update({ userId: user.id });
      faculty.push(fac);
    }

    // Update department heads
    await cseDept.update({ headOfDepartment: faculty[0].id });
    await eceDept.update({ headOfDepartment: faculty[4].id });
    await meDept.update({ headOfDepartment: faculty[6].id });

    // ============================================
    // Create Students
    // ============================================
    console.log('👨‍🎓 Creating students...');
    const studentData = [
      // CSE Students - Batch 2024 (Semester 2)
      {
        rollNumber: '2024CSE001', name: 'Aarav Sharma', email: 'aarav.sharma@student.college.edu',
        phone: '9876543220', programId: btechCSE.id, departmentId: cseDept.id,
        currentSemester: 2, admissionYear: 2024, batchYear: '2024-2028',
        gender: 'Male', dateOfBirth: new Date('2006-03-15'), cgpa: 8.5, status: 'Active'
      },
      {
        rollNumber: '2024CSE002', name: 'Diya Patel', email: 'diya.patel@student.college.edu',
        phone: '9876543221', programId: btechCSE.id, departmentId: cseDept.id,
        currentSemester: 2, admissionYear: 2024, batchYear: '2024-2028',
        gender: 'Female', dateOfBirth: new Date('2006-07-22'), cgpa: 9.1, status: 'Active'
      },
      {
        rollNumber: '2024CSE003', name: 'Arjun Reddy', email: 'arjun.reddy@student.college.edu',
        phone: '9876543222', programId: btechCSE.id, departmentId: cseDept.id,
        currentSemester: 2, admissionYear: 2024, batchYear: '2024-2028',
        gender: 'Male', dateOfBirth: new Date('2006-01-08'), cgpa: 7.8, status: 'Active'
      },
      {
        rollNumber: '2024CSE004', name: 'Ananya Krishnan', email: 'ananya.krishnan@student.college.edu',
        phone: '9876543223', programId: btechCSE.id, departmentId: cseDept.id,
        currentSemester: 2, admissionYear: 2024, batchYear: '2024-2028',
        gender: 'Female', dateOfBirth: new Date('2006-09-30'), cgpa: 8.9, status: 'Active'
      },
      {
        rollNumber: '2024CSE005', name: 'Rohit Malhotra', email: 'rohit.malhotra@student.college.edu',
        phone: '9876543224', programId: btechCSE.id, departmentId: cseDept.id,
        currentSemester: 2, admissionYear: 2024, batchYear: '2024-2028',
        gender: 'Male', dateOfBirth: new Date('2005-12-05'), cgpa: 8.2, status: 'Active'
      },
      // CSE Students - Batch 2023 (Semester 4)
      {
        rollNumber: '2023CSE001', name: 'Rahul Verma', email: 'rahul.verma@student.college.edu',
        phone: '9876543230', programId: btechCSE.id, departmentId: cseDept.id,
        currentSemester: 4, admissionYear: 2023, batchYear: '2023-2027',
        gender: 'Male', dateOfBirth: new Date('2005-05-18'), cgpa: 8.35, status: 'Active'
      },
      {
        rollNumber: '2023CSE002', name: 'Sneha Iyer', email: 'sneha.iyer@student.college.edu',
        phone: '9876543231', programId: btechCSE.id, departmentId: cseDept.id,
        currentSemester: 4, admissionYear: 2023, batchYear: '2023-2027',
        gender: 'Female', dateOfBirth: new Date('2005-08-25'), cgpa: 9.2, status: 'Active'
      },
      {
        rollNumber: '2023CSE003', name: 'Vikram Singh', email: 'vikram.singh@student.college.edu',
        phone: '9876543232', programId: btechCSE.id, departmentId: cseDept.id,
        currentSemester: 4, admissionYear: 2023, batchYear: '2023-2027',
        gender: 'Male', dateOfBirth: new Date('2005-02-14'), cgpa: 7.5, status: 'Active'
      },
      {
        rollNumber: '2023CSE004', name: 'Priya Menon', email: 'priya.menon@student.college.edu',
        phone: '9876543233', programId: btechCSE.id, departmentId: cseDept.id,
        currentSemester: 4, admissionYear: 2023, batchYear: '2023-2027',
        gender: 'Female', dateOfBirth: new Date('2005-11-03'), cgpa: 8.7, status: 'Active'
      },
      {
        rollNumber: '2023CSE005', name: 'Karthik Nair', email: 'karthik.nair@student.college.edu',
        phone: '9876543234', programId: btechCSE.id, departmentId: cseDept.id,
        currentSemester: 4, admissionYear: 2023, batchYear: '2023-2027',
        gender: 'Male', dateOfBirth: new Date('2005-04-20'), cgpa: 8.0, status: 'Active'
      },
      // CSE Students - Batch 2022 (Semester 6)
      {
        rollNumber: '2022CSE001', name: 'Aditya Kapoor', email: 'aditya.kapoor@student.college.edu',
        phone: '9876543240', programId: btechCSE.id, departmentId: cseDept.id,
        currentSemester: 6, admissionYear: 2022, batchYear: '2022-2026',
        gender: 'Male', dateOfBirth: new Date('2004-06-12'), cgpa: 8.8, status: 'Active'
      },
      {
        rollNumber: '2022CSE002', name: 'Meera Joshi', email: 'meera.joshi@student.college.edu',
        phone: '9876543241', programId: btechCSE.id, departmentId: cseDept.id,
        currentSemester: 6, admissionYear: 2022, batchYear: '2022-2026',
        gender: 'Female', dateOfBirth: new Date('2004-09-28'), cgpa: 9.4, status: 'Active'
      },
      {
        rollNumber: '2022CSE003', name: 'Nikhil Gupta', email: 'nikhil.gupta@student.college.edu',
        phone: '9876543242', programId: btechCSE.id, departmentId: cseDept.id,
        currentSemester: 6, admissionYear: 2022, batchYear: '2022-2026',
        gender: 'Male', dateOfBirth: new Date('2004-01-17'), cgpa: 7.9, status: 'Active'
      },
      // ECE Students - Batch 2024 (Semester 2)
      {
        rollNumber: '2024ECE001', name: 'Riya Banerjee', email: 'riya.banerjee@student.college.edu',
        phone: '9876543250', programId: btechECE.id, departmentId: eceDept.id,
        currentSemester: 2, admissionYear: 2024, batchYear: '2024-2028',
        gender: 'Female', dateOfBirth: new Date('2006-04-10'), cgpa: 8.6, status: 'Active'
      },
      {
        rollNumber: '2024ECE002', name: 'Sanjay Rao', email: 'sanjay.rao@student.college.edu',
        phone: '9876543251', programId: btechECE.id, departmentId: eceDept.id,
        currentSemester: 2, admissionYear: 2024, batchYear: '2024-2028',
        gender: 'Male', dateOfBirth: new Date('2006-08-15'), cgpa: 7.7, status: 'Active'
      },
      {
        rollNumber: '2024ECE003', name: 'Tanvi Agarwal', email: 'tanvi.agarwal@student.college.edu',
        phone: '9876543252', programId: btechECE.id, departmentId: eceDept.id,
        currentSemester: 2, admissionYear: 2024, batchYear: '2024-2028',
        gender: 'Female', dateOfBirth: new Date('2006-02-22'), cgpa: 9.0, status: 'Active'
      },
      // ECE Students - Batch 2023 (Semester 4)
      {
        rollNumber: '2023ECE001', name: 'Ananya Gupta', email: 'ananya.gupta@student.college.edu',
        phone: '9876543260', programId: btechECE.id, departmentId: eceDept.id,
        currentSemester: 4, admissionYear: 2023, batchYear: '2023-2027',
        gender: 'Female', dateOfBirth: new Date('2005-10-08'), cgpa: 8.4, status: 'Active'
      },
      {
        rollNumber: '2023ECE002', name: 'Vivek Choudhary', email: 'vivek.choudhary@student.college.edu',
        phone: '9876543261', programId: btechECE.id, departmentId: eceDept.id,
        currentSemester: 4, admissionYear: 2023, batchYear: '2023-2027',
        gender: 'Male', dateOfBirth: new Date('2005-07-14'), cgpa: 7.6, status: 'Active'
      }
    ];

    const students = [];
    for (const sData of studentData) {
      const student = await Student.create(sData);

      // Create user account for student
      const user = await User.create({
        email: sData.email,
        password: 'Student@123',
        name: sData.name,
        role: 'student',
        profileId: student.id,
        profileModel: 'Student',
        isActive: true
      });

      await student.update({ userId: user.id });
      students.push(student);
    }

    // ============================================
    // Create Courses
    // ============================================
    console.log('📖 Creating courses...');
    const courses = await Course.bulkCreate([
      // CSE Semester 2 Courses
      {
        name: 'Programming in C', code: 'CSE201',
        departmentId: cseDept.id, programId: btechCSE.id, semesterId: currentSemester.id,
        facultyId: faculty[3].id, semesterNumber: 2, credits: 4, type: 'Core',
        description: 'Introduction to programming fundamentals using C language.',
        lectureHours: 3, tutorialHours: 1, practicalHours: 2,
        internalMarks: 40, externalMarks: 60, totalMarks: 100, maxCapacity: 60, isActive: true
      },
      {
        name: 'Mathematics II - Linear Algebra', code: 'MTH201',
        departmentId: cseDept.id, programId: btechCSE.id, semesterId: currentSemester.id,
        facultyId: faculty[0].id, semesterNumber: 2, credits: 4, type: 'Core',
        description: 'Vector spaces, linear transformations, matrices, eigenvalues.',
        lectureHours: 3, tutorialHours: 2, practicalHours: 0,
        internalMarks: 40, externalMarks: 60, totalMarks: 100, maxCapacity: 60, isActive: true
      },
      {
        name: 'Digital Logic Design', code: 'CSE202',
        departmentId: cseDept.id, programId: btechCSE.id, semesterId: currentSemester.id,
        facultyId: faculty[2].id, semesterNumber: 2, credits: 3, type: 'Core',
        description: 'Boolean algebra, logic gates, combinational and sequential circuits.',
        lectureHours: 3, tutorialHours: 0, practicalHours: 2,
        internalMarks: 40, externalMarks: 60, totalMarks: 100, maxCapacity: 60, isActive: true
      },
      // CSE Semester 4 Courses
      {
        name: 'Data Structures and Algorithms', code: 'CSE401',
        departmentId: cseDept.id, programId: btechCSE.id, semesterId: currentSemester.id,
        facultyId: faculty[0].id, semesterNumber: 4, credits: 4, type: 'Core',
        description: 'Advanced data structures including trees, graphs, heaps, and hash tables.',
        lectureHours: 3, tutorialHours: 1, practicalHours: 2,
        internalMarks: 40, externalMarks: 60, totalMarks: 100, maxCapacity: 60, isActive: true
      },
      {
        name: 'Database Management Systems', code: 'CSE402',
        departmentId: cseDept.id, programId: btechCSE.id, semesterId: currentSemester.id,
        facultyId: faculty[1].id, semesterNumber: 4, credits: 4, type: 'Core',
        description: 'Relational database design, SQL, normalization, transaction management.',
        lectureHours: 3, tutorialHours: 1, practicalHours: 2,
        internalMarks: 40, externalMarks: 60, totalMarks: 100, maxCapacity: 60, isActive: true
      },
      {
        name: 'Operating Systems', code: 'CSE403',
        departmentId: cseDept.id, programId: btechCSE.id, semesterId: currentSemester.id,
        facultyId: faculty[3].id, semesterNumber: 4, credits: 4, type: 'Core',
        description: 'Process management, memory management, file systems.',
        lectureHours: 3, tutorialHours: 1, practicalHours: 2,
        internalMarks: 40, externalMarks: 60, totalMarks: 100, maxCapacity: 60, isActive: true
      },
      {
        name: 'Computer Networks', code: 'CSE404',
        departmentId: cseDept.id, programId: btechCSE.id, semesterId: currentSemester.id,
        facultyId: faculty[2].id, semesterNumber: 4, credits: 3, type: 'Core',
        description: 'OSI model, TCP/IP protocols, routing algorithms.',
        lectureHours: 3, tutorialHours: 0, practicalHours: 2,
        internalMarks: 40, externalMarks: 60, totalMarks: 100, maxCapacity: 60, isActive: true
      },
      // CSE Semester 6 Courses
      {
        name: 'Machine Learning', code: 'CSE601',
        departmentId: cseDept.id, programId: btechCSE.id, semesterId: currentSemester.id,
        facultyId: faculty[0].id, semesterNumber: 6, credits: 4, type: 'Core',
        description: 'Supervised and unsupervised learning, neural networks.',
        lectureHours: 3, tutorialHours: 1, practicalHours: 2,
        internalMarks: 40, externalMarks: 60, totalMarks: 100, maxCapacity: 50, isActive: true
      },
      {
        name: 'Web Development', code: 'CSE602',
        departmentId: cseDept.id, programId: btechCSE.id, semesterId: currentSemester.id,
        facultyId: faculty[1].id, semesterNumber: 6, credits: 3, type: 'Elective',
        description: 'Full-stack web development using modern frameworks.',
        lectureHours: 2, tutorialHours: 0, practicalHours: 4,
        internalMarks: 50, externalMarks: 50, totalMarks: 100, maxCapacity: 40, isActive: true
      },
      {
        name: 'Software Engineering', code: 'CSE603',
        departmentId: cseDept.id, programId: btechCSE.id, semesterId: currentSemester.id,
        facultyId: faculty[3].id, semesterNumber: 6, credits: 3, type: 'Core',
        description: 'Software development life cycle, agile methodologies.',
        lectureHours: 3, tutorialHours: 1, practicalHours: 0,
        internalMarks: 40, externalMarks: 60, totalMarks: 100, maxCapacity: 60, isActive: true
      },
      // ECE Semester 2 Courses
      {
        name: 'Basic Electronics', code: 'ECE201',
        departmentId: eceDept.id, programId: btechECE.id, semesterId: currentSemester.id,
        facultyId: faculty[5].id, semesterNumber: 2, credits: 4, type: 'Core',
        description: 'Semiconductor devices, diodes, transistors, amplifiers.',
        lectureHours: 3, tutorialHours: 1, practicalHours: 2,
        internalMarks: 40, externalMarks: 60, totalMarks: 100, maxCapacity: 50, isActive: true
      },
      {
        name: 'Circuit Theory', code: 'ECE202',
        departmentId: eceDept.id, programId: btechECE.id, semesterId: currentSemester.id,
        facultyId: faculty[4].id, semesterNumber: 2, credits: 4, type: 'Core',
        description: 'Network theorems, transient and steady-state analysis.',
        lectureHours: 3, tutorialHours: 2, practicalHours: 0,
        internalMarks: 40, externalMarks: 60, totalMarks: 100, maxCapacity: 50, isActive: true
      },
      // ECE Semester 4 Courses
      {
        name: 'Digital Signal Processing', code: 'ECE401',
        departmentId: eceDept.id, programId: btechECE.id, semesterId: currentSemester.id,
        facultyId: faculty[4].id, semesterNumber: 4, credits: 4, type: 'Core',
        description: 'Discrete-time signals, DFT, FFT, digital filter design.',
        lectureHours: 3, tutorialHours: 1, practicalHours: 2,
        internalMarks: 40, externalMarks: 60, totalMarks: 100, maxCapacity: 50, isActive: true
      },
      {
        name: 'VLSI Design', code: 'ECE402',
        departmentId: eceDept.id, programId: btechECE.id, semesterId: currentSemester.id,
        facultyId: faculty[5].id, semesterNumber: 4, credits: 4, type: 'Core',
        description: 'CMOS technology, logic design, layout techniques.',
        lectureHours: 3, tutorialHours: 1, practicalHours: 2,
        internalMarks: 40, externalMarks: 60, totalMarks: 100, maxCapacity: 50, isActive: true
      }
    ], { returning: true });

    // ============================================
    // Create Enrollments
    // ============================================
    console.log('📝 Creating enrollments...');
    const enrollments = [];

    const getStudentsBySemesterAndDept = (sem, deptId) => {
      return students.filter(s => s.currentSemester === sem && s.departmentId === deptId);
    };

    const getCoursesBySemesterAndDept = (sem, deptId) => {
      return courses.filter(c => c.semesterNumber === sem && c.departmentId === deptId);
    };

    // Enroll CSE students
    for (const sem of [2, 4, 6]) {
      const semStudents = getStudentsBySemesterAndDept(sem, cseDept.id);
      const semCourses = getCoursesBySemesterAndDept(sem, cseDept.id);
      for (const student of semStudents) {
        for (const course of semCourses) {
          const enrollment = await Enrollment.create({
            studentId: student.id,
            courseId: course.id,
            semesterId: currentSemester.id,
            status: 'Enrolled',
            enrollmentDate: new Date('2026-01-15')
          });
          enrollments.push(enrollment);
        }
      }
    }

    // Enroll ECE students
    for (const sem of [2, 4]) {
      const semStudents = getStudentsBySemesterAndDept(sem, eceDept.id);
      const semCourses = getCoursesBySemesterAndDept(sem, eceDept.id);
      for (const student of semStudents) {
        for (const course of semCourses) {
          const enrollment = await Enrollment.create({
            studentId: student.id,
            courseId: course.id,
            semesterId: currentSemester.id,
            status: 'Enrolled',
            enrollmentDate: new Date('2026-01-15')
          });
          enrollments.push(enrollment);
        }
      }
    }

    // ============================================
    // Create Exams
    // ============================================
    console.log('📋 Creating exams...');
    const exams = [];

    for (const course of courses) {
      const isCSE = course.departmentId === cseDept.id;

      // Quiz 1 - Already conducted
      exams.push(await Exam.create({
        name: `${course.code} - Quiz 1`,
        courseId: course.id,
        semesterId: currentSemester.id,
        type: 'Quiz',
        category: 'Internal',
        date: new Date('2026-02-05'),
        startTime: '10:00',
        endTime: '10:30',
        duration: 30,
        maxMarks: 10,
        passingMarks: 4,
        weightage: 5,
        venue: isCSE ? 'Room 101, CSE Block' : 'Room 201, ECE Block',
        status: 'Completed',
        isPublished: true
      }));

      // Mid-Term - Upcoming
      exams.push(await Exam.create({
        name: `${course.code} - Mid-Term Examination`,
        courseId: course.id,
        semesterId: currentSemester.id,
        type: 'Mid-Term',
        category: 'Internal',
        date: new Date('2026-03-10'),
        startTime: '09:00',
        endTime: '12:00',
        duration: 180,
        maxMarks: 30,
        passingMarks: 12,
        weightage: 20,
        venue: isCSE ? 'Exam Hall A' : 'Exam Hall B',
        status: 'Scheduled',
        isPublished: false
      }));

      // Assignment 1 - Already conducted
      exams.push(await Exam.create({
        name: `${course.code} - Assignment 1`,
        courseId: course.id,
        semesterId: currentSemester.id,
        type: 'Assignment',
        category: 'Internal',
        date: new Date('2026-02-15'),
        startTime: '00:00',
        endTime: '23:59',
        duration: 1,
        maxMarks: 10,
        passingMarks: 4,
        weightage: 5,
        venue: 'Online Submission',
        status: 'Completed',
        isPublished: true
      }));

      // End-Term - Future
      exams.push(await Exam.create({
        name: `${course.code} - End-Term Examination`,
        courseId: course.id,
        semesterId: currentSemester.id,
        type: 'End-Term',
        category: 'External',
        date: new Date('2026-05-10'),
        startTime: '09:00',
        endTime: '12:00',
        duration: 180,
        maxMarks: 50,
        passingMarks: 20,
        weightage: 50,
        venue: isCSE ? 'Main Auditorium' : 'Conference Hall',
        status: 'Scheduled',
        isPublished: false
      }));
    }

    // ============================================
    // Create Marks for completed exams
    // ============================================
    console.log('📊 Creating marks...');
    const marks = [];

    const generateMark = (maxMarks, studentCgpa) => {
      const basePercent = (studentCgpa / 10) * 100;
      const variance = (Math.random() * 25) - 15;
      const finalPercent = Math.min(100, Math.max(30, basePercent + variance));
      return Math.round((finalPercent / 100) * maxMarks);
    };

    for (const enrollment of enrollments) {
      const student = students.find(s => s.id === enrollment.studentId);
      const course = courses.find(c => c.id === enrollment.courseId);

      const completedExams = exams.filter(e =>
        e.courseId === course.id && e.status === 'Completed'
      );

      for (const exam of completedExams) {
        const marksObtained = generateMark(exam.maxMarks, student.cgpa);
        marks.push(await Mark.create({
          studentId: student.id,
          courseId: course.id,
          examId: exam.id,
          marksObtained: marksObtained,
          maxMarks: exam.maxMarks,
          remarks: marksObtained >= exam.passingMarks ? 'Pass' : 'Needs Improvement',
          isPublished: true
        }));
      }
    }

    // ============================================
    // Create Attendance Records
    // ============================================
    console.log('📅 Creating attendance records...');
    const attendanceRecords = [];

    const attendanceDates = [];
    const startDate = new Date('2026-01-06');
    for (let i = 0; i < 15; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + Math.floor(i / 5) * 7 + (i % 5));
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        attendanceDates.push(new Date(date));
      }
    }

    const getAttendanceStatus = (cgpa) => {
      const rand = Math.random();
      const presentThreshold = 0.7 + (cgpa / 100);
      if (rand < presentThreshold) return 'Present';
      if (rand < presentThreshold + 0.1) return 'Late';
      return 'Absent';
    };

    for (const enrollment of enrollments) {
      const student = students.find(s => s.id === enrollment.studentId);
      const course = courses.find(c => c.id === enrollment.courseId);

      for (let i = 0; i < attendanceDates.length; i++) {
        if (i % 3 === 0 || i % 3 === 2) {
          const status = getAttendanceStatus(student.cgpa);
          attendanceRecords.push(await Attendance.create({
            studentId: student.id,
            courseId: course.id,
            date: attendanceDates[i],
            status: status,
            session: 'Morning',
            markedBy: course.facultyId,
            remarks: status === 'Late' ? 'Arrived 10 minutes late' : (status === 'Absent' ? 'No prior intimation' : '')
          }));
        }
      }
    }

    // ============================================
    // Create Announcements
    // ============================================
    console.log('📢 Creating announcements...');
    await Announcement.bulkCreate([
      {
        title: 'Welcome to Spring Semester 2026',
        content: `Dear Students and Faculty,\n\nWe are pleased to welcome you to the Spring Semester 2026! Classes commenced on January 6th, 2026.\n\nKey Dates for this semester:\n• Mid-Term Examinations: March 9-20, 2026\n• Spring Break: April 6-12, 2026\n• End-Term Examinations: May 4-15, 2026\n• Result Declaration: May 25, 2026\n\nPlease ensure your course registrations are complete and check your timetables on the student portal.\n\nBest wishes for a successful semester!`,
        category: 'Academic',
        priority: 'High',
        targetRoles: ['admin', 'faculty', 'student'],
        createdBy: adminUser.id,
        publishDate: new Date('2026-01-06'),
        isActive: true,
        isPinned: true
      },
      {
        title: 'Mid-Term Examination Schedule Released',
        content: `The Mid-Term Examination schedule for Spring Semester 2026 has been released.\n\nExaminations will be conducted from March 9th to March 20th, 2026.\n\nImportant Instructions:\n1. Carry your college ID card to the examination hall\n2. Report 30 minutes before the scheduled time\n3. No electronic devices allowed inside the examination hall\n4. Detailed seating arrangements will be shared one week before exams\n\nThe complete schedule is available on the Examinations page.\n\nFor any queries, contact the Examination Cell.`,
        category: 'Exam',
        priority: 'High',
        targetRoles: ['faculty', 'student'],
        createdBy: adminUser.id,
        publishDate: new Date('2026-02-20'),
        isActive: true,
        isPinned: true
      },
      {
        title: 'Library Hours Extended During Exam Preparation',
        content: `To facilitate exam preparation, the Central Library will operate with extended hours from February 24th onwards.\n\nNew Timings:\n• Monday to Friday: 7:00 AM - 11:00 PM\n• Saturday: 8:00 AM - 9:00 PM\n• Sunday: 9:00 AM - 6:00 PM\n\nAdditional reading rooms on the 2nd floor will also be open for silent study.\n\nHappy studying!`,
        category: 'General',
        priority: 'Normal',
        targetRoles: ['student'],
        createdBy: adminUser.id,
        publishDate: new Date('2026-02-22'),
        isActive: true
      },
      {
        title: 'Technical Symposium "TechVista 2026" - Call for Participation',
        content: `The Department of Computer Science & Engineering is organizing the annual technical symposium "TechVista 2026" on February 28th-29th, 2026.\n\nEvents:\n• Hackathon (24-hour coding marathon)\n• Paper Presentation\n• Project Exhibition\n• Coding Contest\n• Technical Quiz\n\nRegistration is now open! Early bird registration closes on February 20th.\n\nAttractive prizes and certificates for all participants.\n\nRegister at: https://techvista.college.edu`,
        category: 'Event',
        priority: 'Normal',
        targetRoles: ['student', 'faculty'],
        createdBy: adminUser.id,
        publishDate: new Date('2026-02-01'),
        expiryDate: new Date('2026-03-01'),
        isActive: true
      },
      {
        title: 'Assignment Submission Reminder - Week 3',
        content: `This is a reminder that Assignment 1 submissions for all courses are due by February 15th, 2026, 11:59 PM.\n\nPlease ensure:\n• All assignments are submitted through the online portal\n• Late submissions will attract a penalty of 10% per day\n• Plagiarism will result in zero marks\n\nContact your respective course faculty for any clarifications.`,
        category: 'Academic',
        priority: 'Normal',
        targetRoles: ['student'],
        createdBy: adminUser.id,
        publishDate: new Date('2026-02-12'),
        expiryDate: new Date('2026-02-16'),
        isActive: true
      },
      {
        title: 'Campus Recruitment Drive - Infosys',
        content: `Infosys Limited will be conducting a campus recruitment drive on March 5th, 2026.\n\nEligibility:\n• B.Tech CSE/ECE students (2026 batch)\n• Minimum 65% aggregate with no active backlogs\n• Good communication skills\n\nPositions: Systems Engineer, Power Programmer\n\nCTC: ₹3.6 LPA - ₹8 LPA (based on role)\n\nInterested students must register by March 1st through the Placement Cell portal.\n\nRequired Documents: Updated Resume, Mark sheets, ID proof`,
        category: 'Event',
        priority: 'High',
        targetRoles: ['student'],
        createdBy: adminUser.id,
        publishDate: new Date('2026-02-18'),
        expiryDate: new Date('2026-03-06'),
        isActive: true
      },
      {
        title: 'Attendance Below 75% - Warning Notice',
        content: `Students with attendance below 75% are hereby warned that as per university regulations, a minimum of 75% attendance is mandatory to appear for End-Term examinations.\n\nStudents falling short of attendance must:\n1. Submit a written application to the respective HOD\n2. Provide valid medical certificates (if applicable)\n3. Attend extra classes if arranged by the department\n\nThe final attendance list will be published before the End-Term examinations.`,
        category: 'Academic',
        priority: 'High',
        targetRoles: ['student'],
        createdBy: adminUser.id,
        publishDate: new Date('2026-02-25'),
        isActive: true
      },
      {
        title: 'Faculty Development Program - Machine Learning',
        content: `A one-week Faculty Development Program on "Recent Advances in Machine Learning and AI" will be conducted from March 23rd-28th, 2026.\n\nResource Persons: Experts from IIT Delhi, Microsoft Research, and NVIDIA\n\nTopics Covered:\n• Deep Learning Fundamentals\n• Natural Language Processing\n• Computer Vision Applications\n• Generative AI and LLMs\n• Hands-on Labs with PyTorch\n\nRegistration is open for all faculty members. Limited seats available.\n\nRegister through the Faculty Portal by March 15th.`,
        category: 'Event',
        priority: 'Normal',
        targetRoles: ['faculty', 'admin'],
        createdBy: adminUser.id,
        publishDate: new Date('2026-02-10'),
        isActive: true
      }
    ]);

    // ============================================
    // Summary
    // ============================================
    console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   ✅ Database Seeded Successfully!                               ║
║                                                                  ║
║   📊 Data Summary:                                               ║
║   ────────────────────────────────────────────────────────────   ║
║   • Departments: ${departments.length}                                               ║
║   • Programs: ${programs.length}                                                  ║
║   • Semesters: ${semesters.length}                                                 ║
║   • Faculty: ${faculty.length}                                                   ║
║   • Students: ${students.length}                                                  ║
║   • Courses: ${courses.length}                                                   ║
║   • Enrollments: ${enrollments.length}                                              ║
║   • Exams: ${exams.length}                                                   ║
║   • Marks: ${marks.length}                                                  ║
║   • Attendance Records: ${attendanceRecords.length}                                     ║
║   • Announcements: 8                                             ║
║                                                                  ║
║   🔐 Sample Login Credentials:                                   ║
║   ────────────────────────────────────────────────────────────   ║
║   Admin:   admin@college.edu / Admin@123                         ║
║                                                                  ║
║   Faculty (CSE):                                                 ║
║   • rajesh.kumar@college.edu / Faculty@123 (HOD)                 ║
║   • priya.sharma@college.edu / Faculty@123                       ║
║   • amit.singh@college.edu / Faculty@123                         ║
║   • kavitha.nair@college.edu / Faculty@123                       ║
║                                                                  ║
║   Faculty (ECE):                                                 ║
║   • suresh.menon@college.edu / Faculty@123 (HOD)                 ║
║   • anjali.deshmukh@college.edu / Faculty@123                    ║
║                                                                  ║
║   Students (Sample):                                             ║
║   • aarav.sharma@student.college.edu / Student@123 (CSE, Sem 2)  ║
║   • rahul.verma@student.college.edu / Student@123 (CSE, Sem 4)   ║
║   • aditya.kapoor@student.college.edu / Student@123 (CSE, Sem 6) ║
║   • riya.banerjee@student.college.edu / Student@123 (ECE, Sem 2) ║
║   • ananya.gupta@student.college.edu / Student@123 (ECE, Sem 4)  ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
    `);

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed
seedData();
