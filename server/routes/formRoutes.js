import express from 'express';
import { saveFormData } from '../controller/formController.js';

const router = express.Router();

// Save Form Data Route
router.post('/form', saveFormData);

export default router;
