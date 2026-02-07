'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface UserProfile {
  nickname: string | null
  role: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  isAdmin: boolean
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  updateNickname: (nickname: string) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isAdmin: false,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  updateNickname: async () => ({ error: null }),
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('users')
      .select('role, nickname')
      .eq('id', userId)
      .single()
    if (data) {
      setProfile({ nickname: data.nickname, role: data.role })
      setIsAdmin(data.role === 'admin')
    }
  }

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        if (user) await fetchProfile(user.id)
      } catch (e) {
        console.error('Auth error:', e)
      } finally {
        setLoading(false)
      }
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        await fetchProfile(u.id)
      } else {
        setProfile(null)
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/'
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(currentPath)}`,
      },
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setIsAdmin(false)
  }

  const updateNickname = async (nickname: string) => {
    if (!user) return { error: '로그인 필요' }
    const { error } = await supabase
      .from('users')
      .update({ nickname })
      .eq('id', user.id)
    if (!error) setProfile(prev => prev ? { ...prev, nickname } : null)
    return { error: error?.message ?? null }
  }

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, loading, signInWithGoogle, signOut, updateNickname }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
