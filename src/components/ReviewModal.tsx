import React, { useState } from 'react';
import { X, Send, ShoppingBag, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';

export interface ReviewItem {
  name: string;
  quantity: number;
  price?: number | null;
  total?: number;
  offerNote?: string;
}

export interface ReviewModalData {
  title: string;
  items: ReviewItem[];
  totalAmount: number;
  notes?: string;
  onConfirmWhatsApp: (customerName: string) => void;
}

interface ReviewModalProps {
  data: ReviewModalData | null;
  onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ data, onClose }) => {
  const { t } = useLanguage();
  const [customerName, setCustomerName] = useState<string>(() => {
    return localStorage.getItem('sree_durga_customer_name') || '';
  });
  const [nameError, setNameError] = useState<string | null>(null);

  if (!data) return null;

  const handleProceed = () => {
    if (!customerName || !customerName.trim()) {
      setNameError(t.nameRequiredError);
      return;
    }
    setNameError(null);
    localStorage.setItem('sree_durga_customer_name', customerName.trim());
    onClose();
    data.onConfirmWhatsApp(customerName.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border-2 border-[#E7DCCE] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#FAF7F2] border-b border-[#EADFCF] p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#7B1123] text-white flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-800 leading-tight">
                {t.reviewModalTitle}
              </h3>
              <p className="text-[11px] text-slate-500">{data.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors border border-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* REQUIRED CUSTOMER NAME FIELD */}
          <div className="bg-[#FFFDF9] border-2 border-[#7B1123]/20 rounded-xl p-3.5 shadow-2xs">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1.5">
              <User className="w-3.5 h-3.5 text-[#7B1123]" />
              <span>{t.customerNameLabel}</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                if (e.target.value.trim()) setNameError(null);
              }}
              placeholder={t.customerNamePlaceholder}
              className="w-full px-3 py-2 text-sm bg-white border border-[#DACBB7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1123] text-slate-900 font-semibold"
            />
            {nameError && (
              <p className="text-[11px] font-semibold text-rose-600 mt-1">
                {nameError}
              </p>
            )}
            <p className="text-[10px] text-slate-500 mt-1">
              Your name will be included in the WhatsApp message so the shop owner can identify you.
            </p>
          </div>

          {/* Items breakdown list */}
          <div className="rounded-xl border border-[#E7DCCE] overflow-hidden">
            <div className="bg-[#FAF0E6] px-3.5 py-2 text-[11px] font-bold text-[#7B1123] uppercase tracking-wider">
              {t.selectedItems}
            </div>
            <div className="divide-y divide-slate-100 bg-white max-h-48 overflow-y-auto">
              {data.items.map((item, idx) => (
                <div key={idx} className="p-2.5 flex items-start justify-between text-xs">
                  <div className="flex-1 pr-2">
                    <span className="font-bold text-slate-800 block">{item.name}</span>
                    <span className="text-slate-500 text-[11px]">
                      Qty: <strong className="text-slate-700">{item.quantity}</strong>
                      {item.price !== undefined && item.price !== null && (
                        <span> &bull; ₹{item.price} each</span>
                      )}
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 shrink-0">
                    {item.total !== undefined ? `₹${item.total}` : 'Confirm with shop'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer notes */}
          {data.notes && data.notes.trim() && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 block mb-0.5">{t.addCustomerNote}:</span>
              <p className="text-slate-600 italic">"{data.notes.trim()}"</p>
            </div>
          )}

          {/* Total */}
          <div className="p-3.5 bg-[#FFFDF9] rounded-xl border border-[#EADFCF] flex items-center justify-between">
            <span className="font-extrabold text-xs text-slate-700">{t.subtotalLabel}:</span>
            <span className="text-lg font-black text-[#7B1123]">
              {data.totalAmount > 0 ? `₹${data.totalAmount}` : 'Price to be confirmed'}
            </span>
          </div>

          <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 leading-relaxed">
            {t.whatsappNotice}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-[#FAF7F2] border-t border-[#EADFCF] p-3.5 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 bg-white border border-slate-300 transition-colors cursor-pointer"
          >
            {t.closeBtn}
          </button>
          <button
            type="button"
            onClick={handleProceed}
            className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-[#15803D] hover:bg-[#166534] shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t.confirmWhatsAppBtn}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
