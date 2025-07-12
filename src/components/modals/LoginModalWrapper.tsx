'use client'

import { useLoginModal } from '@/context/LoginModalContext'
import LoginModal from './LoginModal'

export default function LoginModalWrapper() {
  const { isOpen, close } = useLoginModal()

  return <LoginModal isOpen={isOpen} onClose={close} />
}