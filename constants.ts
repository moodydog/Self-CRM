
import { Account, Contact, Opportunity, Trip, User, UserRole, Visit } from './types';

// --- USERS ---
export const MOCK_USERS: User[] = [
    { id: 'admin1', name: 'System Admin', role: UserRole.ADMIN, avatarUrl: 'https://ui-avatars.com/api/?name=System+Admin&background=000&color=fff', province: 'ALL', branch: 'ALL' },
    { id: 'u1', name: 'Alex Manager', role: UserRole.MANAGER, avatarUrl: 'https://ui-avatars.com/api/?name=Alex+Manager&background=4338ca&color=fff', province: 'BC', branch: 'VAN' },
    { id: 'u2', name: 'Sam Sales', role: UserRole.REP, avatarUrl: 'https://ui-avatars.com/api/?name=Sam+Sales&background=0D8ABC&color=fff', province: 'BC', branch: 'VAN', erpId: 'SALESREP_02' },
    { id: 'u3', name: 'Jamie Rep', role: UserRole.REP, avatarUrl: 'https://ui-avatars.com/api/?name=Jamie+Rep&background=green&color=fff', province: 'BC', branch: 'VAN' },
    { id: 'u4', name: 'Sarah Ontario', role: UserRole.REP, avatarUrl: 'https://ui-avatars.com/api/?name=Sarah+Ont&background=purple&color=fff', province: 'ON', branch: 'TOR' }
];

export const CURRENT_USER_ID = 'u2'; 

// --- ACCOUNTS (Companies) ---
export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'a1',
    erpId: 'CUST-1001',
    name: 'A&H Drilling Ltd',
    // Default / Display Address (Ship To #1)
    address: '48987 Chilliwack Central Rd',
    city: 'Delta',
    province: 'BC',
    coordinates: { lat: 49.1568, lng: -121.9722 },
    branch: 'VAN',
    status: 'Active',
    tier: 'High',
    paymentTerms: 'Net 30',
    creditLimit: 50000,
    industry: 'Construction',
    lastSaleDate: '2025-06-16T00:00:00.000Z',
    totalRevenue: 500000,
    tags: ['Drilling', 'Fleet'],
    avatarUrl: 'https://ui-avatars.com/api/?name=A+H&background=0D8ABC&color=fff',
    assignedUserId: 'u2',
    addresses: [
        {
            id: 'addr_1',
            type: 'SHIP_TO',
            shipToNumber: 1,
            description: 'Main Yard',
            address: '48987 Chilliwack Central Rd',
            city: 'Delta',
            province: 'BC',
            coordinates: { lat: 49.1568, lng: -121.9722 },
            isDefault: true
        },
        {
            id: 'addr_2',
            type: 'SHIP_TO',
            shipToNumber: 2,
            description: 'North Warehouse',
            address: '123 Industrial Ave',
            city: 'Delta',
            province: 'BC',
            coordinates: { lat: 49.1600, lng: -121.9800 }, // Slight offset
            isDefault: false
        },
        {
            id: 'addr_bill',
            type: 'BILL_TO',
            description: 'Corporate HQ',
            address: '555 Financial District',
            city: 'Vancouver',
            province: 'BC',
            coordinates: { lat: 49.2827, lng: -123.1207 },
            isDefault: false
        }
    ]
  },
  {
    id: 'a2',
    erpId: 'CUST-1002',
    name: 'Richmond Centre Tech',
    address: '6551 No. 3 Rd',
    city: 'Richmond',
    province: 'BC',
    coordinates: { lat: 49.1666, lng: -123.1370 },
    branch: 'VAN',
    status: 'Active',
    tier: 'Mid',
    paymentTerms: 'Net 30',
    industry: 'Retail',
    tags: ['Tech'],
    avatarUrl: 'https://ui-avatars.com/api/?name=RC+Tech&background=random',
    assignedUserId: 'u2',
    addresses: [
        {
            id: 'addr_rc_1',
            type: 'SHIP_TO',
            shipToNumber: 1,
            address: '6551 No. 3 Rd',
            city: 'Richmond',
            province: 'BC',
            coordinates: { lat: 49.1666, lng: -123.1370 },
            isDefault: true
        }
    ]
  },
  {
    id: 'a3',
    erpId: 'CUST-1003',
    name: 'YVR Airport Services',
    address: '3211 Grant McConachie Way',
    city: 'Richmond',
    province: 'BC',
    coordinates: { lat: 49.1947, lng: -123.1762 },
    branch: 'VAN',
    status: 'Active',
    tier: 'High',
    paymentTerms: 'Net 45',
    industry: 'Aviation',
    avatarUrl: 'https://ui-avatars.com/api/?name=YVR&background=random',
    assignedUserId: 'u2',
    addresses: [
        {
            id: 'addr_yvr_1',
            type: 'SHIP_TO',
            shipToNumber: 1,
            address: '3211 Grant McConachie Way',
            city: 'Richmond',
            province: 'BC',
            coordinates: { lat: 49.1947, lng: -123.1762 },
            isDefault: true
        }
    ]
  }
];

// --- CONTACTS (People) ---
export const INITIAL_CONTACTS: Contact[] = [
    { id: 'c1', accountId: 'a1', firstName: 'Sarah', lastName: 'Jenkins', title: 'Ops Manager', phone: '604-555-1111', isPrimary: true },
    { id: 'c2', accountId: 'a1', firstName: 'Bob', lastName: 'Vance', title: 'Site Super', email: 'bob@ah.ca', isPrimary: false },
    { id: 'c3', accountId: 'a2', firstName: 'David', lastName: 'Lee', title: 'IT Director', isPrimary: true },
    { id: 'c4', accountId: 'a3', firstName: 'Maria', lastName: 'Garcia', title: 'VP Ops', isPrimary: true }
];

// --- OPPORTUNITIES (Deals) ---
export const INITIAL_OPPORTUNITIES: Opportunity[] = [
    { id: 'o1', accountId: 'a1', title: 'Annual Fleet Contract', value: 150000, stage: 'Negotiation', probability: 80, expectedCloseDate: '2023-11-15', nextStep: 'Review fuel surcharge' },
    { id: 'o2', accountId: 'a2', title: 'POS Upgrade', value: 55000, stage: 'Qualifying', probability: 40, expectedCloseDate: '2023-12-01', nextStep: 'Schedule Demo' },
    { id: 'o3', accountId: 'a3', title: 'Logistics Software', value: 900000, stage: 'Proposal', probability: 60, expectedCloseDate: '2024-01-15' }
];

export const MOCK_VISIT_HISTORY: Visit[] = [
  {
    id: 'v1',
    accountId: 'a1',
    locationId: 'addr_1',
    date: '2023-10-15T10:00:00.000Z',
    notes: 'Discussed annual fleet contract renewal. Sarah is concerned about fuel surcharge rates.',
    summary: 'Client negotiating renewal. Action: Review fuel surcharge options.',
    createdByUserId: 'u2',
    erpSyncStatus: 'SYNCED'
  }
];

export const MOCK_TRIPS: Trip[] = [
    {
        id: 't_mock_1',
        date: '2023-10-18T08:30:00.000Z',
        name: 'Richmond Route',
        accountIds: ['a2', 'a3'],
        status: 'Completed',
        assignedUserId: 'u2'
    }
];
