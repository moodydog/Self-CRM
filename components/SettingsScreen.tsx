import React, { useState } from 'react';
import { Account, Visit, User, Trip } from '../types';

interface SettingsScreenProps {
  currentUser: User;
  customers: Account[];
  visits: Visit[];
  onLogout: () => void;
  onBack: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ currentUser, customers, visits, onLogout, onBack }) => {
  const [showDebug, setShowDebug] = useState(false);

  // Retrieve trips from local storage for viewing
  const trips: Trip[] = JSON.parse(localStorage.getItem('trips') || '[]');

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ customers, visits, trips }, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "field_focus_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleResetData = () => {
    if (window.confirm("Are you sure? This will delete all local changes and reset the app to the demo state. This cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-[env(safe-area-inset-top)] pb-20">
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
         <button onClick={onBack} className="text-slate-500 hover:text-slate-700 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
         </button>
         <h1 className="text-lg font-bold text-slate-900">Settings</h1>
      </div>

      <div className="p-4 space-y-6">
        
        {/* Profile Section */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
            <img src={currentUser.avatarUrl} alt="profile" className="w-16 h-16 rounded-full border-2 border-blue-100" />
            <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900">{currentUser.name}</h2>
                <p className="text-sm text-slate-500">{currentUser.role === 'MANAGER' ? 'Sales Manager' : 'Field Representative'}</p>
                <p className="text-xs text-slate-400 mt-1">ID: {currentUser.id}</p>
            </div>
            <button onClick={onLogout} className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                Log Out
            </button>
        </div>

        {/* Data Management */}
        <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Data Management</h3>
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 divide-y divide-slate-50">
                <button onClick={handleExportData} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        </div>
                        <div>
                            <p className="font-medium text-slate-800">Export Data</p>
                            <p className="text-xs text-slate-500">Download customers & visits (JSON)</p>
                        </div>
                    </div>
                </button>
                
                <button onClick={() => setShowDebug(!showDebug)} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                        </div>
                        <div>
                            <p className="font-medium text-slate-800">Backend Inspector</p>
                            <p className="text-xs text-slate-500">{showDebug ? 'Hide' : 'View'} raw database structure</p>
                        </div>
                    </div>
                     <div className={`w-10 h-6 rounded-full p-1 transition-colors ${showDebug ? 'bg-purple-500' : 'bg-slate-300'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${showDebug ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                </button>
            </div>
        </div>

        {/* Backend Inspector View */}
        {showDebug && (
            <div className="bg-slate-900 rounded-xl p-4 shadow-inner overflow-hidden">
                <h3 className="text-white text-xs font-mono font-bold mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    LIVE DATABASE VIEW (READ-ONLY)
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <p className="text-purple-400 text-xs font-mono mb-1">// Table: Customers ({customers.length})</p>
                        <pre className="bg-black/50 text-slate-300 text-[10px] p-2 rounded overflow-x-auto font-mono h-32 no-scrollbar">
                            {JSON.stringify(customers, null, 2)}
                        </pre>
                    </div>

                    <div>
                        <p className="text-purple-400 text-xs font-mono mb-1">// Table: Visits ({visits.length})</p>
                        <pre className="bg-black/50 text-slate-300 text-[10px] p-2 rounded overflow-x-auto font-mono h-32 no-scrollbar">
                            {JSON.stringify(visits, null, 2)}
                        </pre>
                    </div>

                    <div>
                        <p className="text-purple-400 text-xs font-mono mb-1">// Table: Trips ({trips.length})</p>
                        <pre className="bg-black/50 text-slate-300 text-[10px] p-2 rounded overflow-x-auto font-mono h-32 no-scrollbar">
                            {JSON.stringify(trips, null, 2)}
                        </pre>
                    </div>
                </div>
                <p className="text-slate-500 text-[9px] font-mono mt-3">
                    * This data is currently stored in browser LocalStorage. In a production environment, this would be hosted on a PostgreSQL or NoSQL cloud database.
                </p>
            </div>
        )}

        {/* Danger Zone */}
        <div>
            <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 ml-1">Danger Zone</h3>
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-red-100">
                <button onClick={handleResetData} className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors text-left group">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </div>
                        <div>
                            <p className="font-medium text-red-600">Factory Reset</p>
                            <p className="text-xs text-red-400">Clear all data and reset demo</p>
                        </div>
                    </div>
                </button>
            </div>
        </div>
        
        <div className="text-center pt-8">
            <p className="text-xs text-slate-300">FieldFocus v1.0.3</p>
        </div>

      </div>
    </div>
  );
};

export default SettingsScreen;