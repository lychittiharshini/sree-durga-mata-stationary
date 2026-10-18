export type Language = 'en' | 'te';

export interface Translations {
  shopName: string;
  shopSubtitle: string;
  selectLanguage: string;
  langEnglish: string;
  langTelugu: string;

  // Header & Navigation
  chatOnWhatsApp: string;
  backToHome: string;
  shopTimingsVal: string;

  // Customer Name Field
  customerNameLabel: string;
  customerNamePlaceholder: string;
  nameRequiredError: string;

  // Services
  servicesTitle: string;
  servicesSubtitle: string;
  xeroxServiceTitle: string;
  xeroxServiceDesc: string;
  xeroxServiceBtn: string;
  stationeryServiceTitle: string;
  stationeryServiceDesc: string;
  stationeryServiceBtn: string;

  // Xerox Section
  xeroxHeading: string;
  xeroxSubheading: string;
  bwSingleSide: string;
  bwDoubleSide: string;
  colorSingleSide: string;
  colorDoubleSide: string;
  perPage: string;
  copiesQty: string;
  selectOptionsPrompt: string;
  noOptionsSelected: string;
  estimatedTotal: string;
  estimateDisclaimer: string;
  addCustomerNote: string;
  notePlaceholder: string;
  clearSelection: string;
  reviewXeroxRequest: string;
  sendWhatsAppRequest: string;

  // Stationery Section
  stationeryHeading: string;
  stationerySubheading: string;
  searchPlaceholder: string;
  allCategories: string;
  inStock: string;
  outOfStock: string;
  priceNotListed: string;
  addToRequest: string;
  customItemHeading: string;
  customItemDesc: string;
  customItemNamePlaceholder: string;
  customItemQtyPlaceholder: string;
  customItemNotePlaceholder: string;
  addCustomItemBtn: string;
  emptyCatalogTitle: string;
  emptyCatalogDesc: string;
  requestSummaryTitle: string;
  emptyRequestDesc: string;
  clearRequestBtn: string;
  customItemBadge: string;
  reviewStationeryRequest: string;

  // Offers & Shop Images
  specialOffersHeading: string;
  shopGalleryHeading: string;
  additionalServicesHeading: string;

  // Review Modal
  reviewModalTitle: string;
  reviewModalSubtitle: string;
  selectedItems: string;
  subtotalLabel: string;
  closeBtn: string;
  confirmWhatsAppBtn: string;
  whatsappNotice: string;

  // Status & Validation
  numberNotConfigured: string;
  invalidQty: string;
  itemAddedSuccess: string;

  // Footer & Admin
  footerTagline: string;
  adminLoginLink: string;
  copyright: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    shopName: 'Sree Durga Mata Stationery',
    shopSubtitle: 'BOOK STALL & FANCY ITEMS',
    selectLanguage: 'Language',
    langEnglish: 'English',
    langTelugu: 'తెలుగు',

    chatOnWhatsApp: 'Chat on WhatsApp',
    backToHome: '← Back to Main Menu',
    shopTimingsVal: 'Open Daily: 8:00 AM – 9:30 PM',

    customerNameLabel: 'Your Name (Required)',
    customerNamePlaceholder: 'Enter your name...',
    nameRequiredError: 'Please enter your name before sending the WhatsApp request.',

    servicesTitle: 'Select Service',
    servicesSubtitle: 'Choose an option to place your order or enquiry',
    xeroxServiceTitle: 'Xerox',
    xeroxServiceDesc: 'Single & Double sided B&W and Colour photocopies with instant estimation.',
    xeroxServiceBtn: 'Open Xerox Section',
    stationeryServiceTitle: 'Stationery Items',
    stationeryServiceDesc: 'Browse books, pens, supplies, or request any custom stationery items.',
    stationeryServiceBtn: 'Open Stationery Section',

    xeroxHeading: 'Xerox (Photocopy)',
    xeroxSubheading: 'Select your copy requirements and quantities below:',
    bwSingleSide: 'Black & White — Single Side',
    bwDoubleSide: 'Black & White — Double Side',
    colorSingleSide: 'Colour — Single Side',
    colorDoubleSide: 'Colour — Double Side',
    perPage: 'per page',
    copiesQty: 'Quantity / Copies',
    selectOptionsPrompt: 'Please select at least one Xerox option.',
    noOptionsSelected: 'No Xerox options currently selected.',
    estimatedTotal: 'Estimated Total',
    estimateDisclaimer: '* Estimated total based on standard paper. Final amount confirmed by shop.',
    addCustomerNote: 'Special Instructions / Notes (Optional)',
    notePlaceholder: 'e.g., Spiral binding needed, urgent, or print from PDF sent via WhatsApp...',
    clearSelection: 'Clear Selection',
    reviewXeroxRequest: 'Review Request',
    sendWhatsAppRequest: 'Send WhatsApp Request',

    stationeryHeading: 'Stationery Items',
    stationerySubheading: 'Browse items or enter custom stationery requests below:',
    searchPlaceholder: 'Search notebooks, pens, items...',
    allCategories: 'All Items',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    priceNotListed: 'Price on enquiry',
    addToRequest: 'Add to Request',
    customItemHeading: 'Need an unlisted or special item?',
    customItemDesc: 'Enter any stationery, book, or fancy item you need. We will check availability.',
    customItemNamePlaceholder: 'Item name (e.g. Classmate 200pg Long Book)...',
    customItemQtyPlaceholder: 'Qty',
    customItemNotePlaceholder: 'Brand or details (optional)',
    addCustomItemBtn: 'Add to Request',
    emptyCatalogTitle: 'Stationery Catalog',
    emptyCatalogDesc: 'Our physical shop carries a full collection of books, pens, and fancy items! Use the custom request form below to ask for any item.',
    requestSummaryTitle: 'Your Request Summary',
    emptyRequestDesc: 'No items in request yet. Select from catalog or add a custom item above.',
    clearRequestBtn: 'Clear All',
    customItemBadge: 'Custom Item',
    reviewStationeryRequest: 'Review Request',

    specialOffersHeading: 'Current Shop Offers',
    shopGalleryHeading: 'Shop Gallery',
    additionalServicesHeading: 'Additional Services',

    reviewModalTitle: 'Review Request',
    reviewModalSubtitle: 'Verify your name and details before opening WhatsApp:',
    selectedItems: 'Selected Items',
    subtotalLabel: 'Estimated Total',
    closeBtn: 'Back / Edit',
    confirmWhatsAppBtn: 'Send on WhatsApp',
    whatsappNotice: 'WhatsApp will open with your pre-filled English message. You review and click Send.',

    numberNotConfigured: 'Shop WhatsApp number is being configured. Please visit directly or check back shortly.',
    invalidQty: 'Please enter a valid quantity (1 to 10,000).',
    itemAddedSuccess: 'Item added to request list!',

    footerTagline: 'Serving our community with trusted book stall, Xerox, and fancy items.',
    adminLoginLink: 'Admin Login',
    copyright: '© Sree Durga Mata Stationery. All rights reserved.'
  },
  te: {
    shopName: 'శ్రీ దుర్గా మాత స్టేషనరీ',
    shopSubtitle: 'బుక్ స్టాల్ & ఫ్యాన్సీ ఐటమ్స్',
    selectLanguage: 'భాష',
    langEnglish: 'English',
    langTelugu: 'తెలుగు',

    chatOnWhatsApp: 'వాట్సాప్‌లో మాట్లాడండి',
    backToHome: '← మునుపటి మెనుకి వెళ్ళండి',
    shopTimingsVal: 'ప్రతిరోజూ: ఉదయం 8:00 – రాత్రి 9:30',

    customerNameLabel: 'మీ పేరు (తప్పనిసరి)',
    customerNamePlaceholder: 'మీ పేరును నమోదు చేయండి...',
    nameRequiredError: 'వాట్సాప్ అభ్యర్థన పంపడానికి ముందు దయచేసి మీ పేరును నమోదు చేయండి.',

    servicesTitle: 'సేవను ఎంచుకోండి',
    servicesSubtitle: 'ఆర్డర్ లేదా విచారణ కోసం ఒక ఎంపికను ఎంచుకోండి',
    xeroxServiceTitle: 'జిరాక్స్ (Xerox)',
    xeroxServiceDesc: 'ఒక వైపు & రెండు వైపులా నలుపు-తెలుపు మరియు కలర్ ఫోటోకాపీలు.',
    xeroxServiceBtn: 'జిరాక్స్ విభాగం తెరవండి',
    stationeryServiceTitle: 'స్టేషనరీ వస్తువులు',
    stationeryServiceDesc: 'పుస్తకాలు, పెన్నులు లేదా మీకు కావలసిన ఏదైనా ప్రత్యేక వస్తువును అడగండి.',
    stationeryServiceBtn: 'స్టేషనరీ విభాగం తెరవండి',

    xeroxHeading: 'జిరాక్స్ (ఫోటోకాపీ)',
    xeroxSubheading: 'మీకు కావలసిన కాపీల రకం మరియు సంఖ్యను ఎంచుకోండి:',
    bwSingleSide: 'నలుపు & తెలుపు — ఒక వైపు (Single Side)',
    bwDoubleSide: 'నలుపు & తెలుపు — రెండు వైపులా (Double Side)',
    colorSingleSide: 'కలర్ — ఒక వైపు (Single Side)',
    colorDoubleSide: 'కలర్ — రెండు వైపులా (Double Side)',
    perPage: 'పేజీకి',
    copiesQty: 'కాపీల సంఖ్య',
    selectOptionsPrompt: 'దయచేసి కనీసం ఒక జిరాక్స్ ఎంపికను ఎంచుకోండి.',
    noOptionsSelected: 'ప్రస్తుతం ఏ జిరాక్స్ ఎంపికలు ఎంచుకోబడలేదు.',
    estimatedTotal: 'అంచనా మొత్తం',
    estimateDisclaimer: '* ఇది ప్రాథమిక అంచనా మొత్తం మాత్రమే. షాప్ ద్వారా తుది ధర నిర్ధారించబడుతుంది.',
    addCustomerNote: 'ప్రత్యేక గమనిక / సూచన (ఐచ్ఛికం)',
    notePlaceholder: 'ఉదాహరణ: స్పైరల్ బైండింగ్ కావాలి లేదా పిడిఎఫ్ ఫైల్ నుండి ప్రింట్ చేయాలి...',
    clearSelection: 'ఎంపికలను తీసివేయండి',
    reviewXeroxRequest: 'అభ్యర్థనను సమీక్షించండి',
    sendWhatsAppRequest: 'వాట్సాప్ ద్వారా పంపండి',

    stationeryHeading: 'స్టేషనరీ వస్తువులు',
    stationerySubheading: 'దుకాణంలో లభించే వస్తువులు లేదా మీకు అవసరమైన వస్తువుల వివరాలను నమోదు చేయండి:',
    searchPlaceholder: 'పుస్తకాలు, పెన్నులు వెతకండి...',
    allCategories: 'అన్ని వస్తువులు',
    inStock: 'స్టాక్ ఉంది',
    outOfStock: 'అందుబాటులో లేదు',
    priceNotListed: 'ధర విచారించండి',
    addToRequest: 'లిస్ట్‌లో చేర్చండి',
    customItemHeading: 'జాబితాలో లేని వస్తువు కావాలా?',
    customItemDesc: 'మీకు కావలసిన ఏ పుస్తకం లేదా స్టేషనరీ పేరైనా నమోదు చేయండి. మేము చెక్ చేసి తెలియజేస్తాము.',
    customItemNamePlaceholder: 'వస్తువు పేరు (ఉదా: క్లాస్‌మేట్ 200 పేజీల బుక్)...',
    customItemQtyPlaceholder: 'సంఖ్య',
    customItemNotePlaceholder: 'బ్రాండ్ లేదా గమనిక',
    addCustomItemBtn: 'లిస్ట్‌లో చేర్చండి',
    emptyCatalogTitle: 'స్టేషనరీ కేటలాగ్',
    emptyCatalogDesc: 'మా దుకాణంలో అన్ని రకాల స్టేషనరీ అందుబాటులో ఉన్నాయి! మీకు కావలసిన వస్తువులను పై ఫారమ్‌లో నమోదు చేసి అడగవచ్చు.',
    requestSummaryTitle: 'మీ అభ్యర్థన సారాంశం',
    emptyRequestDesc: 'ఇంకా ఏ వస్తువులు ఎంచుకోబడలేదు. పై జాబితా నుండి ఎంచుకోండి.',
    clearRequestBtn: 'అన్నీ తొలగించండి',
    customItemBadge: 'కస్టమ్ వస్తువు',
    reviewStationeryRequest: 'సమీక్షించి పంపండి',

    specialOffersHeading: 'షాప్ ఆఫర్లు & రాయితీలు',
    shopGalleryHeading: 'షాప్ ఫోటోలు',
    additionalServicesHeading: 'ఇతర సేవలు',

    reviewModalTitle: 'మీ అభ్యర్థన వివరాలు',
    reviewModalSubtitle: 'వాట్సాప్ తెరవడానికి ముందు మీ పేరు మరియు వివరాలను ధృవీకరించుకోండి:',
    selectedItems: 'ఎంచుకున్న వస్తువులు',
    subtotalLabel: 'అంచనా మొత్తం',
    closeBtn: 'వెనుకకు / సవరించండి',
    confirmWhatsAppBtn: 'వాట్సాప్‌లో పంపండి',
    whatsappNotice: 'వాట్సాప్‌లో మీ సందేశం ఇంగ్లీషులో సిద్ధంగా ఉంటుంది. మీరు చూసి సెండ్ చేయవచ్చు.',

    numberNotConfigured: 'షాప్ వాట్సాప్ నంబర్ కాన్ఫిగర్ చేయబడుతోంది.',
    invalidQty: 'దయచేసి సరైన సంఖ్యను నమోదు చేయండి (1 నుండి 10,000).',
    itemAddedSuccess: 'వస్తువు లిస్ట్‌లో చేర్చబడింది!',

    footerTagline: 'నమ్మకమైన బుక్ స్టాల్, జిరాక్స్ మరియు ఫ్యాన్సీ ఐటమ్స్.',
    adminLoginLink: 'అడ్మిన్ లాగిన్',
    copyright: '© శ్రీ దుర్గా మాత స్టేషనరీ. సర్వహక్కులు ప్రత్యేకించబడ్డాయి.'
  }
};
