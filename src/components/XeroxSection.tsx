import React, { useState } from 'react';
import { ArrowLeft, Check, Plus, Minus, Trash2, Send, FileText, Sparkles, Printer } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { buildWhatsAppUrl } from '../utils/whatsapp.ts';

interface XeroxRateOption {
  id: 'bw_single' | 'bw_double' | 'color_single' | 'color_double';
  nameKey: 'bwSingleSide' | 'bwDoubleSide' | 'colorSingleSide' | 'colorDoubleSide';
  englishLabel: string;
  isColor: boolean;
  isDouble: boolean;
}

interface XeroxSectionProps {
  whatsappNumber: string;
  onBackToHome: () => void;
  onOpenReview: (summary: {
    title: string;
    items: Array<{ name: string; quantity: number }>;
    totalAmount?: number;
    notes?: string;
    onConfirmWhatsApp: (customerName: string) => void;
  }) => void;
}

export const XeroxSection: React.FC<XeroxSectionProps> = ({
  whatsappNumber,
  onBackToHome,
  onOpenReview
}) => {
  const { t } = useLanguage();

  const xeroxOptions: XeroxRateOption[] = [
    { id: 'bw_single', nameKey: 'bwSingleSide', englishLabel: 'Black & White — Single Side', isColor: false, isDouble: false },
    { id: 'bw_double', nameKey: 'bwDoubleSide', englishLabel: 'Black & White — Double Side', isColor: false, isDouble: true },
    { id: 'color_single', nameKey: 'colorSingleSide', englishLabel: 'Colour — Single Side', isColor: true, isDouble: false },
    { id: 'color_double', nameKey: 'colorDoubleSide', englishLabel: 'Colour — Double Side', isColor: true, isDouble: true },
  ];

  const [selected, setSelected] = useState<Record<string, boolean>>({
    bw_single: false,
    bw_double: false,
    color_single: false,
    color_double: false,
  });

  const [quantities, setQuantities] = useState<Record<string, number>>({
    bw_single: 1,
    bw_double: 1,
    color_single: 1,
    color_double: 1,
  });

  const [customerNote, setCustomerNote] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleOption = (id: string) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
    setErrorMessage(null);
  };

  const updateQuantity = (id: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[id] || 1;
      const next = Math.max(1, Math.min(10000, current + delta));
      return { ...prev, [id]: next };
    });
  };

  const handleQuantityInput = (id: string, val: string) => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed < 1) {
      setQuantities(prev => ({ ...prev, [id]: 1 }));
    } else {
      setQuantities(prev => ({ ...prev, [id]: Math.min(10000, parsed) }));
    }
  };

  const handleClear = () => {
    setSelected({
      bw_single: false,
      bw_double: false,
      color_single: false,
      color_double: false,
    });
    setQuantities({
      bw_single: 1,
      bw_double: 1,
      color_single: 1,
      color_double: 1,
    });
    setCustomerNote('');
    setErrorMessage(null);
  };

  const selectedItems = xeroxOptions
    .filter(opt => selected[opt.id])
    .map(opt => ({
      label: t[opt.nameKey],
      englishLabel: opt.englishLabel,
      quantity: quantities[opt.id] || 1,
    }));

  const hasSelection = selectedItems.length > 0;

  const handleReviewClick = () => {
    if (!hasSelection) {
      setErrorMessage(t.selectOptionsPrompt);
      return;
    }

    if (!whatsappNumber) {
      setErrorMessage(t.numberNotConfigured);
      return;
    }

    onOpenReview({
      title: t.xeroxHeading,
      items: selectedItems.map(item => ({
        name: item.label,
        quantity: item.quantity,
      })),
      notes: customerNote,
      onConfirmWhatsApp: (customerName: string) => {
        const itemLines = selectedItems.map(item => `- ${item.englishLabel}: ${item.quantity} ${item.quantity === 1 ? 'page' : 'pages'}`).join('\\n');
        const message = [
          'Hello, I would like to enquire about Xerox service.',
          `Name: ${customerName}`,
          '',
          'Selected services:',
          itemLines,
          customerNote.trim() ? `\\nNote: ${customerNote.trim()}` : '',
          '',
          'Please confirm the details. Thank you.'
        ].filter(Boolean).join('\\n');

        const { url, error } = buildWhatsAppUrl(whatsappNumber, message);
        if (error || !url) {
          alert(error || t.numberNotConfigured);
          return;
        }
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    });
  };

  return (
    <section className="max-w-4xl mx-auto px-4 py-4 sm:py-6 animate-fade-in">
      
      {/* Return button with Gold border */}
      <div className="mb-5">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#42060F] hover:bg-[#580B16] text-[#FDE68A] text-xs font-bold border border-[#D4AF37]/60 transition-all cursor-pointer shadow-md active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#F5C542]" />
          <span>{t.backToHome}</span>
        </button>
      </div>

      {/* Section Header with Royal gold flourish */}
      <div className="border-b border-[#D4AF37]/30 pb-4 mb-6">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-8 h-8 rounded-xl bg-[#5A0B16] border border-[#F5C542]/60 text-[#FDE68A] flex items-center justify-center shadow-xs">
            <Printer className="w-4 h-4" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-serif-royal">
            {t.xeroxHeading}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#F3E2B8]/80">
          {t.xeroxSubheading}
        </p>
      </div>

      {/* Grid: 4 Fixed Rate Cards in Elegant Cream & Gold */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {xeroxOptions.map((opt) => {
          const isChecked = selected[opt.id];
          const qty = quantities[opt.id] || 1;

          return (
            <div
              key={opt.id}
              className={`rounded-2xl border-2 transition-all p-5 flex flex-col justify-between ${
                isChecked
                  ? 'bg-gradient-to-b from-[#FFFDF9] to-[#F7EDE1] border-[#D4AF37] shadow-xl ring-2 ring-[#D4AF37]/30'
                  : 'bg-gradient-to-b from-[#FFFDF9] to-[#FAF5EB] border-[#D4AF37]/30 hover:border-[#D4AF37] shadow-md'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-2 ${
                      opt.isColor 
                        ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                        : 'bg-slate-100 text-slate-800 border border-slate-300'
                    }`}>
                      {opt.isColor ? 'Colour Print' : 'Black & White'}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-base leading-snug">
                      {t[opt.nameKey]}
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleOption(opt.id)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center border-2 transition-all cursor-pointer shrink-0 mt-0.5 ${
                      isChecked
                        ? 'bg-[#7B1123] border-[#7B1123] text-white shadow-xs'
                        : 'border-slate-300 bg-white hover:border-[#D4AF37]'
                    }`}
                    aria-label={`Select ${t[opt.nameKey]}`}
                  >
                    {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>
                </div>

              </div>

              {/* Quantity Controls */}
              <div className="mt-5 pt-3 border-t border-[#E8DEC8]">
                {isChecked ? (
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(opt.id, -1)}
                          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-sm cursor-pointer shadow-2xs"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="10000"
                          value={qty}
                          onChange={(e) => handleQuantityInput(opt.id, e.target.value)}
                          className="w-14 h-8 text-center font-extrabold text-slate-900 bg-white border border-[#DACBB7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1123] text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => updateQuantity(opt.id, 1)}
                          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-sm cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleOption(opt.id)}
                    className="w-full py-2 text-xs font-bold text-[#7B1123] bg-white hover:bg-[#FAF0E6] rounded-xl border border-[#ECD9C5] transition-colors cursor-pointer text-center shadow-2xs"
                  >
                    + Select Option
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Customer Note */}
      <div className="bg-[#FFFDF9] rounded-2xl border-2 border-[#D4AF37]/35 p-4 sm:p-5 shadow-lg mb-6">
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
          <FileText className="w-4 h-4 text-[#7B1123]" />
          <span>{t.addCustomerNote}</span>
        </label>
        <textarea
          rows={2}
          value={customerNote}
          onChange={(e) => setCustomerNote(e.target.value)}
          placeholder={t.notePlaceholder}
          className="w-full text-xs text-slate-800 placeholder-slate-400 bg-white border border-[#DACBB7] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#7B1123] resize-none"
        />
      </div>

      {/* Summary Box & Action */}
      <div className="bg-gradient-to-b from-[#FFFDF9] to-[#FAF6EE] rounded-3xl border-2 border-[#D4AF37] p-5 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E8DEC8] pb-3 mb-4">
          <h3 className="font-black text-base text-slate-900 font-serif-royal">
            {t.reviewModalTitle}
          </h3>
          {hasSelection && (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-800 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.clearSelection}</span>
            </button>
          )}
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {errorMessage}
          </div>
        )}

        {hasSelection ? (
          <div className="space-y-2.5 mb-5">
            {selectedItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs sm:text-sm py-1.5 border-b border-dashed border-slate-200">
                <span className="font-bold text-slate-800">
                  {item.label} ({item.quantity} {item.quantity === 1 ? 'page' : 'pages'})
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-slate-400 text-xs font-medium">
            {t.noOptionsSelected} {t.selectOptionsPrompt}
          </div>
        )}

        <div className="pt-2">
          <button
            type="button"
            disabled={!hasSelection}
            onClick={handleReviewClick}
            className="w-full py-3.5 px-4 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-[#16A34A] to-[#15803D] hover:from-[#15803D] hover:to-[#14532D] shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
          >
            <Send className="w-4 h-4" />
            <span>{t.sendWhatsAppRequest}</span>
          </button>
        </div>
      </div>

    </section>
  );
};
