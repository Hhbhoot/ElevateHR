import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Employee } from '../models/employee.model.js';
import { AppError } from '../errors/appError.js';
export const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return next(new AppError('You are not logged in! Please log in to get access.', 401));
        }
        const decoded = jwt.verify(token, env.JWT_SECRET);
        const currentEmployee = await Employee.findById(decoded.id);
        if (!currentEmployee) {
            return next(new AppError('The employee belonging to this token no longer exists.', 401));
        }
        if (currentEmployee.status !== 'Active') {
            return next(new AppError(`Your account is currently ${currentEmployee.status}. Access denied.`, 403));
        }
        req.user = currentEmployee;
        next();
    }
    catch (error) {
        next(error);
    }
};
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError('Authentication context is missing.', 500));
        }
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};
