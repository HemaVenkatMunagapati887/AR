const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), workerId: user.workerId, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function sanitize(user) {
  return {
    id: user._id,
    name: user.name,
    workerId: user.workerId,
    phone: user.phone,
    sector: user.sector,
    language: user.language,
    role: user.role,
  };
}

async function register(req, res, next) {
  try {
    const { name, workerId, password, phone, sector, language } = req.body;
    if (!name || !workerId || !password) {
      return res.status(400).json({ error: 'name, workerId and password are required' });
    }

    const existing = await User.findOne({ workerId: workerId.toUpperCase() });
    if (existing) {
      return res.status(409).json({ error: 'Worker ID already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      workerId: workerId.toUpperCase(),
      passwordHash,
      phone,
      sector,
      language,
      role: 'worker',
    });

    const token = signToken(user);
    res.status(201).json({ token, user: sanitize(user) });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { workerId, password } = req.body;
    if (!workerId || !password) {
      return res.status(400).json({ error: 'workerId and password are required' });
    }

    const user = await User.findOne({ workerId: workerId.toUpperCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken(user);
    res.json({ token, user: sanitize(user) });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: sanitize(user) });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me };
