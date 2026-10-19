import React from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { Clock, Phone, Lock, Sparkles, MapPin, Navigation, Compass, ExternalLink } from 'lucide-react';
import { buildWhatsAppUrl } from '../utils/whatsapp.ts';

interface FooterProps {
  whatsappNumber: string;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ whatsappNumber, onOpenAdmin }) => {
  const { t } = useLanguage();

  const officialAddress = "H. No. 69, Ilapur Rd, Durgamata Colony, Tanda, Hyderabad, Telangana 502032, India";
  const directionsUrl = "https://maps.app.goo.gl/MW8VymLaxdTiAjZm6";
  const coordinatesUrl = "https://www.google.com/maps?q=17.53725,78.321972&utm_source=chatgpt.com";

  const handleWhatsAppContact = () => {
    if (!whatsappNumber) {
      alert(t.numberNotConfigured);
      return;
    }
    const { url } = buildWhatsAppUrl(
      whatsappNumber,
      `Hello Sri Durga Mata Stationery, I would like to contact your shop.`
    );
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <footer className="mt-12 bg-[#2B0309] border-t-2 border-[#D4AF37]/40 text-[#F3E2B8]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Main Footer Info */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-6 pb-6 border-b border-[#D4AF37]/20">
          <div className="space-y-2 max-w-md">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F5C542] fill-[#F5C542]" />
              <h3 className="font-extrabold text-base text-white font-serif-royal">
                Sri Durga Mata Stationery
              </h3>
            </div>
            <p className="text-xs font-bold text-[#FDE68A] tracking-widest uppercase">
              BOOK STALL &amp; FANCY ITEMS
            </p>
            <p className="text-xs text-[#F3E2B8]/70">
              {t.footerTagline}
            </p>

            {/* Address */}
            <div className="pt-2 text-xs text-[#F3E2B8]/90 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#F5C542] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Shop Address:</span>
                <p className="text-[11px] text-[#F3E2B8]/80 leading-relaxed">{officialAddress}</p>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px]">
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#86EFAC] hover:underline font-bold"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Get Directions</span>
                  </a>
                  <span className="text-[#D4AF37]/40">•</span>
                  <a
                    href={coordinatesUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#FDE68A] hover:underline"
                  >
                    <Compass className="w-3 h-3" />
                    <span>View Coordinates</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-xs text-[#F3E2B8]/80 shrink-0">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#F5C542]" />
              <span>{t.shopTimingsVal}</span>
            </div>
            {whatsappNumber && (
              <button
                onClick={handleWhatsAppContact}
                className="flex items-center gap-2 text-[#86EFAC] hover:underline font-bold cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>WhatsApp: +{whatsappNumber}</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom bar with discreet Admin Login */}
        <div className="pt-4 flex items-center justify-between text-[11px] text-[#F3E2B8]/60">
          <div>
            {t.copyright}
          </div>

          {/* Discreet Admin Login Link */}
          <div>
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 text-[11px] text-[#D4AF37]/70 hover:text-[#FDE68A] transition-colors cursor-pointer"
              title="Shop Owner Login"
            >
              <Lock className="w-3 h-3" />
              <span>{t.adminLoginLink}</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
