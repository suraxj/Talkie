import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // only secure in production
  sameSite: "strict",
  maxAge: 24 * 60 * 60 * 1000, // 1 day
};

// Signup a new user
export const signup = async (req, res) => {
  try {
    const { fullName, email, password, bio } = req.body;

    if (!fullName || !email || !password || !bio) {
      return res.status(400).json({ success: false, message: "Missing details" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "Account already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });

    const token = generateToken(newUser._id);

    res.cookie("token", token, COOKIE_OPTIONS);

    res.status(201).json({
      success: true,
      userData: newUser,
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("Signup Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Login existing user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: "Missing credentials" });

    const user = await User.findOne({ email });
    if (!user)
      return res.json({ success: false, message: "Invalid credentials" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.json({ success: false, message: "Invalid credentials" });

    const token = generateToken(user._id);
    res.cookie("token", token, COOKIE_OPTIONS);

    res.json({
      success: true,
      userData: user,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Check if user is authenticated
export const checkAuth = (req, res) => {
  res.json({ success: true, user: req.user });
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, fullName } = req.body;
    const userId = req.user._id;

    let updateData = { bio, fullName };

    if (profilePic) {
      const upload = await cloudinary.uploader.upload(profilePic);
      updateData.profilePic = upload.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Update Profile Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Logout user
export const logout = (req, res) => {
  res.clearCookie("token", COOKIE_OPTIONS);
  res.json({ success: true, message: "Logged out successfully" });
};
