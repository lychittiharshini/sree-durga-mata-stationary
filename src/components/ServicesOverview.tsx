import React from 'react';
import { Printer, BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';

interface ServicesOverviewProps {
  onSelectService: (service: 'xerox' | 'stationery') => void;
}

export const ServicesOverview: React.FC<ServicesOverviewProps> = ({ onSelectService }) => {
  const { t } = useLanguage();

  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      
      {/* Ornate Gold Heading matching prompt */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="h-[1.5px] w-12 sm:w-20 bg-gradient-to-r from-transparent via-[#F5C542] to-[#D4AF37]" />
          <span className="flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-widest text-[#FDE68A]">
            <Sparkles className="w-3.5 h-3.5 text-[#F5C542] fill-[#F5C542]" />
            <span>{t.servicesTitle}</span>
            <Sparkles className="w-3.5 h-3.5 text-[#F5C542] fill-[#F5C542]" />
          </span>
          <div className="h-[1.5px] w-12 sm:w-20 bg-gradient-to-l from-transparent via-[#F5C542] to-[#D4AF37]" />
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white font-serif-royal drop-shadow-sm">
          {t.servicesTitle}
        </h2>
        <p className="text-xs sm:text-sm text-[#F3E2B8]/80 mt-1 max-w-md mx-auto">
          {t.servicesSubtitle}
        </p>
      </div>

      {/* Exactly TWO Large, Beautiful Cream-Coloured Service Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 max-w-4xl mx-auto">
        
        {/* Card 1: Xerox (Photocopy) */}
        <button
          onClick={() => onSelectService('xerox')}
          className="group relative rounded-3xl bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EE] to-[#F5ECE0] border-2 border-[#D4AF37]/50 hover:border-[#F5C542] p-6 sm:p-7 shadow-xl hover:shadow-2xl hover:shadow-[#D4AF37]/20 transition-all duration-300 text-left flex flex-col justify-between cursor-pointer hover:-translate-y-1.5 active:scale-[0.99] overflow-hidden"
        >
          {/* Subtle gold corner ornament */}
          <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0 H100 V100 C100 50 50 0 0 0 Z" fill="#D4AF37" />
            </svg>
          </div>

          <div>
            {/* Elegant Icon Badge */}
            <div className="w-14 h-14 rounded-2xl bg-[#5A0B16] text-[#FDE68A] group-hover:bg-[#7B1123] group-hover:scale-105 flex items-center justify-center transition-all duration-300 mb-4 border-2 border-[#F5C542]/60 shadow-md">
              <Printer className="w-7 h-7" />
            </div>

            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#7B1123] bg-[#FAF0E6] px-2.5 py-0.5 rounded-full border border-[#ECD9C5]">
                Fast &bull; Single &amp; Double Side
              </span>
            </div>

            <h3 className="text-2xl font-black text-slate-900 group-hover:text-[#7B1123] transition-colors font-serif-royal leading-tight">
              {t.xeroxServiceTitle}
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t.xeroxServiceDesc}
            </p>
          </div>

          {/* Action Button */}
          <div className="mt-6 pt-4 border-t border-[#E8DEC8] flex items-center justify-between">
            <span className="text-xs sm:text-sm font-extrabold text-[#7B1123] group-hover:underline">
              {t.xeroxServiceBtn}
            </span>
            <div className="w-8 h-8 rounded-full bg-[#5A0B16] text-[#FDE68A] group-hover:bg-[#7B1123] group-hover:scale-110 flex items-center justify-center transition-all shadow-xs">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </button>

        {/* Card 2: Stationery Items */}
        <button
          onClick={() => onSelectService('stationery')}
          className="group relative rounded-3xl bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EE] to-[#F5ECE0] border-2 border-[#D4AF37]/50 hover:border-[#16A34A] p-6 sm:p-7 shadow-xl hover:shadow-2xl hover:shadow-[#16A34A]/20 transition-all duration-300 text-left flex flex-col justify-between cursor-pointer hover:-translate-y-1.5 active:scale-[0.99] overflow-hidden"
        >
          {/* Subtle gold corner ornament */}
          <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0 H100 V100 C100 50 50 0 0 0 Z" fill="#16A34A" />
            </svg>
          </div>

          <div>
            {/* Elegant Icon Badge */}
            <div className="w-14 h-14 rounded-2xl bg-[#14532D] text-[#86EFAC] group-hover:bg-[#166534] group-hover:scale-105 flex items-center justify-center transition-all duration-300 mb-4 border-2 border-[#86EFAC]/60 shadow-md">
              <BookOpen className="w-7 h-7" />
            </div>

            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#15803D] bg-[#EDF7EE] px-2.5 py-0.5 rounded-full border border-[#CDE5D0]">
                Books &bull; Pens &bull; Custom Items
              </span>
            </div>

            <h3 className="text-2xl font-black text-slate-900 group-hover:text-[#166534] transition-colors font-serif-royal leading-tight">
              {t.stationeryServiceTitle}
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t.stationeryServiceDesc}
            </p>
          </div>

          {/* Action Button */}
          <div className="mt-6 pt-4 border-t border-[#E8DEC8] flex items-center justify-between">
            <span className="text-xs sm:text-sm font-extrabold text-[#166534] group-hover:underline">
              {t.stationeryServiceBtn}
            </span>
            <div className="w-8 h-8 rounded-full bg-[#14532D] text-[#86EFAC] group-hover:bg-[#166534] group-hover:scale-110 flex items-center justify-center transition-all shadow-xs">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </button>

      </div>
    </section>
  );
};
