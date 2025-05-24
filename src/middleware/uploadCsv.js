// middleware/uploadCsv.js
const multer = require('multer');
const path  = require('path');
const fs    = require('fs');

const uploadDir = path.join(__dirname, '../uploads/csv_imports');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename:    (_, file, cb) => {
    const ts = Date.now() + '-' + Math.round(Math.random()*1e9);
    cb(null, ts + path.extname(file.originalname));
  }
});

module.exports = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },       // 10 MB max
  fileFilter: (_, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() !== '.csv')
      return cb(new Error('Only CSV files are allowed'), false);
    cb(null, true);
  }
}).single('file');
