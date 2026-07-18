"use client";

import { useEffect, useState } from "react";
import { X, ShieldCheck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { BRAND } from "@/lib/catalog";

type Props = {
  amount: number;
  email: string;
  phone: string;
  onSuccess: () => void;
  onClose: () => void;
};

export function RazorpayMock({ amount, email, phone, onSuccess, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const handlePayment = async () => {
    setProcessing(true);
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 1200));
    setProcessing(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-obsidian/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-md bg-white shadow-2xl">
        <div className="bg-[#02042b] p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">{BRAND.name}</p>
              <p className="mt-1 font-mono text-xl">{formatCurrency(amount)}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white/10 p-1.5 hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-4 text-xs opacity-60">
            {email} · {phone}
          </p>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex h-48 flex-col items-center justify-center text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#02042b] border-t-transparent" />
              <p className="mt-4 text-xs font-medium text-slate-500 uppercase tracking-widest">
                Initializing Secure Gateway...
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={handlePayment}
                disabled={processing}
                className="flex items-center justify-between rounded border border-slate-200 p-4 transition hover:border-[#02042b] disabled:opacity-60"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-100 text-xs font-bold text-[#02042b]">
                    UPI
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-slate-900">Pay with UPI</p>
                    <p className="text-xs text-slate-500">Google Pay, PhonePe, Paytm</p>
                  </div>
                </div>
                {processing && <div className="h-4 w-4 animate-spin rounded-full border border-slate-400 border-t-transparent" />}
              </button>
              <button
                type="button"
                onClick={handlePayment}
                disabled={processing}
                className="flex items-center justify-between rounded border border-slate-200 p-4 transition hover:border-[#02042b] disabled:opacity-60"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-100 text-xs font-bold text-[#02042b]">
                    CC
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-slate-900">Card / Netbanking</p>
                    <p className="text-xs text-slate-500">Visa, MasterCard, RuPay</p>
                  </div>
                </div>
                {processing && <div className="h-4 w-4 animate-spin rounded-full border border-slate-400 border-t-transparent" />}
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center justify-center gap-1.5 border-t border-slate-100 bg-slate-50 py-3 text-[10px] text-slate-400 uppercase tracking-widest">
          <ShieldCheck className="h-3.5 w-3.5" />
          Secured by Razorpay Sandbox
        </div>
      </div>
    </div>
  );
}
