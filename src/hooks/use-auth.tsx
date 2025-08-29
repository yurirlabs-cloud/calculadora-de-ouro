
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';

export interface UserData {
  uid: string;
  email: string | null;
  plan: 'trial' | 'pro';
  used_count: number;
  role: 'user' | 'admin';
  created_at: Timestamp;
  updated_at: Timestamp;
  last_calc_at: Timestamp | null;
}

export interface SubscriptionData {
    provider: "stripe" | "asaas" | "pagarme" | 'admin' | null;
    status: "none" | "active" | "past_due" | "canceled";
    current_period_end: Timestamp | null;
    trial_end: Timestamp | null;
    price_id: string | null;
    last_event: {
        id: string;
        type: string;
        createdAt: Timestamp;
    } | null;
}

const AuthContext = createContext<{
  user: User | null;
  userData: UserData | null;
  subscriptionData: SubscriptionData | null;
  loading: boolean;
}>({
  user: null,
  userData: null,
  subscriptionData: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, authLoading, error] = useAuthState(auth);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [dbLoading, setDbLoading] = useState(true);

  useEffect(() => {
    if (error) {
        console.error('Firebase Auth Error:', error);
    }
  }, [error]);

  useEffect(() => {
    if (authLoading) return;

    let userUnsubscribe: () => void = () => {};
    let subUnsubscribe: () => void = () => {};

    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const subRef = doc(db, 'subscriptions', user.uid);

      const setupListeners = () => {
        userUnsubscribe = onSnapshot(userRef, (userSnap) => {
          if (userSnap.exists()) {
            setUserData(userSnap.data() as UserData);
          }
          setDbLoading(false); 
        }, (error) => {
          console.error("Error with user onSnapshot:", error);
          setDbLoading(false);
        });

        subUnsubscribe = onSnapshot(subRef, (subSnap) => {
            if (subSnap.exists()) {
                setSubscriptionData(subSnap.data() as SubscriptionData);
            }
        });
      };
      
      // Check if user document exists, create if not
      getDoc(userRef).then(userSnap => {
        if (!userSnap.exists()) {
          const newUser: Omit<UserData, 'created_at' | 'updated_at'> & { created_at: any, updated_at: any } = {
            uid: user.uid,
            email: user.email,
            plan: 'trial',
            used_count: 0,
            role: 'user',
            last_calc_at: null,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
          };
          setDoc(userRef, newUser)
            .then(() => setupListeners()) // Setup listeners after creation
            .catch(e => {
              console.error("Error creating user document:", e);
              setDbLoading(false);
            });
        } else {
          setupListeners(); // User exists, just setup listeners
        }
      }).catch(e => {
        console.error("Error getting user document:", e);
        setDbLoading(false);
      });

    } else {
      setUserData(null);
      setSubscriptionData(null);
      setDbLoading(false);
    }

    return () => {
      userUnsubscribe();
      subUnsubscribe();
    };
  }, [user, authLoading]);

  const loading = authLoading || dbLoading;

  return (
    <AuthContext.Provider value={{ user: user ?? null, userData, subscriptionData, loading }}>
        {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
