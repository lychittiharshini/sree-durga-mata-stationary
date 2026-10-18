import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Plus, Minus, Trash2, Send, PlusCircle, ShoppingBag, Check, BookOpen } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { fetchProducts, ProductItem } from '../services/api.ts';
import { formatStationeryWhatsAppMessage, buildWhatsAppUrl, StationeryRequestItem } from '../utils/whatsapp.ts';

interface StationerySectionProps {
  whatsappNumber: string;
  onBackToHome: () => void;
  onOpenReview: (summary: {
    title: string;
    items: Array<{ name: string; quantity: number; price?: number | null; total?: number; offerNote?: string }>;
    totalAmount: number;
    notes?: string;
    onConfirmWhatsApp: (customerName: string) => void;
  }) => void;
}

export const StationerySection: React.FC<StationerySectionProps> = ({
  whatsappNumber,
  onBackToHome,
  onOpenReview
}) => {
  const { t } = useLanguage();

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [catalogQuantities, setCatalogQuantities] = useState<Record<number, number>>({});

  const [requestItems, setRequestItems] = useState<StationeryRequestItem[]>([]);
  const [customerGeneralNote, setCustomerGeneralNote] = useState<string>('');

  const [customName, setCustomName] = useState<string>('');
  const [customQty, setCustomQty] = useState<number>(1);
  const [customNotes, setCustomNotes] = useState<string>('');

  const [notification, setNotification] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchProducts(searchQuery, selectedCategory)
      .then((data) => {
        if (isMounted) {
          setProducts(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching products:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [searchQuery, selectedCategory]);

  const setCardQty = (productId: number, delta: number) => {
    setCatalogQuantities(prev => {
      const cur = prev[productId] || 1;
      return { ...prev, [productId]: Math.max(1, Math.min(100, cur + delta)) };
    });
  };

  const addProductToRequest = (product: ProductItem) => {
    if (!product.is_available) return;

    const qty = catalogQuantities[product.id] || 1;

    setRequestItems(prev => {
      const existingIdx = prev.findIndex(item => item.id === product.id && !item.isCustom);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].quantity += qty;
        return updated;
      } else {
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            quantity: qty,
            price: product.price,
            isCustom: false
          }
        ];
      }
    });

    setNotification(`${product.name} (${qty}) added!`);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) {
      setErrorMessage('Please enter the name of the required item.');
      return;
    }
    if (customQty < 1) {
      setErrorMessage(t.invalidQty);
      return;
    }

    setRequestItems(prev => [
      ...prev,
      {
        name: customName.trim(),
        quantity: customQty,
        price: null,
        isCustom: true,
        notes: customNotes.trim() || undefined
      }
    ]);

    setCustomName('');
    setCustomQty(1);
    setCustomNotes('');
    setErrorMessage(null);
    setNotification(t.itemAddedSuccess);
    setTimeout(() => setNotification(null), 2500);
  };

  const updateRequestItemQty = (index: number, delta: number) => {
    setRequestItems(prev => {
      const copy = [...prev];
      const nextQty = copy[index].quantity + delta;
      if (nextQty <= 0) {
        return copy.filter((_, i) => i !== index);
      }
      copy[index].quantity = nextQty;
      return copy;
    });
  };

  const removeRequestItem = (index: number) => {
    setRequestItems(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllRequests = () => {
    setRequestItems([]);
    setCustomerGeneralNote('');
    setErrorMessage(null);
  };

  const pricedItems = requestItems.filter(item => item.price !== null && item.price !== undefined);
  const estimatedKnownTotal = pricedItems.reduce((sum, item) => sum + (item.price! * item.quantity), 0);
  const hasUnpricedItems = requestItems.some(item => item.price === null || item.price === undefined);
  const totalItemCount = requestItems.reduce((sum, item) => sum + item.quantity, 0);

  const categories = ['All', 'Notebooks & Paper', 'Pens & Writing', 'Office & School', 'Art & Craft', 'General'];

  const handleReviewClick = () => {
    if (requestItems.length === 0) {
      setErrorMessage(t.emptyRequestDesc);
      return;
    }

    if (!whatsappNumber) {
      setErrorMessage(t.numberNotConfigured);
      return;
    }

    onOpenReview({
      title: t.stationeryHeading,
      items: requestItems.map(item => ({
        name: item.name + (item.isCustom ? ` (${t.customItemBadge})` : ''),
        quantity: item.quantity,
        price: item.price,
        total: item.price ? item.price * item.quantity : undefined
      })),
      totalAmount: estimatedKnownTotal,
      notes: customerGeneralNote,
      onConfirmWhatsApp: (customerName: string) => {
        const message = formatStationeryWhatsAppMessage(
          customerName,
          requestItems,
          estimatedKnownTotal,
          hasUnpricedItems,
          customerGeneralNote
        );

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

      {/* Section Header */}
      <div className="border-b border-[#D4AF37]/30 pb-4 mb-6">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-8 h-8 rounded-xl bg-[#14532D] border border-[#86EFAC]/60 text-[#86EFAC] flex items-center justify-center shadow-xs">
            <BookOpen className="w-4 h-4" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-serif-royal">
            {t.stationeryHeading}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#F3E2B8]/80">
          {t.stationerySubheading}
        </p>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* 1. Custom Unlisted Item Form in Cream & Gold */}
      <div className="bg-gradient-to-b from-[#FFFDF9] to-[#FAF6EE] rounded-3xl border-2 border-[#D4AF37]/60 p-5 sm:p-6 shadow-xl mb-6">
        <div className="flex items-center gap-2 mb-2">
          <PlusCircle className="w-5 h-5 text-[#7B1123]" />
          <h4 className="font-black text-base text-slate-900 font-serif-royal">
            {t.customItemHeading}
          </h4>
        </div>
        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          {t.customItemDesc}
        </p>

        <form onSubmit={handleAddCustomItem} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <div className="sm:col-span-3">
              <input
                type="text"
                required
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={t.customItemNamePlaceholder}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-white border border-[#DACBB7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B1123] text-slate-800"
              />
            </div>
            <div className="sm:col-span-1">
              <input
                type="number"
                min="1"
                max="1000"
                required
                value={customQty}
                onChange={(e) => setCustomQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                placeholder={t.customItemQtyPlaceholder}
                className="w-full text-xs sm:text-sm px-3 py-2.5 bg-white border border-[#DACBB7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B1123] text-slate-800 text-center font-bold"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder={t.customItemNotePlaceholder}
              className="flex-1 text-xs px-3.5 py-2.5 bg-white border border-[#DACBB7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B1123] text-slate-800"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl text-xs font-black text-white bg-[#7B1123] hover:bg-[#5C0B18] transition-colors shadow-md cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addCustomItemBtn}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Catalog Products (Search + List) */}
      <div className="mb-6">
        {/* Search & Categories Bar */}
        <div className="bg-[#FFFDF9] rounded-2xl border-2 border-[#D4AF37]/40 p-3 sm:p-4 shadow-md mb-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white border border-[#DACBB7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#166534] text-slate-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#166534] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-[#F5ECE0] border border-slate-200'
                }`}
              >
                {cat === 'All' ? t.allCategories : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="py-10 text-center text-[#FDE68A] text-xs font-semibold">Loading items...</div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((product) => {
              const qty = catalogQuantities[product.id] || 1;
              return (
                <div
                  key={product.id}
                  className="bg-gradient-to-b from-[#FFFDF9] to-[#FAF6EE] rounded-2xl border-2 border-[#D4AF37]/35 p-4 flex flex-col justify-between shadow-md hover:border-[#D4AF37] transition-all"
                >
                  <div>
                    {product.image_url && (
                      <div className="h-32 w-full mb-3 rounded-xl overflow-hidden bg-white flex items-center justify-center border border-slate-100">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-1.5">
                      <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                        {product.name}
                      </h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                        product.is_available 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        {product.is_available ? t.inStock : t.outOfStock}
                      </span>
                    </div>
                    {product.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E8DEC8]">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-base font-black text-[#7B1123]">
                        {product.price !== null && product.price !== undefined ? `₹${product.price}` : t.priceNotListed}
                      </span>

                      {product.is_available && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setCardQty(product.id, -1)}
                            className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-xs font-extrabold text-slate-800">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => setCardQty(product.id, 1)}
                            className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={!product.is_available}
                      onClick={() => addProductToRequest(product)}
                      className="w-full py-1.5 px-3 rounded-xl text-xs font-black text-white bg-[#166534] hover:bg-[#14532D] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t.addToRequest}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#FFFDF9] rounded-3xl border-2 border-dashed border-[#D4AF37]/50 p-6 text-center shadow-md">
            <ShoppingBag className="w-10 h-10 mx-auto text-amber-700/60 mb-2" />
            <h4 className="font-extrabold text-slate-800 text-base font-serif-royal">{t.emptyCatalogTitle}</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1 leading-relaxed">
              {t.emptyCatalogDesc}
            </p>
          </div>
        )}
      </div>

      {/* 3. Request Basket & WhatsApp Action in Cream & Gold */}
      <div className="bg-gradient-to-b from-[#FFFDF9] to-[#FAF6EE] rounded-3xl border-2 border-[#D4AF37] p-5 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E8DEC8] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#166534]" />
            <h3 className="font-black text-base text-slate-900 font-serif-royal">
              {t.requestSummaryTitle}
            </h3>
          </div>
          {requestItems.length > 0 && (
            <button
              type="button"
              onClick={clearAllRequests}
              className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-800 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.clearRequestBtn}</span>
            </button>
          )}
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {errorMessage}
          </div>
        )}

        {requestItems.length > 0 ? (
          <div className="space-y-2.5 mb-5">
            {requestItems.map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-white border border-[#EADBCA] flex items-center justify-between gap-2 text-xs shadow-2xs">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">{item.name}</span>
                    {item.isCustom && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                        Custom
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    {item.price !== null && item.price !== undefined ? (
                      <span className="font-bold text-emerald-800">
                        ₹{item.price} &times; {item.quantity} = ₹{item.price * item.quantity}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">Price to be confirmed</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateRequestItemQty(idx, -1)}
                    className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-300 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-xs font-black text-slate-800">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateRequestItemQty(idx, 1)}
                    className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-300 cursor-pointer"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => removeRequestItem(idx)}
                    className="w-6 h-6 ml-1 text-slate-400 hover:text-rose-600 cursor-pointer flex items-center justify-center font-bold"
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}

            <div className="pt-3 border-t border-[#E8DEC8]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Total Items:</span>
                <span className="font-extrabold text-slate-900">{totalItemCount}</span>
              </div>
              {estimatedKnownTotal > 0 && (
                <div className="flex items-center justify-between mt-1 text-sm">
                  <span className="font-bold text-slate-800">{t.estimatedTotal}:</span>
                  <span className="text-xl font-black text-[#7B1123]">₹{estimatedKnownTotal}</span>
                </div>
              )}
              {hasUnpricedItems && (
                <p className="text-[10px] text-slate-500 mt-1.5 bg-amber-50/70 p-2 rounded-lg border border-amber-200/60">
                  * Includes items with price to be confirmed by the shop.
                </p>
              )}
            </div>

            {/* General Note */}
            <div className="pt-2">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {t.addCustomerNote}:
              </label>
              <textarea
                rows={2}
                value={customerGeneralNote}
                onChange={(e) => setCustomerGeneralNote(e.target.value)}
                placeholder={t.notePlaceholder}
                className="w-full text-xs text-slate-800 placeholder-slate-400 bg-white border border-[#DACBB7] rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#166534] resize-none"
              />
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-slate-400 text-xs font-medium">
            {t.emptyRequestDesc}
          </div>
        )}

        <div className="pt-2">
          <button
            type="button"
            disabled={requestItems.length === 0}
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
