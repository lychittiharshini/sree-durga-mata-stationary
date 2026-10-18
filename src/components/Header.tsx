import React from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { Sparkles, MessageCircle } from 'lucide-react';
import { buildWhatsAppUrl } from '../utils/whatsapp.ts';

interface HeaderProps {
  whatsappNumber: string;
}

export const Header: React.FC<HeaderProps> = ({ whatsappNumber }) => {
  const { language, setLanguage, t } = useLanguage();

  const handleQuickWhatsApp = () => {
    if (!whatsappNumber) {
      alert(t.numberNotConfigured);
      return;
    }
    const { url } = buildWhatsAppUrl(
      whatsappNumber,
      `Hello Sree Durga Mata Stationery, I would like to enquire about your services and items.`
    );
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#42060F]/95 backdrop-blur-md border-b border-[#D4AF37]/35 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        
        {/* Left: Brand Icon + Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#7B1123] to-[#3B050E] border-2 border-[#F5C542] flex items-center justify-center text-[#FDE68A] shadow-md shrink-0">
            <Sparkles className="w-5 h-5 fill-[#FDE68A]" />
          </div>
          <div>
            <h1 className="text-sm sm:text-lg font-black tracking-tight text-white leading-tight font-serif-royal">
              Sree Durga Mata Stationery
            </h1>
            <p className="text-[10px] sm:text-xs font-semibold text-[#FDE68A] tracking-wider uppercase">
              Book Stall &amp; Fancy Items
            </p>
          </div>
        </div>

        {/* Right: Language Selector + WhatsApp Button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Language Switcher Pill matching Screenshot 1 */}
          <div className="flex items-center bg-[#2B0309] p-0.5 sm:p-1 rounded-full border border-[#D4AF37]/40 shadow-inner">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                language === 'en'
                  ? 'bg-gradient-to-r from-[#7B1123] to-[#5A0B16] text-white shadow-xs border border-[#F5C542]/40'
                  : 'text-[#F3E2B8] hover:text-white'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('te')}
              className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                language === 'te'
                  ? 'bg-gradient-to-r from-[#7B1123] to-[#5A0B16] text-white shadow-xs border border-[#F5C542]/40'
                  : 'text-[#F3E2B8] hover:text-white'
              }`}
            >
              తెలుగు
            </button>
          </div>

          {/* WhatsApp Button matching Screenshot 1 */}
          <button
            onClick={handleQuickWhatsApp}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-[#86EFAC]/40 active:scale-95"
            title="Chat on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

        </div>

      </div>
    </header>
  );
};
