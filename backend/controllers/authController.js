import User from '../models/User.js';
import Token from '../models/Token.js';
import crypto from 'crypto';
import { generateToken } from '../utils/generateToken.js';
import { sendEmail } from '../utils/sendEmail.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Create email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    await Token.create({
      userId: user._id,
      token: emailVerificationToken,
      type: 'emailVerification',
    });

    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${emailVerificationToken}`;
    await sendEmail({
      email: user.email,
      subject: 'Email Verification',
      message: `Please verify your email by clicking this link: ${verificationUrl}`,
    });

    // Generate token and set cookie
    generateToken(res, user._id);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    // Generate token and set cookie
    generateToken(res, user._id);

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: 'User logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req, res, next) => {
  try {
    const token = await Token.findOne({
      token: req.params.token,
      type: 'emailVerification',
    });

    if (!token) {
      res.status(400);
      throw new Error('Invalid or expired token');
    }

    const user = await User.findById(token.userId);
    if (!user) {
      res.status(400);
      throw new Error('User not found');
    }

    user.isVerified = true;
    await user.save();

    await token.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Create reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    await Token.create({
      userId: user._id,
      token: resetToken,
      type: 'passwordReset',
    });

    // Send reset email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({
      email: user.email,
      subject: 'Password Reset',
      message: `You are receiving this email because you requested a password reset. Please click this link to reset your password: ${resetUrl}`,
    });

    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const token = await Token.findOne({
      token: req.params.token,
      type: 'passwordReset',
    });

    if (!token) {
      res.status(400);
      throw new Error('Invalid or expired token');
    }

    const user = await User.findById(token.userId);
    if (!user) {
      res.status(400);
      throw new Error('User not found');
    }

    user.password = req.body.password;
    await user.save();
    await token.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Add to your existing authController.js

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Public (with refresh token)
export const refreshToken = async (req, res, next) => {
  try {
    // Check for refresh token in cookies
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      res.status(401);
      throw new Error('No refresh token');
    }
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Get user
    const user = await User.findById(decoded.id);
    
    if (!user) {
      res.status(401);
      throw new Error('User not found');
    }
    
    // Generate new access token
    generateToken(res, user._id);
    
    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    res.status(401);
    next(error);
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Private
export const resendVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.isVerified) {
      res.status(400);
      throw new Error('Email already verified');
    }
    
    // Delete old verification tokens
    await Token.deleteMany({ 
      userId: user._id, 
      type: 'emailVerification' 
    });
    
    // Create new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    await Token.create({
      userId: user._id,
      token: emailVerificationToken,
      type: 'emailVerification',
    });
    
    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${emailVerificationToken}`;
    await sendEmail({
      email: user.email,
      subject: 'Email Verification',
      message: `Please verify your email by clicking this link: ${verificationUrl}`,
    });
    
    res.status(200).json({
      success: true,
      message: 'Verification email sent'
    });
  } catch (error) {
    next(error);
  }
};