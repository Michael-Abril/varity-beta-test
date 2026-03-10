import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary-600" />
            <span className="font-semibold text-gray-900">{APP_NAME}</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#features" className="hover:text-gray-700 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-gray-700 transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="hover:text-gray-700 transition-colors">
              Pricing
            </a>
            <Link href="/login" className="hover:text-gray-700 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-100 pt-6 text-center text-sm text-gray-400">
          &copy; {year} {APP_NAME}. Built with{' '}
          <a
            href="https://www.varity.so"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary-500 hover:text-primary-600 transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 64 64"
              xmlns="http://www.w3.org/2000/svg"
              className="inline-block"
            >
              <defs>
                <linearGradient id="varity-lf-f1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#5EEAD4"/><stop offset="100%" stopColor="#0D9488"/>
                </linearGradient>
                <linearGradient id="varity-lf-f2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#60A5FA"/><stop offset="100%" stopColor="#1D4ED8"/>
                </linearGradient>
                <linearGradient id="varity-lf-f4" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#14B8A6"/><stop offset="100%" stopColor="#2DD4BF"/>
                </linearGradient>
              </defs>
              <path d="M32 6 L48 22 L32 32 L16 22 Z" fill="url(#varity-lf-f4)"/>
              <path d="M16 22 L32 32 L32 58 L8 36 Z" fill="url(#varity-lf-f1)"/>
              <path d="M48 22 L56 36 L32 58 L32 32 Z" fill="url(#varity-lf-f2)"/>
              <path d="M8 36 L32 58 L20 58 Z" fill="url(#varity-lf-f1)" opacity="0.7"/>
              <path d="M56 36 L44 58 L32 58 Z" fill="url(#varity-lf-f2)" opacity="0.7"/>
              <path d="M32 12 L40 22 L32 28 L24 22 Z" fill="white" opacity="0.25"/>
            </svg>
            Varity
          </a>
          .
        </div>
      </div>
    </footer>
  );
}
