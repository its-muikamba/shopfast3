

import React, { useState, useEffect } from 'react';
import { Restaurant, StaffMember, StaffRole } from '../../types';
import { PlusIcon, EditIcon, Trash2Icon } from '../Icons';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => {
  return (
    <button
      type="button"
      className={`${
        checked ? 'bg-brand-emerald' : 'bg-gray-200'
      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2`}
      role="switch"
      aria-checked={checked}
      onClick={onChange}
    >
      <span
        aria-hidden="true"
        className={`${
          checked ? 'translate-x-5' : 'translate-x-0'
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  );
};

const CreateRestaurantModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onSave: (payload: { 
        restaurantData: Omit<Restaurant, 'id' | 'rating' | 'distance' | 'theme'>;
        adminData: Omit<StaffMember, 'id' | 'restaurantId' | 'role' | 'status'>;
    }) => void;
}> = ({ isOpen, onClose, onSave }) => {
    const initialRestaurantState = {
        name: '',
        cuisine: '',
        status: 'active' as 'active' | 'disabled',
        subscription: 'basic' as 'basic' | 'premium' | 'enterprise',
        createdAt: new Date().toISOString().split('T')[0],
        imageUrl: '',
        logoUrl: '',
    };
    const initialAdminState = {
        name: '',
        pin: '',
    };

    const [restaurantData, setRestaurantData] = useState(initialRestaurantState);
    const [adminData, setAdminData] = useState(initialAdminState);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);

    const handleRestaurantChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setRestaurantData(prev => ({ ...prev, [name]: value }));
    };

    const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAdminData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const base64 = await fileToBase64(file);
            if (type === 'logo') {
                setRestaurantData(prev => ({ ...prev, logoUrl: base64 }));
                setLogoPreview(base64);
            } else {
                setRestaurantData(prev => ({ ...prev, imageUrl: base64 }));
                setBannerPreview(base64);
            }
        }
    };
    
    const resetForm = () => {
        setRestaurantData(initialRestaurantState);
        setAdminData(initialAdminState);
        setLogoPreview(null);
        setBannerPreview(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ restaurantData, adminData });
        onClose();
        resetForm();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-brand-charcoal mb-4">Create Restaurant Tenant</h2>
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                            <fieldset className="border p-4 rounded-md">
                                <legend className="text-lg font-semibold px-2">Restaurant Details</legend>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Restaurant Name</label>
                                        <input type="text" name="name" value={restaurantData.name} onChange={handleRestaurantChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Cuisine Type</label>
                                        <input type="text" name="cuisine" value={restaurantData.cuisine} onChange={handleRestaurantChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Subscription Tier</label>
                                        <select name="subscription" value={restaurantData.subscription} onChange={handleRestaurantChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm">
                                            <option value="basic">Basic</option>
                                            <option value="premium">Premium</option>
                                            <option value="enterprise">Enterprise</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Upload Logo</label>
                                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-brand-charcoal hover:file:bg-gray-200" required/>
                                        {logoPreview && <img src={logoPreview} alt="Logo Preview" className="mt-2 h-16 w-16 rounded-full object-cover"/>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Upload Banner Image</label>
                                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-brand-charcoal hover:file:bg-gray-200" required/>
                                        {bannerPreview && <img src={bannerPreview} alt="Banner Preview" className="mt-2 h-24 w-full rounded-md object-cover"/>}
                                    </div>
                                </div>
                            </fieldset>
                             <fieldset className="border p-4 rounded-md">
                                <legend className="text-lg font-semibold px-2">Initial Administrator</legend>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Admin Name</label>
                                        <input type="text" name="name" value={adminData.name} onChange={handleAdminChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm" required />
                                    </div>
                                     <div>
                                        <label className="block text-sm font-medium text-gray-700">Admin PIN (4-digits)</label>
                                        <input type="password" name="pin" value={adminData.pin} onChange={handleAdminChange} maxLength={4} pattern="\d{4}" title="PIN must be 4 digits" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm" required />
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-4 flex justify-end gap-4 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-brand-charcoal rounded-md hover:bg-opacity-90">Create Tenant & Admin</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EditRestaurantModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (restaurant: Restaurant) => void;
    restaurant: Restaurant | null;
}> = ({ isOpen, onClose, onSave, restaurant }) => {
    const [formData, setFormData] = useState<Restaurant | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);

    useEffect(() => {
        if (restaurant) {
            setFormData(restaurant);
            setLogoPreview(restaurant.logoUrl);
            setBannerPreview(restaurant.imageUrl);
        }
    }, [restaurant]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!formData) return;
        const { name, value } = e.target;
        setFormData(prev => prev ? ({ ...prev, [name]: value }) : null);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
        if (e.target.files && e.target.files[0] && formData) {
            const file = e.target.files[0];
            const base64 = await fileToBase64(file);
            if (type === 'logo') {
                setFormData(prev => prev ? ({ ...prev, logoUrl: base64 }) : null);
                setLogoPreview(base64);
            } else {
                setFormData(prev => prev ? ({ ...prev, imageUrl: base64 }) : null);
                setBannerPreview(base64);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData) {
            onSave(formData);
        }
    };

    if (!isOpen || !formData) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-brand-charcoal mb-4">Edit Restaurant: {restaurant?.name}</h2>
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Restaurant Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Cuisine Type</label>
                                <input type="text" name="cuisine" value={formData.cuisine} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm" required />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Upload Logo</label>
                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-brand-charcoal hover:file:bg-gray-200"/>
                                {logoPreview && <img src={logoPreview} alt="Logo Preview" className="mt-2 h-16 w-16 rounded-full object-cover"/>}
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Upload Banner Image</label>
                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-brand-charcoal hover:file:bg-gray-200"/>
                                {bannerPreview && <img src={bannerPreview} alt="Banner Preview" className="mt-2 h-24 w-full rounded-md object-cover"/>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Subscription Tier</label>
                                <select name="subscription" value={formData.subscription} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm">
                                    <option value="basic">Basic</option>
                                    <option value="premium">Premium</option>
                                    <option value="enterprise">Enterprise</option>
                                </select>
                            </div>
                        </div>
                    </div>
                     <div className="bg-gray-50 px-6 py-4 flex justify-end gap-4 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-brand-charcoal rounded-md hover:bg-opacity-90">Save Changes</button>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
                <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-brand-charcoal" id="modal-title">{title}</h3>
                    <div className="mt-2">
                        <div className="text-sm text-gray-500">{children}</div>
                    </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                    <button type="button" onClick={onConfirm} className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none sm:ml-3 sm:w-auto sm:text-sm ${confirmButtonClass}`}>
                        {confirmText}
                    </button>
                    <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};


const HQRestaurants: React.FC<{ 
    restaurants: Restaurant[], 
    onAddRestaurant: (data: any) => void, 
    onUpdateRestaurant: (data: any) => void,
    onDeleteRestaurant: (id: string) => void
}> = ({ restaurants, onAddRestaurant, onUpdateRestaurant, onDeleteRestaurant }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
    const [actionToConfirm, setActionToConfirm] = useState<{ type: 'delete' | 'suspend'; data: Restaurant } | null>(null);

    const handleSaveRestaurantRequest = (updatedRestaurant: Restaurant) => {
        const originalRestaurant = restaurants.find(r => r.id === updatedRestaurant.id);
        
        setEditingRestaurant(null);

        if (originalRestaurant && originalRestaurant.status === 'active' && updatedRestaurant.status === 'disabled') {
            setActionToConfirm({ type: 'suspend', data: updatedRestaurant });
        } else {
            onUpdateRestaurant(updatedRestaurant);
        }
    };
    
    const handleDeleteRequest = (restaurant: Restaurant) => {
        setActionToConfirm({ type: 'delete', data: restaurant });
    };

    const handleConfirmAction = () => {
        if (!actionToConfirm) return;

        if (actionToConfirm.type === 'delete') {
            onDeleteRestaurant(actionToConfirm.data.id);
        } else if (actionToConfirm.type === 'suspend') {
            onUpdateRestaurant(actionToConfirm.data);
        }
        setActionToConfirm(null);
    };

    const handleToggleStatus = (restaurant: Restaurant) => {
        const newStatus = restaurant.status === 'active' ? 'disabled' : 'active';
        const updatedRestaurant = { ...restaurant, status: newStatus };

        // If disabling the restaurant, require confirmation before proceeding.
        if (newStatus === 'disabled') {
            setActionToConfirm({ type: 'suspend', data: updatedRestaurant });
        } else {
            // If activating, apply the change immediately without confirmation.
            onUpdateRestaurant(updatedRestaurant);
        }
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-brand-charcoal">Manage Tenants</h3>
                <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-charcoal rounded-md hover:bg-opacity-90">
                    <PlusIcon className="w-5 h-5"/>
                    Create Tenant
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuisine</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {restaurants.map(r => (
                            <tr key={r.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img className="h-10 w-10 rounded-full object-cover" src={r.logoUrl} alt={`${r.name} logo`} />
                                        <div className="ml-4 font-medium text-gray-900">{r.name}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.cuisine}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                   <div className="flex items-center">
                                        <ToggleSwitch
                                            checked={r.status === 'active'}
                                            onChange={() => handleToggleStatus(r)}
                                        />
                                         <span className={`ml-3 text-sm font-medium ${r.status === 'active' ? 'text-green-800' : 'text-red-800'}`}>
                                            {r.status === 'active' ? 'Active' : 'Disabled'}
                                        </span>
                                   </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{r.subscription}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.createdAt}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    <button onClick={() => setEditingRestaurant(r)} className="text-gray-400 hover:text-brand-gold p-1">
                                        <EditIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDeleteRequest(r)} className="text-gray-400 hover:text-red-600 p-1">
                                        <Trash2Icon className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <CreateRestaurantModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSave={onAddRestaurant} />
            <EditRestaurantModal isOpen={!!editingRestaurant} onClose={() => setEditingRestaurant(null)} onSave={handleSaveRestaurantRequest} restaurant={editingRestaurant} />
            <ConfirmationModal
                isOpen={!!actionToConfirm}
                onClose={() => setActionToConfirm(null)}
                onConfirm={handleConfirmAction}
                title={actionToConfirm?.type === 'delete' ? 'Confirm Deletion' : 'Confirm Suspension'}
                confirmText={actionToConfirm?.type === 'delete' ? 'Delete' : 'Suspend'}
                confirmButtonClass={
                    actionToConfirm?.type === 'delete' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-yellow-500 hover:bg-yellow-600'
                }
            >
                {actionToConfirm && (
                  actionToConfirm.type === 'delete'
                      ? `Are you sure you want to permanently delete "${actionToConfirm.data.name}"? This will also remove all associated staff. This action cannot be undone.`
                      : `Are you sure you want to suspend "${actionToConfirm.data.name}"? Their staff will lose access to the restaurant portal.`
                )}
            </ConfirmationModal>
        </div>
    );
};

export default HQRestaurants;
