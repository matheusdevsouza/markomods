
import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProviderMods } from '@/contexts/ThemeContextMods';
import { AuthProviderMods } from '@/contexts/AuthContextMods';
import { ModsProvider } from '@/contexts/ModsContext';
import { DownloadsProvider } from '@/contexts/DownloadsContext';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { useTranslation } from './hooks/useTranslation';
import { Toaster } from 'sonner';
import EmailVerificationModal from '@/components/auth/EmailVerificationModal';
import { useAuth } from '@/contexts/AuthContextMods';

// Layouts
import MainLayout from '@/components/mods/layout/MainLayout';
import AdminLayout from '@/components/mods/layout/AdminLayout';
import PublicLayout from '@/components/layout/PublicLayout';

// Componente de rota protegida
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Páginas principais (lazy loading)
const HomePage = React.lazy(() => import('@/pages/mods/HomePage'));
const ModDetailPage = React.lazy(() => import('@/pages/mods/ModDetailPage'));
const DownloadPage = React.lazy(() => import('./pages/mods/DownloadPage'));
const ModsListingPage = React.lazy(() => import('@/pages/mods/ModsListingPage'));
const AddonsListingPage = React.lazy(() => import('@/pages/mods/AddonsListingPage'));
const SearchResultsPage = React.lazy(() => import('@/pages/mods/SearchResultsPage'));
const TermsOfServicePage = React.lazy(() => import('@/pages/mods/TermsOfServicePage'));
const ContactPage = React.lazy(() => import('@/pages/mods/ContactPage'));
const FAQPage = React.lazy(() => import('@/pages/mods/FAQPage'));
const BannedPage = React.lazy(() => import('@/pages/mods/BannedPage'));
const NotFoundPage = React.lazy(() => import('@/pages/mods/NotFoundPage'));

// Páginas de autenticação
const LoginPage = React.lazy(() => import('@/pages/mods/LoginPage'));
const RegisterPage = React.lazy(() => import('@/pages/mods/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('@/pages/mods/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('@/pages/mods/ResetPasswordPage'));
const VerifyEmailPage = React.lazy(() => import('@/pages/mods/VerifyEmailPage'));

// Páginas do usuário
const UserDashboardPage = React.lazy(() => import('@/pages/mods/UserDashboardPage'));
const EditProfilePage = React.lazy(() => import('@/pages/mods/EditProfilePage'));
const FavoritesPage = React.lazy(() => import('@/pages/mods/FavoritesPage'));
const DownloadsPage = React.lazy(() => import('@/pages/mods/DownloadsPage'));

// Páginas administrativas
const AdminDashboardPage = React.lazy(() => import('@/pages/mods/admin/AdminDashboardPage'));
const AdminUsersPage = React.lazy(() => import('@/pages/mods/admin/AdminUsersPage'));
const AdminModsPage = React.lazy(() => import('@/pages/mods/admin/AdminModsPage'));
const AdminAdsPage = React.lazy(() => import('@/pages/mods/admin/AdminAdsPage'));
const AdminLogsPage = React.lazy(() => import('@/pages/mods/admin/AdminLogsPage'));
const AdminCommentsModerationPage = React.lazy(() => import('@/pages/mods/admin/AdminCommentsModerationPage'));

// Páginas públicas
const MediaKitPage = React.lazy(() => import('@/pages/MediaKitPage'));

// Componente de loading
const LoadingSpinner = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    </div>
  );
};

const AuthModalOutlet = () => {
  const { verificationModalOpen, closeVerificationModal } = useAuth();
  return <EmailVerificationModal open={verificationModalOpen} onOpenChange={closeVerificationModal} />;
};

function App() {
  return (
    <ThemeProviderMods>
      <AuthProviderMods>
        <ModsProvider>
          <DownloadsProvider>
            <I18nextProvider i18n={i18n}>
            <div className="App">
              <AuthModalOutlet />
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                {/* Rotas principais com MainLayout */}
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="mods" element={<ModsListingPage />} />
                  <Route path="addons" element={<AddonsListingPage />} />
                  <Route path="mods/:modId" element={<ModDetailPage />} />
                  <Route path="mods/:modId/download" element={<DownloadPage />} />
                  <Route path="search" element={<SearchResultsPage />} />
                  <Route path="terms" element={<TermsOfServicePage />} />
                  <Route path="contact" element={<ContactPage />} />
                  <Route path="faq" element={<FAQPage />} />
                  <Route path="banned" element={<BannedPage />} />
                  
                  {/* Rotas de autenticação (não requerem login) */}
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

                  
                  {/* Rotas do usuário (requerem login) */}
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

                {/* Rotas administrativas */}
                <Route path="/admin" element={
                  <ProtectedRoute requireAuth={true} requireSuperAdmin={true}>
                    <AdminLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="mods" element={<AdminModsPage />} />
                  <Route path="ads" element={<AdminAdsPage />} />
                  <Route path="comments-moderation" element={<AdminCommentsModerationPage />} />
                  <Route path="logs" element={<AdminLogsPage />} />
                </Route>

                {/* Rotas públicas com PublicLayout */}
                <Route path="/public" element={<PublicLayout />}>
                  <Route path="media-kit" element={<MediaKitPage />} />
                  <Route path="contact" element={<ContactPage />} />
                </Route>

                {/* Rota 404 */}
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
      </AuthProviderMods>
    </ThemeProviderMods>
  );
}

export default App;
