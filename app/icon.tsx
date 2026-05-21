import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: 32, height: 32, display: 'flex' }}>
        <svg width="32" height="32" viewBox="0 0 34 34" fill="none">
          <rect width="34" height="34" rx="8" fill="#4338CA"/>
          <rect x="9" y="8" width="4" height="18" rx="1.5" fill="white"/>
          <rect x="9" y="8" width="14" height="4" rx="1.5" fill="white"/>
          <rect x="9" y="15" width="11" height="3.5" rx="1.5" fill="white"/>
          <polygon points="9,26 13,26 9,22" fill="#4338CA"/>
        </svg>
      </div>
    ),
    { ...size }
  );
}
