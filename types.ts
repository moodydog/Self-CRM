

export enum ViewState {
  AUTH = 'AUTH',
  LIST = 'LIST',
  MAP = 'MAP',
  TRIPS = 'TRIPS',
  ACCOUNT_DETAIL = 'ACCOUNT_DETAIL',
  VISIT_FORM = 'VISIT_FORM',
  ADD_ACCOUNT = 'ADD_ACCOUNT',
  SETTINGS = 'SETTINGS',
  MANAGER_DASHBOARD = 'MANAGER_DASHBOARD',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  REP = 'REP'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl: string;
  province?: string; 
  branch?: string; // e.g. 'VAN', 'TOR'
  erpId?: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface AccountAddress {
  id: string;
  type: 'BILL_TO' | 'SHIP_TO';
  shipToNumber?: number; // 1, 2, 3...
  description?: string; // "Warehouse B" or "Head Office"
  address: string;
  city: string;
  province: string;
  postalCode?: string;
  coordinates: Coordinates;
  isDefault: boolean; // Typically Ship To #1
}

// 1. ACCOUNTS (Companies)
export interface Account {
  id: string;        
  erpId: string;     
  name: string;      
  
  // Primary Display Address (Usually Ship To #1)
  address: string;
  city: string;
  province: string;
  postalCode?: string;
  coordinates: Coordinates;

  // Full Address List
  addresses: AccountAddress[];

  // Business info
  branch?: string; // e.g. 'VAN'
  industry?: string;
  tier: 'High' | 'Mid' | 'Low' | 'Prospect'; // Mapped from Grade
  status: 'Active' | 'Prospect' | 'Churned';
  paymentTerms?: string;
  creditLimit?: number;
  
  // Assignment
  assignedUserId?: string; 
  
  // Metadata
  lastSaleDate?: string;
  totalRevenue?: number;
  tags?: string[];
  avatarUrl?: string;
  lastVisitDate?: string;
}

// 2. CONTACTS (People)
export interface Contact {
  id: string;
  erpId?: string;
  accountId: string; 
  firstName: string;
  lastName: string;
  title: string;
  email?: string;
  phone?: string;
  isPrimary: boolean;
}

// 3. OPPORTUNITIES (Deals)
export interface Opportunity {
  id: string;
  accountId: string;
  title: string;       
  value: number;       
  stage: 'New' | 'Qualifying' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  probability: number; 
  expectedCloseDate: string;
  nextStep?: string;
}

export interface Visit {
  id: string;
  accountId: string; 
  locationId?: string; // Which address was visited
  date: string;
  notes: string;
  summary?: string;
  photos?: string[];
  createdByUserId?: string;
  erpSyncStatus?: 'PENDING' | 'SYNCED'; 
}

export interface Trip {
  id: string;
  date: string;
  name: string;
  accountIds: string[];
  status: 'Planned' | 'In Progress' | 'Completed';
  assignedUserId: string;
}

export interface UserLocation extends Coordinates {
  timestamp: number;
}

export type SortOption = 'distance' | 'name' | 'recent' | 'value';