
import React, { useState } from 'react';
import { Customer, Coordinates } from '../types';
import { getAddressFromCoordinates, getCoordinatesFromAddress } from '../services/geoService';

interface AddCustomerFormProps {
  userLocation: Coordinates | null;
  onSave: (customer: Customer) => void;
  onCancel: () => void;
}

const AddCustomerForm: React.FC<AddCustomerFormProps> = ({ userLocation, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState<'Active' | 'Prospect' | 'Churned'>('Prospect');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [tags, setTags] = useState('');
  const [dealValue, setDealValue] = useState('');
  
  // New Fields
  const [visibleId, setVisibleId] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');

  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Helper to extract city from address string (naive approach)
  const guessCityFromAddress = (addr: string) => {
      if (addr.includes("Richmond")) return "Richmond";
      if (addr.includes("Delta")) return "Delta";
      if (addr.includes("Vancouver")) return "Vancouver";
      if (addr.includes("Burnaby")) return "Burnaby";
      if (addr.includes("Surrey")) return "Surrey";
      return "";
  };

  const handleGetLocation = async () => {
    setIsLoadingAddress(true);
    
    if (userLocation) {
        setCoordinates(userLocation);
        const addr = await getAddressFromCoordinates(userLocation.lat, userLocation.lng);
        setAddress(addr);
        setCity(guessCityFromAddress(addr));
        setIsLoadingAddress(false);
        return;
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setCoordinates(coords);
                const addr = await getAddressFromCoordinates(coords.lat, coords.lng);
                setAddress(addr);
                setCity(guessCityFromAddress(addr));
                setIsLoadingAddress(false);
            },
            (err) => {
                alert("Could not get location. Please enter address manually.");
                setIsLoadingAddress(false);
            }
        );
    } else {
        setIsLoadingAddress(false);
    }
  };

  const handleSearchAddress = async () => {
      if (!address.trim()) return;
      setIsSearching(true);
      const result = await getCoordinatesFromAddress(address);
      if (result) {
          setCoordinates({ lat: result.lat, lng: result.lng });
          setAddress(result.displayName);
          setCity(guessCityFromAddress(result.displayName));
      } else {
          alert("Address not found. Please try a specific address (Street, City) or use GPS.");
      }
      setIsSearching(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!coordinates) return;

      const finalTags = tags.split(',').map(t => t.trim()).filter(Boolean);

      const newCustomer: Customer = {
          id: `c_${Date.now()}`,
          name,
          company,
          address,
          city: city.trim(),
          coordinates,
          email: '', // Optional for MVP
          phone: '',
          status,
          dealValue: dealValue ? parseFloat(dealValue) : undefined,
          tags: finalTags,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
          createdAt: new Date().toISOString(),
          contacts: [], // Initialize with empty array
          // New Fields
          visibleId: visibleId || undefined,
          paymentTerms: paymentTerms || 'NET 30'
      };
      onSave(newCustomer);
  };

  return (
    <div className="bg-white min-h-screen flex flex-col pb-20">
      <div className="sticky top-0 bg-white z-10 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <button onClick={onCancel} className="text-slate-500 font-medium">Cancel</button>
        <h1 className="text-lg font-bold text-slate-800">Add Customer</h1>
        <button 
          onClick={handleSubmit} 
          disabled={!name || !coordinates}
          className="text-blue-600 font-bold disabled:opacity-50"
        >
          Save
        </button>
      </div>

      <div className="p-5 space-y-5">
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Jane Doe"
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
            <input 
                type="text" 
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Acme Corp"
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer ID</label>
                <input 
                    type="text" 
                    value={visibleId}
                    onChange={(e) => setVisibleId(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. 2AH"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Terms</label>
                <input 
                    type="text" 
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. NET 30"
                />
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option value="Prospect">Prospect</option>
                    <option value="Active">Active</option>
                    <option value="Churned">Churned</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Est. Value ($)</label>
                <input 
                    type="number" 
                    value={dealValue}
                    onChange={(e) => setDealValue(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="0.00"
                />
            </div>
        </div>

        <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma separated)</label>
             <input 
                 type="text" 
                 value={tags}
                 onChange={(e) => setTags(e.target.value)}
                 className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                 placeholder="e.g. Urgent, VIP, Retail"
             />
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Address & Location</label>
            
            <div className="flex flex-col gap-2">
                <textarea 
                    value={address}
                    onChange={(e) => {
                        setAddress(e.target.value);
                    }}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24 text-sm"
                    placeholder="Enter street address or place name..."
                />
                
                <input 
                    type="text" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    placeholder="City (e.g. Delta)"
                />

                <div className="flex gap-2">
                    <button 
                        type="button"
                        onClick={handleSearchAddress}
                        disabled={!address.trim() || isSearching || isLoadingAddress}
                        className="flex-1 bg-blue-100 text-blue-700 py-3 rounded-xl text-sm font-bold hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                    >
                        {isSearching ? (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        )}
                        Find on Map
                    </button>
                    <button 
                        type="button"
                        onClick={handleGetLocation}
                        disabled={isSearching || isLoadingAddress}
                        className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                    >
                        {isLoadingAddress ? (
                            <span className="flex gap-1 items-center">Locating...</span>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                Use GPS
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="mt-3">
                {coordinates ? (
                    <div className="flex items-center gap-2 text-xs text-green-600 font-medium bg-green-50 p-3 rounded-xl border border-green-100">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>Location Confirmed: {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-xs text-amber-600 font-medium bg-amber-50 p-3 rounded-xl border border-amber-100">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        <span>Valid location required to save</span>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AddCustomerForm;
