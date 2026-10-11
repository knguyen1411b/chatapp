import { ImageResponse } from 'next/og'

export const alt = 'ChatApp - Nhắn tin Realtime Tốc độ cao & Bảo mật'
export const size = {
    width: 1200,
    height: 630
}
export const contentType = 'image/png'

export default function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #0c0a1a 0%, #1f143d 50%, #2e1065 100%)',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 96,
                        height: 96,
                        borderRadius: 28,
                        background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                        marginBottom: 28,
                        boxShadow: '0 20px 40px rgba(139, 92, 246, 0.4)'
                    }}
                >
                    <svg
                        width="54"
                        height="54"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                </div>
                <div
                    style={{
                        fontSize: 62,
                        fontWeight: 900,
                        color: '#ffffff',
                        marginBottom: 16
                    }}
                >
                    ChatApp Realtime
                </div>
                <div
                    style={{
                        fontSize: 26,
                        color: '#94a3b8',
                        maxWidth: 820,
                        textAlign: 'center',
                        lineHeight: 1.4
                    }}
                >
                    Nền tảng nhắn tin bảo mật, trò chuyện nhóm và chia sẻ tệp tốc độ cao
                </div>
            </div>
        ),
        {
            ...size
        }
    )
}
