
import React, { useState } from 'react';
import { Customer, Visit } from '../types';

interface CustomerDetailProps {
  customer: Customer;
  visits: Visit[];
  onBack: () => void;
  onAddVisit: () => void;
  onUpdateCustomer: (updated: Customer) => void;
}

type Tab = 'OVERVIEW' | 'INDIVIDUALS' | 'ADDRESSES' | 'ACTIVITY' | 'FORECAST';

const CustomerDetail: React.FC<CustomerDetailProps> = ({
  customer,
  visits,
  onBack,
  onAddVisit,
  onUpdateCustomer
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('OVERVIEW');
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit State
  const [editStatus, setEditStatus] = useState(customer.status);
  const [editValue, setEditValue] = useState(customer.dealValue?.toString() || '');
  const [editAction, setEditAction] = useState(customer.nextActionText || '');
  const [editTerms, setEditTerms] = useState(customer.paymentTerms || '');
  const [editVisibleId, setEditVisibleId] = useState(customer.visibleId || '');
  const [editCity, setEditCity] = useState(customer.city || '');

  const customerVisits = visits.filter(v => v.customerId === customer.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSaveCRM = () => {
    onUpdateCustomer({
      ...customer,
      status: editStatus,
      dealValue: editValue ? parseFloat(editValue) : undefined,
      nextActionText: editAction,
      city: editCity,
      visibleId: editVisibleId,
      paymentTerms: editTerms
    });
    setIsEditing(false);
  };

  const formatCurrency = (val?: number) => {
    if (!val) return '$0';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const formatDate = (dateStr?: string) => {
      if(!dateStr) return 'N/A';
      return new Date(dateStr).toLocaleDateString();
  };

  // Reusable Blue Button for Header
  const HeaderButton = ({ label, count, onClick, active }: { label: string, count?: number, onClick?: () => void, active?: boolean }) => (
      <button 
        onClick={onClick}
        className={`px-3 py-1.5 rounded-md text-xs font-bold border transition-all whitespace-nowrap flex items-center gap-1.5 shadow-sm
        ${active ? 'bg-white text-blue-700 border-blue-200' : 'bg-gradient-to-b from-white to-slate-50 text-slate-600 border-slate-200 hover:bg-slate-50'}`}
      >
          {label}
          {count !== undefined && (
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${active ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'}`}>
                  {count}
              </span>
          )}
      </button>
  );

  return (
    <div className="bg-slate-100 min-h-screen pb-24 font-sans">
      {/* 1. Header Navigation Bar */}
      <div className="bg-white border-b border-slate-200 px-3 py-2 flex items-center gap-3 sticky top-0 z-20">
         <button onClick={onBack} className="text-slate-500 hover:text-slate-700 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
         </button>
         <h1 className="text-lg font-bold text-slate-700 flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            Company Detail
         </h1>
      </div>

      {/* 2. Control Ribbon (Blue Buttons) */}
      <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 overflow-x-auto no-scrollbar flex gap-2">
         <button 
           onClick={() => setIsEditing(!isEditing)}
           className="px-4 py-1.5 bg-[#4361ee] text-white rounded-md text-xs font-bold hover:bg-blue-700 shadow-sm flex items-center gap-1"
         >
             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
             {isEditing ? 'Cancel Edit' : 'Edit'}
         </button>
         <HeaderButton label="Individuals" count={customer.contacts?.length || 0} active={activeTab === 'INDIVIDUALS'} onClick={() => setActiveTab('INDIVIDUALS')} />
         <HeaderButton label="Addresses" count={1} active={activeTab === 'ADDRESSES'} onClick={() => setActiveTab('ADDRESSES')} />
         <HeaderButton label="Phone Numbers" count={1} />
         <HeaderButton label="Notes" count={customerVisits.length} />
         <HeaderButton label="Activity" count={0} active={activeTab === 'ACTIVITY'} onClick={() => setActiveTab('ACTIVITY')} />
         <button className="px-4 py-1.5 bg-[#4361ee] text-white rounded-md text-xs font-bold hover:bg-blue-700 shadow-sm ml-auto">
             + Add Forecast
         </button>
      </div>

      {/* 3. Action Bar (Light Blue) */}
      <div className="bg-[#4361ee] p-2 flex gap-2 overflow-x-auto no-scrollbar">
          <button onClick={onAddVisit} className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1 whitespace-nowrap backdrop-blur-sm border border-white/10">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Add Note
          </button>
          <button className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1 whitespace-nowrap backdrop-blur-sm border border-white/10">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              Add Activity
          </button>
          <button className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1 whitespace-nowrap backdrop-blur-sm border border-white/10">
             Add Activity Rule
          </button>
          <button className="bg-slate-100 text-[#4361ee] px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 whitespace-nowrap shadow-sm">
             Associated Companies
          </button>
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        
        {/* 4. Status Tags Row */}
        <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-[#4361ee] text-white text-[10px] font-bold uppercase rounded shadow-sm tracking-wide">
                Customer
            </span>
            <span className="px-3 py-1 bg-[#4361ee] text-white text-[10px] font-bold uppercase rounded shadow-sm tracking-wide">
                {customer.paymentTerms || 'Terms N/A'}
            </span>
            {customer.source && (
                <span className="px-3 py-1 bg-[#4361ee] text-white text-[10px] font-bold uppercase rounded shadow-sm tracking-wide">
                    {customer.source}
                </span>
            )}
            <span className={`px-3 py-1 text-white text-[10px] font-bold uppercase rounded shadow-sm tracking-wide ${customer.status === 'Active' ? 'bg-green-500' : 'bg-slate-400'}`}>
                {customer.status}
            </span>
        </div>

        {/* 5. Main Info Grid */}
        <div className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Left: Text Data */}
                <div className="p-4 space-y-4">
                    {isEditing ? (
                        <div className="space-y-3">
                             <input className="w-full border p-2 rounded text-sm" value={editVisibleId} onChange={e => setEditVisibleId(e.target.value)} placeholder="Customer ID" />
                             <input className="w-full border p-2 rounded text-sm" value={editTerms} onChange={e => setEditTerms(e.target.value)} placeholder="Payment Terms" />
                             <button onClick={handleSaveCRM} className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold w-full">Save Changes</button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-[120px_1fr] gap-2 items-baseline">
                                <span className="text-xs font-bold text-slate-700">Company Name</span>
                                <span className="text-sm text-slate-600">{customer.name}</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] gap-2 items-baseline">
                                <span className="text-xs font-bold text-slate-700">Address</span>
                                <div className="text-sm text-slate-600 uppercase">
                                    {customer.address}<br/>
                                    {customer.city}
                                </div>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] gap-2 items-baseline">
                                <span className="text-xs font-bold text-slate-700">Status</span>
                                <span className="text-sm text-slate-600">{customer.status}</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] gap-2 items-baseline">
                                <span className="text-xs font-bold text-slate-700">Customer ID</span>
                                <span className="text-sm text-slate-600">{customer.visibleId || 'N/A'}</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] gap-2 items-baseline">
                                <span className="text-xs font-bold text-slate-700">Last Sale</span>
                                <span className="text-sm text-slate-600">{formatDate(customer.lastSaleDate)}</span>
                            </div>
                             <div className="grid grid-cols-[120px_1fr] gap-2 items-baseline">
                                <span className="text-xs font-bold text-slate-700">Deal Value</span>
                                <span className="text-sm text-slate-600">{formatCurrency(customer.dealValue)}</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Right: Map Preview (Desktop style adapted for mobile) */}
                <div className="bg-green-50 relative h-48 md:h-auto border-t md:border-t-0 md:border-l border-slate-200">
                     <iframe 
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        scrolling="no" 
                        marginHeight={0} 
                        marginWidth={0} 
                        src={`https://maps.google.com/maps?q=${customer.coordinates.lat},${customer.coordinates.lng}&z=14&output=embed`}
                        className="opacity-90"
                     ></iframe>
                     <div className="absolute top-2 left-2 bg-white/90 p-2 rounded shadow text-xs">
                         <p className="font-bold">{customer.address}</p>
                         <a 
                             href={`https://www.google.com/maps/search/?api=1&query=${customer.coordinates.lat},${customer.coordinates.lng}`}
                             target="_blank"
                             rel="noreferrer"
                             className="text-blue-600 font-bold flex items-center gap-1 mt-1"
                         >
                             View larger map <span className="text-[10px]">↗</span>
                         </a>
                     </div>
                     <div className="absolute bottom-4 right-4 bg-white/90 p-1 rounded-full shadow cursor-pointer">
                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                     </div>
                </div>
            </div>

            {/* Performance Footer */}
            <div className="bg-slate-50 p-3 border-t border-slate-200 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-600 uppercase">Performance Ratio</span>
                <span className="text-sm font-mono font-bold text-slate-800">{customer.performanceRatio || '0.000'}*</span>
            </div>
        </div>

        {/* 6. Tabs Content Area */}
        <div className="bg-white rounded shadow-sm border border-slate-200 min-h-[200px]">
            {activeTab === 'OVERVIEW' && (
                 <div className="p-4">
                     <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                         <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                         Recent Visits
                     </h3>
                     {customerVisits.length === 0 ? (
                         <p className="text-slate-400 text-sm italic">No visits recorded.</p>
                     ) : (
                         <div className="space-y-4">
                             {customerVisits.map(visit => (
                                 <div key={visit.id} className="border-l-4 border-blue-400 pl-3 py-1">
                                     <div className="text-xs text-slate-500 font-bold mb-1">{formatDate(visit.date)}</div>
                                     <p className="text-sm text-slate-700">{visit.summary || visit.notes}</p>
                                 </div>
                             ))}
                         </div>
                     )}
                 </div>
            )}
            
            {activeTab === 'INDIVIDUALS' && (
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800">Individuals ({customer.contacts?.length || 0})</h3>
                        <button className="text-xs text-blue-600 font-bold">+ Add New</button>
                    </div>
                    <div className="space-y-2">
                        {customer.contacts?.map(c => (
                            <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                                        {c.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-800">{c.name} {c.isPrimary && <span className="text-[10px] text-green-600 bg-green-50 px-1 rounded border border-green-100">Primary</span>}</div>
                                        <div className="text-xs text-slate-500">{c.position}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                     <button className="p-1.5 bg-white border rounded text-slate-600 hover:text-blue-600">
                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                     </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'ADDRESSES' && (
                 <div className="p-4">
                      <div className="p-3 bg-green-50 border border-green-100 rounded mb-2">
                           <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-[10px] font-bold uppercase text-green-700 bg-green-100 px-1.5 rounded mb-1 inline-block">Primary</span>
                                    <p className="text-sm font-bold text-slate-800">Main Office</p>
                                    <p className="text-sm text-slate-600">{customer.address}</p>
                                    <p className="text-sm text-slate-600">{customer.city}, BC</p>
                                </div>
                                <button className="text-xs text-blue-600 font-bold">Edit</button>
                           </div>
                      </div>
                 </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default CustomerDetail;
