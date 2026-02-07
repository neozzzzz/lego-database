'use client'

import Modal from './modal'
import { useAuth } from '@/lib/auth/auth-context'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  message?: string
}

export default function LoginModal({ isOpen, onClose, message }: LoginModalProps) {
  const { signInWithGoogle } = useAuth()

  const handleLogin = async () => {
    // Save current URL to redirect back after login
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname)
    }
    await signInWithGoogle()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="로그인 필요">
      <p style={{ color: '#999', fontSize: '14px', marginBottom: '24px', lineHeight: '1.6' }}>
        {message || '이 기능을 이용하려면 로그인이 필요합니다.'}
      </p>
      <button
        onClick={handleLogin}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '10px', padding: '14px', borderRadius: '12px', fontWeight: 500,
          fontSize: '15px', background: '#1a1a1a', border: '1px solid #333',
          color: '#fff', cursor: 'pointer', transition: 'background 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = '#2a2a2a')}
        onMouseLeave={e => (e.currentTarget.style.background = '#1a1a1a')}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google로 로그인
      </button>
      <button
        onClick={onClose}
        style={{
          width: '100%', padding: '12px', borderRadius: '12px', marginTop: '10px',
          fontSize: '14px', background: 'transparent', border: 'none',
          color: '#666', cursor: 'pointer',
        }}
      >
        닫기
      </button>
    </Modal>
  )
}
