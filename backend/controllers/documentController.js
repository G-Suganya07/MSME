const Document = require('../models/Document');
const Application = require('../models/Application');
const asyncHandler = require('../utils/asyncHandler');

// @route   GET /api/documents/application/:applicationId
// @access  Private (owner or admin)
const getDocumentsForApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.applicationId);
  if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

  if (req.user.role !== 'admin' && application.user.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Forbidden: not your application' });
  }

  const documents = await Document.find({ application: application._id }).sort('-createdAt');
  res.status(200).json({ success: true, count: documents.length, data: documents });
});

// @route   POST /api/documents
// @access  Private
const createDocument = asyncHandler(async (req, res) => {
  const { applicationId, documentType, fileName, fileUrl } = req.body;

  const application = await Application.findById(applicationId);
  if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

  if (application.user.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Forbidden: not your application' });
  }

  const document = await Document.create({
    application: application._id,
    user: req.user.id,
    documentType,
    fileName,
    fileUrl,
    status: 'uploaded',
  });

  res.status(201).json({ success: true, data: document });
});

// @route   PUT /api/documents/:id/status
// @access  Private/Admin (verify/reject) or owner (re-upload -> uploaded)
const updateDocumentStatus = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);
  if (!document) return res.status(404).json({ success: false, message: 'Document not found' });

  const isOwner = document.user.toString() === req.user.id;
  if (req.user.role !== 'admin' && !isOwner) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  document.status = req.body.status;
  await document.save();
  res.status(200).json({ success: true, data: document });
});

// @route   DELETE /api/documents/:id
// @access  Private (owner or admin)
const deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);
  if (!document) return res.status(404).json({ success: false, message: 'Document not found' });

  if (req.user.role !== 'admin' && document.user.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  await document.deleteOne();
  res.status(200).json({ success: true, message: 'Document deleted successfully' });
});

module.exports = { getDocumentsForApplication, createDocument, updateDocumentStatus, deleteDocument };
