import dotenv from 'dotenv';
import { z } from 'zod';
dotenv.config();
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z
        .string()
        .transform((val) => parseInt(val, 10))
        .default('5000'),
    MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
    JWT_SECRET: z.string().min(10, 'JWT_SECRET must be at least 10 characters long'),
    JWT_EXPIRES_IN: z.string().default('15m'),
    REFRESH_TOKEN_SECRET: z
        .string()
        .min(10, 'REFRESH_TOKEN_SECRET must be at least 10 characters long'),
    REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
    CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
    CLOUDINARY_SECRET: z.string().min(1, 'CLOUDINARY_SECRET is required'),
    CLOUDINARY_CLOUDNAME: z.string().min(1, 'CLOUDINARY_CLOUDNAME is required'),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('❌ Invalid environment configuration:', parsed.error.format());
    process.exit(1);
}
export const env = parsed.data;
