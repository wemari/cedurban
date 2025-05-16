const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/profile_photos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Setup storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);  // Store files in the profile_photos directory
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));  // Unique filename with extension
  }
});

// Initialize upload with size limit, file type filter, and storage
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },  // 5MB file size limit
  fileFilter: (req, file, cb) => {
    // Only allow certain image file types (jpeg, jpg, png, gif)
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);  // Accept file
    } else {
      cb(new Error('Only image files are allowed!'), false);  // Reject file
    }
  }
});

// Export the upload middleware for use in routes
module.exports = upload;
