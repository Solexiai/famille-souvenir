import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MfaChallenge } from '@/components/MfaChallenge';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, mfaRequired, refreshMfaStatus } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (mfaRequired) {
    return <MfaChallenge onVerified={refreshMfaStatus} />;
  }

  return <>{children}</>;
};
