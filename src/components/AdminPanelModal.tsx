import React, { useState, useEffect } from 'react';
import { 
  X, Lock, Save, LogOut, CheckCircle2, AlertCircle, AlertTriangle, Phone, 
  Package, Tag, Image as ImageIcon, Briefcase, Plus, Trash2, Edit2, ShieldAlert, Printer
} from 'lucide-react';
import { 
  loginAdmin, logoutAdmin, checkAdminSession, updateShopWhatsAppNumber,
  fetchAdminProducts, createAdminProduct, updateAdminProduct, deleteAdminProduct, ProductItem,
  fetchAdminOffers, createAdminOffer, updateAdminOffer, deleteAdminOffer, OfferItem,
  fetchShopImages, addAdminShopImage, deleteAdminShopImage, ShopImageItem,
  fetchAdminAdditionalServices, createAdminAdditionalService, updateAdminAdditionalService, deleteAdminAdditionalService, AdditionalServiceItem,
  XeroxRates, updateXeroxRates, fetchXeroxRates
} from '../services/api.ts';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWhatsAppNumber: string;
  onNumberUpdated: (newNumber: string) => void;
  currentXeroxRates?: XeroxRates;
  onXeroxRatesUpdated?: (rates: XeroxRates) => void;
}

type AdminTab = 'whatsapp' | 'xerox_rates' | 'products' | 'offers' | 'images' | 'services';

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  currentWhatsAppNumber,
  onNumberUpdated,
  currentXeroxRates,
  onXeroxRatesUpdated
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string>('');
  const [adminUsername, setAdminUsername] = useState<string>('');
  const [activeTab, setActiveTab] = useState<AdminTab>('whatsapp');

  // Login form state
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Status message
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Tab 1: WhatsApp number
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [savePhoneLoading, setSavePhoneLoading] = useState<boolean>(false);

  // Tab 2: Products state
  const [adminProducts, setAdminProducts] = useState<ProductItem[]>([]);
  const [newProdName, setNewProdName] = useState<string>('');
  const [newProdDesc, setNewProdDesc] = useState<string>('');
  const [newProdPrice, setNewProdPrice] = useState<string>('');
  const [newProdCategory, setNewProdCategory] = useState<string>('General');
  const [newProdImage, setNewProdImage] = useState<string>('');
  const [newProdAvailable, setNewProdAvailable] = useState<boolean>(true);
  const [editingProdId, setEditingProdId] = useState<number | null>(null);

  // Delete product confirmation modal state
  const [productToDelete, setProductToDelete] = useState<ProductItem | null>(null);
  const [deleteProductLoading, setDeleteProductLoading] = useState<boolean>(false);

  // Tab 3: Offers state
  const [adminOffers, setAdminOffers] = useState<OfferItem[]>([]);
  const [offerTitle, setOfferTitle] = useState<string>('');
  const [offerDesc, setOfferDesc] = useState<string>('');
  const [offerItem, setOfferItem] = useState<string>('');
  const [offerPrice, setOfferPrice] = useState<string>('');
  const [offerDiscount, setOfferDiscount] = useState<string>('');
  const [offerDates, setOfferDates] = useState<string>('');

  // Tab 4: Shop Images state
  const [adminImages, setAdminImages] = useState<ShopImageItem[]>([]);
  const [newImgUrl, setNewImgUrl] = useState<string>('');
  const [newImgTitle, setNewImgTitle] = useState<string>('');

  // Tab 5: Additional Services state
  const [adminServices, setAdminServices] = useState<AdditionalServiceItem[]>([]);
  const [newSvcName, setNewSvcName] = useState<string>('');
  const [newSvcDesc, setNewSvcDesc] = useState<string>('');

  // Tab 6: Xerox Rates state (Editable)
  const [bwSingleRate, setBwSingleRate] = useState<string>('5');
  const [bwDoubleRate, setBwDoubleRate] = useState<string>('6');
  const [colorSingleRate, setColorSingleRate] = useState<string>('10');
  const [colorDoubleRate, setColorDoubleRate] = useState<string>('20');
  const [saveRatesLoading, setSaveRatesLoading] = useState<boolean>(false);

  const showSuccess = (msg: string) => {
    setActionSuccess(msg);
    setActionError(null);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const showError = (msg: string) => {
    setActionError(msg);
    setActionSuccess(null);
  };

  // Check existing session
  useEffect(() => {
    if (isOpen) {
      setPhoneInput(currentWhatsAppNumber || '');
      setActionSuccess(null);
      setActionError(null);

      if (currentXeroxRates) {
        setBwSingleRate(String(currentXeroxRates.bw_single));
        setBwDoubleRate(String(currentXeroxRates.bw_double));
        setColorSingleRate(String(currentXeroxRates.color_single));
        setColorDoubleRate(String(currentXeroxRates.color_double));
      } else {
        fetchXeroxRates().then(rates => {
          setBwSingleRate(String(rates.bw_single));
          setBwDoubleRate(String(rates.bw_double));
          setColorSingleRate(String(rates.color_single));
          setColorDoubleRate(String(rates.color_double));
        }).catch(() => {});
      }

      const savedToken = sessionStorage.getItem('admin_token');
      if (savedToken) {
        checkAdminSession(savedToken).then((res) => {
          if (res.authenticated && res.user) {
            setIsAuthenticated(true);
            setToken(savedToken);
            setAdminUsername(res.user.username);
            loadAdminData(savedToken);
          } else {
            setIsAuthenticated(false);
            setToken('');
          }
        });
      }
    }
  }, [isOpen, currentWhatsAppNumber, currentXeroxRates]);

  const loadAdminData = (authToken: string) => {
    fetchAdminProducts(authToken).then(setAdminProducts).catch(() => {});
    fetchAdminOffers(authToken).then(setAdminOffers).catch(() => {});
    fetchShopImages().then(setAdminImages).catch(() => {});
    fetchAdminAdditionalServices(authToken).then(setAdminServices).catch(() => {});
  };

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await loginAdmin(usernameInput, passwordInput);
      setIsAuthenticated(true);
      setToken(res.token);
      setAdminUsername(res.username);
      sessionStorage.setItem('admin_token', res.token);
      setPasswordInput('');
      loadAdminData(res.token);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin();
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setToken('');
    setAdminUsername('');
    sessionStorage.removeItem('admin_token');
  };

  // 1. WhatsApp Number Save
  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavePhoneLoading(true);
    try {
      const res = await updateShopWhatsAppNumber(phoneInput, token);
      showSuccess('WhatsApp number saved and updated successfully!');
      onNumberUpdated(res.whatsappNumber);
      setPhoneInput(res.whatsappNumber);
    } catch (err: any) {
      showError(err.message || 'Failed to update WhatsApp number');
    } finally {
      setSavePhoneLoading(false);
    }
  };

  // 2. Product Management
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) {
      showError('Product name is required');
      return;
    }

    try {
      if (editingProdId) {
        await updateAdminProduct(editingProdId, {
          name: newProdName,
          description: newProdDesc,
          price: newProdPrice ? Number(newProdPrice) : null,
          category: newProdCategory,
          image_url: newProdImage,
          is_available: newProdAvailable
        }, token);
        const refreshed = await fetchAdminProducts(token);
        setAdminProducts(refreshed);
        showSuccess('Product updated successfully in PostgreSQL database!');
      } else {
        await createAdminProduct({
          name: newProdName,
          description: newProdDesc,
          price: newProdPrice ? Number(newProdPrice) : null,
          category: newProdCategory,
          image_url: newProdImage,
          is_available: newProdAvailable
        }, token);
        const refreshed = await fetchAdminProducts(token);
        setAdminProducts(refreshed);
        showSuccess('Product added to catalog and database!');
      }

      // Reset form
      setNewProdName('');
      setNewProdDesc('');
      setNewProdPrice('');
      setNewProdCategory('General');
      setNewProdImage('');
      setNewProdAvailable(true);
      setEditingProdId(null);
    } catch (err: any) {
      showError(err.message || 'Failed to save product');
    }
  };

  const startEditProduct = (prod: ProductItem) => {
    setEditingProdId(prod.id);
    setNewProdName(prod.name);
    setNewProdDesc(prod.description || '');
    setNewProdPrice(prod.price !== null && prod.price !== undefined ? String(prod.price) : '');
    setNewProdCategory(prod.category || 'General');
    setNewProdImage(prod.image_url || '');
    setNewProdAvailable(prod.is_available);
  };

  const cancelEditProduct = () => {
    setEditingProdId(null);
    setNewProdName('');
    setNewProdDesc('');
    setNewProdPrice('');
    setNewProdCategory('General');
    setNewProdImage('');
    setNewProdAvailable(true);
  };

  const handleRequestDeleteProduct = (prod: ProductItem) => {
    setActionError(null);
    setProductToDelete(prod);
  };

  const handleCancelDeleteProduct = () => {
    if (deleteProductLoading) return;
    setProductToDelete(null);
  };

  const handleConfirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setDeleteProductLoading(true);
    const target = productToDelete;
    try {
      await deleteAdminProduct(target.id, token);
      // Immediately refresh the entire inventory list from the PostgreSQL database
      const refreshed = await fetchAdminProducts(token);
      setAdminProducts(refreshed);
      setProductToDelete(null);
      showSuccess(`Product "${target.name}" deleted permanently.`);
    } catch (err: any) {
      showError(err.message || 'Failed to delete product from database');
      // On error, the product is NOT removed from state
    } finally {
      setDeleteProductLoading(false);
    }
  };

  const handleToggleProductStock = async (prod: ProductItem) => {
    try {
      await updateAdminProduct(prod.id, { is_available: !prod.is_available }, token);
      const refreshed = await fetchAdminProducts(token);
      setAdminProducts(refreshed);
      showSuccess(`Status changed: ${!prod.is_available ? 'In Stock' : 'Out of Stock'}`);
    } catch (err: any) {
      showError(err.message || 'Failed to change stock status');
    }
  };

  // 3. Offers Management
  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerTitle.trim() || !offerDesc.trim()) {
      showError('Title and description are required for offers');
      return;
    }
    try {
      const created = await createAdminOffer({
        title: offerTitle,
        description: offerDesc,
        applicable_item: offerItem || undefined,
        offer_price: offerPrice ? Number(offerPrice) : null,
        discount_percentage: offerDiscount ? Number(offerDiscount) : null,
        start_date: offerDates || undefined,
        is_active: true
      }, token);
      setAdminOffers(prev => [created, ...prev]);
      setOfferTitle('');
      setOfferDesc('');
      setOfferItem('');
      setOfferPrice('');
      setOfferDiscount('');
      setOfferDates('');
      showSuccess('Offer published successfully!');
    } catch (err: any) {
      showError(err.message || 'Failed to publish offer');
    }
  };

  const handleDeleteOffer = async (id: number) => {
    try {
      await deleteAdminOffer(id, token);
      setAdminOffers(prev => prev.filter(o => o.id !== id));
      showSuccess('Offer removed.');
    } catch (err: any) {
      showError(err.message || 'Failed to delete offer');
    }
  };

  // 4. Shop Images Management
  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImgUrl.trim()) {
      showError('Image URL or Data URI is required');
      return;
    }
    try {
      const created = await addAdminShopImage({
        image_url: newImgUrl.trim(),
        title: newImgTitle.trim() || undefined
      }, token);
      setAdminImages(prev => [created, ...prev]);
      setNewImgUrl('');
      setNewImgTitle('');
      showSuccess('Shop image added to gallery!');
    } catch (err: any) {
      showError(err.message || 'Failed to add image');
    }
  };

  const handleDeleteImage = async (id: number) => {
    try {
      await deleteAdminShopImage(id, token);
      setAdminImages(prev => prev.filter(img => img.id !== id));
      showSuccess('Shop image removed.');
    } catch (err: any) {
      showError(err.message || 'Failed to delete image');
    }
  };

  // 5. Additional Services Management
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSvcName.trim() || !newSvcDesc.trim()) {
      showError('Service name and description are required');
      return;
    }
    try {
      const created = await createAdminAdditionalService({
        service_name: newSvcName.trim(),
        description: newSvcDesc.trim(),
        is_active: true
      }, token);
      setAdminServices(prev => [...prev, created]);
      setNewSvcName('');
      setNewSvcDesc('');
      showSuccess('Additional service added!');
    } catch (err: any) {
      showError(err.message || 'Failed to add service');
    }
  };

  const handleDeleteService = async (id: number) => {
    try {
      await deleteAdminAdditionalService(id, token);
      setAdminServices(prev => prev.filter(s => s.id !== id));
      showSuccess('Service deleted.');
    } catch (err: any) {
      showError(err.message || 'Failed to delete service');
    }
  };

  // 6. Xerox Rates Management
  const handleSaveRates = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveRatesLoading(true);

    const bwSingle = parseFloat(bwSingleRate);
    const bwDouble = parseFloat(bwDoubleRate);
    const colorSingle = parseFloat(colorSingleRate);
    const colorDouble = parseFloat(colorDoubleRate);

    if (
      isNaN(bwSingle) || bwSingle <= 0 ||
      isNaN(bwDouble) || bwDouble <= 0 ||
      isNaN(colorSingle) || colorSingle <= 0 ||
      isNaN(colorDouble) || colorDouble <= 0
    ) {
      showError('All rates must be valid numbers greater than 0.');
      setSaveRatesLoading(false);
      return;
    }

    try {
      const updatedRates = await updateXeroxRates({
        bw_single: bwSingle,
        bw_double: bwDouble,
        color_single: colorSingle,
        color_double: colorDouble
      }, token);

      showSuccess('Xerox rates updated successfully! New rates are now active for all customers.');
      if (onXeroxRatesUpdated) {
        onXeroxRatesUpdated(updatedRates);
      }
    } catch (err: any) {
      showError(err.message || 'Failed to update Xerox rates.');
    } finally {
      setSaveRatesLoading(false);
    }
  };

  const handleResetDefaultRates = () => {
    setBwSingleRate('5');
    setBwDoubleRate('6');
    setColorSingleRate('10');
    setColorDoubleRate('20');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border-2 border-[#E7DCCE] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#FAF7F2] border-b border-[#EADFCF] p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#7B1123] text-white flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                {isAuthenticated ? 'Shop Management Dashboard' : 'Admin Login'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isAuthenticated ? `Signed in as: ${adminUsername}` : 'Shop Owner Access Only'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center border border-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Global Feedback Notifications */}
        {actionSuccess && (
          <div className="mx-4 mt-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}
        {actionError && (
          <div className="mx-4 mt-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {!isAuthenticated ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4 max-w-sm mx-auto py-2">
              <div className="text-xs text-slate-600 bg-amber-50/80 border border-amber-200 p-3 rounded-xl leading-relaxed">
                Authorized shop owner access to update WhatsApp number, products, offers, and services.
              </div>

              {loginError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Username or Email
                </label>
                <input
                  type="text"
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="e.g. admin"
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#DACBB7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B1123] focus:bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#DACBB7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B1123] focus:bg-white text-slate-800"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-[#7B1123] hover:bg-[#5C0B18] transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{loginLoading ? 'Verifying...' : 'Login'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Admin Dashboard */
            <div>
              {/* Dashboard Navigation Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#EADFCF] mb-4 text-xs font-bold">
                <button
                  onClick={() => setActiveTab('whatsapp')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'whatsapp'
                      ? 'bg-[#15803D] text-white shadow-2xs'
                      : 'bg-[#FAF7F2] text-slate-600 hover:bg-[#EFE8DC]'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>WhatsApp Number</span>
                </button>

                <button
                  onClick={() => setActiveTab('products')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'products'
                      ? 'bg-[#15803D] text-white shadow-2xs'
                      : 'bg-[#FAF7F2] text-slate-600 hover:bg-[#EFE8DC]'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Products ({adminProducts.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('offers')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'offers'
                      ? 'bg-[#15803D] text-white shadow-2xs'
                      : 'bg-[#FAF7F2] text-slate-600 hover:bg-[#EFE8DC]'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Offers ({adminOffers.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('images')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'images'
                      ? 'bg-[#15803D] text-white shadow-2xs'
                      : 'bg-[#FAF7F2] text-slate-600 hover:bg-[#EFE8DC]'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Shop Images</span>
                </button>

                <button
                  onClick={() => setActiveTab('services')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'services'
                      ? 'bg-[#15803D] text-white shadow-2xs'
                      : 'bg-[#FAF7F2] text-slate-600 hover:bg-[#EFE8DC]'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Extra Services</span>
                </button>

                <button
                  onClick={() => setActiveTab('xerox_rates')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'xerox_rates'
                      ? 'bg-[#15803D] text-white shadow-2xs'
                      : 'bg-[#FAF7F2] text-slate-600 hover:bg-[#EFE8DC]'
                  }`}
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Xerox Rates (₹)</span>
                </button>
              </div>

              {/* TAB 1: WhatsApp Number */}
              {activeTab === 'whatsapp' && (
                <form onSubmit={handleSavePhone} className="space-y-4">
                  <div className="bg-[#FFFDF9] border border-[#E7DCCE] p-4 rounded-xl">
                    <h4 className="font-extrabold text-sm text-slate-800 mb-1">
                      Shop WhatsApp Number Settings
                    </h4>
                    <p className="text-xs text-slate-500 mb-3">
                      All customer requests for Xerox and Stationery will be directed to this phone number.
                    </p>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Phone Number with Country Code
                      </label>
                      <input
                        type="text"
                        required
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="e.g. 919876543210"
                        className="w-full px-3 py-2 text-sm font-mono font-bold bg-white border border-[#DACBB7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#166534]"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        Indian numbers format: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-bold">919876543210</code>
                      </p>
                    </div>

                    <div className="pt-3">
                      <button
                        type="submit"
                        disabled={savePhoneLoading}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#15803D] hover:bg-[#166534] shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{savePhoneLoading ? 'Saving...' : 'Save WhatsApp Number'}</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* TAB 2: Products Management */}
              {activeTab === 'products' && (
                <div className="space-y-5">
                  {/* Add / Edit Product Form */}
                  <form onSubmit={handleSaveProduct} className="bg-[#FFFDF9] border border-[#E7DCCE] p-4 rounded-xl space-y-3">
                    <h4 className="font-extrabold text-sm text-slate-800 flex items-center justify-between">
                      <span>{editingProdId ? 'Edit Product' : 'Add New Stationery Product'}</span>
                      {editingProdId && (
                        <button
                          type="button"
                          onClick={cancelEditProduct}
                          className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                        >
                          Cancel Editing
                        </button>
                      )}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Product Name *</label>
                        <input
                          type="text"
                          required
                          value={newProdName}
                          onChange={(e) => setNewProdName(e.target.value)}
                          placeholder="e.g. Classmate 200pg Long Book"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#DACBB7] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Price (₹) (Optional)</label>
                        <input
                          type="number"
                          step="0.5"
                          value={newProdPrice}
                          onChange={(e) => setNewProdPrice(e.target.value)}
                          placeholder="Leave blank if price on enquiry"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#DACBB7] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Category</label>
                        <input
                          type="text"
                          value={newProdCategory}
                          onChange={(e) => setNewProdCategory(e.target.value)}
                          placeholder="Notebooks, Pens, Office, etc."
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#DACBB7] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Product Image URL</label>
                        <input
                          type="text"
                          value={newProdImage}
                          onChange={(e) => setNewProdImage(e.target.value)}
                          placeholder="https://... or data:image/..."
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#DACBB7] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Description (Optional)</label>
                      <input
                        type="text"
                        value={newProdDesc}
                        onChange={(e) => setNewProdDesc(e.target.value)}
                        placeholder="Pack of 5, A4 size, ruled..."
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#DACBB7] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newProdAvailable}
                          onChange={(e) => setNewProdAvailable(e.target.checked)}
                          className="rounded text-[#166534]"
                        />
                        <span>In Stock &amp; Available for customers</span>
                      </label>

                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-[#166534] hover:bg-[#14532D] cursor-pointer flex items-center gap-1"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{editingProdId ? 'Update Product' : 'Add Product'}</span>
                      </button>
                    </div>
                  </form>

                  {/* Existing Products List */}
                  <div>
                    <h5 className="font-extrabold text-xs text-slate-700 mb-2 uppercase tracking-wider">
                      Current Shop Inventory ({adminProducts.length})
                    </h5>

                    {adminProducts.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No products added yet.</p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {adminProducts.map((p) => (
                          <div key={p.id} className="p-2.5 rounded-lg bg-white border border-[#E7DCCE] flex items-center justify-between text-xs">
                            <div className="flex-1 pr-2">
                              <span className="font-bold text-slate-900 block">{p.name}</span>
                              <span className="text-[11px] text-slate-500">
                                {p.price !== null ? `₹${p.price}` : 'Price on enquiry'} &bull; Category: {p.category} &bull;{' '}
                                <strong className={p.is_available ? 'text-emerald-700' : 'text-rose-700'}>
                                  {p.is_available ? 'In Stock' : 'Out of Stock'}
                                </strong>
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleToggleProductStock(p)}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer ${
                                  p.is_available 
                                    ? 'bg-rose-50 text-rose-700 border-rose-200' 
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}
                              >
                                {p.is_available ? 'Mark Out of Stock' : 'Mark In Stock'}
                              </button>
                              <button
                                type="button"
                                onClick={() => startEditProduct(p)}
                                className="p-1 text-slate-600 hover:text-slate-900 cursor-pointer"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRequestDeleteProduct(p)}
                                className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                                title={`Delete ${p.name}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: Offers Management */}
              {activeTab === 'offers' && (
                <div className="space-y-5">
                  <form onSubmit={handleCreateOffer} className="bg-[#FFFDF9] border border-[#E7DCCE] p-4 rounded-xl space-y-3">
                    <h4 className="font-extrabold text-sm text-slate-800">
                      Publish a New Shop Offer
                    </h4>
                    <p className="text-xs text-slate-500">
                      Offers will appear on the homepage only after you publish them.
                    </p>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Offer Title *</label>
                      <input
                        type="text"
                        required
                        value={offerTitle}
                        onChange={(e) => setOfferTitle(e.target.value)}
                        placeholder="e.g. Back to School Stationery Sale"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#DACBB7] rounded-lg focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Description *</label>
                      <input
                        type="text"
                        required
                        value={offerDesc}
                        onChange={(e) => setOfferDesc(e.target.value)}
                        placeholder="Get 10% off on all notebooks and chart paper packs today"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#DACBB7] rounded-lg focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Item / Product (Optional)</label>
                        <input
                          type="text"
                          value={offerItem}
                          onChange={(e) => setOfferItem(e.target.value)}
                          placeholder="e.g. Classmate Notebooks"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#DACBB7] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Discount %</label>
                        <input
                          type="number"
                          value={offerDiscount}
                          onChange={(e) => setOfferDiscount(e.target.value)}
                          placeholder="e.g. 10"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#DACBB7] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Validity Dates</label>
                        <input
                          type="text"
                          value={offerDates}
                          onChange={(e) => setOfferDates(e.target.value)}
                          placeholder="e.g. This week only"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#DACBB7] rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="pt-1 flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-[#15803D] hover:bg-[#166534] cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Publish Offer</span>
                      </button>
                    </div>
                  </form>

                  <div>
                    <h5 className="font-extrabold text-xs text-slate-700 mb-2 uppercase tracking-wider">
                      Published Offers ({adminOffers.length})
                    </h5>
                    {adminOffers.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No offers published. The homepage offers section is hidden.</p>
                    ) : (
                      <div className="space-y-2">
                        {adminOffers.map((o) => (
                          <div key={o.id} className="p-2.5 rounded-lg bg-white border border-[#E7DCCE] flex items-center justify-between text-xs">
                            <div className="flex-1 pr-2">
                              <span className="font-bold text-slate-900 block">{o.title}</span>
                              <span className="text-[11px] text-slate-500">{o.description}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteOffer(o.id)}
                              className="p-1 text-rose-600 hover:text-rose-800 cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: Shop Images Management */}
              {activeTab === 'images' && (
                <div className="space-y-5">
                  <form onSubmit={handleAddImage} className="bg-[#FFFDF9] border border-[#E7DCCE] p-4 rounded-xl space-y-3">
                    <h4 className="font-extrabold text-sm text-slate-800">
                      Add a Shop Image
                    </h4>
                    <p className="text-xs text-slate-500">
                      Images will appear in the shop gallery on the customer homepage.
                    </p>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Image URL *</label>
                      <input
                        type="text"
                        required
                        value={newImgUrl}
                        onChange={(e) => setNewImgUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/... or data:image/..."
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#DACBB7] rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Caption / Title (Optional)</label>
                      <input
                        type="text"
                        value={newImgTitle}
                        onChange={(e) => setNewImgTitle(e.target.value)}
                        placeholder="e.g. Front Store Counter, Notebook Display..."
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#DACBB7] rounded-lg"
                      />
                    </div>

                    <div className="pt-1 flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-[#15803D] hover:bg-[#166534] cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Image</span>
                      </button>
                    </div>
                  </form>

                  <div>
                    <h5 className="font-extrabold text-xs text-slate-700 mb-2 uppercase tracking-wider">
                      Current Shop Gallery ({adminImages.length})
                    </h5>
                    {adminImages.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No shop images added. The gallery section is hidden.</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {adminImages.map((img) => (
                          <div key={img.id} className="relative rounded-lg overflow-hidden border border-slate-200 aspect-square group">
                            <img src={img.image_url} alt={img.title || ''} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleDeleteImage(img.id)}
                              className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: Additional Services */}
              {activeTab === 'services' && (
                <div className="space-y-5">
                  <form onSubmit={handleCreateService} className="bg-[#FFFDF9] border border-[#E7DCCE] p-4 rounded-xl space-y-3">
                    <h4 className="font-extrabold text-sm text-slate-800">
                      Add an Additional Service
                    </h4>
                    <p className="text-xs text-slate-500">
                      Services like Spiral Binding, Lamination, or Project Work Printing can be published here.
                    </p>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Service Name *</label>
                      <input
                        type="text"
                        required
                        value={newSvcName}
                        onChange={(e) => setNewSvcName(e.target.value)}
                        placeholder="e.g. Spiral Binding &amp; Lamination"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#DACBB7] rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Description *</label>
                      <input
                        type="text"
                        required
                        value={newSvcDesc}
                        onChange={(e) => setNewSvcDesc(e.target.value)}
                        placeholder="Available for student record books, project submissions, and documents."
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#DACBB7] rounded-lg"
                      />
                    </div>

                    <div className="pt-1 flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-[#15803D] hover:bg-[#166534] cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Service</span>
                      </button>
                    </div>
                  </form>

                  <div>
                    <h5 className="font-extrabold text-xs text-slate-700 mb-2 uppercase tracking-wider">
                      Published Extra Services ({adminServices.length})
                    </h5>
                    {adminServices.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No extra services published.</p>
                    ) : (
                      <div className="space-y-2">
                        {adminServices.map((s) => (
                          <div key={s.id} className="p-2.5 rounded-lg bg-white border border-[#E7DCCE] flex items-center justify-between text-xs">
                            <div className="flex-1 pr-2">
                              <span className="font-bold text-slate-900 block">{s.service_name}</span>
                              <span className="text-[11px] text-slate-500">{s.description}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteService(s.id)}
                              className="p-1 text-rose-600 hover:text-rose-800 cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: Xerox Rates (Fully Editable) */}
              {activeTab === 'xerox_rates' && (
                <form onSubmit={handleSaveRates} className="space-y-4">
                  <div className="bg-[#FFFDF9] border border-[#E7DCCE] p-4 sm:p-5 rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#EADFCF] pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#7B1123] text-white flex items-center justify-center">
                          <Printer className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm sm:text-base text-slate-800">
                            Xerox &amp; Print Price Management
                          </h4>
                          <p className="text-xs text-slate-500">
                            Update the per-page printing costs for your shop.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleResetDefaultRates}
                        className="self-start sm:self-auto text-[11px] font-bold text-slate-600 hover:text-[#7B1123] underline cursor-pointer"
                      >
                        Reset to Default Rates (₹5, ₹6, ₹10, ₹20)
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed bg-amber-50/70 border border-amber-200/80 p-3 rounded-xl">
                      Enter the cost per page in Rupees (₹). When saved, customer order calculations, total estimates, and WhatsApp enquiry messages will reflect the updated rates immediately.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* 1. Black & White Single Side */}
                      <div className="p-3.5 bg-white border border-[#DACBB7] rounded-xl shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800">
                            Black &amp; White — Single Side
                          </label>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            B&amp;W Single
                          </span>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-sm">₹</span>
                          <input
                            type="number"
                            step="0.5"
                            min="0.5"
                            required
                            value={bwSingleRate}
                            onChange={(e) => setBwSingleRate(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 text-sm font-bold bg-[#FAF7F2] border border-[#DACBB7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1123] focus:bg-white text-slate-900"
                            placeholder="5"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Current rate: <span className="font-bold text-[#7B1123]">₹{bwSingleRate || '0'}</span> per page
                        </p>
                      </div>

                      {/* 2. Black & White Double Side */}
                      <div className="p-3.5 bg-white border border-[#DACBB7] rounded-xl shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800">
                            Black &amp; White — Double Side
                          </label>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            B&amp;W Double
                          </span>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-sm">₹</span>
                          <input
                            type="number"
                            step="0.5"
                            min="0.5"
                            required
                            value={bwDoubleRate}
                            onChange={(e) => setBwDoubleRate(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 text-sm font-bold bg-[#FAF7F2] border border-[#DACBB7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1123] focus:bg-white text-slate-900"
                            placeholder="6"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Current rate: <span className="font-bold text-[#7B1123]">₹{bwDoubleRate || '0'}</span> per page
                        </p>
                      </div>

                      {/* 3. Colour Single Side */}
                      <div className="p-3.5 bg-white border border-[#DACBB7] rounded-xl shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800">
                            Colour — Single Side
                          </label>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                            Colour Single
                          </span>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-sm">₹</span>
                          <input
                            type="number"
                            step="0.5"
                            min="0.5"
                            required
                            value={colorSingleRate}
                            onChange={(e) => setColorSingleRate(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 text-sm font-bold bg-[#FAF7F2] border border-[#DACBB7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1123] focus:bg-white text-slate-900"
                            placeholder="10"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Current rate: <span className="font-bold text-[#7B1123]">₹{colorSingleRate || '0'}</span> per page
                        </p>
                      </div>

                      {/* 4. Colour Double Side */}
                      <div className="p-3.5 bg-white border border-[#DACBB7] rounded-xl shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800">
                            Colour — Double Side
                          </label>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                            Colour Double
                          </span>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-sm">₹</span>
                          <input
                            type="number"
                            step="0.5"
                            min="0.5"
                            required
                            value={colorDoubleRate}
                            onChange={(e) => setColorDoubleRate(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 text-sm font-bold bg-[#FAF7F2] border border-[#DACBB7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1123] focus:bg-white text-slate-900"
                            placeholder="20"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Current rate: <span className="font-bold text-[#7B1123]">₹{colorDoubleRate || '0'}</span> per page
                        </p>
                      </div>
                    </div>

                    {/* Preview box */}
                    <div className="bg-[#FAF7F2] border border-[#EADFCF] p-3 rounded-xl text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="font-semibold">
                        Preview calculation (10 pages):
                      </span>
                      <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                        <span className="bg-white px-2 py-0.5 rounded border border-[#DACBB7]">
                          B&amp;W: ₹{(parseFloat(bwSingleRate) || 0) * 10}
                        </span>
                        <span className="bg-white px-2 py-0.5 rounded border border-[#DACBB7]">
                          Colour: ₹{(parseFloat(colorSingleRate) || 0) * 10}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <p className="text-[11px] text-slate-500">
                        Saved instantly to the database.
                      </p>
                      <button
                        type="submit"
                        disabled={saveRatesLoading}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#15803D] hover:bg-[#166534] shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{saveRatesLoading ? 'Saving...' : 'Save Xerox Rates'}</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Logout button at bottom */}
              <div className="pt-6 border-t border-[#EADFCF] flex justify-end">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Product Deletion Confirmation Dialog */}
      {productToDelete && (
        <div 
          className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={handleCancelDeleteProduct}
        >
          <div 
            className="bg-white border-2 border-rose-300 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-slate-900">
                  Delete Product Permanently?
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Are you sure you want to remove this item from your shop catalog and database?
                </p>
              </div>
            </div>

            <div className="bg-[#FAF7F2] border border-[#E7DCCE] p-3 rounded-xl text-xs space-y-1">
              <div className="font-bold text-slate-900 text-sm">
                {productToDelete.name}
              </div>
              <div className="text-slate-600 flex items-center gap-2">
                <span>Category: <strong className="text-slate-800">{productToDelete.category}</strong></span>
                <span>&bull;</span>
                <span>Price: <strong className="text-slate-800">{productToDelete.price !== null ? `₹${productToDelete.price}` : 'Price on enquiry'}</strong></span>
              </div>
              <div className="text-[11px] text-slate-500">
                Database ID: <code className="font-mono bg-white px-1 py-0.5 rounded border border-[#DACBB7]">{productToDelete.id}</code>
              </div>
            </div>

            <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-lg font-medium">
              Warning: This product will be deleted permanently from PostgreSQL. Customers will no longer be able to view or request this item.
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                disabled={deleteProductLoading}
                onClick={handleCancelDeleteProduct}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteProductLoading}
                onClick={handleConfirmDeleteProduct}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleteProductLoading ? 'Deleting from Database...' : 'Yes, Delete Permanently'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
