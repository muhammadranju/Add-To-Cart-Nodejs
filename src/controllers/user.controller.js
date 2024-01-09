const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const userLoginGetController = async (req, res, next) => {
  return res.status(200).render("pages/login");
};
const userLoginPostController = asyncHandler(async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      throw new ApiError(400, "All field are required");
      return res.status(200).json({ error: "All field are required" });
    }

    console.log(req.body);
    const findUser = await User.findOne({ email });
    if (!findUser) {
      return res.status(200).json({ error: "Invalid email or password" });
    }

    const payload = {
      _id: findUser._id,
      username: findUser.username,
      fullName: findUser?.fullName,
      email: findUser.email,
    };

    const accessToken = await jwt.sign(
      payload,
      process.env.ACCESS_TOKEN_SECRET
    );

    const matchPassword = await bcrypt.compare(password, findUser.password);
    if (!matchPassword) {
      return res.status(200).json({ error: "Invalid email or password" });
    }
    const options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .json(new ApiResponse(200, { accessToken }, "User login successfully"));
  } catch (error) {
    next(error);
  }
});

const userRegisterGetController = async (req, res, next) => {};
const userRegisterPostController = async (req, res, next) => {
  try {
    const { username, fullName, email, password } = req.body;

    if ((!username, !email, !password)) {
      throw new ApiError(400, "All fields are required");
    }

    const findUser = await User.findOne({ email });

    if (findUser) {
      throw new ApiError(400, "this email already exits");
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      fullName,
      email,
      password: hashPassword,
    });
    const data = {
      username: user.username,
      fullName: user.fullName,
      email: user.email,
    };
    await user.save();
    return res
      .status(201)
      .json(new ApiResponse(201, data, user, "User create successfully"));
  } catch (error) {
    next(error);
  }
};

const demoController = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.find({ status: true }).select("-password -__v");
    return res
      .status(200)
      .json(new ApiResponse(200, user, "user fetched successfully."));
  } catch (error) {
    next(error);
  }
});

module.exports = {
  userLoginGetController,
  userLoginPostController,
  userRegisterGetController,
  userRegisterPostController,
  demoController,
};
