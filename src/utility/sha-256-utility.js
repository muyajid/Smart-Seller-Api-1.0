import crypto from "crypto";

function hash256(data) {
    return crypto.createHash("sha256").update(data).digest("base64");
}

export default hash256;