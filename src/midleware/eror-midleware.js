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

  return res.status(status).json({
    message: message,
  });
}

export default erorHandling;
