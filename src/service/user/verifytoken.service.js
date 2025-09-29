import logger from "../../application/looger-app.js";
import prisma from "../../application/prisma-client-app.js";
import ResponseEror from "../../eror/response-eror.js";

async function verifyToken(req) {
  logger.info("Proces started GET: /api/v1/auth/token/verify");

  const token = req.query.token;
  if (!token) {
    logger.warn(`Proces failed: missing required query param`);
    throw new ResponseEror("Bad request: missing required query param", 400);
  }

  const findToken = await prisma.resetPasswordToken.findFirst({
    where: { token: token },
  });

  if (!findToken) {
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
  logger.info(
    `Token has ben verified succesfuly ${updateStatusToken.verified}`
  );

  return {
    status: updateStatusToken.verified,
    url: `${req.protocol}://${req.get(
      "host"
    )}/api/v1/auth/password/reset?token=${encodeURIComponent(tokenFromDb)}`,
  };
}

export default verifyToken;
