import JWT from "jsonwebtoken";
import dotenv from "dotenv";
import logger from "../application/looger-app";

dotenv.config();

function jwtAuth(req, res , next) {
    const authorization = req.headers.authorization;

    if (!authorization) {
        logger.warn(`Auth proces failed: missing authroization headers`);
        return res.status(401).json({
            message: `Un authorized missing authorization headers`
        });
    };

    const bearerToken = authorization.split(' ')[1];
    console.debug(bearerToken);

    const secretKey = process.env.JWT_SECRET;

    try {
        const jwtVerify = JWT.verify(bearerToken, secretKey);
        logger.info(`Verify proces succesfully procesed`);
        next();
    } catch (err) {
        logger.warn(`Verify un succeasfully procesed`);
        res.status(401).json({
            message: `JWT verify un succesfully procesed`
        });
    }
}

export default jwtAuth;