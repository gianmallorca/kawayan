import { useEffect, useState } from 'react';
import { getCachedServices, loadServices } from '@/lib/servicesCache';
import type { ServiceItem } from '@/types';

export function useServices() {
  const [services, setServices] = useState<ServiceItem[]>(() => getCachedServices() ?? []);
  const [ready, setReady] = useState(() => getCachedServices() !== undefined);

  useEffect(() => {
    let cancelled = false;
    loadServices()
      .then((data) => {
        if (!cancelled) {
          setServices(data);
          setReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          if (!getCachedServices()) setServices([]);
          setReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { services, ready };
}
