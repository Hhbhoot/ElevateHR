import * as employeeService from '../services/employee.service.js';
import { AppError } from '../errors/appError.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { Employee } from '../models/employee.model.js';
export const createEmployee = async (req, res, next) => {
    try {
        const employee = await employeeService.createEmployee(req.body);
        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            data: employee,
        });
    }
    catch (error) {
        next(error);
    }
};
export const getEmployeeDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const currentUser = req.user;
        // Security Rule: Regular employees can only view their own profile
        if (currentUser.role === 'Employee' && currentUser._id.toString() !== id) {
            throw new AppError('You do not have permission to view other employees details', 403);
        }
        const employee = await employeeService.getEmployeeById(id);
        res.status(200).json({
            success: true,
            data: employee,
        });
    }
    catch (error) {
        next(error);
    }
};
export const updateEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;
        const currentUser = req.user;
        let updates = { ...req.body };
        // Security Rule: Managers are read-only
        if (currentUser.role === 'Manager') {
            throw new AppError('Managers do not have permission to update employees', 403);
        }
        // Security Rule: Regular employees can only update themselves and only basic fields
        if (currentUser.role === 'Employee') {
            if (currentUser._id.toString() !== id) {
                throw new AppError('You can only update your own profile', 403);
            }
            // Restrict fields a standard employee can modify
            const allowedFields = ['name', 'email', 'password'];
            const filteredUpdates = {};
            allowedFields.forEach((field) => {
                if (updates[field] !== undefined) {
                    filteredUpdates[field] = updates[field];
                }
            });
            if (Object.keys(filteredUpdates).length === 0) {
                throw new AppError('No valid fields provided for update', 400);
            }
            updates = filteredUpdates;
        }
        // HR can update any field of any employee
        const updatedEmployee = await employeeService.updateEmployee(id, updates);
        res.status(200).json({
            success: true,
            message: 'Employee updated successfully',
            data: updatedEmployee,
        });
    }
    catch (error) {
        next(error);
    }
};
export const deleteEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;
        await employeeService.deleteEmployee(id);
        res.status(200).json({
            success: true,
            message: 'Employee deleted successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
export const getEmployeesList = async (req, res, next) => {
    try {
        // Cast query options derived from Zod validator
        const { search, department, status, sortBy, sortOrder, page, limit } = req.query;
        const result = await employeeService.queryEmployees({
            search,
            department,
            status,
            sortBy,
            sortOrder,
            page,
            limit,
        });
        res.status(200).json({
            success: true,
            data: result.employees,
            pagination: result.pagination,
        });
    }
    catch (error) {
        next(error);
    }
};
export const uploadProfilePhoto = async (req, res, next) => {
    try {
        const { id } = req.params;
        const currentUser = req.user;
        // Security check: Only HR or the user themselves can update their photo
        if (currentUser.role !== 'HR' && currentUser._id.toString() !== id) {
            throw new AppError('You do not have permission to upload photo for this user', 403);
        }
        if (!req.file) {
            throw new AppError('Please provide an image file to upload', 400);
        }
        // Upload buffer directly to Cloudinary folder "profile_photos"
        const photoUrl = await uploadToCloudinary(req.file.buffer, 'profile_photos');
        // Update in database
        const employee = await Employee.findByIdAndUpdate(id, { profilePhoto: photoUrl }, { new: true, runValidators: true });
        if (!employee) {
            throw new AppError('Employee not found', 404);
        }
        res.status(200).json({
            success: true,
            message: 'Profile photo updated successfully',
            data: employee,
        });
    }
    catch (error) {
        next(error);
    }
};
