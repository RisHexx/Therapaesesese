const { body } = require('express-validator');

// Validation rules for user registration
const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('role')
    .optional()
    .isIn(['user', 'therapist', 'admin'])
    .withMessage('Role must be either user, therapist, or admin'),
  
  body('phone')
    .optional()
    .matches(/^\d{10}$/)
    .withMessage('Phone number must be 10 digits'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date'),
  
  // Therapist-specific validations
  body('specialization')
    .if(body('role').equals('therapist'))
    .notEmpty()
    .withMessage('Specialization is required for therapists'),
  
  body('licenseNumber')
    .if(body('role').equals('therapist'))
    .notEmpty()
    .withMessage('License number is required for therapists'),
  
  body('experience')
    .if(body('role').equals('therapist'))
    .isInt({ min: 0, max: 50 })
    .withMessage('Experience must be a number between 0 and 50 years')
];

// Validation rules for user login
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

module.exports = {
  validateRegister,
  validateLogin
};
