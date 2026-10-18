import React, { useEffect, useState } from 'react';
import { Tag, Sparkles, Image as ImageIcon, Briefcase } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { fetchOffers, fetchShopImages, fetchAdditionalServices, OfferItem, ShopImageItem, AdditionalServiceItem } from '../services/api.ts';

export const OptionalPublishedContent: React.FC = () => {
  const { t } = useLanguage();
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [images, setImages] = useState<ShopImageItem[]>([]);
  const [services, setServices] = useState<AdditionalServiceItem[]>([]);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([fetchOffers(), fetchShopImages(), fetchAdditionalServices()])
      .then(([offersData, imagesData, servicesData]) => {
        if (isMounted) {
          setOffers(offersData);
          setImages(imagesData);
          setServices(servicesData);
          setHasLoaded(true);
        }
      })
      .catch(() => {
        if (isMounted) setHasLoaded(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!hasLoaded) return null;

  const hasAnyContent = offers.length > 0 || images.length > 0 || services.length > 0;
  if (!hasAnyContent) {
    // If no content, do NOT render empty boxes or placeholders per prompt!
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 space-y-8">
      
      {/* 1. Admin Published Offers */}
      {offers.length > 0 && (
        <section className="bg-amber-50/70 border-2 border-amber-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-amber-700" />
            <h3 className="font-extrabold text-base text-slate-800">
              {t.specialOffersHeading}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {offers.map((offer) => (
              <div key={offer.id} className="bg-white rounded-xl border border-amber-200 p-4 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{offer.title}</h4>
                    {offer.discount_percentage ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white shrink-0">
                        {offer.discount_percentage}% OFF
                      </span>
                    ) : offer.offer_price ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white shrink-0">
                        ₹{offer.offer_price}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{offer.description}</p>
                  {offer.applicable_item && (
                    <span className="inline-block mt-2 text-[11px] font-semibold text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded-md">
                      Item: {offer.applicable_item}
                    </span>
                  )}
                </div>
                {(offer.start_date || offer.end_date) && (
                  <p className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                    Valid: {offer.start_date || 'Now'} {offer.end_date ? `to ${offer.end_date}` : ''}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. Admin Published Shop Images */}
      {images.length > 0 && (
        <section className="bg-white border border-[#E7DCCE] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="w-5 h-5 text-[#7B1123]" />
            <h3 className="font-extrabold text-base text-slate-800">
              {t.shopGalleryHeading}
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((img) => (
              <div key={img.id} className="group relative rounded-xl overflow-hidden bg-slate-100 aspect-square border border-slate-200 shadow-2xs">
                <img
                  src={img.image_url}
                  alt={img.title || 'Shop Image'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {img.title && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-2 text-white text-[11px] font-bold truncate">
                    {img.title}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Admin Published Additional Services */}
      {services.length > 0 && (
        <section className="bg-white border border-[#E7DCCE] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-[#166534]" />
            <h3 className="font-extrabold text-base text-slate-800">
              {t.additionalServicesHeading}
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {services.map((svc) => (
              <div key={svc.id} className="py-3 first:pt-0 last:pb-0">
                <h4 className="font-bold text-slate-900 text-sm">{svc.service_name}</h4>
                <p className="text-xs text-slate-600 mt-0.5">{svc.description}</p>
                {svc.details && (
                  <p className="text-[11px] text-slate-500 mt-1 italic">{svc.details}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
