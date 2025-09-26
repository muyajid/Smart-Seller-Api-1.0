import logger from "../../application/looger-app.js";
import sendMail from "../../application/mailer-app.js";
import prisma from "../../application/prisma-client-app.js";
import ResponseEror from "../../eror/response-eror.js";
import hash256 from "../../utility/sha-256-utility.js";

async function forgotPassword(req) {
  const { account } = req.body;
  logger.info(`Process started POST: /api/v1/auth/password/forgot`);

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
    `Token URL Reset Password http://localhost:8080/api/v1/auth/token/verify?token=${encodeURIComponent(
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
};

export default forgotPassword;