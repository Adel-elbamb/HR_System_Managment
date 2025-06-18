import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { tokenBlacklist } from "../module/Auth/blacklist.js";

export const auth = asyncHandler((req, res, next) => {
  const raw = req.headers["authorization"];
  const token = raw && raw.startsWith("Bearer ") ? raw.split(" ")[1] : null;

  if (!token) {
    return next(new Error("Please login, you are not authorized"));
  }

  if (tokenBlacklist.includes(token)) {
    return next(new Error("Token is blacklisted. Please login again"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (err) {
    return next(new Error("Invalid token"));
  }
});

// Authorization Middleware
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new Error("You are not authorized to perform this action", {
          cause: 403,
        })
      );
    }
    next();
  };
};
