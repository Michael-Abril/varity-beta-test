'use client';

import { FolderPlus, ListTodo, TrendingUp } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: 'folderPlus',
      title: 'Create a Project',
      description:
        'Set up a project in seconds. Add a name, description, and due date. Invite your team to collaborate.',
      color: 'bg-blue-600',
      shadow: 'shadow-blue-200',
    },
    {
      number: '02',
      icon: 'listTodo',
      title: 'Add Tasks & Assign',
      description:
        'Break work into tasks with priorities and assignees. Everyone knows what to do and when it is due.',
      color: 'bg-amber-600',
      shadow: 'shadow-amber-200',
    },
    {
      number: '03',
      icon: 'trendingUp',
      title: 'Track & Deliver',
      description:
        'Monitor progress on your dashboard. Update task statuses with a click and ship on schedule.',
      color: 'bg-green-600',
      shadow: 'shadow-green-200',
    },
  ];

  const getIcon = (name: string) => {
    const className = "h-7 w-7 text-white";
    switch (name) {
      case 'folderPlus': return <FolderPlus className={className} />;
      case 'listTodo': return <ListTodo className={className} />;
      case 'trendingUp': return <TrendingUp className={className} />;
      default: return null;
    }
  };

  return (
    <section id="how-it-works" className="py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">
            How It Works
          </p>
          <h2 className="mt-2 heading-section text-gray-900">
            Up and running in three steps
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            No complicated setup. No steep learning curve. Just results.
          </p>
        </div>
        <div className="relative mt-16 grid gap-12 md:grid-cols-3">
          {/* Connecting line between steps (desktop only) */}
          <div className="absolute top-8 left-[calc(16.67%+32px)] right-[calc(16.67%+32px)] hidden h-0.5 bg-gradient-to-r from-blue-200 via-amber-200 to-green-200 md:block" />

          {steps.map((step) => (
            <div key={step.number} className="relative text-center">
              <div className={`relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${step.color} shadow-lg ${step.shadow}`}>
                {getIcon(step.icon)}
              </div>
              <span className="mt-4 block text-xs font-bold uppercase tracking-widest text-primary-500">
                Step {step.number}
              </span>
              <h3 className="mt-2 text-xl font-semibold text-gray-900">{step.title}</h3>
              <p className="mt-3 leading-relaxed text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
