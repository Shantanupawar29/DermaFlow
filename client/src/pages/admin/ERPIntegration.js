import React, { useState } from 'react';
import { Database, RefreshCw, CheckCircle, XCircle, TrendingUp, Package, Users, DollarSign } from 'lucide-react';

export default function ERPIntegration() {
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState({
    products: 'synced',
    orders: 'synced',
    inventory: 'pending',
    customers: 'synced'
  });

  const integrations = [
    { name: 'SAP Business One', status: 'connected', icon: Database, description: 'ERP Core System' },
    { name: 'QuickBooks', status: 'connected', icon: DollarSign, description: 'Accounting & Finance' },
    { name: 'Salesforce CRM', status: 'connected', icon: Users, description: 'Customer Management' },
    { name: 'Warehouse Management', status: 'pending', icon: Package, description: 'Inventory & Logistics' },
  ];

  const handleSync = async () => {
    setSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSyncStatus({ products: 'synced', orders: 'synced', inventory: 'synced', customers: 'synced' });
    setSyncing(false);
    alert('All systems synced successfully!');
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">ERP Integration Hub</h1>
          <p className="text-gray-500 mt-1">Connect and manage your business systems</p>
        </div>
        <button 
          onClick={handleSync}
          disabled={syncing}
          className="bg-[#4A0E2E] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#6B1D45]"
        >
          <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing...' : 'Sync All Systems'}
        </button>
      </div>

      {/* Integration Status Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {integrations.map((integration, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-[#4A0E2E]/10 p-3 rounded-lg">
                  <integration.icon className="text-[#4A0E2E]" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{integration.name}</h3>
                  <p className="text-sm text-gray-500">{integration.description}</p>
                </div>
              </div>
              <span className={`flex items-center text-sm ${integration.status === 'connected' ? 'text-green-600' : 'text-yellow-600'}`}>
                {integration.status === 'connected' ? <CheckCircle size={16} className="mr-1" /> : <XCircle size={16} className="mr-1" />}
                {integration.status}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Last Sync: {integration.status === 'connected' ? 'Today, 10:30 AM' : 'Never'}</span>
              <button className="text-[#4A0E2E] hover:underline">Configure</button>
            </div>
          </div>
        ))}
      </div>

      {/* Sync Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Data Synchronization Status</h2>
        <div className="space-y-3">
          {Object.entries(syncStatus).map(([key, status]) => (
            <div key={key} className="flex justify-between items-center py-2 border-b">
              <span className="capitalize font-medium">{key}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                status === 'synced' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {status === 'synced' ? '✓ Synced' : '⏳ Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}