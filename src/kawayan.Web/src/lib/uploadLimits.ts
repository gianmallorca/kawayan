export const MAX_IMAGE_UPLOAD_MB = 15;

export function validateImageFileSize(file: File, maxMb = MAX_IMAGE_UPLOAD_MB): string | null {
  if (file.size > maxMb * 1024 * 1024) return `Image must be smaller than ${maxMb}MB.`;
  return null;
}
