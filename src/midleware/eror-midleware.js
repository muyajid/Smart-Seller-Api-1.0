import multer from "multer";
import ResponseEror from "../eror/response-eror.js";

function erorHandling(err, req, res, next) {
  const status = Number(err.status) || 500;
  const message = err.message || `Internal server eror`;

  if (err instanceof ResponseEror) {
    return res.status(status).json({
      statusCode: status,
      message: message,
    });
  }

  if (err instanceof multer.MulterError ) {

    if (err.code === "LIMIT_FILE_COUNT") return res.status(400).json({ message: "Too many files uploaded. Maximum is 5."});

    return res.status(400).json({ message: err.message });
  };

  return res.status(status).json({
    message: message,
  });
}

export default erorHandling;
