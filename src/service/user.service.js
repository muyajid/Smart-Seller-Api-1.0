import logger from "../application/looger-app.js";
import prisma from "../application/prisma-client-app.js";
import ResponseEror from "../eror/response-eror.js";
import argon2 from "argon2";
import dotenv from "dotenv";
import JWT from "jsonwebtoken";
import hash256 from "../utilty/sha-256-utilty.js";
import sendMail from "../application/mailer-app.js";

dotenv.config();

async function register(req) {
  const { username, email, password } = req.body;

  logger.info(`Process Started: api/v1/auth/register`);

  if (!username || !email || !password) {
    logger.warn("Failed proces: missing require body fields");
    throw new ResponseEror(
      "Bad request: body missing required body fields",
      400
    );
  }

  if (!email.includes("@")) {
    logger.warn(`Failed proces: email fields not contains @`);
    throw new ResponseEror("Bad request: email must contains @ character", 400);
  }

  const findDuplicateAccount = await prisma.account.findMany({
    where: {
      OR: [{ username: username }, { email: email }],
    },
  });

  if (findDuplicateAccount.length > 0) {
    logger.warn("Failed proces: account already takken");
    throw new ResponseEror("Conflict: data account is already takken", 409);
  }

  const hashPassword = await argon2.hash(password);

  const createNewAccount = await prisma.account.create({
    data: {
      username: username,
      email: email,
      password: hashPassword,
    },
  });

  return createNewAccount;
}

async function login(req) {
  const { username, password } = req.body;

  logger.info(`Process started /api/v1/auth/login`);

  if (!username || !password) {
    logger.warn(`Failed proces: missing required body fields`);
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
  logger.info(`JWT sign proces done ${jwtToken}`);

  return {
    id: findAccount.id,
    username: findAccount.username,
    token: jwtToken,
  };
}

async function forgotPassword(req) {
  const { account } = req.body;
  logger.info(`Process started: /api/v1/auth/forgot-password`);

  if (!account) {
    logger.warn(`Failed proces: missing required body fields`);
    throw new ResponseEror(`Failed proces: missing required body fields`, 400);
  }

  let findAccount;
  if (account.includes("@")) {
    logger.info(`Data is email ${account}`);
    findAccount = await prisma.account.findFirst({
      where: { email: account },
    });
  } else {
    logger.info(`Data is username ${account}`);
    findAccount = await prisma.account.findFirst({
      where: { username: account },
    });
  }

  if (findAccount === null) {
    logger.info(`Failed proces: account not found`);
    throw new ResponseEror("Failed proces: account not found", 404);
  }

  const generateVerifyToken = `${Math.floor(Math.random() * 100 * 12)}${
    account.split("")[0]
  }${account.split("").length - 1}`;
  logger.info(`Generate token results: ${generateVerifyToken}`);

  const hashToken = hash256(generateVerifyToken);
  logger.info(`Hash token results: ${hashToken}`);

  const accountId = findAccount.id;
  const expiredAt = new Date(Date.now() + 5 * 60 * 1000);
  const insertVerifyTokenData = await prisma.resetPasswordToken.create({
    data: {
      accountId: accountId,
      token: hashToken,
      expired: expiredAt,
    },
  });

  const userMails = findAccount.email;
  const sendTokenToMail = await sendMail(
    `Token URL Reset Password http://localhost:8080/api/v1/auth/verify-token?token=${encodeURIComponent(
      hashToken
    )}`,
    userMails
  );
  logger.info(`Sending mail status: ${sendTokenToMail.response}`);

  return {
    accountId: insertVerifyTokenData.accountId,
    token: hashToken,
    expiredAt: expiredAt,
    userMails: userMails,
  };
}

async function verifyToken(req) {
  const token = req.query.token;
  if (!token) {
    logger.warn(`Proces failed: missing required query param`);
    throw new ResponseEror("Bad request: missing required query param", 400);
  }

  const findToken = await prisma.resetPasswordToken.findFirst({
    where: { token: token },
  });

  if (findToken === null) {
    logger.warn(`Proces failed: token not found `);
    throw new ResponseEror("Proces failed: token not found", 404);
  }

  const tokenFromDb = findToken.token;
  const tokenExpired = findToken.expired;
  logger.info(`Token from DB: ${tokenFromDb}`);

  if (Date.now() > tokenExpired) {
    logger.warn(`Token has expired ${tokenExpired}`);
    throw new ResponseEror("Unauthorized: token has expired", 401);
  }

  const tokenId = findToken.id;
  const updateStatusToken = await prisma.resetPasswordToken.update({
    where: { id: tokenId },
    data: {
      verified: true,
    },
  });

  return {
    status: updateStatusToken.verified,
    url: `http://localhost:8080/api/v1/auth/reset-password?token=${encodeURIComponent(
      tokenFromDb
    )}`,
  };
}

async function resetPassword(req) {
  const token = req.query.token;
  const { password } = req.body;

  if (!token || !password) {
    logger.warn(`Proces failed: missing required query param and body`);
    throw new ResponseEror(
      "Bad request: missing required query param and body",
      400
    );
  }

  const findToken = await prisma.resetPasswordToken.findFirst({
    where: { token: token },
  });

  logger.info(`Token from DB ${JSON.stringify(findToken)}`);

  if (findToken === null) {
    throw new ResponseEror(`Proces failed: token not found`, 404);
  }

  const tokenStatus = findToken.verified;
  logger.info(`Token status: ${findToken.verified}`);

  if (tokenStatus === false) {
    logger.warn(`Failed process: token un verified status ${tokenStatus}`);
    throw new ResponseEror("Unauthorized token is not verified", 401);
  }

  const hashNewPassword = await argon2.hash(password);
  logger.info(`New password has been hashed results: ${hashNewPassword}`);

  const accountId = findToken.accountId;
  logger.info(`Id account to update password: ${accountId}`);

  const updatePassword = await prisma.account.update({
    where: { id: accountId },
    data: {
      password: hashNewPassword,
    },
  });

  return {
    accountId: accountId,
    username: updatePassword.username,
  };
}

export { register, login, forgotPassword, verifyToken, resetPassword };
