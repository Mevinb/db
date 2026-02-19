/**
 * Script to create a teacher account
 * Run with: node createTeacher.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { sequelize } = require('./config/db');
const { User, Faculty, Department } = require('./models');

async function createTeacher() {
  try {
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL');
    
    // Get CSE department
    const dept = await Department.findOne({ where: { code: 'CSE' } });
    if (!dept) {
      console.error('CSE Department not found. Please run seed first.');
      process.exit(1);
    }
    
    // Check if user already exists
    const existingUser = await User.scope('withPassword').findOne({ where: { email: 'mevinbenty507@gmail.com' } });
    if (existingUser) {
      console.log('User already exists, deleting to recreate...');
      await User.destroy({ where: { email: 'mevinbenty507@gmail.com' } });
      await Faculty.destroy({ where: { email: 'mevinbenty507@gmail.com' } });
    }
    
    // Create faculty record
    const faculty = await Faculty.create({
      employeeId: 'FAC100',
      name: 'Mevin Benty',
      email: 'mevinbenty507@gmail.com',
      phone: '9999999999',
      departmentId: dept.id,
      designation: 'Assistant Professor',
      specialization: 'Computer Science',
      qualification: 'M.Tech in Computer Science',
      experience: 5,
      dateOfJoining: new Date(),
      gender: 'Male',
      isActive: true
    });
    
    // Create user account
    const user = await User.create({
      email: 'mevinbenty507@gmail.com',
      password: 'mevinbenty12+',
      name: 'Mevin Benty',
      role: 'faculty',
      profileId: faculty.id,
      profileModel: 'Faculty',
      isActive: true
    });
    
    // Link user to faculty
    await faculty.update({ userId: user.id });
    
    console.log('');
    console.log('✅ Teacher account created successfully!');
    console.log('=====================================');
    console.log('Email: mevinbenty507@gmail.com');
    console.log('Password: mevinbenty12+');
    console.log('=====================================');
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createTeacher();
