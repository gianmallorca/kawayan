import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { fetchCompany } from '@/api/company';
import type { CompanyDetails } from '@/types';

type CompanyContextValue = {
  company: CompanyDetails | null;
  refreshCompany: (bustCache?: boolean) => Promise<void>;
};

const CompanyContext = createContext<CompanyContextValue>({
  company: null,
  refreshCompany: async () => {},
});

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [company, setCompany] = useState<CompanyDetails | null>(null);

  const refreshCompany = useCallback(async (bustCache = false) => {
    try {
      const data = await fetchCompany(bustCache ? { bustCache: true } : undefined);
      setCompany(data);
    } catch {
      setCompany((prev) => prev ?? null);
    }
  }, []);

  useEffect(() => {
    void refreshCompany();
  }, [refreshCompany]);

  useEffect(() => {
    if (!company) return;
    document.title = company.nameMain || 'Company';
    const brand = company.primaryColor || '#4a7c59';
    document.documentElement.style.setProperty('--color-primary', brand);
    document.documentElement.style.setProperty('--brand', brand);
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (company.logoUrl) {
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = company.logoUrl;
    }
  }, [company]);

  return (
    <CompanyContext.Provider value={{ company, refreshCompany }}>{children}</CompanyContext.Provider>
  );
}

export function useCompany() {
  return useContext(CompanyContext).company;
}

export function useRefreshCompany() {
  return useContext(CompanyContext).refreshCompany;
}
