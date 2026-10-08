const express = require('express');
const router = express.Router();
const {
  getDocumentsForApplication, createDocument, updateDocumentStatus, deleteDocument,
} = require('../controllers/documentController');
const {
  createDocumentValidator, updateStatusValidator, idParamValidator,
} = require('../validators/documentValidators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { param } = require('express-validator');

router.use(protect);

router.get(
  '/application/:applicationId',
  param('applicationId').isMongoId().withMessage('Invalid application id'),
  validate,
  getDocumentsForApplication
);
router.post('/', createDocumentValidator, validate, createDocument);
router.put('/:id/status', updateStatusValidator, validate, updateDocumentStatus);
router.delete('/:id', idParamValidator, validate, deleteDocument);

module.exports = router;
