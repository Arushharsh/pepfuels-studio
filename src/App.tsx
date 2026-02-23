import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Fuel, 
  Users, 
  Truck, 
  BarChart3, 
  Settings, 
  Bell,
  Search,
  Plus,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  LogOut
} from 'lucide-react';
import { 
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { authService, orderService, adminService } from './services/api';

const data = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 2000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];

const StatCard = ({ title, value, icon: Icon, trend, loading }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-indigo-50 rounded-lg">
        <Icon className="w-5 h-5 text-indigo-600" />
      </div>
      {trend && (
        <span className={`text-xs font-medium ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
    {loading ? (
      <div className="h-8 w-24 bg-slate-100 animate-pulse rounded mt-1" />
    ) : (
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    )}
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('pepfuels_token'));
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // New Order Form States
  const [newOrder, setNewOrder] = useState({
    type: 'DOORSTEP',
    quantity: 100,
    lat: 28.6139,
    lng: 77.2090
  });
  const [orderLoading, setOrderLoading] = useState(false);

  // Auth States
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      fetchDashboardData();
    }
  }, [isLoggedIn]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [ordersRes, statsRes] = await Promise.all([
        orderService.getAll(),
        adminService.getStats()
      ]);
      setOrders(ordersRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError('');
    try {
      await authService.requestOtp(phone);
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError('');
    try {
      const res = await authService.verifyOtp(phone, otp);
      localStorage.setItem('pepfuels_token', res.data.accessToken);
      setUser(res.data.user);
      setIsLoggedIn(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pepfuels_token');
    setIsLoggedIn(false);
    setUser(null);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderLoading(true);
    setError('');
    try {
      await orderService.create(newOrder);
      setSuccessMessage('Order placed successfully!');
      setShowOrderModal(false);
      fetchDashboardData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to place order');
    } finally {
      setOrderLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
          <div className="flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Fuel className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">Pepfuels</span>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-slate-900">Welcome back</h1>
            <p className="text-slate-500 text-sm">Enter your phone to continue</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => {
                    const onlyNumbers = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhone(onlyNumbers);
                  }}
                  placeholder="9876543210"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={authLoading}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Enter 6-digit OTP</label>
                <input 
                  type="text" 
                  value={otp}
                  onChange={(e) => {
                    const onlyNumbers = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(onlyNumbers);
                  }}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-center tracking-[1em] font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={authLoading}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Login'}
              </button>
              <button 
                type="button"
                onClick={() => setStep('phone')}
                className="w-full text-slate-500 text-sm font-medium hover:text-slate-900 transition-colors"
              >
                Change Phone Number
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Fuel className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Pepfuels</span>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'orders', label: 'Orders', icon: Fuel },
              { id: 'customers', label: 'Customers', icon: Users },
              { id: 'drivers', label: 'Drivers', icon: Truck },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === item.id 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-slate-500">{user?.role || 'Super Admin'}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search orders, customers..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </button>
            <button 
              onClick={() => setShowOrderModal(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Order
            </button>
          </div>
        </header>

        <div className="p-8">
          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
              <CheckCircle2 className="w-5 h-5" />
              <p className="text-sm font-medium">{successMessage}</p>
            </div>
          )}
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
              <p className="text-slate-500 text-sm">Welcome back, here's what's happening today.</p>
            </div>
            <button 
              onClick={fetchDashboardData}
              className="text-indigo-600 text-sm font-medium hover:underline flex items-center gap-1"
            >
              {loading && <Loader2 className="w-3 h-3 animate-spin" />}
              Refresh Data
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Revenue" value={`₹${stats?.revenue?.toLocaleString() || '0'}`} icon={BarChart3} trend={12.5} loading={loading} />
            <StatCard title="Active Orders" value={stats?.activeOrders || '0'} icon={Fuel} trend={-2.4} loading={loading} />
            <StatCard title="Total Customers" value={stats?.customers || '0'} icon={Users} trend={8.1} loading={loading} />
            <StatCard title="Available Drivers" value={stats?.drivers || '0'} icon={Truck} loading={loading} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sales Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-900">Sales Analytics</h2>
                <select className="text-sm bg-slate-50 border-none rounded-lg px-3 py-1.5">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                </select>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    />
                    <Area type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Recent Orders</h2>
              <div className="space-y-6">
                {loading ? (
                  Array(4).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center justify-between animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg" />
                        <div className="space-y-2">
                          <div className="h-4 w-24 bg-slate-100 rounded" />
                          <div className="h-3 w-16 bg-slate-100 rounded" />
                        </div>
                      </div>
                      <div className="h-4 w-12 bg-slate-100 rounded" />
                    </div>
                  ))
                ) : orders.length > 0 ? (
                  orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          order.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                          order.status === 'IN_TRANSIT' ? 'bg-indigo-50 text-indigo-600' :
                          'bg-amber-50 text-amber-600'
                        }`}>
                          {order.status === 'COMPLETED' ? <CheckCircle2 className="w-4 h-4" /> :
                           order.status === 'IN_TRANSIT' ? <Truck className="w-4 h-4" /> :
                           <Clock className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{order.customer?.name || 'Customer'}</p>
                          <p className="text-xs text-slate-500">{order.orderNo} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-slate-900">₹{order.totalAmount.toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-400 text-sm">No recent orders</p>
                  </div>
                )}
              </div>
              <button className="w-full mt-8 py-2.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
                View All Orders
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* New Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-slate-900">Place New Order</h2>
              <button onClick={() => setShowOrderModal(false)} className="text-slate-400 hover:text-slate-600">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Order Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['DOORSTEP', 'AT_PUMP'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNewOrder({ ...newOrder, type })}
                        className={`py-3 rounded-xl text-sm font-medium border transition-all ${
                          newOrder.type === type 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {type.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Quantity (Litres)</label>
                  <input 
                    type="number" 
                    value={newOrder.quantity}
                    onChange={(e) => setNewOrder({ ...newOrder, quantity: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Latitude</label>
                  <input 
                    type="number" 
                    step="any"
                    value={newOrder.lat}
                    onChange={(e) => setNewOrder({ ...newOrder, lat: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Longitude</label>
                  <input 
                    type="number" 
                    step="any"
                    value={newOrder.lng}
                    onChange={(e) => setNewOrder({ ...newOrder, lng: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="flex-1 py-3 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={orderLoading}
                  className="flex-[2] bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  {orderLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
