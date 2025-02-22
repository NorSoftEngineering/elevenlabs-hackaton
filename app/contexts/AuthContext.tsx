import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseEnv } from '~/utils/env.server'
import { createSupabaseServer } from '~/utils/supabase.server'
import { useLoaderData, useNavigate } from 'react-router'

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children, env }: { children: React.ReactNode, env: { SUPABASE_URL: string, SUPABASE_ANON_KEY: string } }) {
  const navigate = useNavigate()
  const { session: initialSession } = useLoaderData<{ session: Session | null }>()
  const [user, setUser] = useState<User | null>(initialSession?.user ?? null)
  const [session, setSession] = useState<Session | null>(initialSession)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (newSession?.user.id !== user?.id) {
        setSession(newSession)
        setUser(newSession?.user ?? null)

        if (!newSession) {
          navigate('/login')
        } else {
          navigate('/dashboard')
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, user, navigate])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setSession(null)
      setUser(null)
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const value = {
    user,
    session,
    isLoading,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 