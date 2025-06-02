import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler.js';

// export const auth = asyncHandler((req, res, next) => {
//   const authorization = req.headers['authorization'];
//   if (!authorization || !authorization.startsWith(process.env.BEARERTOKEN)) {
//     return next(new Error("Please login, you are not authorized"));
//   }

//   const token = authorization.split(" ")[1];
//   console.log(token)
//   try {
//     const decoded = jwt.verify(token,process.env.SIGNTURE)
//     req.user = decoded; 
//     console.log(decoded)
//     next();
//   } catch (err) {
//     return next(new Error("Invalid token"));
//   }
// });



export const auth = asyncHandler((req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return next(new Error("Please login, you are not authorized"));
  }
  try {
    const decoded = jwt.verify(token, process.env.SIGNTURE);
    req.user = decoded;
    console.log(decoded)
    next();
  } catch (err) {
    return next(new Error("Invalid token"));
  }
});


// Authorization Middleware
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new Error("You are not authorized to perform this action", { cause: 403 }));
    }
    next();
  };
};


