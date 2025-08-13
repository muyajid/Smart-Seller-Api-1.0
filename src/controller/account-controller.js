import prisma from "../application/prisma-client-app.js";
import argon2 from "argon2";
import logger from "../application/looger-app.js";
import hash256 from "../utilty/sha-256-utilty.js";
import sendMail from "../application/mailer-app.js";
import JWT from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    logger.info("Proces Started: api/v1/auth/register");

    if (!username || !email || !password) {
      logger.warn("Failed proces: missing required body fields");
      return res.status(400).json({
        message: `Bad request body must contains username, email, password`,
      });
    }

    if (!email.includes("@")) {
      logger.warn("Failed proces: email field not contains @");
      return res.status(400).json({
        message: `Bad request email must contains @ character`,
      });
    }

    const registeredAccount = await prisma.account.findMany({
      where: {
        OR: [{ username: username }, { email: email }],
      },
    });
    logger.debug(registeredAccount);

    if (registeredAccount.length > 0) {
      logger.warn("Failed proces: account already takken");
      return res.status(409).json({
        message: `Conflict account is already takken`,
      });
    }

    const hashPassword = await argon2.hash(password);

    const createAccount = await prisma.account.create({
      data: {
        username: username,
        email: email,
        password: hashPassword,
      },
    });

    res.status(200).json({
      message: `Account succesfully registered`,
      data: {
        id: createAccount.id,
        username: createAccount.username,
        email: createAccount.email,
      },
    });
    logger.info("Account succesfully registered");
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({
      message: `Internal server eror`,
    });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      logger.warn(`Failed proces: missing required body fields`);
      return res.status(400).json({
        message: `Bad request: missing required body fields`,
      });
    }

    const findAccount = await prisma.account.findFirst({
      where: { username: username },
    });

    logger.debug(findAccount);

    if (findAccount.length === 0) {
      logger.info(`Account not found`);
      return res.status(404).json({
        message: `Account not found`,
      });
    }
    const hashPassword = findAccount.password;
    logger.info(`Password data from DB ${hashPassword}`);

    const verifyAccount = await argon2.verify(hashPassword, password);
    logger.info(`Argon2 verify results ${verifyAccount}`);

    if (!verifyAccount) {
      logger.warn(`Failed proces: unauthorized account password is wrong`);
      return res.status(401).json({
        message: `Unauthorized, password is wrong`,
      });
    }

    const payload = { id: findAccount.id, username: findAccount.username, email: findAccount.email };
    const secretKey = process.env.JWT_SECRET;

    const jwtToken = JWT.sign(payload, secretKey, {expiresIn: '1h'});
    logger.info(`JWT sign proces done: ${jwtToken}`);
    
    res.status(200).json({
      message: `Succesfully login, username and password is correct`,
      data: {
        id: findAccount.id,
        username: findAccount.username,
        token: jwtToken,
      },
    });

  } catch (err) {
    logger.error(err.message);
    res.status(500).json({
      message: `Internal server online`,
    });
  }
}

async function forgotPassword(req, res) {
  try {
    const { account } = req.body;
    if (!account) {
      logger.warn(`Failed proces: missing required body fields`);
      return res.status(400).json({
        message: `Bad request: missing required body fields`,
      });
    }

    let findAccount;
    if (account.includes("@")) {
      logger.info(`data is email ${account}`);
      findAccount = await prisma.account.findFirst({
        where: { email: account },
      });
    } else {
      logger.info(`data is username ${account}`);
      findAccount = await prisma.account.findFirst({
        where: { username: account },
      });
    }

    if (findAccount.length === 0) {
      logger.warn(`Failed proces: account not found`);
      return res.status(404).json({
        message: `Account not found`,
      });
    }

    const token = `${Math.floor(Math.random() * 100 * account.length)}${
      account.split("")[0]
    }${account.split("").length - 1}`;
    logger.info(`Generated token : ${token}`);

    const hashToken = hash256(token);
    logger.info(`Hash token : ${hashToken}`);

    const accountId = findAccount.id;
    const expiredAt = new Date(Date.now() + 5 * 60 * 1000);
    const insertTokenData = await prisma.resetPasswordToken.create({
      data: {
        accountId: accountId,
        token: hashToken,
        expired: expiredAt,
      },
    });

    const mails = findAccount.email;
    const sendTokenToMail = await sendMail(
      `Token URL Reset Password http://localhost:8080/api/v1/auth/verify-token?token=${encodeURIComponent(hashToken)}`,
      mails
    );
    logger.info(`Sending mail status : ${sendTokenToMail.response}`);

    res.status(200).json({
      message: `Verification token already sent to your email ${mails}`,
    });

    logger.info(`Forgot password proces finish succesfully`);
  } catch (err) {
    logger.warn(`Failed proces: internal server eror ${err.message}`);
    res.status(500).json({
      message: `Internal server eror`,
    });
  }
}

async function verifyToken(req, res) {
  try {
    const token = req.query.token;
    logger.info(token.concat());
    if (!token) {
      logger.warn(`Proces failed: missing required query param`);
      return res.status(400).json({
        message: `Bad request: missing required query param`,
      });
    }

    const findToken = await prisma.resetPasswordToken.findFirst({
      where: { token: token },
    });
    const tokenFromDb = findToken.token;
    logger.info(`Token from DB: ${tokenFromDb}`);

    const tokenExpired = findToken.expired;

    if (Date.now() > tokenExpired) {
      logger.info(`Token has expired: ${tokenExpired}`);
      return res.status(401).json({
        message: `Unauthorized token has expired`,
      });
    }
    const tokenId = findToken.id;
    const updateToken = await prisma.resetPasswordToken.update({
      where: { id: tokenId },
      data: {
        verified: true,
      },
    });

    res.status(200).json({
      message: `Token has ben verified`,
      status: updateToken.verified,
      resetPassword: `http://localhost:8080/api/v1/auth/reset-password?token=${encodeURIComponent(tokenFromDb)}`
    });

    logger.info(`Verify token proces finish`);
  } catch (err) {
    logger.warn(`Failed proces: internal server eror ${err.message}`);
    res.status(500).json({
      message: `Internal server eror`,
    });
  }
}

async function resetPassword(req, res) {
  try {
    const token = req.query.token;
    const { password } = req.body;

    if (!token || !password) {
      logger.warn(
        `Proces failed: missing required query param and body fields`
      );
      return res.status(400).json({
        message: `Bad request: missing required query param and body fields`,
      });
    }

    const findToken = await prisma.resetPasswordToken.findFirst({
      where: { token: token },
    });
    logger.info(`Token from DB: ${findToken.token}`);

    const tokenStatus = findToken.verified;
    logger.info(`Token status: ${tokenStatus}`);

    if (tokenStatus === false) {
      logger.warn(`Failed process: token un verified status: ${tokenStatus}`);
      return res.status(401).json({
        message: `Unauthorized token is not verified`,
      });
    }

    const hashPassword = await argon2.hash(password);
    logger.info(`Password has ben hashed: ${hashPassword}`);

    const accountId = findToken.accountId;
    logger.info(`Id account to update data: ${accountId}`);

    const updateAccountData = await prisma.account.update({
      where: { id: accountId },
      data: {
        password: hashPassword,
      },
    });

    res.status(200).json({
      message: `Password succesfully reset, continue to login`,
      data: {
        accountId: accountId,
        username: updateAccountData.username,
      },
    });

    logger.info(`Reset password proces succesfullt finished`);
  } catch (err) {
    logger.warn(`Failed proces: internal server eror ${err.message}`);
    res.status(500).json({
      message: `Internal server eror`,
    });
  }
}

export { register, login, forgotPassword, verifyToken, resetPassword };