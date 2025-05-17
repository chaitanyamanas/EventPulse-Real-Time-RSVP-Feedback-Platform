import { NextResponse } from 'next/server';

// This API route helps us verify our authentication setup
export async function GET() {
  // Import testUsers from auth.ts
  const { getUserByEmail } = await import('../../lib/auth');
  
  // Test that we can fetch users
  const testUser = await getUserByEmail('test@example.com');
  const hostUser = await getUserByEmail('host@example.com');
  const adminUser = await getUserByEmail('admin@example.com');
  
  // Create a simplified version without the password
  const simplifiedUsers = [
    testUser ? { id: testUser.id, email: testUser.email, name: testUser.name, role: testUser.role } : null,
    hostUser ? { id: hostUser.id, email: hostUser.email, name: hostUser.name, role: hostUser.role } : null,
    adminUser ? { id: adminUser.id, email: adminUser.email, name: adminUser.name, role: adminUser.role } : null,
  ];
  
  return NextResponse.json({ 
    status: 'Authentication system test',
    timestamp: new Date().toISOString(),
    message: 'This endpoint verifies that our auth system is working correctly',
    availableUsers: simplifiedUsers.filter(Boolean),
    authSystemEnabled: true
  });
} 