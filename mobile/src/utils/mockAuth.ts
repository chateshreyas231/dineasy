/**
 * Mock Authentication System
 * For testing without backend server
 */

export interface MockUser {
  id: string;
  email: string;
  name: string;
  password: string; // In real app, this would be hashed
}

const users: MockUser[] = [
  {
    id: '1',
    email: 'demo@dineasy.com',
    name: 'Demo User',
    password: 'demo123',
  },
  {
    id: '2',
    email: 'test@example.com',
    name: 'Test User',
    password: 'test123',
  },
  {
    id: 'admin',
    email: 'admin@dineasy.com',
    name: 'Admin User',
    password: 'admin123',
  },
];

const tokens: Map<string, string> = new Map();

export const mockLogin = async (email: string, password: string) => {
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return { error: 'Invalid email or password' };
  }

  const token = `mock_token_${user.id}_${Date.now()}`;
  tokens.set(token, user.id);

  return {
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.id === 'admin', // Mark admin user
      },
      accessToken: token,
      token, // Keep for backward compatibility
    },
  };
};

export const mockRegister = async (
  email: string,
  password: string,
  name: string
) => {
  if (users.find((u) => u.email === email)) {
    return { error: 'Email already exists' };
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters' };
  }

  const newUser: MockUser = {
    id: String(users.length + 1),
    email,
    name,
    password,
  };

  users.push(newUser);

  const token = `mock_token_${newUser.id}_${Date.now()}`;
  tokens.set(token, newUser.id);

  return {
    data: {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        isAdmin: false,
      },
      accessToken: token,
      token, // Keep for backward compatibility
    },
  };
};

export const mockGetMe = async (token: string) => {
  const userId = tokens.get(token);
  if (!userId) {
    return { error: 'Invalid token' };
  }

  const user = users.find((u) => u.id === userId);
  if (!user) {
    return { error: 'User not found' };
  }

  return {
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.id === 'admin',
    },
  };
};

export const mockLogout = async (token: string) => {
  tokens.delete(token);
  return { data: { success: true } };
};
