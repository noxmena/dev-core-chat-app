import { base44 } from '../api/base44Client';
import { UserProfile } from '../types';

const SESSION_KEY = 'devcore_session';

export const authService = {
  async login(email: string, password: string): Promise<UserProfile> {
    const results = await base44.entities.UserProfile.filter({ email });
    const user = results[0];

    if (!user) {
      throw new Error('User not found');
    }

    if (user.password !== password) {
      throw new Error('Incorrect password');
    }

    // Don't store plain password in session
    const sessionUser = { ...user };
    delete sessionUser.password;

    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  },

  getSession(): UserProfile | null {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },

  logout() {
    localStorage.removeItem(SESSION_KEY);
  },

  async updatePassword(password: string): Promise<void> {
    const user = this.getSession();
    if (!user?.id) throw new Error('Not authenticated');
    await base44.entities.UserProfile.update(user.id, { password });
  }
};
