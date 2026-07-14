import { Employee } from '../models/employee.model.js';
import { AppError } from '../errors/appError.js';
export const createEmployee = async (employeeData) => {
    const existingEmployee = await Employee.findOne({ email: employeeData.email });
    if (existingEmployee) {
        throw new AppError('An employee with this email already exists', 400);
    }
    const employee = await Employee.create(employeeData);
    // Hide password on returned object
    const employeeObj = employee.toObject();
    delete employeeObj.password;
    return employee;
};
export const getEmployeeById = async (id) => {
    const employee = await Employee.findById(id);
    if (!employee) {
        throw new AppError('Employee not found', 404);
    }
    return employee;
};
export const updateEmployee = async (id, updateData) => {
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
        const value = updateData[key];
        if (value !== undefined) {
            employee[key] = value;
        }
    });
    await employee.save();
    return employee;
};
export const deleteEmployee = async (id) => {
    const result = await Employee.findByIdAndDelete(id);
    if (!result) {
        throw new AppError('Employee not found', 404);
    }
};
export const queryEmployees = async (options) => {
    const query = {};
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
    const sort = {};
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
