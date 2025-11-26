
import React, { useState } from 'react';
import { Account, Contact, Opportunity, Visit, AccountAddress } from '../types';

interface CustomerDetailProps {
  customer: Account;
  contacts: Contact[];
  opportunities: Opportunity[];
  visits: Visit[];
  onBack: () => void;
  onAddVisit: () => void;
  onUpdateCustomer: (updated: Account) => void;
}

type Tab = 'OVERVIEW' | 'ADDRESSES' | 'CONTACTS' | 'DEALS' | 'VISITS';

const CustomerDetail: React.FC<CustomerDetailProps> = ({
  customer,
  contacts,
  opportunities,
  visits,
  onBack,
  onAddVisit,
  onUpdateCustomer
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('OVERVIEW');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AccountAddress | undefined>(
      customer.addresses.find(a => a.isDefault) || customer.addresses[0]
  );
  
  // Edit State
  const [editStatus, setEditStatus] = useState(customer.status);
  const [editTerms, setEditTerms] = useState(customer.paymentTerms || '');

  const customerVisits = visits.filter(v => v.accountId === customer.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSaveCRM = () => {
    onUpdateCustomer({
      ...customer,
      status: editStatus,
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

  const HeaderButton = ({ label, count, onClick, active }: { label: string, count?: number, onClick?: () => void, active?: boolean }) => (
      <button onClick={onClick} className={`px-3 py-1.5 rounded-md text-xs font-bold border transition-all whitespace-nowrap flex items-center gap-1.5 shadow-sm ${active ? 'bg-white text-blue-700 border-blue-200' : 'bg-gradient-to-b from-white to-slate-50 text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
          {label}
          {count !== undefined && ( <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${active ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'}`}>{count}</span> )}
      </button>
  );

  return (
    <div className="bg-slate-100 min-h-screen pb-24 font-sans">
      <div className="bg-white border-b border-slate-200 px-3 py-2 flex items-center gap-3 sticky top-0 z-20">
         <button onClick={onBack} className="text-slate-500 hover:text-slate-700 p-1"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg></button>
         <h1 className="text-lg font-bold text-slate-700 flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            Account Detail
         </h1>
      </div>
      <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 overflow-x-auto no-scrollbar flex gap-2">
         <button onClick={() => setIsEditing(!isEditing)} className="px-4 py-1.5 bg-[#4361ee] text-white rounded-md text-xs font-bold hover:bg-blue-700 shadow-sm flex items-center gap-1">
             {isEditing ? 'Cancel' : 'Edit'}
         </button>
         <HeaderButton label="Overview" active={activeTab === 'OVERVIEW'} onClick={() => setActiveTab('OVERVIEW')} />
         <HeaderButton label="Locations" count={customer.addresses.length} active={activeTab === 'ADDRESSES'} onClick={() => setActiveTab('ADDRESSES')} />
         <HeaderButton label="Contacts" count={contacts.length} active={activeTab === 'CONTACTS'} onClick={() => setActiveTab('CONTACTS')} />
         <HeaderButton label="Deals" count={opportunities.length} active={activeTab === 'DEALS'} onClick={() => setActiveTab('DEALS')} />
         <HeaderButton label="Visits" count={customerVisits.length} active={activeTab === 'VISITS'} onClick={() => setActiveTab('VISITS')} />
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-[#4361ee] text-white text-[10px] font-bold uppercase rounded shadow-sm tracking-wide">Customer</span>
            <span className="px-3 py-1 bg-[#4361ee] text-white text-[10px] font-bold uppercase rounded shadow-sm tracking-wide">{customer.paymentTerms || 'Terms N/A'}</span>
            <span className={`px-3 py-1 text-white text-[10px] font-bold uppercase rounded shadow-sm tracking-wide ${customer.status === 'Active' ? 'bg-green-500' : 'bg-slate-400'}`}>{customer.status}</span>
             {customer.branch && <span className="px-3 py-1 bg-slate-700 text-white text-[10px] font-bold uppercase rounded shadow-sm tracking-wide">Branch: {customer.branch}</span>}
        </div>

        <div className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-4 space-y-4">
                    {isEditing ? (
                        <div className="space-y-3">
                             <input className="w-full border p-2 rounded text-sm" value={editTerms} onChange={e => setEditTerms(e.target.value)} placeholder="Payment Terms" />
                             <button onClick={handleSaveCRM} className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold w-full">Save Changes</button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-[120px_1fr] gap-2 items-baseline">
                                <span className="text-xs font-bold text-slate-700">Account Name</span>
                                <span className="text-sm text-slate-600 font-bold">{customer.name}</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] gap-2 items-baseline">
                                <span className="text-xs font-bold text-slate-700">Address ({selectedAddress?.type})</span>
                                <div className="text-sm text-slate-600 uppercase">
                                    {selectedAddress?.address}<br/>{selectedAddress?.city}, {selectedAddress?.province}
                                </div>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] gap-2 items-baseline">
                                <span className="text-xs font-bold text-slate-700">ERP ID</span>
                                <span className="text-sm text-slate-600">{customer.erpId}</span>
                            </div>
                        </>
                    )}
                </div>
                <div className="bg-green-50 relative h-48 md:h-auto border-t md:border-t-0 md:border-l border-slate-200">
                     {selectedAddress && (
                        <iframe width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight={0} marginWidth={0} src={`https://maps.google.com/maps?q=${selectedAddress.coordinates.lat},${selectedAddress.coordinates.lng}&z=14&output=embed`} className="opacity-90"></iframe>
                     )}
                     <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 text-[10px] rounded shadow border">
                         Viewing: {selectedAddress?.shipToNumber ? `Ship-To #${selectedAddress.shipToNumber}` : selectedAddress?.type}
                     </div>
                </div>
            </div>
        </div>

        <div className="bg-white rounded shadow-sm border border-slate-200 min-h-[200px]">
            {activeTab === 'OVERVIEW' && (
                 <div className="p-4">
                     <h3 className="font-bold text-slate-800 mb-2">Summary</h3>
                     <p className="text-sm text-slate-500 mb-4">Total Revenue: {formatCurrency(customer.totalRevenue)}</p>
                     <p className="text-sm text-slate-500 mb-4">Credit Limit: {formatCurrency(customer.creditLimit || 0)}</p>
                     <button onClick={onAddVisit} className="w-full bg-blue-600 text-white py-2 rounded font-bold text-sm">Log New Visit</button>
                 </div>
            )}
            
            {activeTab === 'ADDRESSES' && (
                <div className="p-4 space-y-3">
                    {customer.addresses.map((addr) => (
                        <div 
                           key={addr.id} 
                           onClick={() => setSelectedAddress(addr)}
                           className={`p-3 rounded border flex justify-between items-center cursor-pointer transition-colors ${selectedAddress?.id === addr.id ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-white border-slate-200 hover:border-blue-300'}`}
                        >
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${addr.type === 'BILL_TO' ? 'bg-slate-200 text-slate-700' : 'bg-green-100 text-green-700'}`}>
                                        {addr.type === 'SHIP_TO' ? `SHIP TO #${addr.shipToNumber}` : 'BILL TO'}
                                    </span>
                                    {addr.isDefault && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">DEFAULT</span>}
                                    {addr.description && <span className="text-xs font-bold text-slate-700">{addr.description}</span>}
                                </div>
                                <div className="text-sm text-slate-600">{addr.address}, {addr.city}</div>
                            </div>
                            {selectedAddress?.id === addr.id && <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'CONTACTS' && (
                <div className="p-4 space-y-2">
                    {contacts.length === 0 && <p className="text-sm text-slate-400">No contacts synced.</p>}
                    {contacts.map(c => (
                        <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">{c.firstName.charAt(0)}</div>
                                <div>
                                    <div className="text-sm font-bold text-slate-800">{c.firstName} {c.lastName}</div>
                                    <div className="text-xs text-slate-500">{c.title}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {activeTab === 'DEALS' && (
                <div className="p-4 space-y-2">
                     {opportunities.length === 0 && <p className="text-sm text-slate-400">No active opportunities.</p>}
                     {opportunities.map(o => (
                         <div key={o.id} className="p-3 border rounded-lg hover:bg-slate-50">
                             <div className="flex justify-between">
                                 <div className="font-bold text-slate-800 text-sm">{o.title}</div>
                                 <div className="font-bold text-green-700 text-sm">{formatCurrency(o.value)}</div>
                             </div>
                             <div className="flex justify-between mt-1">
                                 <div className="text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-600">{o.stage}</div>
                                 <div className="text-xs text-slate-400">Close: {o.expectedCloseDate}</div>
                             </div>
                         </div>
                     ))}
                </div>
            )}

            {activeTab === 'VISITS' && (
                 <div className="p-4 space-y-4">
                     {customerVisits.map(visit => {
                         const loc = customer.addresses.find(a => a.id === visit.locationId);
                         return (
                             <div key={visit.id} className="border-l-4 border-blue-400 pl-3 py-1">
                                 <div className="flex justify-between items-start">
                                     <div className="text-xs text-slate-500 font-bold mb-1">{formatDate(visit.date)}</div>
                                     {loc && <span className="text-[9px] bg-slate-100 px-1 rounded text-slate-500">@{loc.shipToNumber ? `Ship-To ${loc.shipToNumber}` : loc.city}</span>}
                                 </div>
                                 <p className="text-sm text-slate-700">{visit.summary || visit.notes}</p>
                             </div>
                         );
                     })}
                 </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
