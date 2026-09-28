import { VTUNetworkInfo, VTUDataPlan, VTUTransaction, VTUConfig, VTUSavedBeneficiary } from '../types';

export const VTU_NETWORKS: VTUNetworkInfo[] = [
  {
    id: 'MTN',
    name: 'MTN Nigeria',
    shortName: 'MTN',
    color: 'from-amber-400 to-yellow-500',
    bgLight: 'bg-amber-50',
    borderColor: 'border-amber-400',
    textColor: 'text-amber-900',
    prefixes: ['0803', '0806', '0703', '0706', '0813', '0816', '0810', '0814', '0903', '0906', '0913', '0916'],
    enabled: true,
    airtimeDiscountPercent: 2
  },
  {
    id: 'AIRTEL',
    name: 'Airtel Nigeria',
    shortName: 'Airtel',
    color: 'from-rose-600 to-red-700',
    bgLight: 'bg-rose-50',
    borderColor: 'border-rose-500',
    textColor: 'text-rose-900',
    prefixes: ['0802', '0808', '0708', '0812', '0701', '0902', '0901', '0904', '0907', '0912'],
    enabled: true,
    airtimeDiscountPercent: 2
  },
  {
    id: 'GLO',
    name: 'Globacom (Glo)',
    shortName: 'Glo',
    color: 'from-emerald-500 to-green-700',
    bgLight: 'bg-emerald-50',
    borderColor: 'border-emerald-500',
    textColor: 'text-emerald-900',
    prefixes: ['0805', '0807', '0705', '0815', '0811', '0905', '0915'],
    enabled: true,
    airtimeDiscountPercent: 3
  },
  {
    id: '9MOBILE',
    name: '9mobile Nigeria',
    shortName: '9mobile',
    color: 'from-teal-600 to-emerald-900',
    bgLight: 'bg-teal-50',
    borderColor: 'border-teal-500',
    textColor: 'text-teal-900',
    prefixes: ['0809', '0818', '0817', '0909', '0908'],
    enabled: true,
    airtimeDiscountPercent: 2
  }
];

export const COMMON_AIRTIME_AMOUNTS = [100, 200, 500, 1000, 2000, 5000, 10000];

export const INITIAL_VTU_CONFIG: VTUConfig = {
  mode: 'TEST_MODE',
  isLivePaystack: false,
  vtuProviderName: 'FDC Sandbox VTU Provider (Ready for VTU.ng / Reloadly / Flutterwave)',
  minAirtimeAmount: 50,
  maxAirtimeAmount: 50000,
  airtimeServiceFee: 0,
  dataServiceFee: 0,
  networksEnabled: {
    MTN: true,
    AIRTEL: true,
    GLO: true,
    '9MOBILE': true
  }
};

export const INITIAL_VTU_DATA_PLANS: VTUDataPlan[] = [
  // ================= MTN DATA PLANS =================
  {
    planId: 'mtn-500mb-30d',
    network: 'MTN',
    name: '500MB',
    description: 'MTN SME / Corporate Monthly Data Bundle',
    category: 'MONTHLY',
    validity: '30 Days',
    providerPrice: 230,
    customerPrice: 250,
    status: 'ACTIVE'
  },
  {
    planId: 'mtn-1gb-30d',
    network: 'MTN',
    name: '1GB',
    description: 'MTN All-Day Monthly Smart Data Bundle',
    category: 'MONTHLY',
    validity: '30 Days',
    providerPrice: 460,
    customerPrice: 500,
    status: 'ACTIVE'
  },
  {
    planId: 'mtn-2gb-30d',
    network: 'MTN',
    name: '2GB',
    description: 'MTN Monthly Value Data Plan',
    category: 'MONTHLY',
    validity: '30 Days',
    providerPrice: 920,
    customerPrice: 1000,
    status: 'ACTIVE'
  },
  {
    planId: 'mtn-3gb-30d',
    network: 'MTN',
    name: '3GB',
    description: 'MTN Super Streaming & Work Bundle',
    category: 'MONTHLY',
    validity: '30 Days',
    providerPrice: 1380,
    customerPrice: 1500,
    status: 'ACTIVE'
  },
  {
    planId: 'mtn-5gb-30d',
    network: 'MTN',
    name: '5GB',
    description: 'MTN High-Speed Monthly Data Plan',
    category: 'MONTHLY',
    validity: '30 Days',
    providerPrice: 2300,
    customerPrice: 2500,
    status: 'ACTIVE'
  },
  {
    planId: 'mtn-10gb-30d',
    network: 'MTN',
    name: '10GB',
    description: 'MTN Business & Family Monthly Data',
    category: 'MEGA',
    validity: '30 Days',
    providerPrice: 4500,
    customerPrice: 4800,
    status: 'ACTIVE'
  },
  {
    planId: 'mtn-20gb-30d',
    network: 'MTN',
    name: '20GB',
    description: 'MTN Heavy User Power Bundle',
    category: 'MEGA',
    validity: '30 Days',
    providerPrice: 8800,
    customerPrice: 9500,
    status: 'ACTIVE'
  },
  {
    planId: 'mtn-40gb-30d',
    network: 'MTN',
    name: '40GB',
    description: 'MTN Enterprise & Office Mega Bundle',
    category: 'MEGA',
    validity: '30 Days',
    providerPrice: 17500,
    customerPrice: 18500,
    status: 'ACTIVE'
  },

  // ================= AIRTEL DATA PLANS =================
  {
    planId: 'airtel-500mb-30d',
    network: 'AIRTEL',
    name: '500MB',
    description: 'Airtel Corporate Gifting Starter Plan',
    category: 'MONTHLY',
    validity: '30 Days',
    providerPrice: 220,
    customerPrice: 250,
    status: 'ACTIVE'
  },
  {
    planId: 'airtel-1gb-30d',
    network: 'AIRTEL',
    name: '1GB',
    description: 'Airtel SmartBinge / Monthly Plan',
    category: 'MONTHLY',
    validity: '30 Days',
    providerPrice: 450,
    customerPrice: 500,
    status: 'ACTIVE'
  },
  {
    planId: 'airtel-2gb-30d',
    network: 'AIRTEL',
    name: '2GB',
    description: 'Airtel 4G Super Speed Monthly Plan',
    category: 'MONTHLY',
    validity: '30 Days',
    providerPrice: 900,
    customerPrice: 1000,
    status: 'ACTIVE'
  },
  {
    planId: 'airtel-5gb-30d',
    network: 'AIRTEL',
    name: '5GB',
    description: 'Airtel Monthly Freedom Bundle',
    category: 'MONTHLY',
    validity: '30 Days',
    providerPrice: 2200,
    customerPrice: 2450,
    status: 'ACTIVE'
  },
  {
    planId: 'airtel-10gb-30d',
    network: 'AIRTEL',
    name: '10GB',
    description: 'Airtel Monthly Executive Data Plan',
    category: 'MEGA',
    validity: '30 Days',
    providerPrice: 4400,
    customerPrice: 4750,
    status: 'ACTIVE'
  },
  {
    planId: 'airtel-20gb-30d',
    network: 'AIRTEL',
    name: '20GB',
    description: 'Airtel Mega Home & Office Plan',
    category: 'MEGA',
    validity: '30 Days',
    providerPrice: 8600,
    customerPrice: 9200,
    status: 'ACTIVE'
  },

  // ================= GLO DATA PLANS =================
  {
    planId: 'glo-500mb-30d',
    network: 'GLO',
    name: '500MB',
    description: 'Glo Yakata / Corporate Data Plan',
    category: 'MONTHLY',
    validity: '30 Days',
    providerPrice: 200,
    customerPrice: 230,
    status: 'ACTIVE'
  },
  {
    planId: 'glo-1gb-30d',
    network: 'GLO',
    name: '1GB',
    description: 'Glo Grand Master 4G LTE Monthly Plan',
    category: 'MONTHLY',
    validity: '30 Days',
    providerPrice: 410,
    customerPrice: 450,
    status: 'ACTIVE'
  },
  {
    planId: 'glo-2gb-30d',
    network: 'GLO',
    name: '2GB',
    description: 'Glo Double Data Value Plan',
    category: 'MONTHLY',
    validity: '30 Days',
    providerPrice: 820,
    customerPrice: 900,
    status: 'ACTIVE'
  },
  {
    planId: 'glo-5gb-30d',
    network: 'GLO',
    name: '5GB',
    description: 'Glo Binge & Stream Monthly Plan',
    category: 'MONTHLY',
    validity: '30 Days',
    providerPrice: 2050,
    customerPrice: 2250,
    status: 'ACTIVE'
  },
  {
    planId: 'glo-10gb-30d',
    network: 'GLO',
    name: '10GB',
    description: 'Glo Mega Oga Data Bundle',
    category: 'MEGA',
    validity: '30 Days',
    providerPrice: 4000,
    customerPrice: 4400,
    status: 'ACTIVE'
  },
  {
    planId: 'glo-20gb-30d',
    network: 'GLO',
    name: '20GB',
    description: 'Glo Ultra Max Monthly Bundle',
    category: 'MEGA',
    validity: '30 Days',
    providerPrice: 7900,
    customerPrice: 8500,
    status: 'ACTIVE'
  },

  // ================= 9MOBILE DATA PLANS =================
  {
    planId: '9mobile-500mb-30d',
    network: '9MOBILE',
    name: '500MB',
    description: '9mobile SME Monthly Starter Bundle',
    category: 'MONTHLY',
    validity: '30 Days',
    providerPrice: 200,
    customerPrice: 240,
    status: 'ACTIVE'
  },
  {
    planId: '9mobile-1gb-30d',
    network: '9MOBILE',
    name: '1GB',
    description: '9mobile Moreblaze Monthly Data Plan',
    category: 'MONTHLY',
    validity: '30 Days',
    providerPrice: 400,
    customerPrice: 460,
    status: 'ACTIVE'
  },
  {
    planId: '9mobile-2gb-30d',
    network: '9MOBILE',
    name: '2GB',
    description: '9mobile Smart Monthly Data Bundle',
    category: 'MONTHLY',
    validity: '30 Days',
    providerPrice: 800,
    customerPrice: 920,
    status: 'ACTIVE'
  },
  {
    planId: '9mobile-5gb-30d',
    network: '9MOBILE',
    name: '5GB',
    description: '9mobile Super Streaming Monthly Plan',
    category: 'MONTHLY',
    validity: '30 Days',
    providerPrice: 1950,
    customerPrice: 2200,
    status: 'ACTIVE'
  },
  {
    planId: '9mobile-10gb-30d',
    network: '9MOBILE',
    name: '10GB',
    description: '9mobile Heavy Duty Monthly Bundle',
    category: 'MEGA',
    validity: '30 Days',
    providerPrice: 3900,
    customerPrice: 4300,
    status: 'ACTIVE'
  }
];

export const INITIAL_SAVED_BENEFICIARIES: VTUSavedBeneficiary[] = [
  {
    id: 'ben-1',
    name: 'My Primary Line (Okene)',
    phoneNumber: '09162723865',
    network: 'MTN'
  },
  {
    id: 'ben-2',
    name: 'Store Operations Line',
    phoneNumber: '08034567890',
    network: 'MTN'
  },
  {
    id: 'ben-3',
    name: 'Home Wi-Fi Router',
    phoneNumber: '08023456789',
    network: 'AIRTEL'
  }
];

export const INITIAL_VTU_TRANSACTIONS: VTUTransaction[] = [
  {
    id: 'FDC-20260927-482910',
    reference: 'PSTK_VTU_20260927_482910',
    type: 'AIRTIME',
    network: 'MTN',
    phoneNumber: '08031234567',
    customerName: 'Barrister Yakubu Ahmed',
    customerEmail: 'yakubu.ahmed@law.ng',
    amount: 1000,
    serviceFee: 0,
    totalAmount: 1000,
    providerCost: 980,
    paymentMethod: 'PAYSTACK_CARD',
    paymentStatus: 'SUCCESSFUL',
    paymentGatewayRef: 'PSTK_SIM_994821',
    paymentVerifiedAt: '2026-09-27T08:30:12Z',
    vtuProvider: 'FDC Sandbox VTU Provider',
    vtuProviderRef: 'VTU_MTN_AIR_882190',
    vtuStatusMessage: '₦1,000 MTN Airtime successfully credited to 08031234567',
    status: 'SUCCESSFUL',
    mode: 'TEST_MODE',
    createdAt: '2026-09-27T08:30:00Z',
    updatedAt: '2026-09-27T08:30:15Z',
    completedAt: '2026-09-27T08:30:15Z'
  },
  {
    id: 'FDC-20260927-739104',
    reference: 'PSTK_VTU_20260927_739104',
    type: 'DATA',
    network: 'AIRTEL',
    phoneNumber: '08029876543',
    customerName: 'Dr. (Mrs) Fatima Bello',
    customerEmail: 'fatima.bello@hospital.ng',
    amount: 1000,
    serviceFee: 0,
    totalAmount: 1000,
    providerCost: 900,
    planId: 'airtel-2gb-30d',
    planName: '2GB',
    planValidity: '30 Days',
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'SUCCESSFUL',
    paymentGatewayRef: 'PSTK_SIM_773190',
    paymentVerifiedAt: '2026-09-27T10:14:22Z',
    vtuProvider: 'FDC Sandbox VTU Provider',
    vtuProviderRef: 'VTU_AIRTEL_DATA_551029',
    vtuStatusMessage: 'Airtel 2GB (30 Days) Data Bundle activated on 08029876543',
    status: 'SUCCESSFUL',
    mode: 'TEST_MODE',
    createdAt: '2026-09-27T10:14:00Z',
    updatedAt: '2026-09-27T10:14:25Z',
    completedAt: '2026-09-27T10:14:25Z'
  },
  {
    id: 'FDC-20260926-192045',
    reference: 'PSTK_VTU_20260926_192045',
    type: 'DATA',
    network: 'GLO',
    phoneNumber: '08055544332',
    customerName: 'Engr. David Ohiare',
    customerEmail: 'david.ohiare@kogi.ng',
    amount: 2250,
    serviceFee: 0,
    totalAmount: 2250,
    providerCost: 2050,
    planId: 'glo-5gb-30d',
    planName: '5GB',
    planValidity: '30 Days',
    paymentMethod: 'USSD',
    paymentStatus: 'FAILED',
    paymentGatewayRef: 'PSTK_SIM_FAILED_112',
    vtuProvider: 'FDC Sandbox VTU Provider',
    vtuStatusMessage: 'Payment authorization declined by issuing bank. VTU dispense blocked.',
    status: 'FAILED',
    mode: 'TEST_MODE',
    createdAt: '2026-09-26T16:40:00Z',
    updatedAt: '2026-09-26T16:40:30Z'
  }
];
