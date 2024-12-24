import { User } from "../models/user.model.js"
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";



const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { firstName, lastName, password, email, phoneNumber, address, role } = req.body;

    if (!firstName || !lastName || !password || !email || !phoneNumber || !address) {
        throw new ApiError(400, "All fields are required")
    }

    if (!email.includes('@')) {
        throw new ApiError(400, "Invalid Email address");
    }

    const existedUser = await User.findOne(email)
    if (existedUser) {
        throw new ApiError(409, "User already exists")
    }

    const user = await User.create({
        firstName: firstName,
        password: password,
        email: email,
        lastName: lastName,
        address: address,
        phoneNumber: phoneNumber,
        role: role
    })
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering a user")
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered Successfully")
    );

})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!email) {
        throw new ApiError(400, "Username or email is required")
    }

    const user = await User.findOne({
        email: email
    })

    if (!user) {
        throw new ApiError(404, "User does not exists")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credintials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const logedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    doctor: logedInUser, accessToken,
                    refreshToken
                },
                "User Logged In successfully"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $set: { refreshToken: undefined } },
        { new: true }
    )

    const options = { httpOnly: true, secure: true };

    res.clearCookie("accessToken", options);
    res.clearCookie("refreshToken", options);

    return res.status(200).json(new ApiResponse(200, {}, "User Logged Out"));
});

const getAllUsers = asyncHandler(async(req, res) => {
    const users = await User.find();
    res.json(users);
})

export {
    registerUser,
    loginUser,
    logoutUser
}