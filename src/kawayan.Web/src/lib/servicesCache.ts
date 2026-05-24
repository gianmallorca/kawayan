import { fetchServices } from '@/api/services';
import type { ServiceItem } from '@/types';

let cached: ServiceItem[] | undefined;
let inflight: Promise<ServiceItem[]> | undefined;

export function getCachedServices() {
  return cached;
}

export async function loadServices(): Promise<ServiceItem[]> {
  if (cached) return cached;
  if (inflight) return inflight;

  inflight = fetchServices()
    .then((data) => {
      cached = data;
      inflight = undefined;
      return data;
    })
    .catch((err) => {
      inflight = undefined;
      throw err;
    });

  return inflight;
}

export function prefetchServices() {
  if (cached || inflight) return;
  void loadServices().catch(() => undefined);
}

export function invalidateServicesCache() {
  cached = undefined;
  inflight = undefined;
}
