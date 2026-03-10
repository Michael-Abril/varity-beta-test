'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

let PrivyStackComponent: any = null;
let usePrivyHook: (() => { authenticated: boolean; ready: boolean; login: () => void }) | null = null;

try {
  const uiKit = require('@varity-labs/ui-kit');
  PrivyStackComponent = uiKit.PrivyStack;
  usePrivyHook = uiKit.usePrivy;
} catch {}

function LoginContent() {
  const router = useRouter();
  // eslint-disable-next-line react-hooks/rules-of-hooks -- conditional on require() success, stable across renders
  const privy = usePrivyHook ? usePrivyHook() : null;

  useEffect(() => {
    if (privy?.authenticated) {
      router.push('/dashboard');
    }
  }, [privy?.authenticated, router]);

  const handleLogin = () => {
    if (privy?.login) {
      privy.login();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <CheckCircle className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">{APP_NAME}</span>
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Use your email or social account to get started.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          {privy ? (
            <button
              onClick={handleLogin}
              disabled={!privy.ready || privy.authenticated}
              className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              {!privy.ready
                ? 'Loading...'
                : privy.authenticated
                ? 'Already Signed In'
                : 'Sign In with Email or Social'}
            </button>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Loading authentication...
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-500">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  // Always wrap in PrivyStack - it uses dev credentials automatically when no appId is provided
  if (PrivyStackComponent) {
    return (
      <PrivyStackComponent
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
        thirdwebClientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
        loginMethods={['email', 'google']}
        appearance={{ theme: 'light', accentColor: '#2563EB', logo: '/logo.svg' }}
      >
        <LoginContent />
      </PrivyStackComponent>
    );
  }

  // Fallback if ui-kit package isn't installed
  return <LoginContent />;
}
