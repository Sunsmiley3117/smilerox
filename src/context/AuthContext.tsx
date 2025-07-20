import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser, AuthError } from '@supabase/supabase-js';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (firstName: string, lastName: string, email: string, phone: string, password: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean }>;
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Clear previous user data before fetching new user
        setUser(null);
        await fetchUserProfile(session.user);
      } else if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (authUser: SupabaseUser) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (data) {
        setUser({
          id: data.id,
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          phone: data.phone || undefined,
          dateOfBirth: data.date_of_birth || undefined,
        });
      } else {
        // Create user profile if it doesn't exist (for Google login)
        const names = authUser.user_metadata?.full_name?.split(' ') || ['', ''];
        const firstName = names[0] || '';
        const lastName = names.slice(1).join(' ') || '';

        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            first_name: firstName,
            last_name: lastName,
            email: authUser.email || '',
            phone: authUser.user_metadata?.phone || null,
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating user profile:', insertError);
          return;
        }

        if (newUser) {
          setUser({
            id: newUser.id,
            firstName: newUser.first_name,
            lastName: newUser.last_name,
            email: newUser.email,
            phone: newUser.phone || undefined,
          });
        }
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setUser(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await fetchUserProfile(data.user);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Logout failed');
    }
  };

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    password: string
  ) => {
    setIsLoading(true);
    try {
      // First, sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation
          data: {
            first_name: firstName,
            last_name: lastName,
            phone: phone
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create user profile in our users table
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            first_name: firstName,
            last_name: lastName,
            email,
            phone,
          });

        if (profileError) {
          // If profile creation fails, it might be due to duplicate email
          if (profileError.code === '23505') {
            throw new Error('This email address is already registered. Please use a different email or try logging in.');
          }
          throw profileError;
        }

        // Send welcome email (you can implement this later)
        console.log('Welcome email would be sent to:', email);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.message.includes('already registered')) {
        throw error;
      } else if (error.message.includes('email')) {
        throw new Error('This email address is already registered. Please use a different email or try logging in.');
      } else {
        throw new Error(error.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;

    try {
      const updateData: any = {};
      if (userData.firstName) updateData.first_name = userData.firstName;
      if (userData.lastName) updateData.last_name = userData.lastName;
      if (userData.email) updateData.email = userData.email;
      if (userData.phone) updateData.phone = userData.phone;
      if (userData.dateOfBirth) updateData.date_of_birth = userData.dateOfBirth;

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      setUser({ ...user, ...userData });
    } catch (error: any) {
      console.error('Update user error:', error);
      throw new Error(error.message || 'Update failed');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(error.message || 'Password reset failed');
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Password update error:', error);
      throw new Error(error.message || 'Password update failed');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      register,
      updateUser,
      resetPassword,
      updatePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};