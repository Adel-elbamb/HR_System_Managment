import hrModel from "../../../../DB/models/HR.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import loginSchema from "../auth.validation.js";
import { tokenBlacklist } from "../blacklist.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({
          status: "fail",
          message: "Name, email and password are required",
        });
    }

    const existingUser = await hrModel.findOne({ email: email.trim() });
    if (existingUser) {
      return res
        .status(400)
        .json({
          status: "fail",
          message: "User already exists with this email",
        });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const newUser = new hrModel({
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword,
      role: "HR",
    });

    await newUser.save();

    return res
      .status(201)
      .json({ status: "success", message: "User registered successfully" });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({ status: "fail", errors });
    }

    const { email, password } = req.body;

    const user = await hrModel.findOne({ email: email.trim() });

    if (!user) {
      return res
        .status(400)
        .json({ status: "fail", message: "User not found" });
    }

    const isValid = await bcryptjs.compare(password, user.password);

    if (!isValid) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: "HR" },
      process.env.JWT_SECRET
    );

    return res
      .status(200)
      .json({ status: "success", data: { token, role: "HR" } });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

export const logout = asyncHandler((req, res) => {
  const token = req.headers["authorization"];

  if (token) {
    tokenBlacklist.push(token);
  }

  return res
    .status(200)
    .json({ status: "success", message: "Logged out successfully" });
});
