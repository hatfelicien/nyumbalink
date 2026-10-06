import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { Skeleton } from './components/ui/Skeleton'
import { AuthProvider } from './context/AuthContext'
import { CompareProvider } from './context/CompareContext'
import { DataSaverProvider } from './context/DataSaverContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { LanguageProvider } from './context/LanguageContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { AdminLayout } from './routes/AdminLayout'
import { OwnerLayout } from './routes/OwnerLayout'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { PublicLayout } from './routes/PublicLayout'

const AdminApplicationsPage = lazy(() => import('./pages/admin/AdminApplicationsPage').then((m) => ({ default: m.AdminApplicationsPage })))
const AdminOverviewPage = lazy(() => import('./pages/admin/AdminOverviewPage').then((m) => ({ default: m.AdminOverviewPage })))
const AdminOwnersPage = lazy(() => import('./pages/admin/AdminOwnersPage').then((m) => ({ default: m.AdminOwnersPage })))
const AdminPropertiesPage = lazy(() => import('./pages/admin/AdminPropertiesPage').then((m) => ({ default: m.AdminPropertiesPage })))
const AdminReportsPage = lazy(() => import('./pages/admin/AdminReportsPage').then((m) => ({ default: m.AdminReportsPage })))
const AdminReviewsPage = lazy(() => import('./pages/admin/AdminReviewsPage').then((m) => ({ default: m.AdminReviewsPage })))
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage })))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })))
const AdminVerificationPage = lazy(() => import('./pages/admin/AdminVerificationPage').then((m) => ({ default: m.AdminVerificationPage })))
const OwnerApplicationsPage = lazy(() => import('./pages/owner/OwnerApplicationsPage').then((m) => ({ default: m.OwnerApplicationsPage })))
const OwnerEnquiriesPage = lazy(() => import('./pages/owner/OwnerEnquiriesPage').then((m) => ({ default: m.OwnerEnquiriesPage })))
const OwnerMaintenancePage = lazy(() => import('./pages/owner/OwnerMaintenancePage').then((m) => ({ default: m.OwnerMaintenancePage })))
const OwnerMessagesPage = lazy(() => import('./pages/owner/OwnerMessagesPage').then((m) => ({ default: m.OwnerMessagesPage })))
const OwnerOverviewPage = lazy(() => import('./pages/owner/OwnerOverviewPage').then((m) => ({ default: m.OwnerOverviewPage })))
const OwnerProfilePage = lazy(() => import('./pages/owner/OwnerProfilePage').then((m) => ({ default: m.OwnerProfilePage })))
const OwnerPropertiesPage = lazy(() => import('./pages/owner/OwnerPropertiesPage').then((m) => ({ default: m.OwnerPropertiesPage })))
const OwnerTenantsPage = lazy(() => import('./pages/owner/OwnerTenantsPage').then((m) => ({ default: m.OwnerTenantsPage })))
const OwnerVerificationPage = lazy(() => import('./pages/owner/OwnerVerificationPage').then((m) => ({ default: m.OwnerVerificationPage })))
const OwnerViewingsPage = lazy(() => import('./pages/owner/OwnerViewingsPage').then((m) => ({ default: m.OwnerViewingsPage })))
const PropertyWizardPage = lazy(() => import('./pages/owner/PropertyWizardPage').then((m) => ({ default: m.PropertyWizardPage })))
const AboutPage = lazy(() => import('./pages/public/AboutPage').then((m) => ({ default: m.AboutPage })))
const AccountPage = lazy(() => import('./pages/public/AccountPage').then((m) => ({ default: m.AccountPage })))
const AgreementPage = lazy(() => import('./pages/public/AgreementPage').then((m) => ({ default: m.AgreementPage })))
const BecomeOwnerPage = lazy(() => import('./pages/public/BecomeOwnerPage').then((m) => ({ default: m.BecomeOwnerPage })))
const BrowsePage = lazy(() => import('./pages/public/BrowsePage').then((m) => ({ default: m.BrowsePage })))
const ComparePage = lazy(() => import('./pages/public/ComparePage').then((m) => ({ default: m.ComparePage })))
const ContactPage = lazy(() => import('./pages/public/ContactPage').then((m) => ({ default: m.ContactPage })))
const ForbiddenPage = lazy(() => import('./pages/public/ForbiddenPage').then((m) => ({ default: m.ForbiddenPage })))
const ForgotPasswordPage = lazy(() => import('./pages/public/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })))
const LandingPage = lazy(() => import('./pages/public/LandingPage').then((m) => ({ default: m.LandingPage })))
const LoginPage = lazy(() => import('./pages/public/LoginPage').then((m) => ({ default: m.LoginPage })))
const MapSearchPage = lazy(() => import('./pages/public/MapSearchPage').then((m) => ({ default: m.MapSearchPage })))
const MessagesPage = lazy(() => import('./pages/public/MessagesPage').then((m) => ({ default: m.MessagesPage })))
const NotFoundPage = lazy(() => import('./pages/public/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))
const ProfilePage = lazy(() => import('./pages/public/ProfilePage').then((m) => ({ default: m.ProfilePage })))
const PropertyDetailPage = lazy(() => import('./pages/public/PropertyDetailPage').then((m) => ({ default: m.PropertyDetailPage })))
const RegisterPage = lazy(() => import('./pages/public/RegisterPage').then((m) => ({ default: m.RegisterPage })))
const SavedListingsPage = lazy(() => import('./pages/public/SavedListingsPage').then((m) => ({ default: m.SavedListingsPage })))
const TermsPage = lazy(() => import('./pages/public/TermsPage').then((m) => ({ default: m.TermsPage })))

function RouteFallback() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Skeleton className="h-72 w-full" />
    </div>
  )
}

function App() {
  return (
    // Honour the OS "reduce motion" setting for every Framer Motion animation, not just CSS ones.
    <MotionConfig reducedMotion="user">
    <ThemeProvider>
      <LanguageProvider>
      <ToastProvider>
        <AuthProvider>
          <FavoritesProvider>
          <CompareProvider>
          <DataSaverProvider>
            <BrowserRouter>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route element={<PublicLayout />}>
                    <Route index element={<LandingPage />} />
                    <Route path="browse" element={<BrowsePage />} />
                    <Route path="listings/:id" element={<PropertyDetailPage />} />
                    <Route path="map" element={<MapSearchPage />} />
                    <Route path="saved" element={<SavedListingsPage />} />
                    <Route path="compare" element={<ComparePage />} />
                    <Route
                      path="profile"
                      element={
                        <ProtectedRoute allowedRoles={['guest', 'owner', 'admin']}>
                          <ProfilePage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="account"
                      element={
                        <ProtectedRoute allowedRoles={['guest']}>
                          <AccountPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="agreements/:id"
                      element={
                        <ProtectedRoute allowedRoles={['guest', 'owner', 'admin']}>
                          <AgreementPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="messages"
                      element={
                        <ProtectedRoute allowedRoles={['guest', 'owner', 'admin']}>
                          <MessagesPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                    <Route path="become-an-owner" element={<BecomeOwnerPage />} />
                    <Route path="forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="about" element={<AboutPage />} />
                    <Route path="contact" element={<ContactPage />} />
                    <Route path="terms" element={<TermsPage />} />
                    <Route path="403" element={<ForbiddenPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>

                  <Route
                    path="/owner"
                    element={
                      <ProtectedRoute allowedRoles={['owner']}>
                        <OwnerLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<OwnerOverviewPage />} />
                    <Route path="properties" element={<OwnerPropertiesPage />} />
                    <Route path="properties/new" element={<PropertyWizardPage />} />
                    <Route path="properties/:id/edit" element={<PropertyWizardPage />} />
                    <Route path="verification" element={<OwnerVerificationPage />} />
                    <Route path="viewings" element={<OwnerViewingsPage />} />
                    <Route path="applications" element={<OwnerApplicationsPage />} />
                    <Route path="tenants" element={<OwnerTenantsPage />} />
                    <Route path="maintenance" element={<OwnerMaintenancePage />} />
                    <Route path="enquiries" element={<OwnerEnquiriesPage />} />
                    <Route path="messages" element={<OwnerMessagesPage />} />
                    <Route path="profile" element={<OwnerProfilePage />} />
                  </Route>

                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<AdminOverviewPage />} />
                    <Route path="verification" element={<AdminVerificationPage />} />
                    <Route path="reports" element={<AdminReportsPage />} />
                    <Route path="reviews" element={<AdminReviewsPage />} />
                    <Route path="owners" element={<AdminOwnersPage />} />
                    <Route path="applications" element={<AdminApplicationsPage />} />
                    <Route path="properties" element={<AdminPropertiesPage />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="settings" element={<AdminSettingsPage />} />
                    <Route path="profile" element={<OwnerProfilePage />} />
                  </Route>
                </Routes>
              </Suspense>
            </BrowserRouter>
          </DataSaverProvider>
          </CompareProvider>
          </FavoritesProvider>
        </AuthProvider>
      </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
    </MotionConfig>
  )
}

export default App
