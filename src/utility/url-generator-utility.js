import crypto from "crypto";
import path from "path";

function urlGenerator(req, folder, originalName) {

    const randomChar = crypto.randomBytes(5).toString("hex");
    const extension = path.extname(originalName);
    const date = Date.now();

    const imageName = `${randomChar}-${date}${extension}`;
    const imageUrl = `${req.protocol}://${req.get("host")}/${folder}/${imageName}`;

    return {
        imageName,
        imageUrl,
    };
};

export default urlGenerator;