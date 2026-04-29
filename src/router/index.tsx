import { createBrowserRouter, Navigate, redirect } from 'react-router'
import { TabLayout } from '@/components/templates/TabLayout'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { LibraryPage } from '@/pages/LibraryPage'
import { DownloadPage } from '@/pages/DownloadPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { PlayerPage } from '@/pages/PlayerPage'

export const router = createBrowserRouter([
  {
    path: '/',
    loader: () => redirect(localStorage.getItem('ktv-onboarded') ? '/library' : '/onboarding'),
  },
  {
    path: '/onboarding',
    element: <OnboardingPage />,
  },
  {
    element: <TabLayout />,
    children: [
      { path: '/library', element: <LibraryPage /> },
      { path: '/download', element: <DownloadPage /> },
      { path: '/settings', element: <SettingsPage /> },
    ],
  },
  {
    path: '/player/:songId',
    element: <PlayerPage />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
