import { useEffect, useId, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { login } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { useCompany } from '@/contexts/CompanyContext';
import { CompanyNameFromDetails } from '@/components/CompanyName';
import { AdminFormField, AdminInput } from '@/components/admin/AdminForm';
import { companyNameInitials } from '@/lib/companyNameValidation';
import { companyAssetUrl } from '@/lib/utils';
import './login.css';

const schema = z.object({
  email: z.string().min(1, 'This field is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'This field is required').min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const company = useCompany();
  const accessToken = useAuthStore((s) => s.accessToken);
  const formId = useId();
  const [showPassword, setShowPassword] = useState(false);
  const [shakeFields, setShakeFields] = useState(false);
  const [authError, setAuthError] = useState('');

  const logoSrc = company?.logoUrl ? companyAssetUrl(company.logoUrl, company.updatedAt) : null;
  const brandBg = company?.primaryColor || undefined;

  useEffect(() => {
    if (accessToken) navigate('/admin/company', { replace: true });
  }, [accessToken, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', remember: false },
  });

  const onSubmit = handleSubmit(
    async (values) => {
      setAuthError('');
      try {
        await login(values.email, values.password);
        if (values.remember) localStorage.setItem('login.remember', '1');
        else localStorage.removeItem('login.remember');
        navigate('/admin/company');
      } catch {
        setAuthError('Incorrect email or password. Please try again.');
        setShakeFields(true);
        setTimeout(() => setShakeFields(false), 320);
      }
    },
    () => {
      setShakeFields(true);
      setTimeout(() => setShakeFields(false), 320);
    },
  );

  const emailError = errors.email?.message;
  const passwordError = errors.password?.message;
  const fieldError = Boolean(emailError || passwordError || authError);

  return (
    <main className="login-page" style={brandBg ? { backgroundColor: brandBg } : undefined}>
      <div className="login-card">
        <div className="login-card__logo">
          {logoSrc ? (
            <img src={logoSrc} alt="" className="login-card__logo-img" decoding="async" />
          ) : (
            <span className="login-card__logo-fallback" aria-hidden>
              {companyNameInitials(company?.nameMain)}
            </span>
          )}
          {company ? (
            <CompanyNameFromDetails company={company} className="login-card__name" />
          ) : null}
          {company?.tagline?.trim() ? (
            <p className="login-card__tagline">{company.tagline}</p>
          ) : (
            <p className="login-card__tagline">Admin sign in</p>
          )}
        </div>

        <form
          className={`space-y-4${shakeFields && fieldError ? ' login-shake' : ''}`}
          onSubmit={onSubmit}
          noValidate
        >
          <AdminFormField label="Email" required error={emailError}>
            <AdminInput
              id={`${formId}-email`}
              type="email"
              placeholder={company?.email || 'Email address'}
              autoComplete="email"
              error={Boolean(emailError || authError)}
              {...register('email')}
            />
          </AdminFormField>

          <AdminFormField label="Password" required error={passwordError}>
            <div className="relative">
              <AdminInput
                id={`${formId}-password`}
                type={showPassword ? 'text' : 'password'}
                className="pr-10"
                placeholder="Password"
                autoComplete="current-password"
                error={Boolean(passwordError || authError)}
                {...register('password')}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-[var(--color-primary)] rounded-md"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </AdminFormField>

          {authError ? (
            <p className="login-form-error" role="alert">
              {authError}
            </p>
          ) : null}

          <label className="login-remember">
            <input type="checkbox" {...register('remember')} />
            <span>Remember me</span>
          </label>

          <button type="submit" className="admin-btn-primary w-full gap-2" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="login-btn-spinner" aria-hidden />
                Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
      </div>

      <Link to="/" className="login-card__back">
        ← Back to website
      </Link>
    </main>
  );
}
