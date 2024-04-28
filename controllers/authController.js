import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const generateToken = user => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "15d",
    }
  );
};

// generate token me no errors

export const register = async (req, res) => {
  const { email, password, name, role, photo, gender } = req.body;
  try {
    let user = null;

    if (role === "patient") {
      user = await User.findOne({ email });
    } else if (role === "doctor") {
      user = await Doctor.findOne({ email });
    }

    //check if user exists

    if (user) {
      return res.status(400).json({ message: "User already exists." });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    if (role === "patient") {
      await User.create({
        name,
        email,
        password: hashPassword,
        photo,
        gender,
        role: "patient",
      });
    }

    if (role === "doctor") {
      await Doctor.create({
        name,
        email,
        password: hashPassword,
        photo,
        gender,
        role: "doctor",
      });
    }
    res
      .status(200)
      .json({ success: true, message: "User successfull created" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Internal server error, Try Again" });
  }
};

// register me no errors

export const login = async (req, res) => {
  const { email } = req.body;
  try {
    let user = null;
    const patient = await User.findOne({ email });
    const doctor = await Doctor.findOne({ email });

    if (patient) {
      user = patient;
    }
    if (doctor) {
      user = doctor;
    }

    // if user not found

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // compare password

    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!isPasswordMatch) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid Credentials" });
    }

    const token = generateToken(user);

    const { password, role, appointments, ...rest } = user._doc;
    res.status(200).json({
      status: true,
      message: "Successfully Logged in",
      token,
      data: { ...rest },
      role,
    });
  } catch (err) {
    res.status(500).json({ status: false, message: "Failed to Login" });
  }
};

// login me no errors
