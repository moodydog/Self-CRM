
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface AdminDashboardProps {
  users: User[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ users }) => {
  const [activeTab, setActiveTab] = useState<'USERS' | 'SETTINGS'>('USERS');

  return (
    <div className="pb-32 space-y-6 p-6">
       <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg mb-6">
           <h2 className="text-2xl font-black mb-1">Admin Console</h2>
           <p className="text-slate-400">System Configuration & User Management</p>
       </div>

       <div className="flex gap-4 border-b border-slate-200 pb-2">
           <button 
             onClick={() => setActiveTab('USERS')}
             className={`pb-2 px-1 text-sm font-bold transition-colors ${activeTab === 'USERS' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
           >
               Users & Roles
           </button>
           <button 
             onClick={() => setActiveTab('SETTINGS')}
             className={`pb-2 px-1 text-sm font-bold transition-colors ${activeTab === 'SETTINGS' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
           >
               System Settings
           </button>
       </div>

       {activeTab === 'USERS' && (
           <div className="space-y-4">
               <div className="flex justify-between items-center">
                   <h3 className="font-bold text-slate-800">Active Users ({users.length})</h3>
                   <button className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded font-bold hover:bg-blue-700">
                       + Add User
                   </button>
               </div>
               
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                   <table className="w-full text-left text-sm">
                       <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500">
                           <tr>
                               <th className="p-4 font-bold">User</th>
                               <th className="p-4 font-bold">Role</th>
                               <th className="p-4 font-bold">Province</th>
                               <th className="p-4 font-bold text-right">Actions</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                           {users.map(user => (
                               <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                   <td className="p-4">
                                       <div className="flex items-center gap-3">
                                           <img src={user.avatarUrl} className="w-8 h-8 rounded-full" />
                                           <div>
                                               <p className="font-bold text-slate-900">{user.name}</p>
                                               <p className="text-xs text-slate-400">{user.id}</p>
                                           </div>
                                       </div>
                                   </td>
                                   <td className="p-4">
                                       <span className={`px-2 py-1 rounded text-xs font-bold ${
                                           user.role === 'ADMIN' ? 'bg-slate-100 text-slate-700' :
                                           user.role === 'MANAGER' ? 'bg-purple-100 text-purple-700' :
                                           'bg-blue-100 text-blue-700'
                                       }`}>
                                           {user.role}
                                       </span>
                                   </td>
                                   <td className="p-4">
                                       {user.province ? (
                                           <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{user.province}</span>
                                       ) : (
                                           <span className="text-slate-300 italic">Global</span>
                                       )}
                                   </td>
                                   <td className="p-4 text-right">
                                       <button className="text-blue-600 font-bold text-xs hover:underline">Edit</button>
                                   </td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               </div>
           </div>
       )}

       {activeTab === 'SETTINGS' && (
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center text-slate-400">
               <p>System configuration settings would go here.</p>
               <p className="text-xs mt-2">(API Keys, Integrations, Billing)</p>
           </div>
       )}
    </div>
  );
};

export default AdminDashboard;
