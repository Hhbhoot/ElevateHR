import { Employee, IEmployee } from '../models/employee.model.js';
import { AppError } from '../errors/appError.js';

export const createEmployee = async (employeeData: Partial<IEmployee>): Promise<IEmployee> => {
  const existingEmployee = await Employee.findOne({ email: employeeData.email });
  if (existingEmployee) {
    throw new AppError('An employee with this email already exists', 400);
  }

  const employee = await Employee.create(employeeData);
  // Hide password on returned object
  const employeeObj = employee.toObject();
  delete employeeObj.password;
  return employee as any;
};

export const getEmployeeById = async (id: string): Promise<IEmployee> => {
  const employee = await Employee.findById(id);
  if (!employee) {
    throw new AppError('Employee not found', 404);
  }
  return employee;
};

export const updateEmployee = async (
  id: string,
  updateData: Partial<IEmployee>
): Promise<IEmployee> => {
  // If email is being updated, check if it already exists
  if (updateData.email) {
    const existingEmployee = await Employee.findOne({
      email: updateData.email,
      _id: { $ne: id },
    });
    if (existingEmployee) {
      throw new AppError('An employee with this email already exists', 400);
    }
  }

  // Find employee and apply updates (so save hook triggers if password is modified)
  const employee = await Employee.findById(id);
  if (!employee) {
    throw new AppError('Employee not found', 404);
  }

  // Iterate over update fields and set them
  Object.keys(updateData).forEach((key) => {
    const value = (updateData as any)[key];
    if (value !== undefined) {
      (employee as any)[key] = value;
    }
  });

  await employee.save();
  return employee;
};

export const deleteEmployee = async (id: string): Promise<void> => {
  const result = await Employee.findByIdAndDelete(id);
  if (!result) {
    throw new AppError('Employee not found', 404);
  }
};

export interface QueryOptions {
  search?: string;
  department?: string;
  status?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

export const queryEmployees = async (options: QueryOptions) => {
  const query: any = {};

  // Case-insensitive regex search for name
  if (options.search) {
    query.name = { $regex: options.search, $options: 'i' };
  }

  if (options.department) {
    query.department = options.department;
  }

  if (options.status) {
    query.status = options.status;
  }

  const sort: any = {};
  sort[options.sortBy] = options.sortOrder === 'asc' ? 1 : -1;

  const skip = (options.page - 1) * options.limit;

  const [employees, totalEmployees] = await Promise.all([
    Employee.find(query).sort(sort).skip(skip).limit(options.limit),
    Employee.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalEmployees / options.limit);

  return {
    employees,
    pagination: {
      page: options.page,
      limit: options.limit,
      totalPages,
      totalEmployees,
    },
  };
};
