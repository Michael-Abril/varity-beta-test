import { Star } from 'lucide-react';

const testimonials = [
  {
    quote:
      'We switched from a messy spreadsheet to this and our team is finally aligned. Projects get shipped on time now.',
    name: 'Sarah Chen',
    role: 'Engineering Manager',
    company: 'Acme Corp',
    color: 'bg-blue-500',
  },
  {
    quote:
      'The setup took less than a minute. No config files, no environment variables. It just works.',
    name: 'Marcus Rodriguez',
    role: 'CTO',
    company: 'StartupHQ',
    color: 'bg-green-500',
  },
  {
    quote:
      'Our team went from constant status meetings to a dashboard everyone actually checks. Huge time saver.',
    name: 'Emily Park',
    role: 'Product Lead',
    company: 'BuildFast',
    color: 'bg-purple-500',
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">
            Testimonials
          </p>
          <h2 className="mt-2 heading-section text-gray-900">
            Teams love using it
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            See why teams switch to a simpler way of managing projects.
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mt-4 leading-relaxed text-gray-600">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${testimonial.color} text-sm font-bold text-white`}
                >
                  {testimonial.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-xs text-gray-500">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
