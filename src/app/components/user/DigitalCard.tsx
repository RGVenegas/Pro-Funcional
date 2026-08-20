import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Sparkles } from 'lucide-react';

export function DigitalCard() {
  const user = {
    id: 'GYM-2024-001234',
    name: 'John Smith',
    plan: 'Premium',
    memberSince: '2024-01-15',
    expirationDate: '2025-02-15',
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2 text-[#F7F7F7]">Digital Membership Card</h1>
        <p className="text-white/60">Use this QR code for gym access</p>
      </div>

      {/* Digital Card */}
      <div className="relative">
        {/* Card Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#09C82C]/20 to-[#09C82C]/5 blur-3xl" />
        
        {/* Main Card */}
        <div className="relative bg-gradient-to-br from-[#09C82C]/10 to-transparent rounded-2xl p-8 backdrop-blur-sm border border-[#09C82C]/20 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#09C82C]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#09C82C]/5 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-6 h-6 text-[#09C82C]" />
                  <h2 className="text-2xl font-bold text-[#09C82C]">GymFlow</h2>
                </div>
                <p className="text-sm text-white/60">Premium Fitness Center</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/60 mb-1">Member ID</p>
                <p className="font-mono text-sm font-medium text-[#F7F7F7]">{user.id}</p>
              </div>
            </div>

            {/* Member Info */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 bg-[#09C82C]/20 rounded-full flex items-center justify-center border-2 border-[#09C82C]">
                  <span className="text-3xl font-bold text-[#09C82C]">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1 text-[#F7F7F7]">{user.name}</h3>
                  <p className="text-[#09C82C] font-semibold">{user.plan} Member</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-white/60 mb-1">Member Since</p>
                  <p className="font-medium text-[#F7F7F7]">{new Date(user.memberSince).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-white/60 mb-1">Valid Until</p>
                  <p className="font-medium text-[#F7F7F7]">{new Date(user.expirationDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-white rounded-2xl p-6 flex flex-col items-center">
              <QRCodeSVG
                value={`GYMFLOW:${user.id}`}
                size={200}
                level="H"
                includeMargin={true}
                fgColor="#010A01"
              />
              <p className="text-[#010A01] text-sm font-medium mt-4">Scan at entrance</p>
            </div>

            {/* Status Badge */}
            <div className="mt-6 text-center">
              <span className="inline-block px-4 py-2 bg-[#09C82C]/20 text-[#09C82C] rounded-full text-sm font-medium border border-[#09C82C]/30">
                ✓ Active Membership
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10">
        <h3 className="font-semibold mb-3 text-[#F7F7F7]">How to Use</h3>
        <ul className="space-y-2 text-sm text-white/80">
          <li className="flex items-start gap-2">
            <span className="text-[#09C82C] mt-1">1.</span>
            <span>Present this QR code at the gym entrance scanner</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#09C82C] mt-1">2.</span>
            <span>Wait for the green checkmark confirmation</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#09C82C] mt-1">3.</span>
            <span>Your entry will be logged for attendance tracking</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#09C82C] mt-1">4.</span>
            <span>Keep your phone brightness high for best scanning results</span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-medium">
          Save to Wallet
        </button>
        <button className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-medium">
          Share
        </button>
      </div>
    </div>
  );
}