import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#0a0a0a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Background gradient */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(ellipse at 50% 40%, rgba(139,92,246,0.15) 0%, transparent 70%)',
          }}
        />
        {/* Logo mark */}
        <div
          style={{
            width: '80px',
            height: '80px',
            background: '#ffffff',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '32px',
          }}
        >
          <span style={{ fontSize: '48px', fontWeight: 900, color: '#0a0a0a', lineHeight: 1 }}>V</span>
        </div>
        {/* Brand name */}
        <div
          style={{
            fontSize: '80px',
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '-3px',
            marginBottom: '16px',
            lineHeight: 1,
          }}
        >
          Ventexx
        </div>
        {/* Tagline */}
        <div
          style={{
            fontSize: '28px',
            color: '#888888',
            fontWeight: 500,
            marginBottom: '48px',
            letterSpacing: '-0.5px',
          }}
        >
          Where startups pitch, fund and sell.
        </div>
        {/* Pills */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '60px' }}>
          {['Pitch Investors', 'Raise Funding', 'Sell Products'].map((label) => (
            <div
              key={label}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '100px',
                padding: '8px 20px',
                color: '#cccccc',
                fontSize: '16px',
                fontWeight: 600,
              }}
            >
              {label}
            </div>
          ))}
        </div>
        {/* URL */}
        <div style={{ fontSize: '20px', color: '#555555', fontWeight: 600, letterSpacing: '0.5px' }}>
          ventexx.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
