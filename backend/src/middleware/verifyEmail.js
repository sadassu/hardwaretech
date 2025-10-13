export const requireVerifiedEmail = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: No user found" });
    }

    if (!req.user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before accessing this resource.",
      });
    }

    next(); // user is verified, proceed
  } catch (error) {
    res.status(500).json({ message: "Email verification check failed" });
  }
};
