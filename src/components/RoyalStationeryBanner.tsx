import React from 'react';
import { Clock, MapPin, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';

interface RoyalStationeryBannerProps {
  whatsappNumber: string;
}

export const RoyalStationeryBanner: React.FC<RoyalStationeryBannerProps> = ({ whatsappNumber }) => {
  const { t } = useLanguage();

  return (
    <section className="w-full max-w-5xl mx-auto px-3 sm:px-6 pt-4 pb-2">
      {/* Ornate Gold Framed Banner Container */}
      <div className="relative rounded-2xl sm:rounded-3xl p-1 sm:p-2 bg-gradient-to-b from-[#E6CA65] via-[#B8860B] to-[#5A0B16] shadow-2xl overflow-hidden">
        
        {/* Inner Border Frame */}
        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-[#240306] border-2 border-[#FDE68A]/70">
          
          {/* Main Banner Image */}
          <div className="relative w-full aspect-[16/9] sm:aspect-[16/8.5] max-h-[460px] overflow-hidden flex items-center justify-center">
            <img
              src="/stationery_banner.jpg"
              alt="Sree Durga Mata Stationery - Book Stall & Fancy Items Banner"
              className="w-full h-full object-cover object-center select-none"
              loading="eager"
            />
            {/* Subtle royal vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#200206]/40 via-transparent to-[#200206]/20 pointer-events-none" />
          </div>

          {/* Shop Information Strip matching Screenshot 1 */}
          <div className="bg-[#3D050C] border-t-2 border-[#D4AF37]/50 px-3 sm:px-6 py-2 sm:py-2.5 text-center flex items-center justify-center gap-3 sm:gap-6 flex-wrap text-xs text-[#FDE68A] font-semibold tracking-wide">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#F5C542] shrink-0" />
              <span>{t.shopTimingsVal}</span>
            </span>

            <span className="hidden sm:inline text-[#D4AF37]/40">•</span>

            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#F5C542] shrink-0" />
              <span>Book Stall &amp; Fancy Items, Near Durga Mata Temple</span>
            </span>

            {whatsappNumber && (
              <>
                <span className="hidden md:inline text-[#D4AF37]/40">•</span>
                <span className="hidden md:flex items-center gap-1.5 text-[#86EFAC]">
                  <Sparkles className="w-3.5 h-3.5 text-[#86EFAC] shrink-0" />
                  <span>WhatsApp: +{whatsappNumber}</span>
                </span>
              </>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
