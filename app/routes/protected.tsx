import { Outlet } from 'react-router'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { AppLayout } from '~/layouts/AppLayout'
import { getSupabaseEnv } from '~/utils/env.server'
import { useLoaderData } from "react-router";

export const loader = async ({ request }: { request: Request }) => {
  const env = getSupabaseEnv()
  return {
    env,
  }
}

export default function ProtectedRouteHandler() {
  const { env } = useLoaderData<typeof loader>()
  return (
    <AppLayout env={env}>
      <ProtectedRoute>
        <DashboardLayout>
          <Outlet />
        </DashboardLayout>
      </ProtectedRoute>
    </AppLayout>
  )
} 