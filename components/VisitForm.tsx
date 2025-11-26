
import React, { useState } from 'react';
import { Account, Visit } from '../types';
import { polishVisitNotes } from '../services/geminiService';

interface VisitFormProps {
  customer: Account;
  onSave: (visit: Visit) => void;
  onCancel: () => void;
}

const VisitForm: React.FC<VisitFormProps> = ({ customer, onSave, onCancel }) => {
  const [notes, setNotes] = useState('');
  const [locationId, setLocationId] = useState(customer.addresses.find(a => a.isDefault)?.id || customer.addresses[0]?.id || '');
  const [isPolishing, setIsPolishing] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const handlePolish = async () => {
    if (!notes.trim()) return;
    setIsPolishing(true);
    const polished = await polishVisitNotes(notes);
    setNotes(polished);
    setIsPolishing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setImages(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newVisit: Visit = {
      id: Date.now().toString(),
      accountId: customer.id,
      locationId: locationId,
      date: new Date().toISOString(),
      notes: notes,
      photos: images
    };
    onSave(newVisit);
  };

  return (
    <div className="bg-white min-h-screen flex flex-col pt-[env(safe-area-inset-top)]">
      <div className="sticky top-0 bg-white z-10 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <button onClick={onCancel} className="text-slate-500 font-medium">Cancel</button>
        <h1 className="text-lg font-bold text-slate-800">New Visit</h1>
        <button onClick={handleSubmit} disabled={!notes.trim()} className="text-blue-600 font-bold disabled:opacity-50">Save</button>
      </div>
      <div className="p-5 flex-1">
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Account</label>
          <div className="text-lg font-bold text-slate-900">{customer.name}</div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Location Visited</label>
          <select 
             value={locationId} 
             onChange={(e) => setLocationId(e.target.value)}
             className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          >
              {customer.addresses.map(addr => (
                  <option key={addr.id} value={addr.id}>
                      {addr.type === 'SHIP_TO' ? `Ship To #${addr.shipToNumber}` : 'Billing'} - {addr.address}, {addr.city}
                  </option>
              ))}
          </select>
        </div>

        <div className="mb-6 relative">
          <label className="block text-sm font-medium text-slate-700 mb-2 flex justify-between items-center">
            <span>Visit Notes</span>
            <button type="button" onClick={handlePolish} disabled={isPolishing || !notes.trim()} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex items-center gap-1 hover:bg-purple-200 transition-colors disabled:opacity-50">
              {isPolishing ? "..." : "AI Polish"}
            </button>
          </label>
          <textarea className="w-full h-40 p-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none text-slate-700 text-base" placeholder="Type your rough notes here..." value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
        </div>
        <div className="mb-6">
           <label className="block text-sm font-medium text-slate-700 mb-2">Photos</label>
           <div className="grid grid-cols-4 gap-2">
              {images.map((img, idx) => (<div key={idx} className="aspect-square rounded-lg overflow-hidden border border-slate-200 relative"><img src={img} alt="upload" className="w-full h-full object-cover" /></div>))}
              <label className="aspect-square rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-blue-400 bg-slate-50 text-slate-400 hover:text-blue-500">
                 <input type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={handleImageUpload} />
                 <span>+</span>
              </label>
           </div>
        </div>
      </div>
    </div>
  );
};
export default VisitForm;
