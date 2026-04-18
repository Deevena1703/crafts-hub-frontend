const multer = require("multer");

// Store files in memory — we convert to base64 ourselves
const storage = multer.memoryStorage();

const IMAGE_LIMIT = 5 * 1024 * 1024;   // 5 MB
const VIDEO_LIMIT = 25 * 1024 * 1024;  // 25 MB

const fileFilter = (req, file, cb) => {
  const allowedImages = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const allowedVideos = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"];
  if ([...allowedImages, ...allowedVideos].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images and videos are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: VIDEO_LIMIT }, // multer enforces per-file max
});

/**
 * Convert a multer file object to a base64 data-URI string.
 * Returns { dataUri, type, name } or throws if the file exceeds its type limit.
 */
const toBase64 = (file) => {
  const isImage = file.mimetype.startsWith("image/");
  const limit = isImage ? IMAGE_LIMIT : VIDEO_LIMIT;

  if (file.size > limit) {
    const mb = limit / 1024 / 1024;
    throw new Error(
      `${isImage ? "Image" : "Video"} "${file.originalname}" exceeds the ${mb} MB limit`
    );
  }

  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
  return {
    dataUri,
    type: isImage ? "image" : "video",
    name: file.originalname,
  };
};

module.exports = { upload, toBase64 };
