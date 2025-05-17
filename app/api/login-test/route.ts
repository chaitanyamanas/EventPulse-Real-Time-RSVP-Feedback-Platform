import { NextRequest, NextResponse } from 'next/server';

const testUsers = [
  {
    id: "user-1",
    email: "test@example.com",
    password: "test1234",
    name: "Test User",
    role: "USER"
  },
  {
    id: "host-1",
    email: "host@example.com",
    password: "test1234",
    name: "Host User",
    role: "HOST"
  },
  {
    id: "admin-1",
    email: "admin@example.com",
    password: "test1234",
    name: "Admin User",
    role: "ADMIN"
  }
];

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    // Basic validation
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Missing email or password' }, { status: 400 });
    }
    
    // Find user
    const user = testUsers.find(u => u.email === email);
    
    // User not found
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 401 });
    }
    
    // Check password (plain text comparison for test users)
    if (user.password !== password) {
      return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
    }
    
    // Success - return user without password
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ 
      success: true, 
      user: userWithoutPassword,
      message: 'Login successful'
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
} 