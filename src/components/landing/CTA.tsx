import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

const perks = [
  'Free to get started',
  'No credit card required',
  'Set up in under a minute',
];

export function CTA() {
  return (
    <section className="relative overflow-hidden bg-gray-900 py-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-900/20 via-transparent to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 text-center">
        <h2 className="heading-section text-white">
          Ready to get your team organized?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
          Join teams who use {APP_NAME} to ship projects on time.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {perks.map((perk) => (
            <div key={perk} className="flex items-center gap-2 text-sm text-gray-300">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              {perk}
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-medium text-gray-900 shadow-lg hover:bg-gray-100 transition-all"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
