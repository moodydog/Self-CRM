
import { Customer, Trip, User, UserRole, Visit } from './types';

// --- USERS ---
export const MOCK_USERS: User[] = [
    { id: 'u1', name: 'Alex Manager', role: UserRole.MANAGER, avatarUrl: 'https://ui-avatars.com/api/?name=Alex+Manager&background=000&color=fff' },
    { id: 'u2', name: 'Sam Sales', role: UserRole.REP, avatarUrl: 'https://ui-avatars.com/api/?name=Sam+Sales&background=0D8ABC&color=fff' },
    { id: 'u3', name: 'Jamie Rep', role: UserRole.REP, avatarUrl: 'https://ui-avatars.com/api/?name=Jamie+Rep&background=green&color=fff' }
];

export const CURRENT_USER_ID = 'u2'; // Default logged in as Sam Sales

export const INITIAL_CUSTOMERS: Customer[] = [
  // --- DELTA, BC CUSTOMERS ---
  {
    id: 'd1',
    visibleId: '2AH',
    name: 'A&H Drilling Ltd',
    company: 'A&H Drilling Ltd',
    address: '48987 Chilliwack Central Rd, Delta, BC',
    city: 'Delta',
    coordinates: { lat: 49.1568, lng: -121.9722 }, // Using approx coord
    email: 'info@ahdrilling.ca',
    phone: '604-555-0101',
    status: 'Active',
    tier: 'High',
    paymentTerms: '1 - NET 30 DAYS',
    source: 'NAPS CANADA',
    lastSaleDate: '2025-06-16T00:00:00.000Z',
    performanceRatio: 0.384,
    tags: ['Construction', 'Drilling'],
    avatarUrl: 'https://ui-avatars.com/api/?name=A+H&background=0D8ABC&color=fff',
    dealValue: 150000,
    nextActionText: 'Renew annual fleet contract',
    nextActionDate: '2023-11-15T09:00:00.000Z',
    assignedUserId: 'u2',
    contacts: [
        { id: 'c1', name: 'Sarah Jenkins', position: 'Ops Manager', phone: '604-555-1111', isPrimary: true },
        { id: 'c2', name: 'Bob Vance', position: 'Site Super', email: 'bob@ah.ca' }
    ]
  },
  {
    id: 'd2',
    visibleId: 'LAD-001',
    name: 'Ladner Fishing Co',
    company: 'Ladner Fishing Co',
    address: '4800 River Rd, Delta, BC',
    city: 'Delta',
    coordinates: { lat: 49.0900, lng: -123.0800 },
    email: 'mike@ladnerfish.com',
    phone: '604-555-0102',
    status: 'Active',
    tier: 'Mid',
    paymentTerms: 'NET 15',
    source: 'REFERRAL',
    performanceRatio: 0.82,
    tags: ['Seasonal', 'Food & Bev'],
    avatarUrl: 'https://ui-avatars.com/api/?name=Ladner+Fish&background=random',
    dealValue: 25000,
    lastVisitDate: '2023-10-01T10:00:00.000Z',
    nextActionText: 'Drop off new catalog',
    nextActionDate: '2023-10-28T14:00:00.000Z',
    assignedUserId: 'u2',
    contacts: [
        { id: 'c3', name: 'Mike Peterson', position: 'Owner', isPrimary: true }
    ]
  },
  {
    id: 'd3',
    visibleId: 'AIS-99',
    name: 'Annacis Industrial Supply',
    company: 'Annacis Industrial Supply',
    address: '1500 Cliveden Ave, Delta, BC',
    city: 'Delta',
    coordinates: { lat: 49.1650, lng: -122.9450 },
    email: 'gurdeep@annacis.ca',
    phone: '604-555-0103',
    status: 'Prospect',
    tier: 'High',
    paymentTerms: 'PREPAID',
    source: 'WEB',
    tags: ['Industrial', 'Urgent'],
    avatarUrl: 'https://ui-avatars.com/api/?name=Annacis&background=random',
    dealValue: 80000,
    nextActionText: 'Schedule site demo',
    nextActionDate: '2023-10-22T11:00:00.000Z',
    assignedUserId: 'u3',
    contacts: [
        { id: 'c4', name: 'Gurdeep Singh', position: 'Procurement', isPrimary: true }
    ]
  },
  // ... adding legacy fields to others generally ...
  {
    id: 'd4',
    visibleId: 'TMR-55',
    name: 'Tsawwassen Mills Retail',
    company: 'Tsawwassen Mills Retail',
    address: '5000 Canoe Pass Way, Delta, BC',
    city: 'Delta',
    coordinates: { lat: 49.0350, lng: -123.0850 },
    email: 'emily@tmills.ca',
    phone: '604-555-0104',
    status: 'Active',
    tier: 'High',
    paymentTerms: 'NET 60',
    performanceRatio: 0.95,
    tags: ['Retail', 'Key Account'],
    avatarUrl: 'https://ui-avatars.com/api/?name=Tsawwassen&background=random',
    dealValue: 200000,
    nextActionText: 'Quarterly Review',
    nextActionDate: '2023-11-01T10:00:00.000Z',
    assignedUserId: 'u2',
    contacts: [
        { id: 'c5', name: 'Emily Chen', position: 'General Manager', isPrimary: true }
    ]
  },
  {
    id: 'd5',
    visibleId: 'TC-02',
    name: 'Tilbury Cement',
    company: 'Tilbury Cement',
    address: '7800 Vantage Way, Delta, BC',
    city: 'Delta',
    coordinates: { lat: 49.1450, lng: -123.0050 },
    email: 'jason@tilburycement.com',
    phone: '604-555-0105',
    status: 'Churned',
    tier: 'Low',
    tags: ['Construction'],
    avatarUrl: 'https://ui-avatars.com/api/?name=Tilbury&background=random',
    dealValue: 0,
    lastVisitDate: '2023-01-15T09:00:00.000Z',
    nextActionText: 'Re-engagement email',
    nextActionDate: '2024-02-01T09:00:00.000Z',
    assignedUserId: 'u2',
    contacts: [
        { id: 'c6', name: 'Jason Ford', position: 'Site Manager', isPrimary: true }
    ]
  },
  // --- RICHMOND, BC CUSTOMERS ---
  {
    id: 'r1',
    visibleId: 'RCT-22',
    name: 'Richmond Centre Tech',
    company: 'Richmond Centre Tech',
    address: '6551 No. 3 Rd, Richmond, BC',
    city: 'Richmond',
    coordinates: { lat: 49.1666, lng: -123.1370 },
    email: 'david@rctech.ca',
    phone: '604-555-0201',
    status: 'Active',
    tier: 'Mid',
    paymentTerms: 'NET 30',
    tags: ['Retail', 'Tech'],
    avatarUrl: 'https://ui-avatars.com/api/?name=RC+Tech&background=random',
    dealValue: 55000,
    nextActionText: 'Upgrade POS systems',
    nextActionDate: '2023-10-24T13:00:00.000Z',
    assignedUserId: 'u2',
    contacts: [
        { id: 'c7', name: 'David Lee', position: 'IT Director', isPrimary: true }
    ]
  },
  {
    id: 'r2',
    visibleId: 'YVR-00',
    name: 'YVR Airport Services',
    company: 'YVR Airport Services',
    address: '3211 Grant McConachie Way, Richmond, BC',
    city: 'Richmond',
    coordinates: { lat: 49.1947, lng: -123.1762 },
    email: 'maria@yvr.ca',
    phone: '604-555-0202',
    status: 'Active',
    tier: 'High',
    paymentTerms: 'NET 45',
    source: 'RFP',
    performanceRatio: 0.99,
    tags: ['Aviation', 'Enterprise', 'High Value'],
    avatarUrl: 'https://ui-avatars.com/api/?name=YVR&background=random',
    dealValue: 900000,
    nextActionText: 'Contract Renewal Meeting',
    nextActionDate: '2023-11-05T10:00:00.000Z',
    assignedUserId: 'u2',
    contacts: [
        { id: 'c8', name: 'Maria Garcia', position: 'VP Ops', isPrimary: true },
        { id: 'c9', name: 'Tom Cruise', position: 'Logistics Lead' }
    ]
  },
  // Adding more simple ones to reach count
  {
    id: 'r3', visibleId: 'ABD-33', name: 'Aberdeen Import', company: 'Aberdeen Import', address: '4151 Hazelbridge Way, Richmond, BC', city: 'Richmond', coordinates: { lat: 49.1830, lng: -123.1330 }, email: 'jin@ab.ca', phone: '555-1234', status: 'Prospect', tier: 'Mid', dealValue: 12000, avatarUrl: 'https://ui-avatars.com/api/?name=Aberdeen', contacts: [], assignedUserId: 'u3'
  },
  {
    id: 'r4', visibleId: 'STV-44', name: 'Steveston Harbor', company: 'Steveston Harbor', address: '3800 Bayview St, Richmond, BC', city: 'Richmond', coordinates: { lat: 49.1250, lng: -123.1850 }, email: 'rob@stv.ca', phone: '555-5678', status: 'Active', tier: 'Low', dealValue: 5000, avatarUrl: 'https://ui-avatars.com/api/?name=Steveston', contacts: [], assignedUserId: 'u2'
  },
  {
    id: 'r5', visibleId: 'RR-77', name: 'River Rock', company: 'River Rock', address: '8811 River Rd, Richmond, BC', city: 'Richmond', coordinates: { lat: 49.1950, lng: -123.1280 }, email: 'alice@rr.ca', phone: '555-9999', status: 'Active', tier: 'High', dealValue: 450000, avatarUrl: 'https://ui-avatars.com/api/?name=River+Rock', contacts: [], assignedUserId: 'u2'
  }
];

export const MOCK_VISIT_HISTORY: Visit[] = [
  {
    id: 'v1',
    customerId: 'd1',
    date: '2023-10-15T10:00:00.000Z',
    notes: 'Discussed annual fleet contract renewal. Sarah is concerned about fuel surcharge rates.',
    summary: 'Client negotiating renewal. Action: Review fuel surcharge options.',
    createdByUserId: 'u2'
  },
  {
    id: 'v2',
    customerId: 'r2',
    date: '2023-09-28T14:30:00.000Z',
    notes: 'YVR Operations team meeting. Reviewed security clearance protocols for our new staff.',
    summary: 'Security protocols reviewed. Operations smooth.',
    createdByUserId: 'u2'
  }
];

export const MOCK_TRIPS: Trip[] = [
    {
        id: 't_mock_1',
        date: '2023-10-18T08:30:00.000Z',
        name: 'Richmond Route',
        customerIds: ['r1', 'r2', 'r5'],
        status: 'Completed',
        assignedUserId: 'u2'
    },
    {
        id: 't_mock_2',
        date: '2023-10-20T09:00:00.000Z',
        name: 'Delta Industrial Park',
        customerIds: ['d3', 'd5', 'd1'],
        status: 'In Progress',
        assignedUserId: 'u2'
    }
];
