'use client';

import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // ユーザーがログインしていない場合は匿名ログイン
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error('匿名ログインエラー:', error);
        }
      } else {
        setUser(user);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error('ログインエラー:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('ログアウトエラー:', error);
      throw error;
    }
  };

  return { user, loading, login, logout };
}

