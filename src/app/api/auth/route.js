import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { generateToken, hashPassword, comparePassword } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, password, name, role, action } = body;

    if (!action || !['login', 'register'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "login" or "register".' },
        { status: 400 }
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // ─── REGISTER ──────────────────────────────────────────────
    if (action === 'register') {
      if (!name || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Name is required for registration.' },
          { status: 400 }
        );
      }

      const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) {
        return NextResponse.json(
          { error: 'An account with this email already exists.' },
          { status: 409 }
        );
      }

      const hashedPassword = await hashPassword(password);

      const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: role && ['recruiter', 'candidate'].includes(role) ? role : 'recruiter',
      });

      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      return NextResponse.json(
        {
          message: 'Registration successful.',
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
          },
        },
        { status: 201 }
      );
    }

    // ─── LOGIN ─────────────────────────────────────────────────
    if (action === 'login') {
      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user) {
        return NextResponse.json(
          { error: 'Invalid email or password.' },
          { status: 401 }
        );
      }

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Invalid email or password.' },
          { status: 401 }
        );
      }

      // Update last login timestamp
      user.lastLogin = new Date();
      await user.save();

      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      return NextResponse.json(
        {
          message: 'Login successful.',
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            lastLogin: user.lastLogin,
          },
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('[Auth Route] Error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return NextResponse.json(
        { error: 'Validation failed.', details: messages },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
