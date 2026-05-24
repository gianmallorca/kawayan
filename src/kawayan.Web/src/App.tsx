import { Navigate, Route, Routes } from 'react-router-dom';
import { CompanyProvider } from '@/contexts/CompanyContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { PublicHomePage } from '@/pages/public/PublicHomePage';
import { AboutPage } from '@/pages/public/AboutPage';
import { ServicesPage } from '@/pages/public/ServicesPage';
import { ContactPage } from '@/pages/public/ContactPage';
import { ArticlesListPage } from '@/pages/public/ArticlesListPage';
import { ArticleDetailPage } from '@/pages/public/ArticleDetailPage';
import { MessagesIndexPage } from '@/pages/admin/MessagesIndexPage';
import { PageDetailPage } from '@/pages/admin/PageDetailPage';
import { AdminServicesIndexPage } from '@/pages/admin/AdminServicesIndexPage';
import { AdminServiceFormPage } from '@/pages/admin/AdminServiceFormPage';
import { MediaManagerPage } from '@/pages/admin/MediaManagerPage';
import { CompanyDetailsIndexPage } from '@/pages/admin/CompanyDetailsIndexPage';
import { CompanyDetailsEditPage } from '@/pages/admin/CompanyDetailsEditPage';
import { AdminArticlesIndexPage } from '@/pages/admin/AdminArticlesIndexPage';
import { AdminArticleFormPage } from '@/pages/admin/AdminArticleFormPage';
import { LEGAL_SLUGS } from '@/lib/legalCache';
import { LegalPage } from '@/pages/public/LegalPage';
import { NotFoundPage } from '@/pages/public/NotFoundPage';
import { AdminLegalIndexPage } from '@/pages/admin/AdminLegalIndexPage';
import { AdminLegalEditPage } from '@/pages/admin/AdminLegalEditPage';

const articlesListElement = <ArticlesListPage />;
const articleDetailElement = <ArticleDetailPage />;
const legalPageElement = <LegalPage />;

export default function App() {
  return (
    <CompanyProvider>
      <ToastProvider>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<PublicHomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="articles" element={articlesListElement} />
          <Route path="articles/:slug" element={articleDetailElement} />
          {LEGAL_SLUGS.map((slug) => (
            <Route key={slug} path={slug} element={legalPageElement} />
          ))}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/company" replace />} />
            <Route path="messages" element={<MessagesIndexPage />} />
            <Route path="pages" element={<Navigate to="/admin/pages/home" replace />} />
            <Route path="pages/:pageKey" element={<PageDetailPage />} />
            <Route path="services" element={<AdminServicesIndexPage />} />
            <Route path="services/new" element={<AdminServiceFormPage />} />
            <Route path="services/:id/edit" element={<AdminServiceFormPage />} />
            <Route path="articles" element={<AdminArticlesIndexPage />} />
            <Route path="articles/new" element={<AdminArticleFormPage />} />
            <Route path="articles/:id/edit" element={<AdminArticleFormPage />} />
            <Route path="media" element={<MediaManagerPage />} />
            <Route path="company" element={<CompanyDetailsIndexPage />} />
            <Route path="company/edit" element={<CompanyDetailsEditPage />} />
            <Route path="legal" element={<AdminLegalIndexPage />} />
            <Route path="legal/:id" element={<AdminLegalEditPage />} />
          </Route>
        </Route>
      </Routes>
      </ToastProvider>
    </CompanyProvider>
  );
}
