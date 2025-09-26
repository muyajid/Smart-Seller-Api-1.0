import logger from "../../application/looger-app.js";
import prisma from "../../application/prisma-client-app.js";
import argon2 from "argon2";
import ResponseEror from "../../eror/response-eror.js";
import dotenv from "dotenv";
import JWT from "jsonwebtoken";

dotenv.config();

async function login(req) {
  const { username, password } = req.body;

  logger.info(`Proces started POST: /api/v1/auth/login`);

  if (!username || !password) {
    logger.warn(`Failed proces: require body inco`);
    throw new ResponseEror("Bad request: missing required body fields", 400);
  }

  const findAccount = await prisma.account.findFirst({
    where: { username: username },
  });
  logger.info(`Account from DB: ${JSON.stringify(findAccount)}`);

  if (findAccount === null) {
    logger.info(`Failed proces: account not found`);
    throw new ResponseEror("Failed proces: account not found", 404);
  }

  const passwordFromDb = findAccount.password;

  const verifyAccount = await argon2.verify(passwordFromDb, password);
  logger.info(`Verify account status: ${verifyAccount}`);

  if (!verifyAccount) {
    logger.warn(`Failed proces: unauthorized account`);
    throw new ResponseEror("Unauthorized password is wrong", 401);
  }

  const payload = { id: findAccount.id, username: findAccount.username };
  const secretKey = process.env.JWT_SECRET;

  const jwtToken = JWT.sign(payload, secretKey, { expiresIn: "1h" });
  logger.info(`JWT sign proces done ${payload.id}`);

  return {
    id: findAccount.id,
    username: findAccount.username,
    token: jwtToken,
  };
};

export default login;