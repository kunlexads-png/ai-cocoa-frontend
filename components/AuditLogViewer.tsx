
import React, { useState, useEffect } from 'react';
import { AuditLogEntry } from '../types';
import { auditService } from '../services/auditService';
import { Search, Shield, Download, FileSpreadsheet, Lock } from 'lucide-react';

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    // In a real app, this would be a data fetching call
    const loadLogs = () => {
      setLogs(auditService.getLogs());
    };
    
    loadLogs();
    const interval = setInterval(loadLogs, 2000); // Poll for updates
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = filter ? auditService.filterLogs(filter) : logs;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div>
             <h2 className="text-xl font-bold text-[#3E2723] flex items-center">
               <Shield size={24} className="mr-2 text-emerald-600"/> Security Audit Log
             </h2>
             <p className="text-xs text-slate-500 mt-1">Immutable record of all system actions for compliance (ISO 27001 / FDA).</p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                <input 
                  type="text" 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Search user, action..." 
                  className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
             </div>
             <button className="flex items-center px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">
                <Download size={16} className="mr-2"/> Export CSV
             </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
              <tr>
                <th className="p-3">Timestamp (UTC)</th>
                <th className="p-3">User</th>
                <th className="p-3">Role</th>
                <th className="p-3">Action</th>
                <th className="p-3">Details</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">IP Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3 font-mono text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-3 font-bold text-[#3E2723]">{log.user}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      {log.role}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-blue-700">{log.action}</td>
                  <td className="p-3 text-slate-600 max-w-xs truncate" title={log.details}>{log.details}</td>
                  <td className="p-3">
                    {log.status === 'Success' && <span className="text-emerald-600 font-bold text-xs flex items-center"><Lock size={12} className="mr-1"/> Success</span>}
                    {log.status === 'Denied' && <span className="text-rose-600 font-bold text-xs flex items-center"><Shield size={12} className="mr-1"/> Denied</span>}
                    {log.status === 'Failed' && <span className="text-amber-600 font-bold text-xs">Failed</span>}
                  </td>
                  <td className="p-3 text-right font-mono text-xs text-slate-300">{log.ipHash}</td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">No logs found matching criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
