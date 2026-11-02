// Backwards compatibility layer: Re-export S3 configuration
const s3Config = require('./s3');

module.exports = {
  ...s3Config,
  cloudinary: {
    uploader: {
      destroy: async (publicId) => s3Config.deleteFromS3(publicId)
    }
  }
};
