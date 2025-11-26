
import React, { useMemo, useState } from 'react';
import { Customer, Coordinates, SortOption, User } from '../types';
import { calculateDistance, formatDistance } from '../services/geoService';

interface CustomerListProps {
  customers: Customer[];
  userLocation: Coordinates | null;
  onSelectCustomer: (customer: Customer) => void;
  searchTerm: string;
  selectedIds: string[];
  onToggleSelection: (id: string) => void;
  currentUser: User;
}

const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  userLocation,
  onSelectCustomer,
  searchTerm,
  selectedIds,
  onToggleSelection,
  currentUser
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('distance');
  const [filterCity, setFilterCity] = useState<string | null>(null);

  // Filter Logic:
  // 1. Filter by Search Term
  // 2. Filter by City
  // 3. Filter by Role (Manager sees all, Rep sees assigned)
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
        const matchesSearch = (c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                               c.company.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCity = !filterCity || c.city === filterCity;
        
        // RBAC: Manager sees all, Rep sees assigned only
        const matchesRole = currentUser.role === 'MANAGER' || c.assignedUserId === currentUser.id;

        return matchesSearch && matchesCity && matchesRole;
    });
  }, [customers, searchTerm, filterCity, currentUser]);

  // Extract unique cities for filter (from filtered list or full list? Full list of what they can see)
  const cities = useMemo(() => {
    const visibleCustomers = currentUser.role === 'MANAGER' ? customers : customers.filter(c => c.assignedUserId === currentUser.id);
    const allCities = visibleCustomers.map(c => c.city).filter(Boolean) as string[];
    return Array.from(new Set(allCities)).sort();
  }, [customers, currentUser]);

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
        return (b.dealValue || 0) - (a.dealValue || 0);
      }
      return 0;
    });

    return list;
  }, [filteredCustomers, userLocation, sortBy]);

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
      {/* Controls Container */}
      <div className="flex flex-col gap-2 mb-4">
          
          {/* City Filter */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
             <span className="text-xs font-bold text-slate-400 uppercase mr-1">City:</span>
             <button 
               onClick={() => setFilterCity(null)}
               className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${!filterCity ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
             >
               All
             </button>
             {cities.map(city => (
               <button 
                 key={city}
                 onClick={() => setFilterCity(city)}
                 className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filterCity === city ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
               >
                 {city}
               </button>
             ))}
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
             <span className="text-xs font-bold text-slate-400 uppercase mr-1">Sort:</span>
             <button 
               onClick={() => setSortBy('distance')}
               className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${sortBy === 'distance' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
             >
               Nearest
             </button>
             <button 
               onClick={() => setSortBy('value')}
               className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${sortBy === 'value' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
             >
               Value
             </button>
             <button 
               onClick={() => setSortBy('name')}
               className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${sortBy === 'name' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
             >
               A-Z
             </button>
             <button 
               onClick={() => setSortBy('recent')}
               className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${sortBy === 'recent' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
             >
               Recent
             </button>
          </div>
      </div>

      {sortedAndFiltered.map((customer) => {
        const distance = userLocation 
          ? calculateDistance(userLocation, customer.coordinates) 
          : null;
        
        const isSelected = selectedIds.includes(customer.id);
        const dealVal = formatCurrency(customer.dealValue);
        const overdue = isOverdue(customer.nextActionDate);

        return (
          <div 
            key={customer.id}
            className={`bg-white rounded-xl p-3 shadow-sm border transition-all flex items-start gap-3 relative overflow-hidden ${isSelected ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/50' : 'border-slate-100'}`}
          >
             {/* Left color bar based on status */}
             <div className={`absolute left-0 top-0 bottom-0 w-1 ${
               customer.status === 'Active' ? 'bg-green-500' : 
               customer.status === 'Prospect' ? 'bg-blue-400' : 'bg-slate-300'
             }`}></div>

            {/* Checkbox for Trip Selection */}
            <div 
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelection(customer.id);
              }}
              className={`mt-2 w-6 h-6 rounded-md border flex-shrink-0 flex items-center justify-center cursor-pointer transition-colors ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-300 hover:border-blue-400'}`}
            >
              {isSelected && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
            </div>

            {/* Main Content -> Click to Detail */}
            <div 
              className="flex-1 flex items-start gap-3 cursor-pointer min-w-0"
              onClick={() => onSelectCustomer(customer)}
            >
                <img 
                src={customer.avatarUrl} 
                alt={customer.name} 
                className="w-12 h-12 mt-1 rounded-full object-cover bg-slate-200 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-900 truncate text-sm leading-tight">{customer.name}</h3>
                        {distance !== null && (
                        <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                            {formatDistance(distance)}
                        </span>
                        )}
                    </div>
                    
                    <p className="text-xs text-slate-500 truncate mb-1">{customer.company}</p>
                    
                    {/* CRM Chips & Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        {dealVal && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                {dealVal}
                            </span>
                        )}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                        customer.status === 'Active' ? 'bg-green-100 text-green-700' :
                        customer.status === 'Prospect' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                        }`}>
                        {customer.status}
                        </span>
                        {/* Tags Display */}
                        {customer.tags && customer.tags.slice(0, 2).map(tag => (
                             <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-md font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                {tag}
                             </span>
                        ))}
                        {customer.tags && customer.tags.length > 2 && (
                             <span className="text-[10px] px-1 py-0.5 text-slate-400">+{customer.tags.length - 2}</span>
                        )}
                    </div>

                    {/* Next Action Preview */}
                    {customer.nextActionText && (
                        <div className={`mt-2 flex items-center gap-1.5 text-xs ${overdue ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
                           <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                           <span className="truncate max-w-[150px]">{customer.nextActionText}</span>
                           {overdue && <span className="bg-red-100 text-red-700 px-1 rounded text-[9px] uppercase font-bold">Overdue</span>}
                        </div>
                    )}
                </div>
            </div>
          </div>
        );
      })}
      
      {sortedAndFiltered.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <p>No customers found.</p>
          {currentUser.role === 'REP' && (
             <p className="text-xs mt-2">You only see customers assigned to you.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerList;
