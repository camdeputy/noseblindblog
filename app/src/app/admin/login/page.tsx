import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import LoginForm from './LoginForm';

export default function AdminLoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Suspense fallback={
        <div className="w-full max-w-sm flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary/50" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
