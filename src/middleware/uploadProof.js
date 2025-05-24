// src/middleware/uploadProof.js
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');

const uploadDir = path.join(__dirname, '../uploads/donations');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename:   (_, file, cb) => {
    const name = `${Date.now()}${path.extname(file.originalname)}`;
    cb(null, name);
  }
});

module.exports = multer({ storage });
