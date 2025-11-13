import React from 'react';
import { AUDIT_LOGS } from '../../constants';

const HQAuditLogs: React.FC = () => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {AUDIT_LOGS.map(log => (
                    <tr key={log.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.timestamp}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.actor === 'System' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                {log.actor}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">{log.action}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.details}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
};

export default HQAuditLogs;
