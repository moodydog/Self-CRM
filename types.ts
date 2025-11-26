
export enum ViewState {
  AUTH = 'AUTH',
  LIST = 'LIST',
  MAP = 'MAP',
  TRIPS = 'TRIPS',
  CUSTOMER_DETAIL = 'CUSTOMER_DETAIL',
  VISIT_FORM = 'VISIT_FORM',
  ADD_CUSTOMER = 'ADD_CUSTOMER',
  SETTINGS = 'SETTINGS',
  MANAGER_DASHBOARD = 'MANAGER_DASHBOARD'
}

export enum UserRole {
  MANAGER = 'MANAGER',
  REP = 'REP'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Contact {
  id: string;
  name: string;
  position: string;
  phone?: string;
  email?: string;
  isPrimary?: boolean;
}

export interface Visit {
  id: string;
  customerId: string;
  date: string; // ISO string
  notes: string;
  summary?: string; // AI generated summary
  photos?: string[]; // Base64 strings
  createdByUserId?: string;
}

export interface Trip {
  id: string;
  date: string; // ISO string
  name: string; // e.g., "Trip to Richmond"
  customerIds: string[];
  status: 'Planned' | 'In Progress' | 'Completed';
  assignedUserId: string;
}

export type Tier = 'High' | 'Mid' | 'Low' | 'Prospect';

export interface Customer {
  id: string;
  name: string; // This is now the "Company Name" basically
  company: string; // Redundant but keeping for backward compat, usually same as name now
  
  // Legacy CRM Fields from Screenshot
  visibleId?: string; // e.g. "2AH"
  paymentTerms?: string; // e.g. "1 - NET 30 DAYS"
  source?: string; // e.g. "NAPS CANADA"
  lastSaleDate?: string;
  performanceRatio?: number; // e.g. 0.384

  address: string;
  city?: string;
  coordinates: Coordinates;
  
  // Contact Info (Company Level)
  email: string;
  phone: string;
  
  status: 'Active' | 'Prospect' | 'Churned';
  tier?: Tier;
  tags?: string[];
  
  lastVisitDate?: string;
  createdAt?: string;
  avatarUrl: string;
  
  contacts: Contact[];
  assignedUserId?: string; // For RBAC
  
  // CRM Specific Fields
  dealValue?: number; // Potential or current revenue
  nextActionText?: string; // e.g. "Send Contract", "Follow up on pricing"
  nextActionDate?: string; // ISO Date for the deadline
}

export interface UserLocation extends Coordinates {
  timestamp: number;
}

export type SortOption = 'distance' | 'name' | 'recent' | 'value';
