const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

// Read AWS configuration from environment variables
const region = process.env.AWS_REGION || 'ap-south-1';
const bucketName = process.env.AWS_BUCKET_NAME || process.env.S3_BUCKET_NAME;

// Configure S3 Client
// If AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY are provided in .env, use them.
// If running on EC2 with an attached IAM Role, omit credentials and AWS SDK
// will automatically use the EC2 Instance Profile metadata service.
const s3Config = {
  region: region,
};

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3Config.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID.trim(),
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY.trim()
  };
}

if (process.env.AWS_ENDPOINT) {
  s3Config.endpoint = process.env.AWS_ENDPOINT;
  s3Config.forcePathStyle = true;
}

const s3 = new S3Client(s3Config);

// Helper to sanitize filenames for safe S3 keys
const sanitizeFileName = (fileName) => {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_');
};

// S3 Multer Storage Engine
const storage = multerS3({
  s3: s3,
  bucket: (req, file, cb) => {
    const bucket = process.env.AWS_BUCKET_NAME || process.env.S3_BUCKET_NAME;
    if (!bucket) {
      return cb(new Error('AWS S3 bucket name is not configured. Please set AWS_BUCKET_NAME in your .env file.'));
    }
    cb(null, bucket);
  },
  acl: (req, file, cb) => cb(null, undefined),
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    // Determine folder category based on request URL
    let folder = 'products';
    const originalUrl = (req.originalUrl || req.baseUrl || '').toLowerCase();
    if (originalUrl.includes('carousel')) {
      folder = 'carousel';
    } else if (originalUrl.includes('brand')) {
      folder = 'brands';
    } else if (originalUrl.includes('categor')) {
      folder = 'categories';
    } else if (originalUrl.includes('return-gift')) {
      folder = 'return-gifts';
    }

    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const safeBase = sanitizeFileName(base) || 'upload';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fullKey = `${folder}/${safeBase}-${uniqueSuffix}${ext}`;
    cb(null, fullKey);
  }
});

// File filter: accept standard image formats
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml'
  ];
  if (allowedMimes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed types: JPG, PNG, WEBP, GIF, SVG`), false);
  }
};

const rawMulter = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB per file
  }
});

// Normalize uploaded files so both file.path and file.location point to the S3 URL
const normalizeFile = (file) => {
  if (!file) return;
  const bucket = file.bucket || process.env.AWS_BUCKET_NAME || process.env.S3_BUCKET_NAME;
  const region = process.env.AWS_REGION || 'ap-south-1';
  const key = file.key;
  const s3Url = file.location || (key && bucket ? `https://${bucket}.s3.${region}.amazonaws.com/${key}` : (file.path || ''));
  file.location = s3Url;
  file.path = s3Url;
};

// Middleware wrapper that automatically sets file.path = file.location
const wrapUpload = (multerMiddleware) => {
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message || 'File upload failed' });
      }
      if (req.file) {
        normalizeFile(req.file);
      }
      if (req.files) {
        if (Array.isArray(req.files)) {
          req.files.forEach(normalizeFile);
        } else if (typeof req.files === 'object') {
          Object.values(req.files).flat().forEach(normalizeFile);
        }
      }
      next();
    });
  };
};

const upload = {
  single: (field) => wrapUpload(rawMulter.single(field)),
  array: (field, maxCount) => wrapUpload(rawMulter.array(field, maxCount)),
  fields: (fields) => wrapUpload(rawMulter.fields(fields)),
  any: () => wrapUpload(rawMulter.any()),
  none: () => rawMulter.none()
};

/**
 * Utility to delete an object from S3 by key or full S3 URL
 * @param {string} fileUrlOrKey - e.g. "https://bucket.s3.region.amazonaws.com/products/img-123.jpg" or "products/img-123.jpg"
 */
const deleteFromS3 = async (fileUrlOrKey) => {
  if (!fileUrlOrKey) return false;
  try {
    const bucket = process.env.AWS_BUCKET_NAME || process.env.S3_BUCKET_NAME;
    if (!bucket) return false;

    let key = fileUrlOrKey;
    if (fileUrlOrKey.startsWith('http://') || fileUrlOrKey.startsWith('https://')) {
      const url = new URL(fileUrlOrKey);
      key = decodeURIComponent(url.pathname.replace(/^\/+/, ''));
      if (key.startsWith(`${bucket}/`)) {
        key = key.replace(`${bucket}/`, '');
      }
    }

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key
    });
    await s3.send(command);
    return true;
  } catch (err) {
    console.error('Error deleting file from S3:', err.message);
    return false;
  }
};

module.exports = {
  s3,
  s3Client: s3,
  upload,
  deleteFromS3
};

