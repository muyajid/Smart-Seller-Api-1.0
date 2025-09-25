import multer from "multer";
import ResponseEror from "../eror/response-eror.js";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {  files: 5 },
    fileFilter: (req, file, cb) => {
        const allowedMimeType = ["image/jpeg", "image/png"];

        if (!allowedMimeType.includes(file.mimetype)) {
            cb(new ResponseEror("File format not supported only jpeg and png are allowed", 400), false);
        } else {
            cb(null, true);
        };
    },
});

export default upload;