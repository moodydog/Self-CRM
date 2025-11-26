
import React, { useState } from 'react';
import { Account, Coordinates, AccountAddress } from '../types';
import { getAddressFromCoordinates } from '../services/geoService';

interface AddAccountFormProps {
  userLocation: Coordinates | null;
  onSave: (account: Account) => void;
  onCancel: () => void;
}

const AddAccountForm: React.FC<AddAccountFormProps> = ({ userLocation, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'Active' | 'Prospect' | 'Churned'>('Prospect');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [branch, setBranch] = useState('VAN'); // Default
  const [erpId, setErpId] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  const guessCityFromAddress = (addr: string) => {
      if (addr.includes("Richmond")) return "Richmond";
      if (addr.includes("Delta")) return "Delta";
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
            (err) => { setIsLoadingAddress(false); }
        );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!coordinates) return;

      const mainAddress: AccountAddress = {
          id: `addr_${Date.now()}`,
          type: 'SHIP_TO',
          shipToNumber: 1,
          description: 'Main Location',
          address: address,
          city: city.trim(),
          province: 'BC',
          coordinates: coordinates,
          isDefault: true
      };

      const newAccount: Account = {
          id: `a_${Date.now()}`,
          erpId: erpId || 'PENDING',
          name,
          address,
          city: city.trim(),
          province: 'BC',
          coordinates,
          branch,
          status,
          tier: 'Mid',
          paymentTerms: paymentTerms || 'Net 30',
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
          addresses: [mainAddress]
      };
      onSave(newAccount);
  };

  return (
    <div className="bg-white min-h-screen flex flex-col pb-20">
      <div className="sticky top-0 bg-white z-10 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <button onClick={onCancel} className="text-slate-500 font-medium">Cancel</button>
        <h1 className="text-lg font-bold text-slate-800">Add Account</h1>
        <button onClick={handleSubmit} disabled={!name || !coordinates} className="text-blue-600 font-bold disabled:opacity-50">Save</button>
      </div>

      <div className="p-5 space-y-5">
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Account Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Acme Corp" />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ERP ID (Optional)</label>
                <input type="text" value={erpId} onChange={(e) => setErpId(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="CUST-000" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Branch</label>
                <select value={branch} onChange={(e) => setBranch(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="VAN">Vancouver</option>
                    <option value="TOR">Toronto</option>
                </select>
            </div>
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
            <div className="flex flex-col gap-2">
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-24 text-sm" placeholder="Address..." />
                <button type="button" onClick={handleGetLocation} className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                    {isLoadingAddress ? "Locating..." : "Use GPS"}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AddAccountForm;
