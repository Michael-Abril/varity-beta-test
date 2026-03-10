'use client';

import Link from 'next/link';
import { ArrowRight, BarChart3, Shield, Zap, CheckCircle2 } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

function DashboardMockup() {
  return (
    <div className="animate-fade-in-up-delay-3 mx-auto mt-16 max-w-4xl px-4">
      <div className="rounded-xl border border-gray-200 bg-white shadow-2xl shadow-gray-200/50 ring-1 ring-gray-900/5 overflow-hidden">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2.5">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
          </div>
          <div className="ml-3 flex-1 rounded-md bg-gray-100 px-3 py-1 text-xs text-gray-400">
            app.yourcompany.com/dashboard
          </div>
        </div>
        {/* Mock dashboard content */}
        <div className="p-6">
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Projects', value: '12', color: 'bg-blue-500' },
              { label: 'Tasks', value: '48', color: 'bg-amber-500' },
              { label: 'Completed', value: '31', color: 'bg-green-500' },
              { label: 'Team', value: '8', color: 'bg-purple-500' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg border border-gray-100 p-3">
                <div className={`mb-2 h-1.5 w-6 rounded-full ${stat.color} opacity-60`} />
                <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {[
              { name: 'Website Redesign', status: 'In Progress', pct: 65 },
              { name: 'Mobile App v2', status: 'Planning', pct: 20 },
              { name: 'API Integration', status: 'Review', pct: 85 },
            ].map((project) => (
              <div key={project.name} className="flex items-center gap-3 rounded-lg border border-gray-50 bg-gray-50/50 px-3 py-2">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">{project.name}</div>
                  <div className="text-xs text-gray-400">{project.status}</div>
                </div>
                <div className="h-1.5 w-24 rounded-full bg-gray-100">
                  <div
                    className="h-1.5 rounded-full bg-primary-500"
                    style={{ width: `${project.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  const highlights = [
    { icon: 'zap', label: 'Fast setup' },
    { icon: 'shield', label: 'Secure by default' },
    { icon: 'barChart', label: 'Built-in analytics' },
  ];

  const getIcon = (name: string) => {
    const className = "h-4 w-4 text-primary-500";
    switch (name) {
      case 'zap': return <Zap className={className} />;
      case 'shield': return <Shield className={className} />;
      case 'barChart': return <BarChart3 className={className} />;
      default: return null;
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 via-white to-white py-24 sm:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-100/40 via-transparent to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 text-center">
        <div className="animate-fade-in-up mx-auto inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700">
          <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
          Free to get started
        </div>
        <h1 className="animate-fade-in-up-delay-1 mt-6 heading-hero tracking-tight text-gray-900">
          Manage Projects,{' '}
          <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
            Ship Faster
          </span>
        </h1>
        <p className="animate-fade-in-up-delay-2 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
          {APP_NAME} gives your team a clear view of every project, task, and deadline.
          Stop juggling spreadsheets and start delivering on time.
        </p>
        <div className="animate-fade-in-up-delay-2 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-base font-medium text-white shadow-lg shadow-primary-200 hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-200/50 transition-all"
          >
            Start Free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all"
          >
            See How It Works
          </a>
        </div>

        {/* Social proof */}
        <div className="animate-fade-in-up-delay-3 mt-12 flex flex-col items-center gap-3">
          <div className="flex -space-x-2">
            {['bg-blue-500', 'bg-green-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500'].map((color, i) => (
              <div
                key={i}
                className={`flex h-8 w-8 items-center justify-center rounded-full ${color} text-xs font-bold text-white ring-2 ring-white`}
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>Trusted by teams who ship on time</span>
          </div>
        </div>

        <div className="animate-fade-in-up-delay-4 mt-12 flex items-center justify-center gap-8 sm:gap-12">
          {highlights.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm text-gray-500">
              {getIcon(item.icon)}
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        <DashboardMockup />
      </div>
    </section>
  );
}
