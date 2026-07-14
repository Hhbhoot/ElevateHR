import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { Employee } from './models/employee.model.js';
import { RefreshToken } from './models/token.model.js';

const seedData = async () => {
  try {
    await connectDB();

    console.log('🧹 Clearing existing database data...');
    await Employee.deleteMany({});
    await RefreshToken.deleteMany({});

    console.log('🌱 Seeding initial roles...');

    // Dynamic dates for testing joining dates (this month vs previous months)
    const now = new Date();
    const thisMonthJoined = new Date(now.getFullYear(), now.getMonth(), 5);
    const lastMonthJoined = new Date(now.getFullYear(), now.getMonth() - 1, 15);
    const twoMonthsAgoJoined = new Date(now.getFullYear(), now.getMonth() - 2, 20);

    const employeesToInsert = [
      // Primary Roles
      {
        name: 'HR Manager',
        email: 'hr@company.com',
        password: 'password123',
        department: 'Human Resources',
        designation: 'HR Lead',
        salary: 75000,
        joiningDate: twoMonthsAgoJoined,
        status: 'Active',
        role: 'HR',
      },
      {
        name: 'Engineering Manager',
        email: 'manager@company.com',
        password: 'password123',
        department: 'Engineering',
        designation: 'Tech Lead',
        salary: 120000,
        joiningDate: lastMonthJoined,
        status: 'Active',
        role: 'Manager',
      },
      {
        name: 'John Doe',
        email: 'employee@company.com',
        password: 'password123',
        department: 'Engineering',
        designation: 'Software Engineer',
        salary: 60000,
        joiningDate: thisMonthJoined,
        status: 'Active',
        role: 'Employee',
      },
      // Mock Employees for query testing
      {
        name: 'Jane Smith',
        email: 'jane.smith@company.com',
        password: 'password123',
        department: 'Engineering',
        designation: 'Senior Developer',
        salary: 95000,
        joiningDate: thisMonthJoined,
        status: 'Active',
        role: 'Employee',
      },
      {
        name: 'Alice Brown',
        email: 'alice.brown@company.com',
        password: 'password123',
        department: 'Marketing',
        designation: 'Marketing Executive',
        salary: 50000,
        joiningDate: lastMonthJoined,
        status: 'Active',
        role: 'Employee',
      },
      {
        name: 'Bob Johnson',
        email: 'bob.johnson@company.com',
        password: 'password123',
        department: 'Sales',
        designation: 'Sales Representative',
        salary: 55000,
        joiningDate: twoMonthsAgoJoined,
        status: 'Inactive',
        role: 'Employee',
      },
      {
        name: 'Charlie Davis',
        email: 'charlie.davis@company.com',
        password: 'password123',
        department: 'Sales',
        designation: 'Sales Manager',
        salary: 80000,
        joiningDate: thisMonthJoined,
        status: 'Active',
        role: 'Manager',
      },
      {
        name: 'David Wilson',
        email: 'david.wilson@company.com',
        password: 'password123',
        department: 'Engineering',
        designation: 'QA Analyst',
        salary: 45000,
        joiningDate: twoMonthsAgoJoined,
        status: 'Terminated',
        role: 'Employee',
      },
      {
        name: 'Emma Watson',
        email: 'emma.watson@company.com',
        password: 'password123',
        department: 'Marketing',
        designation: 'Marketing Director',
        salary: 110000,
        joiningDate: lastMonthJoined,
        status: 'Active',
        role: 'Manager',
      },
    ];

    // Password hashing middleware handles it automatically upon save or create
    await Employee.create(employeesToInsert);
    console.log('✅ Seeding completed successfully!');

    // Log demo accounts
    console.log('\n🔐 Test Accounts Loaded:');
    console.log('------------------------------------------------');
    console.log('1. HR:        hr@company.com        / password123');
    console.log('2. Manager:   manager@company.com   / password123');
    console.log('3. Employee:  employee@company.com  / password123');
    console.log('------------------------------------------------\n');
  } catch (error) {
    console.error(`❌ Seeding failed: ${(error as Error).message}`);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Mongoose disconnected.');
    process.exit(0);
  }
};

seedData();
