import { AppError } from '../errors/appError.js';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)?.[0] || 'Unknown value';
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};
const handleJWTError = () => new AppError('Invalid token. Please log in again.', 401);
const handleJWTExpiredError = () => new AppError('Your token has expired. Please log in again.', 401);
const handleZodError = (err) => {
    const details = err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
    }));
    const error = new AppError('Validation failed', 400);
    error.details = details;
    return error;
};
const sendErrorDev = (err, res) => {
    const responseBody = {
        success: false,
        error: {
            message: err.message || 'Something went wrong',
            details: err.details || null,
            stack: err.stack,
        },
    };
    res.status(err.statusCode || 500).json(responseBody);
};
const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            success: false,
            error: {
                message: err.message,
                details: err.details || null,
            },
        });
    }
    else {
        console.error('💥 ERROR:', err);
        res.status(500).json({
            success: false,
            error: {
                message: 'Something went very wrong!',
            },
        });
    }
};
export const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (env.NODE_ENV === 'development') {
        let error = { ...err, message: err.message, stack: err.stack };
        if (err instanceof ZodError)
            error = handleZodError(err);
        if (err.name === 'CastError')
            error = handleCastErrorDB(err);
        if (err.code === 11000)
            error = handleDuplicateFieldsDB(err);
        if (err.name === 'ValidationError')
            error = handleValidationErrorDB(err);
        if (err.name === 'JsonWebTokenError')
            error = handleJWTError();
        if (err.name === 'TokenExpiredError')
            error = handleJWTExpiredError();
        sendErrorDev(error, res);
    }
    else {
        let error = { ...err, message: err.message };
        if (err instanceof ZodError)
            error = handleZodError(err);
        if (err.name === 'CastError')
            error = handleCastErrorDB(err);
        if (err.code === 11000)
            error = handleDuplicateFieldsDB(err);
        if (err.name === 'ValidationError')
            error = handleValidationErrorDB(err);
        if (err.name === 'JsonWebTokenError')
            error = handleJWTError();
        if (err.name === 'TokenExpiredError')
            error = handleJWTExpiredError();
        sendErrorProd(error, res);
    }
};
