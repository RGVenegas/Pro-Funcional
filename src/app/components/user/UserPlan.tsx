import React from 'react';
import { Check, Sparkles, Clock, Calendar } from 'lucide-react';

export function UserPlan() {
  const currentPlan = {
    name: 'Premium',
    status: 'active',
    price: 99,
    startDate: '2024-01-15',
    expirationDate: '2025-02-15',
    benefits: [
      'Unlimited gym access',
      'All group classes included',
      'Personal trainer consultation',
      'Access to premium equipment',
      'Nutrition guidance',
      'Mobile app premium features',
    ],
  };

  const availablePlans = [
    {
      name: 'Basic',
      price: 29,
      description: 'Perfect for getting started',
      features: ['Gym access during off-peak hours', 'Basic equipment access', 'Mobile app'],
    },
    {
      name: 'Standard',
      price: 59,
      description: 'Great for regular training',
      features: ['Unlimited gym access', 'Group classes (5/month)', 'Locker rental', 'Mobile app'],
    },
    {
      name: 'Premium',
      price: 99,
      description: 'Complete fitness experience',
      features: ['All Standard features', 'Unlimited group classes', 'Personal training sessions', 'Nutrition guidance'],
      popular: true,
    },
  ];

  const daysUntilExpiration = Math.floor(
    (new Date(currentPlan.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-[#F7F7F7]">My Plan</h1>
        <p className="text-white/60">Manage your subscription and benefits</p>
      </div>

      {/* Current Plan */}
      <div className="bg-gradient-to-br from-[#09C82C]/20 to-[#09C82C]/5 rounded-xl p-6 backdrop-blur-sm border border-[#09C82C]/20">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-[#F7F7F7]">{currentPlan.name}</h2>
              <span className="px-3 py-1 bg-[#09C82C]/30 text-[#09C82C] rounded-full text-sm font-medium">
                Active
              </span>
            </div>
            <p className="text-2xl font-bold text-[#09C82C]">${currentPlan.price}/month</p>
          </div>
          <Sparkles className="w-8 h-8 text-[#09C82C]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
            <Calendar className="w-5 h-5 text-[#09C82C]" />
            <div>
              <p className="text-xs text-white/60">Started</p>
              <p className="font-medium">{new Date(currentPlan.startDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
            <Clock className="w-5 h-5 text-[#09C82C]" />
            <div>
              <p className="text-xs text-white/60">Expires</p>
              <p className="font-medium">{new Date(currentPlan.expirationDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {daysUntilExpiration <= 30 && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
            <p className="text-yellow-400 text-sm">
              ⚠️ Your plan expires in {daysUntilExpiration} days. Renew now to continue enjoying all benefits!
            </p>
          </div>
        )}

        <div className="mb-6">
          <h3 className="font-semibold mb-3 text-[#F7F7F7]">Included Benefits</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {currentPlan.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#09C82C]/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-[#09C82C]" />
                </div>
                <span className="text-sm text-[#F7F7F7]/90">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 px-6 py-3 bg-[#09C82C] text-[#010A01] rounded-lg hover:bg-[#09C82C]/90 transition-colors font-medium">
            Renew Plan
          </button>
          <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-medium">
            Cancel
          </button>
        </div>
      </div>

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-[#F7F7F7]">Upgrade or Change Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {availablePlans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl p-6 backdrop-blur-sm border transition-all ${
                plan.popular
                  ? 'bg-[#09C82C]/10 border-[#09C82C] scale-105'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              {plan.popular && (
                <span className="inline-block px-3 py-1 bg-[#09C82C] text-[#010A01] rounded-full text-xs font-medium mb-4">
                  Current Plan
                </span>
              )}
              <h3 className="text-xl font-bold mb-2 text-[#F7F7F7]">{plan.name}</h3>
              <p className="text-white/60 text-sm mb-4">{plan.description}</p>
              <p className="text-3xl font-bold mb-6">
                ${plan.price}
                <span className="text-sm text-white/60 font-normal">/month</span>
              </p>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-[#09C82C] mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                disabled={plan.name === currentPlan.name}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  plan.name === currentPlan.name
                    ? 'bg-white/5 text-white/40 cursor-not-allowed'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {plan.name === currentPlan.name ? 'Current Plan' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}