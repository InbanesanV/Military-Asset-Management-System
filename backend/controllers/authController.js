import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import supabase from '../config/db.js';

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: 'Username and password are required.' });

    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, password_hash, role, base_id, bases(name)')
      .eq('username', username)
      .limit(1);

    if (error) throw error;
    if (!users || users.length === 0)
      return res.status(401).json({ message: 'Invalid credentials.' });

    const user = users[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid)
      return res.status(401).json({ message: 'Invalid credentials.' });

    const tokenPayload = {
      id: user.id,
      username: user.username,
      role: user.role,
      baseId: user.base_id,
      baseName: user.bases?.name || null,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    });

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        baseId: user.base_id,
        baseName: user.bases?.name || null,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during authentication.' });
  }
};

export const getMe = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, role, base_id, created_at, bases(name)')
      .eq('id', req.user.id)
      .single();

    if (error || !data)
      return res.status(404).json({ message: 'User not found.' });

    res.json({ user: { ...data, baseName: data.bases?.name } });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};
