
import React, { useMemo, useState } from 'react';
import { Account, Opportunity, Coordinates, SortOption, User, UserRole } from '../types';
import { calculateDistance, formatDistance } from '../services/geoService';

interface CustomerListProps {
  customers: Account[]; 
  opportunities: Opportunity[];
  userLocation: Coordinates | null;
  onSelectCustomer: (customer: Account) => void;
  searchTerm: string;
  selectedIds: string[];
  onToggleSelection: (id: string) => void;
  currentUser: User;
}

const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  opportunities,
  userLocation,
  onSelectCustomer,
  searchTerm,
  selectedIds,
  onToggleSelection,
  currentUser
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('distance');
  const [filterCity, setFilterCity] = useState<string | null>(null);

  const getDealValue = (accId: string) => {
      return opportunities
        .filter(o => o.accountId === accId && o.stage !== 'Closed Lost' && o.stage !== 'Closed Won')
        .reduce((sum, o) => sum + o.value, 0);
  };
  
  const getNextAction = (accId: string) => {
      const opps = opportunities
        .filter(o => o.accountId === accId && o.stage !== 'Closed Lost')
        .sort((a,b) => new Date(a.expectedCloseDate).getTime() - new Date(b.expectedCloseDate).getTime());
      
      if (opps.length > 0) {
          const top = opps[0];
          return { text: top.nextStep || `Close ${top.title}`, date: top.expectedCloseDate };
      }
      return null;
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
        const matchesSearch = (c.name.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCity = !filterCity || c.city === filterCity;
        
        // Branch & Role Logic
        let matchesRole = false;
        if (currentUser.role === UserRole.ADMIN) {
            matchesRole = true;
        } else {
            // Both Managers and Reps can see all accounts in their BRANCH
            if (currentUser.branch && currentUser.branch !== 'ALL') {
                matchesRole = c.branch === currentUser.branch;
            } else {
                // Fallback for global users (if any) or missing branch data
                matchesRole = true;
            }
        }

        return matchesSearch && matchesCity && matchesRole;
    });
  }, [customers, searchTerm, filterCity, currentUser]);

  const cities = useMemo(() => {
    return Array.from(new Set(filteredCustomers.map(c => c.city).filter(Boolean) as string[])).sort();
  }, [filteredCustomers]);

  const sortedAndFiltered = useMemo(() => {
    let list = [...filteredCustomers];

    list = list.sort((a, b) => {
      if (sortBy === 'distance' && userLocation) {
        const distA = calculateDistance(userLocation, a.coordinates);
        const distB = calculateDistance(userLocation, b.coordinates);
        return distA - distB;
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'recent') {
        const dateA = a.lastVisitDate ? new Date(a.lastVisitDate).getTime() : 0;
        const dateB = b.lastVisitDate ? new Date(b.lastVisitDate).getTime() : 0;
        return dateB - dateA;
      } else if (sortBy === 'value') {
        return getDealValue(b.id) - getDealValue(a.id);
      }
      return 0;
    });
    return list;
  }, [filteredCustomers, userLocation, sortBy, opportunities]);

  const formatCurrency = (val?: number) => {
    if (!val) return null;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const isOverdue = (dateStr?: string) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  return (
    <div className="pb-32 space-y-3 p-4">
      <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
             <span className="text-xs font-bold text-slate-400 uppercase mr-1">City:</span>
             <button onClick={() => setFilterCity(null)} className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${!filterCity ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>All</button>
             {cities.map(city => (
               <button key={city} onClick={() => setFilterCity(city)} className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filterCity === city ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>{city}</button>
             ))}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
             <span className="text-xs font-bold text-slate-400 uppercase mr-1">Sort:</span>
             <button onClick={() => setSortBy('distance')} className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${sortBy === 'distance' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>Nearest</button>
             <button onClick={() => setSortBy('value')} className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${sortBy === 'value' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>Value</button>
             <button onClick={() => setSortBy('name')} className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${sortBy === 'name' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>A-Z</button>
          </div>
      </div>

      {sortedAndFiltered.map((customer) => {
        const distance = userLocation ? calculateDistance(userLocation, customer.coordinates) : null;
        const isSelected = selectedIds.includes(customer.id);
        const totalVal = getDealValue(customer.id);
        const dealVal = totalVal > 0 ? formatCurrency(totalVal) : null;
        const nextAction = getNextAction(customer.id);
        const overdue = isOverdue(nextAction?.date);
        
        // Count Ship-Tos
        const shipToCount = customer.addresses.filter(a => a.type === 'SHIP_TO').length;

        return (
          <div key={customer.id} className={`bg-white rounded-xl p-3 shadow-sm border transition-all flex items-start gap-3 relative overflow-hidden ${isSelected ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/50' : 'border-slate-100'}`}>
             <div className={`absolute left-0 top-0 bottom-0 w-1 ${customer.status === 'Active' ? 'bg-green-500' : customer.status === 'Prospect' ? 'bg-blue-400' : 'bg-slate-300'}`}></div>
            <div onClick={(e) => { e.stopPropagation(); onToggleSelection(customer.id); }} className={`mt-2 w-6 h-6 rounded-md border flex-shrink-0 flex items-center justify-center cursor-pointer transition-colors ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-300 hover:border-blue-400'}`}>
              {isSelected && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
            </div>
            <div className="flex-1 flex items-start gap-3 cursor-pointer min-w-0" onClick={() => onSelectCustomer(customer)}>
                <img src={customer.avatarUrl} alt={customer.name} className="w-12 h-12 mt-1 rounded-full object-cover bg-slate-200 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-900 truncate text-sm leading-tight">{customer.name}</h3>
                        {distance !== null && <span className="text-xs text-slate-400 whitespace-nowrap ml-2">{formatDistance(distance)}</span>}
                    </div>
                    <p className="text-xs text-slate-500 truncate mb-1">ID: {customer.erpId}</p>
                    <div className="flex gap-1 items-center">
                        <span className="text-[9px] bg-slate-100 px-1 rounded text-slate-500">{customer.city}</span>
                        {shipToCount > 1 && <span className="text-[9px] bg-yellow-50 text-yellow-700 px-1 rounded border border-yellow-100">+{shipToCount} Locs</span>}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        {dealVal && <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">{dealVal}</span>}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${customer.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{customer.status}</span>
                    </div>
                    {nextAction && (
                        <div className={`mt-2 flex items-center gap-1.5 text-xs ${overdue ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
                           <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                           <span className="truncate max-w-[150px]">{nextAction.text}</span>
                        </div>
                    )}
                </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CustomerList;
