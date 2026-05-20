export type AuthMode = 'login' | 'register' | 'forgot';

export type RiskProfile = 'conservative' | 'balanced' | 'aggressive';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: 'Investor' | 'Analyst' | 'Guest';
  plan: 'Demo';
  avatarInitials: string;
  riskProfile: RiskProfile;
  preferredCurrency: 'usd' | 'eur' | 'clp';
  createdAt: string;
  lastLoginAt: string;
};

export type AuthActivity = {
  id: string;
  type: 'login' | 'register' | 'logout' | 'password-reset' | 'profile-update';
  title: string;
  description: string;
  createdAt: string;
};

export type LoginPayload = {
  email: string;
  password: string;
  remember: boolean;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  acceptTerms: boolean;
};

export type ProfileUpdatePayload = Partial<Pick<AuthUser, 'name' | 'riskProfile' | 'preferredCurrency'>>;
