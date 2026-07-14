import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
const employeeSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        select: false,
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        trim: true,
        index: true,
    },
    designation: {
        type: String,
        required: [true, 'Designation is required'],
        trim: true,
    },
    salary: {
        type: Number,
        required: [true, 'Salary is required'],
        min: [0, 'Salary cannot be negative'],
    },
    joiningDate: {
        type: Date,
        default: Date.now,
        index: true,
    },
    status: {
        type: String,
        enum: {
            values: ['Active', 'Inactive', 'Terminated'],
            message: '{VALUE} is not a valid status',
        },
        default: 'Active',
        index: true,
    },
    role: {
        type: String,
        enum: {
            values: ['HR', 'Manager', 'Employee'],
            message: '{VALUE} is not a valid role',
        },
        default: 'Employee',
    },
    profilePhoto: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});
// Hash password before saving
employeeSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    }
    catch (err) {
        next(err);
    }
});
// Compare password method
employeeSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password)
        return false;
    return bcrypt.compare(candidatePassword, this.password);
};
export const Employee = mongoose.model('Employee', employeeSchema);
