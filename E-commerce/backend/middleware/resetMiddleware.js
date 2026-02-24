exports.checkPasswordResetRequired = (req, res, next) => {
  if (!req.user.isPasswordSet) {
    return res.status(403).json({
      message: "Password reset required before accessing system",
    });
  }
  next();
};
