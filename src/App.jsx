
import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProviderMods } from '@/contexts/ThemeContextMods';
import { AuthProviderMods } from '@/contexts/AuthContextMods';
import { PermissionsProvider } from '@/contexts/PermissionsContext';
import { ModsProvider } from '@/contexts/ModsContext';
import { DownloadsProvider } from '@/contexts/DownloadsContext';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { Toaster } from 'sonner';
import EmailVerificationModal from '@/components/auth/EmailVerificationModal';
import { useAuth } from '@/contexts/AuthContextMods';
import MainLayout from '@/components/mods/layout/MainLayout';
import AdminLayout from '@/components/mods/layout/AdminLayout';
import PublicLayout from '@/components/layout/PublicLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PermissionGuard from '@/components/auth/PermissionGuard';
import DomainValidator from '@/components/security/DomainValidator';
const HomePage = React.lazy(() => import('@/pages/mods/HomePage'));
const ModDetailPage = React.lazy(() => import('@/pages/mods/ModDetailPage'));
const DownloadPage = React.lazy(() => import('./pages/mods/DownloadPage'));
const ModsListingPage = React.lazy(() => import('@/pages/mods/ModsListingPage'));
const AddonsListingPage = React.lazy(() => import('@/pages/mods/AddonsListingPage'));
const SearchResultsPage = React.lazy(() => import('@/pages/mods/SearchResultsPage'));
const TermsOfServicePage = React.lazy(() => import('@/pages/mods/TermsOfServicePage'));
const PrivacyPolicyPage = React.lazy(() => import('@/pages/mods/PrivacyPolicyPage'));
const AboutPage = React.lazy(() => import('@/pages/mods/AboutPage'));
const ContactPage = React.lazy(() => import('@/pages/mods/ContactPage'));
const FAQPage = React.lazy(() => import('@/pages/mods/FAQPage'));
const BannedPage = React.lazy(() => import('@/pages/mods/BannedPage'));
const NotFoundPage = React.lazy(() => import('@/pages/mods/NotFoundPage'));
const LoginPage = React.lazy(() => import('@/pages/mods/LoginPage'));
const RegisterPage = React.lazy(() => import('@/pages/mods/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('@/pages/mods/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('@/pages/mods/ResetPasswordPage'));
const VerifyEmailPage = React.lazy(() => import('@/pages/mods/VerifyEmailPage'));
const ConfirmAccountDeletionPage = React.lazy(() => import('@/pages/mods/ConfirmAccountDeletionPage'));
const UserDashboardPage = React.lazy(() => import('@/pages/mods/UserDashboardPage'));
const EditProfilePage = React.lazy(() => import('@/pages/mods/EditProfilePage'));
const FavoritesPage = React.lazy(() => import('@/pages/mods/FavoritesPage'));
const DownloadsPage = React.lazy(() => import('@/pages/mods/DownloadsPage'));
const AdminDashboardPage = React.lazy(() => import('@/pages/mods/admin/AdminDashboardPage'));
const AdminUsersPage = React.lazy(() => import('@/pages/mods/admin/AdminUsersPage'));
const AdminAdministratorsPage = React.lazy(() => import('@/pages/mods/admin/AdminAdministratorsPage'));
const AdminModsPage = React.lazy(() => import('@/pages/mods/admin/AdminModsPage'));
const AdminLogsPage = React.lazy(() => import('@/pages/mods/admin/AdminLogsPage'));
const AdminCommentsModerationPage = React.lazy(() => import('@/pages/mods/admin/AdminCommentsModerationPage'));
const AdminChangelogsPage = React.lazy(() => import('@/pages/mods/admin/AdminChangelogsPage'));
const MediaKitPage = React.lazy(() => import('@/pages/MediaKitPage'));
const ChangelogPage = React.lazy(() => import('@/pages/ChangelogPage'));
const ChangelogDetailPage = React.lazy(() => import('@/pages/ChangelogDetailPage'));
const DonatePage = React.lazy(() => import('@/pages/mods/DonatePage'));
const AuthModalOutlet = () => {
  const { verificationModalOpen, closeVerificationModal } = useAuth();
  return <EmailVerificationModal open={verificationModalOpen} onOpenChange={closeVerificationModal} />;
};
function App() {
  return (
    <ThemeProviderMods>
      <AuthProviderMods>
        <PermissionsProvider>
          <ModsProvider>
            <DownloadsProvider>
              <I18nextProvider i18n={i18n}>
            <div className="App">
              <DomainValidator />
              <AuthModalOutlet />
              <Suspense fallback={null}>
                <Routes>
                {}
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="mods" element={<ModsListingPage />} />
                  <Route path="addons" element={<AddonsListingPage />} />
                  <Route path="mods/:slug" element={<ModDetailPage />} />
                  <Route path="mods/:slug/download" element={<DownloadPage />} />
                  <Route path="search" element={<SearchResultsPage />} />
                  <Route path="terms" element={<TermsOfServicePage />} />
                  <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="contact" element={<ContactPage />} />
                  <Route path="donate" element={<DonatePage />} />
                  <Route path="faq" element={<FAQPage />} />
                  <Route path="changelog" element={<ChangelogPage />} />
                  <Route path="changelog/:slug" element={<ChangelogDetailPage />} />
                  <Route path="banned" element={<BannedPage />} />
                  {}
                  <Route path="login" element={
                    <ProtectedRoute requireAuth={false}>
                      <LoginPage />
                    </ProtectedRoute>
                  } />
                  <Route path="register" element={
                    <ProtectedRoute requireAuth={false}>
                      <RegisterPage />
                    </ProtectedRoute>
                  } />
                  <Route path="forgot-password" element={
                    <ProtectedRoute requireAuth={false}>
                      <ForgotPasswordPage />
                    </ProtectedRoute>
                  } />
                  <Route path="reset-password" element={
                    <ProtectedRoute requireAuth={false}>
                      <ResetPasswordPage />
                    </ProtectedRoute>
                  } />
                  <Route path="verify-email" element={<VerifyEmailPage />} />
                  <Route path="confirm-account-deletion" element={<ConfirmAccountDeletionPage />} />
                  {}
                  <Route path="dashboard" element={
                    <ProtectedRoute requireAuth={true}>
                      <UserDashboardPage />
                    </ProtectedRoute>
                  } />
                  <Route path="edit-profile" element={
                    <ProtectedRoute requireAuth={true}>
                      <EditProfilePage />
                    </ProtectedRoute>
                  } />
                  <Route path="favorites" element={
                    <ProtectedRoute requireAuth={true}>
                      <FavoritesPage />
                    </ProtectedRoute>
                  } />
                  <Route path="downloads" element={
                    <ProtectedRoute requireAuth={true}>
                      <DownloadsPage />
                    </ProtectedRoute>
                  } />
                </Route>
                {}
                <Route path="/admin" element={
                  <ProtectedRoute requireAuth={true} requireAdmin={true}>
                    <PermissionGuard requiredPermission="access_admin_panel">
                      <AdminLayout />
                    </PermissionGuard>
                  </ProtectedRoute>
                }>
                  <Route index element={
                    <PermissionGuard requiredPermission="access_admin_panel">
                      <AdminDashboardPage />
                    </PermissionGuard>
                  } />
                  <Route path="users" element={
                    <PermissionGuard requiredPermission="manage_users" requireSuperAdmin={true}>
                      <AdminUsersPage />
                    </PermissionGuard>
                  } />
                  <Route path="administrators" element={
                    <PermissionGuard requireSuperAdmin={true}>
                      <AdminAdministratorsPage />
                    </PermissionGuard>
                  } />
                  <Route path="mods" element={
                    <PermissionGuard requiredPermission="view_mods">
                      <AdminModsPage />
                    </PermissionGuard>
                  } />
                  <Route path="changelogs" element={
                    <PermissionGuard requiredPermission="view_changelogs">
                      <AdminChangelogsPage />
                    </PermissionGuard>
                  } />
                  <Route path="comments-moderation" element={
                    <PermissionGuard requiredPermission="view_comments">
                      <AdminCommentsModerationPage />
                    </PermissionGuard>
                  } />
                  <Route path="logs" element={
                    <PermissionGuard requiredPermission="view_logs">
                      <AdminLogsPage />
                    </PermissionGuard>
                  } />
                </Route>
                {}
                <Route path="/public" element={<PublicLayout />}>
                  <Route path="media-kit" element={<MediaKitPage />} />
                  <Route path="contact" element={<ContactPage />} />
                </Route>
                {}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
            <Toaster
              richColors
              position="bottom-right"
              toastOptions={{
                style: {
                  marginBottom: '12px',
                  marginRight: '16px'
                }
              }}
              expand={true}
              visibleToasts={5}
              closeButton={true}
              duration={5000}
              offset="16px"
              gap={12}
            />
          </div>
              </I18nextProvider>
            </DownloadsProvider>
          </ModsProvider>
        </PermissionsProvider>
      </AuthProviderMods>
    </ThemeProviderMods>
  );
}
export default App;