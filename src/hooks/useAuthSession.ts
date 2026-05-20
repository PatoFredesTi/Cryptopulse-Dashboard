import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type {
  AuthActivity,
  AuthUser,
  LoginPayload,
  ProfileUpdatePayload,
  RegisterPayload,
} from '../types/auth';

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function getInitials(nameOrEmail: string) {
  const parts = nameOrEmail
    .replace(/@.*/, '')
    .split(/[\s._-]+/)
    .filter(Boolean);

  return (parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0]?.slice(0, 2) ?? 'CP').toUpperCase();
}

function createActivity(type: AuthActivity['type'], title: string, description: string): AuthActivity {
  return {
    id: makeId('activity'),
    type,
    title,
    description,
    createdAt: new Date().toISOString(),
  };
}

function createDemoUser(name: string, email: string): AuthUser {
  const now = new Date().toISOString();

  return {
    id: makeId('user'),
    name,
    email,
    role: 'Analyst',
    plan: 'Demo',
    avatarInitials: getInitials(name || email),
    riskProfile: 'balanced',
    preferredCurrency: 'usd',
    createdAt: now,
    lastLoginAt: now,
  };
}

export function useAuthSession() {
  const [user, setUser] = useLocalStorage<AuthUser | null>('cryptopulse-auth-user', null);
  const [activity, setActivity] = useLocalStorage<AuthActivity[]>('cryptopulse-auth-activity', []);

  const addActivity = (item: AuthActivity) => {
    setActivity((current) => [item, ...current].slice(0, 8));
  };

  const signIn = ({ email }: LoginPayload) => {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = user?.email === normalizedEmail ? user : null;
    const nextUser = existingUser
      ? { ...existingUser, lastLoginAt: new Date().toISOString() }
      : createDemoUser(normalizedEmail.split('@')[0] || 'Crypto Analyst', normalizedEmail);

    setUser(nextUser);
    addActivity(createActivity('login', 'Session started', `Logged in as ${normalizedEmail}.`));
    return nextUser;
  };

  const register = ({ name, email }: RegisterPayload) => {
    const nextUser = createDemoUser(name.trim() || 'Crypto Analyst', email.trim().toLowerCase());
    setUser(nextUser);
    addActivity(createActivity('register', 'Demo account created', `${nextUser.name} joined CryptoPulse.`));
    return nextUser;
  };

  const requestPasswordReset = (email: string) => {
    addActivity(createActivity('password-reset', 'Password reset simulated', `A demo reset flow was requested for ${email}.`));
  };

  const updateProfile = (updates: ProfileUpdatePayload) => {
    if (!user) return null;

    const nextUser: AuthUser = {
      ...user,
      ...updates,
      avatarInitials: getInitials(updates.name ?? user.name),
    };

    setUser(nextUser);
    addActivity(createActivity('profile-update', 'Profile updated', 'User preferences were updated locally.'));
    return nextUser;
  };

  const logout = () => {
    if (user) {
      addActivity(createActivity('logout', 'Session closed', `${user.email} signed out.`));
    }
    setUser(null);
  };

  return useMemo(() => ({
    user,
    activity,
    isAuthenticated: Boolean(user),
    signIn,
    register,
    requestPasswordReset,
    updateProfile,
    logout,
  }), [user, activity]);
}
