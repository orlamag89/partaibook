import { useLoginModal } from '@/context/LoginModalContext';
import LoginModal from '@/components/modals/LoginModal';

export default function LoginModalRoot() {
  const { isOpen, close } = useLoginModal();
  return <LoginModal isOpen={isOpen} onClose={close} />;
}
