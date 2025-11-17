import React, { useState, useEffect } from 'react';
import { StaffMember, StaffRole } from '../../types';
import { PlusIcon, EditIcon, Trash2Icon, UserCheckIcon, UserXIcon } from '../Icons';

const CreateStaffModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<StaffMember, 'id' | 'restaurantId' | 'status'>) => void;
}> = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        role: StaffRole.SERVER,
        pin: ''
    });

    const staffRoles = Object.values(StaffRole).filter(role => role !== StaffRole.ADMIN);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value as StaffRole }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
        setFormData({ name: '', role: StaffRole.SERVER, pin: '' }); // Reset form
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-lg shadow-xl w-full max-w-lg p-6 border border-border">
                <h2 className="text-2xl font-bold text-copy-rich mb-4">Add Staff Member</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-copy-light">Staff Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-border bg-background shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm text-copy" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-copy-light">Role</label>
                        <select name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full rounded-md border-border bg-background shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm text-copy">
                            {staffRoles.map(role => <option key={role} value={role}>{role}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-copy-light">PIN (4-digits)</label>
                        <input type="password" name="pin" value={formData.pin} onChange={handleChange} maxLength={4} pattern="\d{4}" title="PIN must be 4 digits" className="mt-1 block w-full rounded-md border-border bg-background shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm text-copy" required />
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-copy-rich bg-surface-light rounded-md hover:bg-border">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-copy-rich rounded-md hover:bg-opacity-90">Add Staff</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EditStaffModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (newPin: string) => void;
    staffMember: StaffMember | null;
}> = ({ isOpen, onClose, onSave, staffMember }) => {
    const [pin, setPin] = useState('');

    useEffect(() => {
        if (!isOpen) setPin('');
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(pin);
    };

    if (!isOpen || !staffMember) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-lg shadow-xl w-full max-w-lg p-6 border border-border">
                <h2 className="text-2xl font-bold text-copy-rich mb-4">Reset PIN for {staffMember.name}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-copy-light">New PIN (4-digits)</label>
                        <input type="password" name="pin" value={pin} onChange={(e) => setPin(e.target.value)} maxLength={4} pattern="\d{4}" title="PIN must be 4 digits" className="mt-1 block w-full rounded-md border-border bg-background shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm text-copy" required />
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-copy-rich bg-surface-light rounded-md hover:bg-border">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-copy-rich rounded-md hover:bg-opacity-90">Reset PIN</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    confirmText?: string;
    confirmButtonClass?: string;
    children: React.ReactNode;
}> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    children,
    confirmText = "Confirm", 
    confirmButtonClass = "bg-red-600 hover:bg-red-700" 
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-lg shadow-xl w-full max-w-md border border-border">
                <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-copy-rich">{title}</h3>
                    <div className="mt-2 text-sm text-copy-light">{children}</div>
                </div>
                <div className="bg-background px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                    <button onClick={onClose} type="button" className="px-4 py-2 text-sm font-medium text-copy-rich bg-surface-light border border-border rounded-md hover:bg-border">Cancel</button>
                    <button onClick={onConfirm} type="button" className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md ${confirmButtonClass}`}>{confirmText}</button>
                </div>
            </div>
        </div>
    );
};


const RestaurantStaffManagement: React.FC<{
    staff: StaffMember[];
    onAddStaffMember: (staffData: Omit<StaffMember, 'id' | 'restaurantId' | 'status'>) => void;
    onUpdateStaffMember: (staffMember: StaffMember) => void;
    onDeleteStaffMember: (staffId: string) => void;
}> = ({ staff, onAddStaffMember, onUpdateStaffMember, onDeleteStaffMember }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
    const [actionToConfirm, setActionToConfirm] = useState<{ type: 'delete' | 'suspend' | 'activate'; data: StaffMember } | null>(null);
    
    const handleConfirmAction = () => {
        if (!actionToConfirm) return;

        if (actionToConfirm.type === 'delete') {
            onDeleteStaffMember(actionToConfirm.data.id);
        } else if (actionToConfirm.type === 'suspend') {
            onUpdateStaffMember({ ...actionToConfirm.data, status: 'suspended' });
        } else if (actionToConfirm.type === 'activate') {
            onUpdateStaffMember({ ...actionToConfirm.data, status: 'active' });
        }
        setActionToConfirm(null);
    };

    const handlePinReset = (newPin: string) => {
        if (editingStaff) {
            onUpdateStaffMember({ ...editingStaff, pin: newPin });
            setEditingStaff(null);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold text-copy-rich">Your Team</h3>
                <button 
                    onClick={() => setIsCreateModalOpen(true)} 
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-copy-rich rounded-md hover:bg-opacity-90"
                >
                    <PlusIcon className="w-5 h-5"/>
                    Add Staff
                </button>
            </div>

            <div className="bg-surface shadow-md rounded-lg overflow-hidden border border-border">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-surface-light">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-copy-light uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-copy-light uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-copy-light uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-copy-light uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-surface divide-y divide-border">
                        {staff.length > 0 ? staff.map(s => (
                            <tr key={s.id} className={s.status === 'suspended' ? 'bg-surface-light' : ''}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`font-medium ${s.status === 'suspended' ? 'text-copy-lighter' : 'text-copy-rich'}`}>{s.name}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-copy-light">{s.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${s.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {s.status === 'active' ? 'Active' : 'Suspended'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                                    <button onClick={() => setEditingStaff(s)} className="text-copy-lighter hover:text-brand-gold p-1" title="Reset PIN">
                                        <EditIcon className="w-5 h-5" />
                                    </button>
                                    {s.status === 'active' ? (
                                        <button onClick={() => setActionToConfirm({ type: 'suspend', data: s })} className="text-copy-lighter hover:text-yellow-600 p-1" title="Suspend User">
                                            <UserXIcon className="w-5 h-5" />
                                        </button>
                                    ) : (
                                        <button onClick={() => setActionToConfirm({ type: 'activate', data: s })} className="text-copy-lighter hover:text-green-600 p-1" title="Activate User">
                                            <UserCheckIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                    <button onClick={() => setActionToConfirm({ type: 'delete', data: s })} className="text-copy-lighter hover:text-red-600 p-1" title="Delete User">
                                        <Trash2Icon className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="text-center py-10 text-copy-light">No staff have been added yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <CreateStaffModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSave={onAddStaffMember} />
            <EditStaffModal isOpen={!!editingStaff} onClose={() => setEditingStaff(null)} onSave={handlePinReset} staffMember={editingStaff} />
            <ConfirmationModal
                isOpen={!!actionToConfirm}
                onClose={() => setActionToConfirm(null)}
                onConfirm={handleConfirmAction}
                title={
                    actionToConfirm?.type === 'delete' ? 'Confirm Deletion' : 
                    actionToConfirm?.type === 'suspend' ? 'Confirm Suspension' : 'Confirm Activation'
                }
                confirmText={
                    actionToConfirm?.type === 'delete' ? 'Delete' : 
                    actionToConfirm?.type === 'suspend' ? 'Suspend' : 'Activate'
                }
                confirmButtonClass={
                    actionToConfirm?.type === 'delete' ? 'bg-red-600 hover:bg-red-700' :
                    actionToConfirm?.type === 'suspend' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-600 hover:bg-green-700'
                }
            >
                {actionToConfirm?.type === 'delete' && `Are you sure you want to permanently delete "${actionToConfirm.data.name}"? This action cannot be undone.`}
                {actionToConfirm?.type === 'suspend' && `Are you sure you want to suspend "${actionToConfirm.data.name}"? They will lose access to the restaurant portal.`}
                {actionToConfirm?.type === 'activate' && `Are you sure you want to reactivate "${actionToConfirm.data.name}"? They will regain access to the restaurant portal.`}
            </ConfirmationModal>
        </div>
    );
};

export default RestaurantStaffManagement;