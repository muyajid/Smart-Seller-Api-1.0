import argon2 from "argon2";
import logger from "../../application/looger-app.js";
import prisma from "../../application/prisma-client-app.js";
import ResponseEror from "../../eror/response-eror.js";

async function resetPassword(req) {

  logger.info("Proces started POST: /api/v1/auth/password/reset");

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
  logger.info(`Succesfullt update password: ${updatePassword.id}`);

  return {
    accountId: accountId,
    username: updatePassword.username,
  };
};

export default resetPassword;