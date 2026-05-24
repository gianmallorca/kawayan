const loaded = new Set<string>();

export function isImageLoaded(url: string) {
  return loaded.has(url);
}

export function markImageLoaded(url: string) {
  loaded.add(url);
}

export function preloadImage(url?: string) {
  if (!url || loaded.has(url)) return;
  const img = new Image();
  const done = () => markImageLoaded(url);
  img.onload = done;
  img.onerror = done;
  img.src = url;
}
