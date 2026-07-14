import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/appError.js';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { env } from '../config/env.js';

interface StandardErrorResponse {
  success: false;
  error: {
    message: string;
    details?: any;
    stack?: string;
  };
}

const handleCastErrorDB = (err: mongoose.Error.CastError) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: any) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)?.[0] || 'Unknown value';
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err: mongoose.Error.ValidationError) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please log in again.', 401);

const handleZodError = (err: ZodError) => {
  const details = err.errors.map((e) => ({
    field: e.path.join('.'),
    message: e.message,
  }));
  const error = new AppError('Validation failed', 400);
  (error as any).details = details;
  return error;
};

const sendErrorDev = (err: any, res: Response) => {
  const responseBody: StandardErrorResponse = {
    success: false,
    error: {
      message: err.message || 'Something went wrong',
      details: err.details || null,
      stack: err.stack,
    },
  };
  res.status(err.statusCode || 500).json(responseBody);
};

const sendErrorProd = (err: any, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        details: err.details || null,
      },
    });
  } else {
    console.error('💥 ERROR:', err);
    res.status(500).json({
      success: false,
      error: {
        message: 'Something went very wrong!',
      },
    });
  }
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (env.NODE_ENV === 'development') {
    let error = { ...err, message: err.message, stack: err.stack };

    if (err instanceof ZodError) error = handleZodError(err);
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorDev(error, res);
  } else {
    let error = { ...err, message: err.message };

    if (err instanceof ZodError) error = handleZodError(err);
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
