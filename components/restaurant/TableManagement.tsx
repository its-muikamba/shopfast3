import React, { useState } from 'react';
import { Restaurant, Table } from '../../types';
import { PlusIcon, Trash2Icon, QrCodeIcon } from '../Icons';

// This tells TypeScript that the QRCode object will be available on the window
// because we are loading it from an external script in index.html.
declare var QRCode: any;

const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    children: React.ReactNode;
}> = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-brand-charcoal">{title}</h3>
                    <div className="mt-2 text-sm text-gray-500">{children}</div>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                    <button onClick={onClose} type="button" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                    <button onClick={onConfirm} type="button" className="px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md bg-red-600 hover:bg-red-700">Delete</button>
                </div>
            </div>
        </div>
    );
};

const CreateTableModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (tableNumber: number, capacity: number) => void;
}> = ({ isOpen, onClose, onSave }) => {
    const [tableNumber, setTableNumber] = useState('');
    const [capacity, setCapacity] = useState('4');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(parseInt(tableNumber), parseInt(capacity));
        setTableNumber('');
        setCapacity('4');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h2 className="text-2xl font-bold text-brand-charcoal mb-4">Create New Table</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Table Number</label>
                        <input type="number" value={tableNumber} onChange={e => setTableNumber(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Capacity (Seats)</label>
                        <input type="number" value={capacity} onChange={e => setCapacity(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300" required />
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-brand-charcoal rounded-md hover:bg-opacity-90">Create Table</button>
                </div>
            </form>
        </div>
    );
};


interface TableManagementProps {
    restaurant: Restaurant;
    onUpdateRestaurant: (restaurant: Restaurant) => void;
}

const TableManagement: React.FC<TableManagementProps> = ({ restaurant, onUpdateRestaurant }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [tableToDelete, setTableToDelete] = useState<Table | null>(null);

    const handleCreateTable = (tableNumber: number, capacity: number) => {
        const newTable: Table = {
            id: `t-${Date.now()}`,
            number: tableNumber,
            capacity: capacity,
            status: 'available',
            orderCount: 0,
        };
        const updatedRestaurant = {
            ...restaurant,
            tables: [...restaurant.tables, newTable],
        };
        onUpdateRestaurant(updatedRestaurant);
    };

    const handleDeleteTable = () => {
        if (!tableToDelete) return;
        const updatedRestaurant = {
            ...restaurant,
            tables: restaurant.tables.filter(t => t.id !== tableToDelete.id),
        };
        onUpdateRestaurant(updatedRestaurant);
        setTableToDelete(null);
    };
    
    const handleDownloadQR = (table: Table) => {
        const qrData = JSON.stringify({
            restaurantId: restaurant.id,
            tableNumber: table.number.toString(),
        });

        // Create a temporary element to render the QR code
        const qrElement = document.createElement('div');
        
        new QRCode(qrElement, {
            text: qrData,
            width: 256,
            height: 256,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });

        // The library creates a canvas inside the div, let's get it.
        const canvas = qrElement.querySelector('canvas');
        if (canvas) {
            const pngUrl = canvas
                .toDataURL("image/png")
                .replace("image/png", "image/octet-stream");
            
            let downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `${restaurant.name}-table-${table.number}-qr.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-brand-charcoal">Manage Your Tables</h3>
                <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-charcoal rounded-md hover:bg-opacity-90">
                    <PlusIcon className="w-5 h-5"/>
                    Create Table
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                 <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Table Number</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Orders</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                     <tbody className="bg-white divide-y divide-gray-200">
                        {restaurant.tables.sort((a,b) => a.number - b.number).map(table => (
                            <tr key={table.id}>
                                <td className="px-6 py-4 font-medium">{table.number}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{table.capacity} Seats</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{table.orderCount}</td>
                                <td className="px-6 py-4 text-center space-x-2">
                                     <button onClick={() => handleDownloadQR(table)} className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-brand-emerald rounded-md hover:bg-opacity-90">
                                        <QrCodeIcon className="w-4 h-4"/>
                                        Download QR
                                    </button>
                                    <button onClick={() => setTableToDelete(table)} className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                                        <Trash2Icon className="w-4 h-4"/>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                         {restaurant.tables.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center py-10 text-gray-500">No tables created yet.</td>
                            </tr>
                         )}
                    </tbody>
                 </table>
            </div>

            <CreateTableModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSave={handleCreateTable} />
            <ConfirmationModal 
                isOpen={!!tableToDelete}
                onClose={() => setTableToDelete(null)}
                onConfirm={handleDeleteTable}
                title="Confirm Deletion"
            >
                Are you sure you want to delete Table {tableToDelete?.number}?
            </ConfirmationModal>

        </div>
    );
};

export default TableManagement;