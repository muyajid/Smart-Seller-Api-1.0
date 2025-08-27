import {
  forgotPassword,
  login,
  register,
  resetPassword,
  verifyToken,
} from "../service/user.service.js";

async function registerController(req, res, next) {
  try {
    const results = await register(req);

    res.status(200).json({
      message: `Account succesfully registered`,
      data: {
        id: results.id,
        username: results.username,
        email: results.email,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function loginController(req, res, next) {
  try {
    const results = await login(req);

    res.status(200).json({
      message: `Succesfully login, username and password is correct`,
      data: {
        id: results.id,
        username: results.username,
        token: results.token,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function forgotPasswordController(req, res, next) {
  try {
    const results = await forgotPassword(req);

    res.status(200).json({
      message: `Verification URL token already send to your email ${results.userMails}`,
      data: {
        accountId: results.accountId,
        token: results.token,
        expiredAt: results.expiredAt,
        userMails: results.userMails,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function verifyTokenController(req, res, next) {
  try {
    const results = await verifyToken(req);

    res.status(200).json({
      message: `Token has been verified`,
      data: {
        status: results.status,
        url: results.url,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function resetPasswordController(req, res, next) {
  try {
    const results = await resetPassword(req);

    res.status(200).json({
      message: `Password succesfully reset, continue to login`,
      data: {
        accountId: results.accountId,
        username: results.username,
      },
    });
  } catch (err) {
    next(err);
  }
}

export {
  registerController,
  loginController,
  forgotPasswordController,
  verifyTokenController,
  resetPasswordController,
};
