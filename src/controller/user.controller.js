import {
  forgotPassword,
  login,
  register,
  resetPassword,
  verifyToken,
} from "../service/user.service.js";

async function registerController(req, res, next) {
  try {
    const registerService = await register(req);

    res.status(200).json({
      message: `Account succesfully registered`,
      data: {
        id: registerService.id,
        username: registerService.username,
        email: registerService.email,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function loginController(req, res, next) {
  try {
    const loginService = await login(req);

    res.status(200).json({
      message: `Succesfully login, username and password is correct`,
      data: {
        id: loginService.id,
        username: loginService.username,
        token: loginService.token,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function forgotPasswordController(req, res, next) {
  try {
    const forgotPasswordService = await forgotPassword(req);

    res.status(200).json({
      message: `Verification URL token already send to your email ${forgotPasswordService.userMails}`,
      data: {
        accountId: forgotPasswordService.accountId,
        token: forgotPasswordService.token,
        expiredAt: forgotPasswordService.expiredAt,
        userMails: forgotPasswordService.userMails,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function verifyTokenController(req, res, next) {
  try {
    const verifyTokenService = await verifyToken(req);

    res.status(200).json({
      message: `Token has been verified`,
      data: {
        status: verifyTokenService.status,
        url: verifyTokenService.url,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function resetPasswordController(req, res, next) {
  try {
    const resetPasswordService = await resetPassword(req);

    res.status(200).json({
      message: `Password succesfully reset, continue to login`,
      data: {
        accountId: resetPasswordService.accountId,
        username: resetPasswordService.username,
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
