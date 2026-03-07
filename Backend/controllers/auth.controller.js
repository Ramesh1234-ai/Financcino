// Backend/controllers/auth.controller.js
import { User } from '../models/User.models.js';
import { AppError } from '../middleware/errorHandler.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import logger from '../utils/logger.js';

export async function register(req, res, next) {
  try {
    const { fullName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, config.BCRYPT_ROUNDS);

    // Generate username from email
    let username = email.split('@')[0].toLowerCase();
    let usernameExists = await User.findOne({ username });
    let counter = 1;
    while (usernameExists) {
      username = `${email.split('@')[0].toLowerCase()}${counter}`;
      usernameExists = await User.findOne({ username });
      counter++;
    }

    // Create user
    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      username,
      password: hashedPassword,
    });

    // Generate token
    const token = generateToken(user._id);

    logger.info(`User registered: ${user._id}`);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Fetch user and password (password is normally excluded)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate token
    const token = generateToken(user._id);

    logger.info(`User logged in: ${user._id}`);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    logger.info(`User logged out: ${req.userId}`);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

export async function getCurrentUser(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    res.json({
      success: true,
      data: { user },
    });
  } catch (err) {
    next(err);
  }
}

export async function refreshToken(req, res, next) {
  try {
    const { token } = req.body;
    if (!token) {
      throw new AppError('Token required', 400);
    }

    const decoded = jwt.verify(token, config.JWT_SECRET, { ignoreExpiration: true });
    const newToken = generateToken(decoded.id);

    res.json({
      success: true,
      data: { token: newToken },
    });
  } catch (err) {
    next(err);
  }
}

function generateToken(userId) {
  return jwt.sign({ id: userId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE,
  });
}
