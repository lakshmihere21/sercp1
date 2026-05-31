const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/alert.controller');

// Multer setup
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
});

router.post('/sos', protect, authorize('citizen'), ctrl.triggerSOS);
router.get('/', protect, authorize('admin', 'responder'), ctrl.getAllAlerts);
router.get('/my', protect, ctrl.getMyAlerts);
router.get('/nearby', protect, authorize('responder', 'volunteer', 'admin'), ctrl.getNearbyAlerts);
router.get('/:id', protect, ctrl.getAlert);
router.patch('/:id/status', protect, ctrl.updateStatus);
router.post('/:id/assign', protect, authorize('admin'), ctrl.assignResponder);
router.post('/:id/images', protect, upload.array('images', 5), ctrl.uploadImages);

module.exports = router;
