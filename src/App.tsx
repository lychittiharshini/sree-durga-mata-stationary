/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext.tsx';
import { Header } from './components/Header.tsx';
import { RoyalStationeryBanner } from './components/RoyalStationeryBanner.tsx';
import { ServicesOverview } from './components/ServicesOverview.tsx';
import { XeroxSection } from './components/XeroxSection.tsx';
import { StationerySection } from './components/StationerySection.tsx';
import { OptionalPublishedContent } from './components/OptionalPublishedContent.tsx';
import { ReviewModal, ReviewModalData } from './components/ReviewModal.tsx';
import { AdminPanelModal } from './components/AdminPanelModal.tsx';
import { Footer } from './components/Footer.tsx';
import { fetchPublicSettings, XeroxRates } from './services/api.ts';

type AppView = 'home' | 'xerox' | 'stationery';

function MainContent() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [whatsappNumber, setWhatsappNumber] = useState<string>('919876543210');
  const [xeroxRates, setXeroxRates] = useState<XeroxRates>({
    bw_single: 5,
    bw_double: 6,
    color_single: 10,
    color_double: 20
  });

  // Modals
  const [reviewData, setReviewData] = useState<ReviewModalData | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Fetch shop settings (WhatsApp number & Xerox rates) on load
  useEffect(() => {
    fetchPublicSettings()
      .then((data) => {
        if (data.whatsappNumber) {
          setWhatsappNumber(data.whatsappNumber);
        }
        if (data.xeroxRates) {
          setXeroxRates(data.xeroxRates);
        }
      })
      .catch((err) => {
        console.warn('Could not load public settings:', err);
      });
  }, []);

  const handleSelectService = (service: 'xerox' | 'stationery') => {
    setCurrentView(service);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-maroon-pattern text-slate-100 selection:bg-[#F5C542] selection:text-[#3B050E]">
      
      {/* 1. Header with Maroon Background, Gold Details, Language Selector, and WhatsApp button */}
      <Header whatsappNumber={whatsappNumber} />

      {/* Main View Area */}
      <main className="flex-1 py-2 sm:py-4">
        {currentView === 'home' && (
          <div className="space-y-4 sm:space-y-6">
            {/* 2. Large Beautiful Stationery Banner with Ornate Gold Frame & Shop Info Strip */}
            <RoyalStationeryBanner whatsappNumber={whatsappNumber} />

            {/* 3. Select Service Heading & Exactly Two Cream Service Cards (Xerox & Stationery) */}
            <ServicesOverview onSelectService={handleSelectService} />

            {/* 4. Optional Published Content (Admin Offers, Images, Extra Services ONLY if published) */}
            <OptionalPublishedContent />
          </div>
        )}

        {currentView === 'xerox' && (
          <XeroxSection
            whatsappNumber={whatsappNumber}
            rates={xeroxRates}
            onBackToHome={handleBackToHome}
            onOpenReview={(data) => setReviewData(data)}
          />
        )}

        {currentView === 'stationery' && (
          <StationerySection
            whatsappNumber={whatsappNumber}
            onBackToHome={handleBackToHome}
            onOpenReview={(data) => setReviewData(data)}
          />
        )}
      </main>

      {/* 5. Elegant Maroon & Gold Footer with Discreet Admin Login Link */}
      <Footer
        whatsappNumber={whatsappNumber}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Review Modal: Requires Customer Name and generates English WhatsApp enquiry */}
      <ReviewModal
        data={reviewData}
        onClose={() => setReviewData(null)}
      />

      {/* Separate Admin Management Modal */}
      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        currentWhatsAppNumber={whatsappNumber}
        onNumberUpdated={(newNum) => setWhatsappNumber(newNum)}
        currentXeroxRates={xeroxRates}
        onXeroxRatesUpdated={(newRates) => setXeroxRates(newRates)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainContent />
    </LanguageProvider>
  );
}
