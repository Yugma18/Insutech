import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';

const USER_SECRET = process.env.USER_JWT_SECRET || process.env.JWT_SECRET;

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: 'user' }, USER_SECRET, { expiresIn: '30d' });
}

export async function register(req, res) {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !phone || !password)
    return res.status(400).json({ error: 'name, email, phone and password are required' });

  if (!/^\d{10}$/.test(phone.trim()))
    return res.status(400).json({ error: 'Enter a valid 10-digit phone number' });

  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: email.trim().toLowerCase() }, { phone: phone.trim() }] },
  });
  if (existing) return res.status(409).json({ error: 'Account with this email or phone already exists' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), passwordHash },
  });

  res.status(201).json({ token: signToken(user), user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

  res.json({ token: signToken(user), user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
}

export async function getMe(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, name: true, email: true, phone: true, dateOfBirth: true, gender: true, city: true, createdAt: true },
  });
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
}

export async function updateMe(req, res) {
  const { name, dateOfBirth, gender, city, phone } = req.body;

  if (phone && !/^\d{10}$/.test(phone.trim()))
    return res.status(400).json({ error: 'Enter a valid 10-digit phone number' });

  const user = await prisma.user.update({
    where: { id: req.userId },
    data: {
      ...(name       && { name: name.trim() }),
      ...(phone      && { phone: phone.trim() }),
      ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
      ...(gender     && { gender }),
      ...(city !== undefined && { city: city?.trim() || null }),
    },
    select: { id: true, name: true, email: true, phone: true, dateOfBirth: true, gender: true, city: true },
  });
  res.json(user);
}
