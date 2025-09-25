import argon2 from "argon2";
import logger from "../../application/looger-app.js";
import dotenv from "dotenv";
import prisma from "../../application/prisma-client-app.js";
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
};

export default register;