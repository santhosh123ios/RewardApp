export type RootStackParamList = {
  // Main screens
  Main: undefined;
  VendorDashboard: undefined;
  Login: undefined;
  
  // Profile screens
  ProfileEdit: undefined;
  Notifications: undefined;
  Privacy: undefined;
  Support: undefined;
  About: undefined;
  ThemeSettings: undefined;
  
  // Lead screens
  CreateLead: { vendor?: any };
  LeadDetails: { lead: any };
  VendorLeadDetails: { lead: any };
  
  // Offer and Product screens
  OfferDetails: { offer: any };
  ProductDetails: { product: any };
  
  // Vendor screens
  Vendors: undefined;
  VendorDetails: { vendor: any; defaultTab?: string };
  
  // Complaint screens
  Complaints: undefined;
  ComplaintCreate: undefined;
  ComplaintDetails: { complaint: any };
  
  // Report screens
  Reports: undefined;
  
  // Wallet screens
  Wallet: undefined;
  VendorWallet: undefined;
  AllTransactions: undefined;
  Redeem: undefined;
  
  // Lead management screens
  Leads: undefined;
  VendorLeads: undefined;
};
