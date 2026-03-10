import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: 0,
    priceLabel: '$0',
    period: 'forever',
    description: 'Perfect for trying out the platform',
    features: [
      '3 projects',
      '10 tasks per project',
      'Basic analytics',
      'Email support',
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Pro',
    price: 1900,
    priceLabel: '$19',
    period: 'per month',
    description: 'Best for growing teams',
    features: [
      'Unlimited projects',
      'Unlimited tasks',
      'Advanced analytics',
      'Priority support',
      'Team collaboration',
      'Custom integrations',
    ],
    cta: 'Start Pro Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 9900,
    priceLabel: '$99',
    period: 'per month',
    description: 'For large organizations',
    features: [
      'Everything in Pro',
      'SSO authentication',
      'Audit logs',
      'Dedicated account manager',
      'SLA guarantee',
      'Custom contracts',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">
            Pricing
          </p>
          <h2 className="mt-2 heading-section text-gray-900">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Choose the plan that works for your team. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border ${
                plan.popular
                  ? 'border-primary-500 shadow-xl ring-2 ring-primary-500/20'
                  : 'border-gray-200 shadow-md hover:shadow-xl transition-shadow duration-300'
              } bg-white p-8`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-4 py-1 text-sm font-medium text-white">
                  Most Popular
                </span>
              )}

              <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
              <p className="mt-2 text-sm text-gray-600">{plan.description}</p>

              <div className="mt-6">
                <span className="text-4xl font-bold text-gray-900">{plan.priceLabel}</span>
                <span className="text-gray-600">/{plan.period}</span>
              </div>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary-600 shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <a
                  href="/login"
                  className={`block w-full rounded-lg py-3 text-center font-medium transition-colors ${
                    plan.popular
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : plan.price === 0
                        ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
