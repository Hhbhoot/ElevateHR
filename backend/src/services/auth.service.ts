import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Employee, IEmployee } from '../models/employee.model.js';
import { RefreshToken } from '../models/token.model.js';
import { AppError } from '../errors/appError.js';

interface TokenPayload {
  id: string;
  role: string;
}

export const signAccessToken = (employeeId: string, role: string): string => {
  return jwt.sign({ id: employeeId, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
};

export const signRefreshToken = (employeeId: string): string => {
  return jwt.sign({ id: employeeId }, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as any,
  });
};

export const login = async (email: string, password: string) => {
  // 1) Find employee and explicitly select the password
  const employee = await Employee.findOne({ email }).select('+password');
  if (!employee) {
    throw new AppError('Invalid email or password', 401);
  }

  // 2) Verify status is Active
  if (employee.status !== 'Active') {
    throw new AppError(`Your account is currently ${employee.status}. Access denied.`, 403);
  }

  // 3) Compare candidate password with hashed password
  const isMatch = await employee.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  // 4) Generate new tokens
  const accessToken = signAccessToken(employee._id.toString(), employee.role);
  const refreshTokenString = signRefreshToken(employee._id.toString());

  // 5) Save refresh token in DB
  const expiresAt = new Date();
  // Standard 7d default if parse fails, or extract from config.
  // Let's compute date based on config format (e.g. 7d = 7 days)
  expiresAt.setDate(expiresAt.getDate() + 7);

  await RefreshToken.create({
    employeeId: employee._id,
    token: refreshTokenString,
    expiresAt,
  });

  // Remove password from output
  employee.password = undefined;

  return {
    employee,
    accessToken,
    refreshToken: refreshTokenString,
  };
};

export const refresh = async (oldRefreshToken: string) => {
  // 1) Find token in DB
  const dbToken = await RefreshToken.findOne({ token: oldRefreshToken });
  if (!dbToken) {
    throw new AppError('Invalid refresh token or session has expired', 401);
  }

  // 2) Verify JWT token
  let decoded: { id: string };
  try {
    decoded = jwt.verify(oldRefreshToken, env.REFRESH_TOKEN_SECRET) as { id: string };
  } catch (error) {
    // Delete invalid token from db
    await RefreshToken.deleteOne({ _id: dbToken._id });
    throw new AppError('Invalid refresh token. Please login again.', 401);
  }

  // 3) Ensure employee still exists and is Active
  const employee = await Employee.findById(decoded.id);
  if (!employee) {
    await RefreshToken.deleteOne({ _id: dbToken._id });
    throw new AppError('The owner of this token no longer exists.', 401);
  }

  if (employee.status !== 'Active') {
    await RefreshToken.deleteOne({ _id: dbToken._id });
    throw new AppError(`The user is currently ${employee.status}. Access denied.`, 403);
  }

  // 4) Clean old refresh token and rotate to a new one
  await RefreshToken.deleteOne({ _id: dbToken._id });

  const newAccessToken = signAccessToken(employee._id.toString(), employee.role);
  const newRefreshToken = signRefreshToken(employee._id.toString());

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await RefreshToken.create({
    employeeId: employee._id,
    token: newRefreshToken,
    expiresAt,
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const logout = async (token: string) => {
  await RefreshToken.deleteOne({ token });
};
