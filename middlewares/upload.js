import multer from "multer";
import path from "path";
import crypto from "crypto";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const uniqueName =
      crypto.randomUUID() + path.extname(file.originalname).toLowerCase();
    cb(null, uniqueName);
  },
});

function fileFilter(req, file, cb) {
  const allowed = /\.(jpe?g|png|webp|gif)$/i.test(file.originalname);
  if (allowed) {
    cb(null, true);
  } else {
    cb(new Error("image must be jpg, jpeg, png, webp or gif"));
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
}).single("image");

export function uploadImage(req, res, next) {
  upload(req, res, (err) => {
    if (err) {
      const msg =
        err.code === "LIMIT_FILE_SIZE"
          ? "image must be smaller than 5MB"
          : err.message;
      return res.status(422).json({ errors: { image: { errors: [msg] } } });
    }
    next();
  });
}
