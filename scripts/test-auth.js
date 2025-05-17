// Run this file with: node scripts/test-auth.js

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

// Simulate authentication
function authenticate(email, password) {
  console.log(`Attempting to authenticate: ${email} / ${password}`);
  
  const user = testUsers.find(u => u.email === email);
  
  if (!user) {
    console.log(`User not found: ${email}`);
    return null;
  }
  
  if (user.password !== password) {
    console.log(`Password mismatch for: ${email}`);
    return null;
  }
  
  console.log(`Authentication successful for: ${email}`);
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };
}

// Test all users
console.log("\n=== Testing Authentication ===\n");

const testCases = [
  { email: "test@example.com", password: "test1234" },
  { email: "host@example.com", password: "test1234" },
  { email: "admin@example.com", password: "test1234" },
  { email: "wrong@example.com", password: "test1234" },
  { email: "test@example.com", password: "wrongpassword" }
];

testCases.forEach((testCase) => {
  console.log("\n--- Test Case ---");
  const result = authenticate(testCase.email, testCase.password);
  console.log("Result:", result ? "SUCCESS" : "FAILED");
  if (result) {
    console.log("User:", result);
  }
});

console.log("\n=== Test Complete ===\n"); 