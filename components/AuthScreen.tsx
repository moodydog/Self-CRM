
import React from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../constants';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-8">
        <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight mb-2">FieldFocus</h1>
        <p className="text-slate-400">Smart CRM for field sales teams.</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Select Persona</p>
        
        {MOCK_USERS.map(user => (
          <button
            key={user.id}
            onClick={() => onLogin(user)}
            className="w-full bg-white/10 hover:bg-white/20 transition-colors border border-white/5 rounded-xl p-4 flex items-center gap-4 group text-left"
          >
            <img 
              src={user.avatarUrl} 
              alt={user.name} 
              className="w-12 h-12 rounded-full border-2 border-transparent group-hover:border-blue-400 transition-colors"
            />
            <div className="flex-1">
              <h3 className="text-white font-bold">{user.name}</h3>
              <p className="text-sm text-slate-400 flex items-center gap-2">
                {user.role === UserRole.MANAGER ? (
                  <span className="text-purple-400 flex items-center gap-1">
                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                     Sales Manager
                  </span>
                ) : (
                  <span className="text-blue-400 flex items-center gap-1">
                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                     Field Rep
                  </span>
                )}
              </p>
            </div>
            <svg className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        ))}
      </div>
      
      <p className="mt-8 text-xs text-slate-600 max-w-xs">
        Note: This is a demo application. Data is saved locally on your device.
      </p>
    </div>
  );
};

export default AuthScreen;
