
import React from 'react';
import { Customer, Visit, User } from '../types';
import { MOCK_USERS } from '../constants';

interface ManagerDashboardProps {
  customers: Customer[];
  visits: Visit[];
  users: User[];
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ customers, visits, users }) => {
  
  // Aggregate data by Rep
  const repStats = users.filter(u => u.role === 'REP').map(rep => {
      const repCustomers = customers.filter(c => c.assignedUserId === rep.id);
      const repVisits = visits.filter(v => v.createdByUserId === rep.id);
      
      const pipeline = repCustomers.reduce((acc, c) => acc + (c.dealValue || 0), 0);
      const activeDeals = repCustomers.filter(c => c.status === 'Active').length;
      
      return {
          ...rep,
          pipeline,
          visitCount: repVisits.length,
          activeDeals
      };
  }).sort((a, b) => b.pipeline - a.pipeline);

  const totalPipeline = customers.reduce((acc, c) => acc + (c.dealValue || 0), 0);
  const totalVisits = visits.length;

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0, notation: "compact" }).format(val);

  return (
    <div className="pb-32 space-y-4 p-4">
      {/* High Level Stats */}
      <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-4 text-white shadow-lg shadow-blue-200">
             <p className="text-xs font-bold opacity-70 uppercase mb-1">Total Pipeline</p>
             <p className="text-2xl font-black tracking-tight">{formatCurrency(totalPipeline)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
             <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Visits</p>
             <p className="text-2xl font-black text-slate-800">{totalVisits}</p>
          </div>
      </div>

      <h2 className="font-bold text-slate-800 text-lg mt-6">Rep Leaderboard</h2>
      <div className="space-y-3">
          {repStats.map((rep, index) => (
              <div key={rep.id} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="flex-shrink-0 relative">
                      <img src={rep.avatarUrl} alt={rep.name} className="w-12 h-12 rounded-full" />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">
                          #{index + 1}
                      </div>
                  </div>
                  <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">{rep.name}</h3>
                      <div className="flex gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-green-500"></span>
                              {rep.activeDeals} Active
                          </span>
                          <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                              {rep.visitCount} Visits
                          </span>
                      </div>
                  </div>
                  <div className="text-right">
                      <p className="text-sm font-black text-blue-600">{formatCurrency(rep.pipeline)}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Value</p>
                  </div>
              </div>
          ))}
      </div>

      <h2 className="font-bold text-slate-800 text-lg mt-6">Team Activity</h2>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {visits.slice(0, 5).map((visit, idx) => {
              const rep = users.find(u => u.id === visit.createdByUserId);
              const customer = customers.find(c => c.id === visit.customerId);
              
              return (
                  <div key={visit.id} className={`p-3 flex gap-3 ${idx !== 4 ? 'border-b border-slate-50' : ''}`}>
                      <img src={rep?.avatarUrl} className="w-8 h-8 rounded-full bg-slate-100" />
                      <div>
                          <p className="text-xs text-slate-500">
                             <span className="font-bold text-slate-900">{rep?.name}</span> visited <span className="font-bold text-slate-900">{customer?.name || 'Unknown'}</span>
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{new Date(visit.date).toLocaleDateString()}</p>
                      </div>
                  </div>
              );
          })}
      </div>
    </div>
  );
};

export default ManagerDashboard;
