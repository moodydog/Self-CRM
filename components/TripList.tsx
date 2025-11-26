import React, { useState } from 'react';
import { Trip, Account } from '../types';

interface TripListProps {
  trips: Trip[];
  customers: Account[];
  onLogVisitForCustomer: (customer: Account) => void;
  onViewCustomer: (customer: Account) => void;
}

const TripList: React.FC<TripListProps> = ({ trips, customers, onLogVisitForCustomer, onViewCustomer }) => {
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedTripId(prev => prev === id ? null : id);
  };

  const getCustomer = (id: string) => customers.find(c => c.id === id);

  // Sort trips descending by date
  const sortedTrips = [...trips].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="pb-32 space-y-4 p-4">
      {sortedTrips.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
              <p>No trips recorded yet.</p>
              <p className="text-xs mt-2">Start a trip from the List view to see it here.</p>
          </div>
      ) : (
          sortedTrips.map(trip => {
             const tripDate = new Date(trip.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
             const isExpanded = expandedTripId === trip.id;
             
             return (
                 <div key={trip.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                     {/* Trip Header */}
                     <div 
                        className="p-4 cursor-pointer hover:bg-slate-50 transition-colors flex justify-between items-center"
                        onClick={() => toggleExpand(trip.id)}
                     >
                         <div>
                             <div className="flex items-center gap-2 mb-1">
                                <span className={`w-2 h-2 rounded-full ${trip.status === 'Completed' ? 'bg-green-500' : trip.status === 'In Progress' ? 'bg-blue-500' : 'bg-slate-300'}`}></span>
                                <h3 className="font-bold text-slate-800 text-sm">{trip.name || 'Untitled Trip'}</h3>
                             </div>
                             <p className="text-xs text-slate-500">{tripDate} • {trip.accountIds.length} stops</p>
                         </div>
                         <button className="text-slate-400">
                             <svg className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                         </button>
                     </div>

                     {/* Trip Details (Route List) */}
                     {isExpanded && (
                         <div className="bg-slate-50 border-t border-slate-100 p-3 space-y-3">
                             <div className="relative pl-4 space-y-4 border-l-2 border-slate-200 ml-2">
                                 {trip.accountIds.map((custId, index) => {
                                     const customer = getCustomer(custId);
                                     if (!customer) return null;
                                     
                                     return (
                                         <div key={custId} className="relative">
                                             {/* Dot on line */}
                                             <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-slate-300 border-2 border-slate-50"></div>
                                             
                                             <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 text-sm">{customer.name}</h4>
                                                        <p className="text-xs text-slate-500">{customer.industry || customer.city}</p>
                                                    </div>
                                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">#{index + 1}</span>
                                                </div>
                                                
                                                <div className="flex gap-2 mt-2">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); onLogVisitForCustomer(customer); }}
                                                        className="flex-1 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                        Log Visit
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); onViewCustomer(customer); }}
                                                        className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded hover:bg-slate-200 transition-colors"
                                                    >
                                                        Profile
                                                    </button>
                                                </div>
                                             </div>
                                         </div>
                                     );
                                 })}
                             </div>
                         </div>
                     )}
                 </div>
             );
          })
      )}
    </div>
  );
};

export default TripList;