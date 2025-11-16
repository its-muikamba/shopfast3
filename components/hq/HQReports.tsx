import React, { useState, useMemo } from 'react';
import { SupportTicket, TicketStatus } from '../../types';
import { FileTextIcon } from '../Icons';

const priorityStyles: Record<SupportTicket['priority'], string> = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-blue-100 text-blue-800',
};

const statusStyles: Record<TicketStatus, string> = {
    open: 'bg-green-100 text-green-800',
    'in-progress': 'bg-purple-100 text-purple-800',
    resolved: 'bg-gray-200 text-gray-800',
    closed: 'bg-gray-200 text-gray-800',
};

const ViewTicketModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    ticket: SupportTicket | null;
    onUpdateStatus: (ticketId: string, newStatus: TicketStatus) => void;
}> = ({ isOpen, onClose, ticket, onUpdateStatus }) => {
    if (!isOpen || !ticket) return null;

    const handleStatusChange = (newStatus: TicketStatus) => {
        onUpdateStatus(ticket.id, newStatus);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold text-brand-charcoal">{ticket.subject}</h2>
                    <p className="text-sm text-gray-500">From: {ticket.restaurantName}</p>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <h3 className="font-semibold">Conversation History</h3>
                    <div className="space-y-4">
                        {ticket.conversation.map((msg, index) => (
                            <div key={index} className={`p-3 rounded-lg ${msg.author.includes('HQ') ? 'bg-blue-50' : 'bg-gray-50'}`}>
                                <p className="text-sm font-semibold">{msg.author} <span className="text-xs text-gray-400 font-normal">{msg.timestamp}</span></p>
                                <p className="text-sm mt-1">{msg.message}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center rounded-b-lg border-t">
                     <div className="flex gap-2">
                        <button onClick={() => handleStatusChange('in-progress')} className="px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700">Set In Progress</button>
                        <button onClick={() => handleStatusChange('resolved')} className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700">Set Resolved</button>
                    </div>
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Close</button>
                </div>
            </div>
        </div>
    );
};

const HQReports: React.FC<{
    tickets: SupportTicket[];
    onUpdateTicketStatus: (ticketId: string, newStatus: TicketStatus) => void;
}> = ({ tickets, onUpdateTicketStatus }) => {
    const [activeTab, setActiveTab] = useState<'tickets' | 'reports'>('tickets');
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

    const openTickets = useMemo(() => tickets.filter(t => t.status === 'open' || t.status === 'in-progress'), [tickets]);
    const resolvedTickets = useMemo(() => tickets.filter(t => t.status === 'resolved' || t.status === 'closed'), [tickets]);

    return (
        <div>
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('tickets')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'tickets' ? 'border-brand-gold text-brand-gold' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        Open Tickets ({openTickets.length})
                    </button>
                    <button onClick={() => setActiveTab('reports')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'reports' ? 'border-brand-gold text-brand-gold' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        Reports
                    </button>
                </nav>
            </div>
            
            {activeTab === 'tickets' && (
                 <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restaurant</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                            {openTickets.map(ticket => (
                                <tr key={ticket.id}>
                                    <td className="px-6 py-4 font-medium">{ticket.subject}</td>
                                    <td className="px-6 py-4 text-sm">{ticket.restaurantName}</td>
                                    <td className="px-6 py-4"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityStyles[ticket.priority]}`}>{ticket.priority}</span></td>
                                    <td className="px-6 py-4"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[ticket.status]}`}>{ticket.status}</span></td>
                                    <td className="px-6 py-4 text-sm">{ticket.createdAt}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => setSelectedTicket(ticket)} className="px-3 py-1 text-xs font-medium text-white bg-brand-charcoal rounded-md hover:bg-opacity-80">
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

             {activeTab === 'reports' && (
                 <div className="bg-white p-8 rounded-lg shadow-md h-full flex flex-col items-center justify-center text-center">
                    <FileTextIcon className="w-16 h-16 text-gray-300 mb-4" />
                    <h2 className="text-2xl font-bold text-brand-charcoal">Reporting Dashboard</h2>
                    <p className="mt-2 text-gray-500 max-w-md">
                       This area will contain platform-wide analytics, such as ticket resolution times, common issue types, and tenant satisfaction metrics.
                    </p>
                </div>
            )}

            <ViewTicketModal 
                isOpen={!!selectedTicket}
                onClose={() => setSelectedTicket(null)}
                ticket={selectedTicket}
                onUpdateStatus={onUpdateTicketStatus}
            />
        </div>
    );
};

export default HQReports;