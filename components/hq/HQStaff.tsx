import React, { useState, useMemo } from 'react';
import { Restaurant, StaffMember, StaffRole } from '../../types';
import { PlusIcon } from '../Icons';

const CreateAdminModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<StaffMember, 'id' | 'restaurantId' | 'role' | 'status'>) => void;
}> = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        pin: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
        setFormData({ name: '', pin: '' }); // Reset form
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
                <h2 className="text-2xl font-bold text-brand-charcoal mb-4">Create Restaurant Admin</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Admin Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">PIN (4-digits)</label>
                        <input type="password" name="pin" value={formData.pin} onChange={handleChange} maxLength={4} pattern="\d{4}" title="PIN must be 4 digits" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm" required />
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-brand-charcoal rounded-md hover:bg-opacity-90">Create Admin</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const HQStaff: React.FC<{
    restaurants: Restaurant[];
    staff: StaffMember[];
    onAddStaffMember: (staffData: Omit<StaffMember, 'id' | 'status'>) => void;
}> = ({ restaurants, staff, onAddStaffMember }) => {
    const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>(restaurants.find(r => r.status === 'active')?.id || restaurants[0]?.id || '');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredAdmins = useMemo(() => {
        return staff.filter(s => s.restaurantId === selectedRestaurantId && s.role === StaffRole.ADMIN);
    }, [staff, selectedRestaurantId]);

    const handleSaveAdmin = (adminData: Omit<StaffMember, 'id' | 'restaurantId' | 'role' | 'status'>) => {
        onAddStaffMember({ 
            ...adminData, 
            restaurantId: selectedRestaurantId,
            role: StaffRole.ADMIN 
        });
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                     <h3 className="text-xl font-bold text-brand-charcoal">Manage Restaurant Admins</h3>
                     <select 
                        value={selectedRestaurantId} 
                        onChange={(e) => setSelectedRestaurantId(e.target.value)}
                        className="block w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-gold focus:border-brand-gold sm:text-sm rounded-md"
                    >
                        {restaurants.map(r => <option key={r.id} value={r.id}>{r.name} {r.status === 'disabled' && '(Disabled)'}</option>)}
                    </select>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)} 
                    disabled={!selectedRestaurantId || restaurants.find(r => r.id === selectedRestaurantId)?.status === 'disabled'} 
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-charcoal rounded-md hover:bg-opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    <PlusIcon className="w-5 h-5"/>
                    Create Admin
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin ID</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAdmins.length > 0 ? filteredAdmins.map(s => (
                            <tr key={s.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{s.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                     <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                        {s.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{s.id}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={3} className="text-center py-10 text-gray-500">No Admins found for this restaurant.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <CreateAdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveAdmin} />
        </div>
    );
};

export default HQStaff;