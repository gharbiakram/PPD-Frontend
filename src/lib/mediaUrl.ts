import { API_ORIGIN } from '@/constants/apiConfig';

export function resolveMediaUrl(url?: string | null): string {
  if (!url) {
    return '';
  }

  if (/^(https?:|blob:|data:)/i.test(url)) {
    return url;
  }

  if (url.startsWith('/')) {
    return `${API_ORIGIN}${url}`;
  }

  return `${API_ORIGIN}/${url}`;
}

export function isStreamingVideo(url?: string | null): boolean {
  return !!url && /\.m3u8($|\?)/i.test(url);
}