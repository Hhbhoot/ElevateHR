import { Router } from 'express';
import * as employeeController from '../controllers/employee.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createEmployeeSchema, updateEmployeeSchema, queryEmployeeSchema, } from '../utils/validation/employee.validation.js';
import multer from 'multer';
const router = Router();
// Configure multer memory storage for buffer stream uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed!'), false);
        }
    },
});
// Protect all routes under employee resource
router.use(protect);
router
    .route('/')
    .post(restrictTo('HR'), validate(createEmployeeSchema), employeeController.createEmployee)
    .get(restrictTo('HR', 'Manager'), validate(queryEmployeeSchema), employeeController.getEmployeesList);
router
    .route('/:id')
    .get(employeeController.getEmployeeDetails)
    .patch(validate(updateEmployeeSchema), employeeController.updateEmployee)
    .delete(restrictTo('HR'), employeeController.deleteEmployee);
router.patch('/:id/photo', upload.single('photo'), employeeController.uploadProfilePhoto);
export default router;
