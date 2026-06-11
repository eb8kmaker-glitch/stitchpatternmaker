import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#4F4A45',
        }}
      >
        <svg width="120" height="120" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="19" y1="19" x2="45" y2="45" stroke="#F7F5F2" strokeWidth="7" strokeLinecap="round" />
          <line x1="45" y1="19" x2="19" y2="45" stroke="#A8B2A1" strokeWidth="7" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size },
  )
}
