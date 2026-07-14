import { z } from 'zod';
const roleEnum = z.enum(['HR', 'Manager', 'Employee']);
const statusEnum = z.enum(['Active', 'Inactive', 'Terminated']);
export const createEmployeeSchema = z.object({
    body: z.object({
        name: z
            .string({ required_error: 'Name is required' })
            .min(2, 'Name must be at least 2 characters'),
        email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
        password: z
            .string({ required_error: 'Password is required' })
            .min(6, 'Password must be at least 6 characters'),
        department: z
            .string({ required_error: 'Department is required' })
            .min(1, 'Department cannot be empty'),
        designation: z
            .string({ required_error: 'Designation is required' })
            .min(1, 'Designation cannot be empty'),
        salary: z.number({ required_error: 'Salary is required' }).min(0, 'Salary cannot be negative'),
        joiningDate: z.string().datetime().optional().or(z.string().date().optional()),
        status: statusEnum.default('Active'),
        role: roleEnum.default('Employee'),
    }),
});
export const updateEmployeeSchema = z.object({
    body: z.object({
        name: z.string().min(2).optional(),
        email: z.string().email().optional(),
        password: z.string().min(6).optional(),
        department: z.string().min(1).optional(),
        designation: z.string().min(1).optional(),
        salary: z.number().min(0).optional(),
        joiningDate: z.string().datetime().optional().or(z.string().date().optional()),
        status: statusEnum.optional(),
        role: roleEnum.optional(),
    }),
});
export const queryEmployeeSchema = z.object({
    query: z.object({
        search: z.string().optional(),
        department: z.string().optional(),
        status: z.string().optional(),
        sortBy: z.enum(['salary', 'joiningDate', 'createdAt']).default('createdAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
        page: z
            .string()
            .transform((val) => Math.max(parseInt(val, 10) || 1, 1))
            .default('1'),
        limit: z
            .string()
            .transform((val) => Math.max(parseInt(val, 10) || 10, 1))
            .default('10'),
    }),
});
