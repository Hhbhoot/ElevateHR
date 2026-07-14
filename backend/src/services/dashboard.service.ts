import { Employee } from '../models/employee.model.js';

export const getDashboardStats = async () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // Run all statistic queries in parallel using Promise.all for high performance
  const [
    totalEmployees,
    activeEmployees,
    avgSalaryGroup,
    highestPaidEmployee,
    departmentWiseCount,
    joinedThisMonth,
  ] = await Promise.all([
    Employee.countDocuments(),
    Employee.countDocuments({ status: 'Active' }),
    Employee.aggregate([
      {
        $group: {
          _id: null,
          averageSalary: { $avg: '$salary' },
        },
      },
    ]),
    Employee.findOne().sort({ salary: -1 }).limit(1).select('-password'),
    Employee.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          department: '$_id',
          count: 1,
        },
      },
      {
        $sort: { count: -1 },
      },
    ]),
    Employee.countDocuments({
      joiningDate: { $gte: startOfMonth, $lte: endOfMonth },
    }),
  ]);

  const averageSalary =
    avgSalaryGroup.length > 0 ? Math.round(avgSalaryGroup[0].averageSalary * 100) / 100 : 0;

  return {
    totalEmployees,
    activeEmployees,
    departmentWiseCount,
    averageSalary,
    highestPaidEmployee,
    employeesJoinedThisMonth: joinedThisMonth,
  };
};
