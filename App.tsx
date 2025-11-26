
import React, { useState, useEffect } from 'react';
import { Customer, Visit, ViewState, Coordinates, Trip, User, UserRole } from './types';
import { INITIAL_CUSTOMERS, MOCK_VISIT_HISTORY, MOCK_TRIPS, MOCK_USERS } from './constants';
import CustomerList from './components/CustomerList';
import CustomerDetail from './components/CustomerDetail';
import VisitForm from './components/VisitForm';
import RadarMap from './components/RadarMap';
import AddCustomerForm from './components/AddCustomerForm';
import TripList from './components/TripList';
import AuthScreen from './components/AuthScreen';
import SettingsScreen from './components/SettingsScreen';
import ManagerDashboard from './components/ManagerDashboard';
import { buildGoogleMapsRouteUrl } from './services/geoService';

const App: React.FC = () => {
  // --- State ---
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [viewState, setViewState] = useState<ViewState>(currentUser ? ViewState.LIST : ViewState.AUTH);

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('customers_v2');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });
  const [visits, setVisits] = useState<Visit[]>(() => {
    const saved = localStorage.getItem('visits');
    return saved ? JSON.parse(saved) : MOCK_VISIT_HISTORY;
  });
  const [trips, setTrips] = useState<Trip[]>(() => {
    const saved = localStorage.getItem('trips');
    return saved ? JSON.parse(saved) : MOCK_TRIPS;
  });
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  
  // Trip planning state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Toast Notification
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  // --- Effects ---
  useEffect(() => {
    if (currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
        localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('customers_v2', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('visits', JSON.stringify(visits));
  }, [visits]);

  useEffect(() => {
    localStorage.setItem('trips', JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location", error);
          // Demo fallback (set to Delta BC for demo purposes)
          setUserLocation({ lat: 49.0900, lng: -123.0800 }); 
        }
      );
    }
  }, []);

  // Show toast with auto-hide
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
      setToast({ msg, type });
      setTimeout(() => setToast(null), 3000);
  };

  // --- Handlers ---

  const handleLogin = (user: User) => {
      setCurrentUser(user);
      setViewState(user.role === UserRole.MANAGER ? ViewState.MANAGER_DASHBOARD : ViewState.LIST);
  };

  const handleLogout = () => {
      setCurrentUser(null);
      setViewState(ViewState.AUTH);
      setSelectedCustomer(null);
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setViewState(ViewState.CUSTOMER_DETAIL);
  };

  const handleToggleSelection = (id: string) => {
    setSelectedIds(prev => {
        if (prev.includes(id)) {
            return prev.filter(x => x !== id);
        } else {
            return [...prev, id];
        }
    });
  };

  const handleStartAddCustomer = () => {
    setViewState(ViewState.ADD_CUSTOMER);
  };

  const handleSaveCustomer = (newCustomer: Customer) => {
    const customerWithUser = { ...newCustomer, assignedUserId: currentUser?.id };
    setCustomers(prev => [customerWithUser, ...prev]);
    setViewState(ViewState.LIST);
    showToast("Customer added successfully!");
  };

  const handleUpdateCustomer = (updatedCustomer: Customer) => {
      setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
      setSelectedCustomer(updatedCustomer);
      showToast("Customer updated!");
  };

  const handleBackToNav = () => {
    if (currentUser?.role === UserRole.MANAGER) {
        setViewState(ViewState.MANAGER_DASHBOARD);
    } else {
        setViewState(ViewState.LIST);
    }
    setSelectedCustomer(null);
  };

  const handleAddVisitStart = () => {
    setViewState(ViewState.VISIT_FORM);
  };

  const handleLogVisitForCustomer = (customer: Customer) => {
      setSelectedCustomer(customer);
      setViewState(ViewState.VISIT_FORM);
  };

  const handleSaveVisit = (visit: Visit) => {
    const visitWithUser = { ...visit, createdByUserId: currentUser?.id };
    setVisits(prev => [visitWithUser, ...prev]);
    setCustomers(prev => prev.map(c => 
      c.id === visit.customerId ? { ...c, lastVisitDate: visit.date } : c
    ));
    setViewState(ViewState.CUSTOMER_DETAIL);
    showToast("Visit logged successfully!");
  };

  const handleStartTrip = async () => {
      if (!userLocation) {
          alert("Waiting for GPS...");
          return;
      }
      
      if (selectedIds.length === 0) return;

      const selectedCustomers = selectedIds.map(id => customers.find(c => c.id === id)).filter(Boolean) as Customer[];

      // 1. Create Route URL
      const url = buildGoogleMapsRouteUrl(userLocation, selectedCustomers);
      
      // 2. Save Trip Record
      const newTrip: Trip = {
          id: `t_${Date.now()}`,
          date: new Date().toISOString(),
          name: `Trip - ${new Date().toLocaleDateString()}`,
          customerIds: selectedCustomers.map(c => c.id),
          status: 'In Progress',
          assignedUserId: currentUser?.id || ''
      };
      setTrips(prev => [newTrip, ...prev]);

      // 3. Clear current selection to reset
      setSelectedIds([]);

      // 4. Open Maps
      window.open(url, '_blank');
      
      // 5. Switch view to Trips so user sees it when they come back
      setViewState(ViewState.TRIPS);
  };

  // --- KPI Calculation (Personal) ---
  const myCustomers = customers.filter(c => c.assignedUserId === currentUser?.id);
  const totalPipeline = myCustomers.reduce((acc, curr) => acc + (curr.dealValue || 0), 0);
  const visitsThisWeek = visits.filter(v => {
      const d = new Date(v.date);
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return d > oneWeekAgo && v.createdByUserId === currentUser?.id;
  }).length;
  const overdueTasks = myCustomers.filter(c => c.nextActionDate && new Date(c.nextActionDate) < new Date()).length;

  const renderRepDashboardWidget = () => (
      <div className="mx-4 mt-2 mb-4 bg-white rounded-xl shadow-sm border border-slate-200 p-4 grid grid-cols-3 gap-2">
          <div className="text-center border-r border-slate-100">
             <p className="text-[10px] uppercase font-bold text-slate-400">Pipeline</p>
             <p className="text-sm font-black text-slate-800">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: "compact" }).format(totalPipeline)}
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

  // --- Render Helpers ---

  const renderMainView = () => (
    <div className="max-w-md mx-auto bg-slate-50 min-h-[100dvh] shadow-xl relative overflow-hidden flex flex-col pt-[env(safe-area-inset-top)]">
      
      {/* Toast */}
      {toast && (
          <div className={`absolute top-20 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-bold animate-fade-in-down ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
              {toast.msg}
          </div>
      )}

      {/* Header */}
      <div className="bg-white px-5 pt-8 pb-2 shadow-sm z-20 sticky top-0">
        <div className="flex justify-between items-center mb-4">
           <div className="flex items-center gap-3">
              <button onClick={() => setViewState(ViewState.SETTINGS)}>
                  <img src={currentUser?.avatarUrl} className="w-10 h-10 rounded-full border-2 border-slate-100" alt="profile" />
              </button>
              <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">FieldFocus</h1>
                  <p className="text-xs text-slate-500 font-medium">
                    Hello, {currentUser?.name.split(' ')[0]}
                  </p>
              </div>
           </div>
           
           {/* Reps see New Customer button */}
           {currentUser?.role === UserRole.REP && (
               <button 
                 onClick={handleStartAddCustomer}
                 className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md active:scale-95 transition-transform flex items-center gap-1"
               >
                 <span>+ New</span>
               </button>
           )}
        </div>

        {/* View Switcher (Tabs) */}
        <div className="flex bg-slate-100 p-1 rounded-lg mb-2">
          {currentUser?.role === UserRole.MANAGER ? (
             <button 
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${viewState === ViewState.MANAGER_DASHBOARD ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                onClick={() => setViewState(ViewState.MANAGER_DASHBOARD)}
             >
                Dashboard
             </button>
          ) : (
             <button 
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${viewState === ViewState.LIST ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                onClick={() => setViewState(ViewState.LIST)}
             >
                My List
             </button>
          )}

          <button 
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${viewState === ViewState.MAP ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            onClick={() => setViewState(ViewState.MAP)}
          >
            Map
          </button>
           <button 
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${viewState === ViewState.TRIPS ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            onClick={() => setViewState(ViewState.TRIPS)}
          >
            Trips
          </button>
           {/* Manager extra tab for All Customers */}
           {currentUser?.role === UserRole.MANAGER && (
               <button 
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${viewState === ViewState.LIST ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                onClick={() => setViewState(ViewState.LIST)}
              >
                All Cust
              </button>
           )}
        </div>

        {/* Search (Only on List) */}
        {viewState === ViewState.LIST && (
            <div className="relative mb-2">
            <input 
                type="text" 
                placeholder={currentUser?.role === UserRole.MANAGER ? "Search all customers..." : "Search my customers..."} 
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar relative bg-slate-50">
        {viewState === ViewState.MANAGER_DASHBOARD && currentUser?.role === UserRole.MANAGER && (
            <ManagerDashboard customers={customers} visits={visits} users={MOCK_USERS} />
        )}
        
        {viewState === ViewState.LIST && currentUser && (
           <>
               {currentUser.role === UserRole.REP && renderRepDashboardWidget()}
               <CustomerList 
                    customers={customers} 
                    userLocation={userLocation} 
                    onSelectCustomer={handleSelectCustomer}
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
                   customers={currentUser.role === UserRole.MANAGER ? customers : customers.filter(c => c.assignedUserId === currentUser.id)}
                   onSelectCustomer={handleSelectCustomer}
                   selectedIds={selectedIds}
                   onToggleSelection={handleToggleSelection}
                 />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                   <p>Waiting for GPS...</p>
                </div>
              )}
           </div>
        )}
        {viewState === ViewState.TRIPS && (
             <TripList 
                trips={currentUser?.role === UserRole.MANAGER ? trips : trips.filter(t => t.assignedUserId === currentUser?.id)}
                customers={customers}
                onLogVisitForCustomer={handleLogVisitForCustomer}
                onViewCustomer={handleSelectCustomer}
             />
        )}
      </div>

      {/* Trip Bar (Floating) - Only show on LIST or MAP when selections exist */}
      {selectedIds.length > 0 && (viewState === ViewState.LIST || viewState === ViewState.MAP) && (
          <div className="absolute bottom-6 left-4 right-4 z-30 mb-[env(safe-area-inset-bottom)]">
              <div className="bg-slate-900 rounded-xl p-4 shadow-2xl flex items-center justify-between text-white">
                  <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">Trip Planner</p>
                      <p className="font-bold">{selectedIds.length} stops selected</p>
                  </div>
                  <button 
                    onClick={handleStartTrip}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
                  >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      Start Trip
                  </button>
              </div>
          </div>
      )}
    </div>
  );

  return (
    <div className="bg-slate-200 min-h-screen font-sans">
      {!currentUser || viewState === ViewState.AUTH ? (
          <AuthScreen onLogin={handleLogin} />
      ) : viewState === ViewState.SETTINGS ? (
          <SettingsScreen 
            currentUser={currentUser} 
            customers={customers} 
            visits={visits} 
            onLogout={handleLogout}
            onBack={handleBackToNav}
          />
      ) : viewState === ViewState.CUSTOMER_DETAIL && selectedCustomer ? (
        <CustomerDetail 
          customer={selectedCustomer} 
          visits={visits}
          onBack={handleBackToNav}
          onAddVisit={handleAddVisitStart}
          onUpdateCustomer={handleUpdateCustomer}
        />
      ) : viewState === ViewState.VISIT_FORM && selectedCustomer ? (
        <VisitForm 
          customer={selectedCustomer}
          onSave={handleSaveVisit}
          onCancel={() => setViewState(ViewState.CUSTOMER_DETAIL)} 
        />
      ) : viewState === ViewState.ADD_CUSTOMER ? (
        <AddCustomerForm
          userLocation={userLocation}
          onSave={handleSaveCustomer}
          onCancel={handleBackToNav}
        />
      ) : (
        renderMainView()
      )}
    </div>
  );
};

export default App;
