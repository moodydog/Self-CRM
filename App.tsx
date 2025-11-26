

import React, { useState, useEffect } from 'react';
import { Account, Contact, Opportunity, Visit, ViewState, Coordinates, Trip, User, UserRole } from './types';
import { INITIAL_ACCOUNTS, INITIAL_CONTACTS, INITIAL_OPPORTUNITIES, MOCK_VISIT_HISTORY, MOCK_TRIPS, MOCK_USERS } from './constants';
import CustomerList from './components/CustomerList';
import CustomerDetail from './components/CustomerDetail';
import VisitForm from './components/VisitForm';
import RadarMap from './components/RadarMap';
import AddCustomerForm from './components/AddCustomerForm';
import TripList from './components/TripList';
import AuthScreen from './components/AuthScreen';
import SettingsScreen from './components/SettingsScreen';
import ManagerDashboard from './components/ManagerDashboard';
import AdminDashboard from './components/AdminDashboard';
import { buildGoogleMapsRouteUrl } from './services/geoService';

const App: React.FC = () => {
  // --- State ---
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [viewState, setViewState] = useState<ViewState>(currentUser ? ViewState.LIST : ViewState.AUTH);

  // Data Stores
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('accounts');
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('contacts');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => {
      const saved = localStorage.getItem('opportunities');
      return saved ? JSON.parse(saved) : INITIAL_OPPORTUNITIES;
  });

  const [visits, setVisits] = useState<Visit[]>(() => {
    const saved = localStorage.getItem('visits');
    return saved ? JSON.parse(saved) : MOCK_VISIT_HISTORY;
  });
  const [trips, setTrips] = useState<Trip[]>(() => {
    const saved = localStorage.getItem('trips');
    return saved ? JSON.parse(saved) : MOCK_TRIPS;
  });
  
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
        if (event.state && event.state.view) {
            setViewState(event.state.view);
            if (event.state.account) {
                setSelectedAccount(event.state.account);
            } else {
                setSelectedAccount(null);
            }
        } else {
            setViewState(currentUser ? ViewState.LIST : ViewState.AUTH);
        }
    };
    window.addEventListener('popstate', handlePopState);
    if (currentUser) {
        window.history.replaceState({ view: ViewState.LIST }, '');
    }
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentUser]);

  const pushView = (view: ViewState, account: Account | null = null) => {
      window.history.pushState({ view, account }, '');
      setViewState(view);
      setSelectedAccount(account);
  };

  useEffect(() => {
    if (currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        if (viewState === ViewState.AUTH) {
            if (currentUser.role === UserRole.ADMIN) setViewState(ViewState.ADMIN_DASHBOARD);
            else if (currentUser.role === UserRole.MANAGER) setViewState(ViewState.MANAGER_DASHBOARD);
            else setViewState(ViewState.LIST);
        }
    } else {
        localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  useEffect(() => localStorage.setItem('accounts', JSON.stringify(accounts)), [accounts]);
  useEffect(() => localStorage.setItem('contacts', JSON.stringify(contacts)), [contacts]);
  useEffect(() => localStorage.setItem('opportunities', JSON.stringify(opportunities)), [opportunities]);
  useEffect(() => localStorage.setItem('visits', JSON.stringify(visits)), [visits]);
  useEffect(() => localStorage.setItem('trips', JSON.stringify(trips)), [trips]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        (error) => { console.error("Error getting location", error); setUserLocation({ lat: 49.0900, lng: -123.0800 }); }
      );
    }
  }, []);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
      setToast({ msg, type });
      setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = (user: User) => {
      setCurrentUser(user);
      if (user.role === UserRole.ADMIN) pushView(ViewState.ADMIN_DASHBOARD);
      else if (user.role === UserRole.MANAGER) pushView(ViewState.MANAGER_DASHBOARD);
      else pushView(ViewState.LIST);
  };

  const handleLogout = () => {
      setCurrentUser(null);
      pushView(ViewState.AUTH);
  };

  const handleSelectAccount = (account: Account) => {
    pushView(ViewState.ACCOUNT_DETAIL, account);
  };

  const handleToggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleStartAddAccount = () => {
    pushView(ViewState.ADD_ACCOUNT);
  };

  const handleSaveAccount = (newAccount: Account) => {
    // Inherit user's branch
    const accWithUser = { ...newAccount, assignedUserId: currentUser?.id, province: currentUser?.province || 'BC', branch: currentUser?.branch || 'VAN' };
    setAccounts(prev => [accWithUser, ...prev]);
    window.history.back(); 
    showToast("Account added successfully!");
  };

  const handleUpdateAccount = (updated: Account) => {
      setAccounts(prev => prev.map(c => c.id === updated.id ? updated : c));
      setSelectedAccount(updated);
      showToast("Account updated!");
  };

  const handleBackToNav = () => {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        if (currentUser?.role === UserRole.ADMIN) setViewState(ViewState.ADMIN_DASHBOARD);
        else if (currentUser?.role === UserRole.MANAGER) setViewState(ViewState.MANAGER_DASHBOARD);
        else setViewState(ViewState.LIST);
        setSelectedAccount(null);
    }
  };

  const handleAddVisitStart = () => {
    pushView(ViewState.VISIT_FORM, selectedAccount);
  };

  const handleLogVisitForAccount = (account: Account) => {
      pushView(ViewState.VISIT_FORM, account);
  };

  const handleSaveVisit = (visit: Visit) => {
    const visitWithUser: Visit = { ...visit, createdByUserId: currentUser?.id, erpSyncStatus: 'PENDING' };
    setVisits(prev => [visitWithUser, ...prev]);
    // update last visit date on account
    setAccounts(prev => prev.map(a => a.id === visit.accountId ? { ...a, lastVisitDate: visit.date } : a));
    window.history.back();
    showToast("Visit logged successfully!");
  };

  const handleStartTrip = () => {
      if (!userLocation) { alert("Waiting for GPS..."); return; }
      if (selectedIds.length === 0) return;
      const selectedAccs = selectedIds.map(id => accounts.find(c => c.id === id)).filter(Boolean) as Account[];
      const url = buildGoogleMapsRouteUrl(userLocation, selectedAccs);
      
      const newTrip: Trip = {
          id: `t_${Date.now()}`,
          date: new Date().toISOString(),
          name: `Trip - ${new Date().toLocaleDateString()}`,
          accountIds: selectedAccs.map(c => c.id),
          status: 'In Progress',
          assignedUserId: currentUser?.id || ''
      };
      setTrips(prev => [newTrip, ...prev]);
      setSelectedIds([]);
      window.open(url, '_blank');
      pushView(ViewState.TRIPS);
  };

  const myAccounts = accounts.filter(c => c.assignedUserId === currentUser?.id);
  
  const myPipelineValue = opportunities
    .filter(o => myAccounts.some(a => a.id === o.accountId))
    .reduce((acc, curr) => acc + curr.value, 0);

  const visitsThisWeek = visits.filter(v => {
      const d = new Date(v.date);
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return d > oneWeekAgo && v.createdByUserId === currentUser?.id;
  }).length;
  
  const overdueTasks = opportunities.filter(o => myAccounts.some(a => a.id === o.accountId) && new Date(o.expectedCloseDate) < new Date()).length;

  const renderRepDashboardWidget = () => (
      <div className="mx-4 mt-2 mb-4 bg-white rounded-xl shadow-sm border border-slate-200 p-4 grid grid-cols-3 gap-2">
          <div className="text-center border-r border-slate-100">
             <p className="text-[10px] uppercase font-bold text-slate-400">Pipeline</p>
             <p className="text-sm font-black text-slate-800">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: "compact" }).format(myPipelineValue)}
             </p>
          </div>
          <div className="text-center border-r border-slate-100">
             <p className="text-[10px] uppercase font-bold text-slate-400">Visits (7d)</p>
             <p className="text-sm font-black text-blue-600">{visitsThisWeek}</p>
          </div>
          <div className="text-center">
             <p className="text-[10px] uppercase font-bold text-slate-400">Overdue</p>
             <p className={`text-sm font-black ${overdueTasks > 0 ? 'text-red-500' : 'text-green-500'}`}>{overdueTasks}</p>
          </div>
      </div>
  );

  const renderMainView = () => (
    <div className="max-w-md mx-auto bg-slate-50 min-h-[100dvh] shadow-xl relative overflow-hidden flex flex-col pt-[env(safe-area-inset-top)]">
      {toast && (
          <div className={`absolute top-20 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-bold animate-fade-in-down ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
              {toast.msg}
          </div>
      )}
      <div className="bg-white px-5 pt-8 pb-2 shadow-sm z-20 sticky top-0">
        <div className="flex justify-between items-center mb-4">
           <div className="flex items-center gap-3">
              <button onClick={() => pushView(ViewState.SETTINGS)}>
                  <img src={currentUser?.avatarUrl} className="w-10 h-10 rounded-full border-2 border-slate-100" alt="profile" />
              </button>
              <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">FieldFocus</h1>
                  <p className="text-xs text-slate-500 font-medium">
                    {currentUser?.role === UserRole.ADMIN ? 'Administrator' : `Hello, ${currentUser?.name.split(' ')[0]}`}
                  </p>
              </div>
           </div>
           {currentUser?.role === UserRole.REP && (
               <button onClick={handleStartAddAccount} className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md active:scale-95 transition-transform flex items-center gap-1">
                 <span>+ New</span>
               </button>
           )}
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg mb-2">
          {currentUser?.role === UserRole.ADMIN ? (
               <button className="flex-1 py-1.5 text-sm font-medium rounded-md bg-white text-slate-900 shadow-sm">Admin</button>
          ) : (
            <>
                {currentUser?.role === UserRole.MANAGER && (
                    <button className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${viewState === ViewState.MANAGER_DASHBOARD ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`} onClick={() => pushView(ViewState.MANAGER_DASHBOARD)}>Dash</button>
                )}
                <button className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${viewState === ViewState.LIST ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`} onClick={() => pushView(ViewState.LIST)}>{currentUser?.role === UserRole.MANAGER ? 'Accts' : 'My List'}</button>
                <button className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${viewState === ViewState.MAP ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`} onClick={() => pushView(ViewState.MAP)}>Map</button>
                <button className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${viewState === ViewState.TRIPS ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`} onClick={() => pushView(ViewState.TRIPS)}>Trips</button>
            </>
          )}
        </div>
        {viewState === ViewState.LIST && (
            <div className="relative mb-2">
            <input type="text" placeholder={currentUser?.role === UserRole.MANAGER ? "Search..." : "Search my accounts..."} className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar relative bg-slate-50">
        {viewState === ViewState.ADMIN_DASHBOARD && <AdminDashboard users={MOCK_USERS} />}
        {viewState === ViewState.MANAGER_DASHBOARD && currentUser?.role === UserRole.MANAGER && <ManagerDashboard customers={accounts} visits={visits} users={MOCK_USERS} />}
        {viewState === ViewState.LIST && currentUser && (
           <>
               {currentUser.role === UserRole.REP && renderRepDashboardWidget()}
               <CustomerList 
                    customers={accounts}
                    opportunities={opportunities} 
                    userLocation={userLocation} 
                    onSelectCustomer={handleSelectAccount}
                    searchTerm={searchTerm}
                    selectedIds={selectedIds}
                    onToggleSelection={handleToggleSelection}
                    currentUser={currentUser}
               />
           </>
        )}
        {viewState === ViewState.MAP && currentUser && (
           <div className="h-full w-full p-4 pb-24">
              {userLocation ? (
                 <RadarMap 
                   userLocation={userLocation}
                   // Use the same filtering logic for map as the list
                   customers={
                       currentUser.role === UserRole.ADMIN ? accounts :
                       currentUser.role === UserRole.MANAGER ? accounts.filter(c => c.branch === currentUser.branch) :
                       accounts.filter(c => c.assignedUserId === currentUser.id)
                   }
                   onSelectCustomer={handleSelectAccount}
                   selectedIds={selectedIds}
                   onToggleSelection={handleToggleSelection}
                 />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400"><p>Waiting for GPS...</p></div>
              )}
           </div>
        )}
        {viewState === ViewState.TRIPS && (
             <TripList 
                trips={currentUser?.role === UserRole.MANAGER ? trips : trips.filter(t => t.assignedUserId === currentUser?.id)}
                customers={accounts}
                onLogVisitForCustomer={handleLogVisitForAccount}
                onViewCustomer={handleSelectAccount}
             />
        )}
      </div>
      {selectedIds.length > 0 && (viewState === ViewState.LIST || viewState === ViewState.MAP) && (
          <div className="absolute bottom-6 left-4 right-4 z-30 mb-[env(safe-area-inset-bottom)]">
              <div className="bg-slate-900 rounded-xl p-4 shadow-2xl flex items-center justify-between text-white">
                  <div><p className="text-xs text-slate-400 font-bold uppercase">Trip Planner</p><p className="font-bold">{selectedIds.length} stops selected</p></div>
                  <button onClick={handleStartTrip} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors">Start Trip</button>
              </div>
          </div>
      )}
    </div>
  );

  return (
    <>
      {viewState === ViewState.AUTH ? (
          <AuthScreen onLogin={handleLogin} />
      ) : viewState === ViewState.ADD_ACCOUNT ? (
          <AddCustomerForm 
             userLocation={userLocation} 
             onSave={handleSaveAccount} 
             onCancel={handleBackToNav}
          />
      ) : viewState === ViewState.VISIT_FORM ? (
          selectedAccount ? (
              <VisitForm 
                customer={selectedAccount}
                onSave={handleSaveVisit}
                onCancel={handleBackToNav}
              />
          ) : null
      ) : viewState === ViewState.ACCOUNT_DETAIL ? (
          selectedAccount ? (
              <CustomerDetail 
                customer={selectedAccount} 
                contacts={contacts.filter(c => c.accountId === selectedAccount.id)}
                opportunities={opportunities.filter(o => o.accountId === selectedAccount.id)}
                visits={visits}
                onBack={handleBackToNav}
                onAddVisit={handleAddVisitStart}
                onUpdateCustomer={handleUpdateAccount}
              />
          ) : null
      ) : viewState === ViewState.SETTINGS && currentUser ? (
          <SettingsScreen 
            currentUser={currentUser}
            customers={accounts}
            visits={visits}
            onLogout={handleLogout}
            onBack={handleBackToNav}
          />
      ) : (
          renderMainView()
      )}
    </>
  );
};

export default App;