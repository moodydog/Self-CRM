
import React, { useState } from 'react';
import { Customer, Visit } from '../types';
import { polishVisitNotes } from '../services/geminiService';

interface VisitFormProps {
  customer: Customer;
  onSave: (visit: Visit) => void;
  onCancel: () => void;
}

const VisitForm: React.FC<VisitFormProps> = ({ customer, onSave, onCancel }) => {
  const [notes, setNotes] = useState('');
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
      customerId: customer.id,
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
        <button 
          onClick={handleSubmit} 
          disabled={!notes.trim()}
          className="text-blue-600 font-bold disabled:opacity-50"
        >
          Save
        </button>
      </div>

      <div className="p-5 flex-1">
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-1">Customer</label>
          <div className="text-lg font-bold text-slate-900">{customer.name}</div>
          <div className="text-slate-500 text-sm">{customer.company}</div>
        </div>

        <div className="mb-6 relative">
          <label className="block text-sm font-medium text-slate-700 mb-2 flex justify-between items-center">
            <span>Visit Notes</span>
            <button 
              type="button"
              onClick={handlePolish}
              disabled={isPolishing || !notes.trim()}
              className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex items-center gap-1 hover:bg-purple-200 transition-colors disabled:opacity-50"
            >
              {isPolishing ? (
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              )}
              AI Polish
            </button>
          </label>
          <textarea
            className="w-full h-48 p-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none text-slate-700 text-base"
            placeholder="Type your rough notes here... e.g. 'Met with Sarah, she wants 100 widgets next week, complained about delivery time.'"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
           <p className="text-xs text-slate-400 mt-2">
             Tip: Use "AI Polish" to turn rough bullet points into a professional summary.
           </p>
        </div>

        <div className="mb-6">
           <label className="block text-sm font-medium text-slate-700 mb-2">Photos</label>
           <div className="grid grid-cols-4 gap-2">
              {images.map((img, idx) => (
                <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-slate-200 relative">
                   <img src={img} alt="upload" className="w-full h-full object-cover" />
                </div>
              ))}
              <label className="aspect-square rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-blue-400 bg-slate-50 text-slate-400 hover:text-blue-500">
                 <input 
                   type="file" 
                   accept="image/*" 
                   capture="environment"
                   multiple 
                   className="hidden" 
                   onChange={handleImageUpload} 
                 />
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              </label>
           </div>
        </div>
      </div>
    </div>
  );
};

export default VisitForm;