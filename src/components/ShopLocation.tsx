import React from 'react';
import { MapPin, Navigation, Compass, Clock, Phone, Sparkles, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { buildWhatsAppUrl } from '../utils/whatsapp.ts';

interface ShopLocationProps {
  whatsappNumber?: string;
  className?: string;
}

export const ShopLocation: React.FC<ShopLocationProps> = ({ whatsappNumber, className = '' }) => {
  const { t } = useLanguage();

  const officialAddress = "H. No. 69, Ilapur Rd, Durgamata Colony, Tanda, Hyderabad, Telangana 502032, India";
  const directionsUrl = "https://maps.app.goo.gl/MW8VymLaxdTiAjZm6";
  const coordinatesUrl = "https://www.google.com/maps?q=17.53725,78.321972&utm_source=chatgpt.com";

  const handleWhatsAppHelp = () => {
    if (!whatsappNumber) return;
    const { url } = buildWhatsAppUrl(
      whatsappNumber,
      `Hello Sri Durga Mata Stationery, I would like directions or assistance reaching your shop at ${officialAddress}.`
    );
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section id="shop-location" className={`w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-8 ${className}`}>
      {/* Decorative Royal Heading */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5A0B16] border border-[#F5C542]/60 text-[#FDE68A] text-xs font-bold uppercase tracking-widest shadow-sm mb-2">
          <MapPin className="w-3.5 h-3.5 text-[#F5C542]" />
          <span>Shop Location &amp; Directions</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white font-serif-royal">
          Visit Our Stationery &amp; Xerox Shop
        </h2>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#D4AF37]" />
          <Sparkles className="w-4 h-4 text-[#F5C542] fill-[#F5C542]" />
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#D4AF37]" />
        </div>
      </div>

      {/* Main Container Card in Elegant Cream & Gold */}
      <div className="bg-gradient-to-b from-[#FFFDF9] to-[#FAF5EB] rounded-2xl sm:rounded-3xl border-2 border-[#D4AF37] shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          
          {/* Left Column: Address, Action Buttons & Shop Details (5 cols on lg) */}
          <div className="lg:col-span-5 p-5 sm:p-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#E8DEC8]">
            <div className="space-y-4">
              {/* Shop Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7B1123] text-[#FDE68A] text-xs font-bold shadow-xs">
                <Sparkles className="w-3 h-3 text-[#F5C542]" />
                <span>Sri Durga Mata Stationery</span>
              </div>

              {/* Subtitle */}
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                BOOK STALL &amp; FANCY ITEMS
              </h3>

              {/* Official Address Display */}
              <div className="p-3.5 bg-white border border-[#DACBB7] rounded-xl shadow-2xs space-y-1.5">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-5 h-5 text-[#7B1123] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                      Official Shop Address
                    </span>
                    <p className="text-xs sm:text-sm font-extrabold text-slate-900 leading-relaxed">
                      {officialAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timings */}
              <div className="flex items-center gap-2 text-xs text-slate-700 bg-[#FAF0E6] p-2.5 rounded-xl border border-[#ECD9C5]">
                <Clock className="w-4 h-4 text-[#7B1123] shrink-0" />
                <span className="font-bold">{t.shopTimingsVal || 'Open 7 Days a Week: 7:00 AM - 10:00 PM'}</span>
              </div>

              {/* Direction & Navigation Links */}
              <div className="space-y-2.5 pt-1">
                {/* 1. Primary "Get Directions" Button */}
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl font-black text-xs sm:text-sm text-white bg-gradient-to-r from-[#16A34A] to-[#15803D] hover:from-[#15803D] hover:to-[#14532D] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Navigation className="w-4 h-4 fill-white" />
                  <span>Get Directions</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>

                {/* 2. Coordinates Link */}
                <a
                  href={coordinatesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl font-bold text-xs text-slate-700 bg-white hover:bg-slate-50 border border-[#DACBB7] hover:border-[#7B1123] shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                >
                  <Compass className="w-4 h-4 text-[#7B1123]" />
                  <span>Open Coordinates: 17.53725, 78.321972</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

                {/* 3. Quick WhatsApp query */}
                {whatsappNumber && (
                  <button
                    type="button"
                    onClick={handleWhatsAppHelp}
                    className="w-full py-2.5 px-3 rounded-xl font-bold text-xs text-[#7B1123] bg-[#FFF8F0] hover:bg-[#FCEFE3] border border-[#E7DCCE] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Ask for Assistance via WhatsApp</span>
                  </button>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic mt-4 pt-3 border-t border-[#E8DEC8]">
              Located on Ilapur Road near Durgamata Colony, Tanda. Photocopying, school books, fancy gifts &amp; stationery available all 7 days.
            </p>
          </div>

          {/* Right Column: Embedded Responsive Google Map (7 cols on lg) */}
          <div className="lg:col-span-7 bg-slate-100 p-2 sm:p-3 flex flex-col items-center justify-center">
            <div className="w-full h-[360px] sm:h-[450px] rounded-xl sm:rounded-2xl overflow-hidden border-2 border-[#D4AF37]/50 shadow-inner bg-slate-200">
              <iframe
                title="Sri Durga Mata Stationery Book Stall and Fancy Items Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3804.3761529470953!2d78.31944207493834!3d17.537268983375718!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb8d5c9c08441b%3A0xd6a3477cdd4023b2!2sSri%20Durga%20Mata%20Stationery%20Book%20Stall%20and%20Fancy%20Items!5e0!3m2!1sen!2sin!4v1792414165494!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, width: '100%', height: '100%', maxWidth: '600px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ShopLocation;
