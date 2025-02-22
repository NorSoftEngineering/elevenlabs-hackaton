import { Outlet } from 'react-router'
import { AuthProvider } from '../contexts/AuthContext'

type AppLayoutProps = {
  children: React.ReactNode
  env: { SUPABASE_URL: string, SUPABASE_ANON_KEY: string }
}

export function AppLayout({ children, env }: AppLayoutProps) {
  return (
    <AuthProvider env={env}>
      {children}
    </AuthProvider>
  )
} 