export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'Done';
  deadline: string;
  assigneeId: string;
  createdAt: string;
  updatedAt: string;
}

// Hardcoded users for demo
export const USERS: User[] = [
  { id: '1', username: 'admin', email: 'admin@example.com', name: 'Administrator' },
  { id: '2', username: 'john', email: 'john@example.com', name: 'John Doe' },
  { id: '3', username: 'jane', email: 'jane@example.com', name: 'Jane Smith' },
  { id: '4', username: 'mike', email: 'mike@example.com', name: 'Mike Johnson' },
];

// Simple auth functions
export const authenticate = (username: string, password: string): User | null => {
  const users = getUsers();
  const passwords = getPasswords();
  const user = users.find(u => u.username === username);
  if (user && passwords[username] === password) {
    return user;
  }
  return null;
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userData = localStorage.getItem('currentUser');
  return userData ? JSON.parse(userData) : null;
};

export const setCurrentUser = (user: User): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('currentUser', JSON.stringify(user));
};

export const registerUser = (username: string, email: string, name: string, password: string): { success: boolean; error?: string; user?: User } => {
  if (typeof window === 'undefined') return { success: false, error: 'Window not available' };
  
  const existingUsers = getUsers();
  
  // Check if username already exists
  if (existingUsers.find(u => u.username === username)) {
    return { success: false, error: 'Username already exists' };
  }
  
  // Check if email already exists
  if (existingUsers.find(u => u.email === email)) {
    return { success: false, error: 'Email already exists' };
  }
  
  // Create new user
  const newUser: User = {
    id: Date.now().toString(),
    username,
    email,
    name,
  };
  
  // Add to users list
  const updatedUsers = [...existingUsers, newUser];
  localStorage.setItem('users', JSON.stringify(updatedUsers));
  
  // Store password separately (in real app, this would be hashed)
  const passwords = getPasswords();
  passwords[username] = password;
  localStorage.setItem('passwords', JSON.stringify(passwords));
  
  return { success: true, user: newUser };
};

const getUsers = (): User[] => {
  if (typeof window === 'undefined') return USERS;
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : USERS;
};

const getPasswords = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  const passwords = localStorage.getItem('passwords');
  return passwords ? JSON.parse(passwords) : {
    'admin': 'password',
    'john': 'password',
    'jane': 'password',
    'mike': 'password',
  };
};

export const getAllUsers = (): User[] => {
  return getUsers();
};

export const logout = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('currentUser');
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};