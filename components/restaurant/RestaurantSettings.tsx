
import React, { useState, useEffect } from 'react';
import { Restaurant, DailySpecial } from '../../types';
import { StripeIcon, MpesaIcon, CreditCardIcon, PlusIcon, EditIcon, Trash2Icon } from '../Icons';
import { CURRENCIES } from '../../constants';

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => {
  return (
    <button
      type="button"
      className={`${
        checked ? 'bg-brand-emerald' : 'bg-gray-400 theme-dark:bg-surface-light'
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

const SpecialModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (special: DailySpecial) => void;
    special: DailySpecial | null;
}> = ({ isOpen, onClose, onSave, special }) => {
    const [formData, setFormData] = useState<Omit<DailySpecial, 'id'>>({
        title: '', description: '', active: true, mediaUrl: '', mediaType: 'image'
    });

    useEffect(() => {
        if (special) {
            setFormData(special);
        } else {
            setFormData({ title: '', description: '', active: true, mediaUrl: '', mediaType: 'image' });
        }
    }, [special, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            id: special?.id || `sp-${Date.now()}`,
        });
        onClose();
    };

    const inputStyles = "mt-1 block w-full rounded-md border-border bg-background shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm text-copy";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-lg shadow-xl w-full max-w-2xl border border-border">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-copy-rich mb-4">{special ? 'Edit' : 'Add'} Special/Announcement</h2>
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-copy-light">Title</label>
                                    <input type="text" name="title" value={formData.title} onChange={handleChange} className={inputStyles} required />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-copy-light">Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={inputStyles} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-copy-light">Media URL (Image or Video)</label>
                                    <input type="url" name="mediaUrl" value={formData.mediaUrl} onChange={handleChange} className={inputStyles} placeholder="https://example.com/image.png" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-copy-light">Media Type</label>
                                    <select name="mediaType" value={formData.mediaType} onChange={handleChange} className={inputStyles}>
                                        <option value="image">Image</option>
                                        <option value="video">Video</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-background px-6 py-4 flex justify-end gap-4 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-copy-rich bg-surface-light rounded-md hover:bg-border">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-copy-rich rounded-md hover:bg-opacity-90">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface RestaurantSettingsProps {
    restaurant: Restaurant;
    onUpdateRestaurant: (restaurant: Restaurant) => void;
}

const RestaurantSettings: React.FC<RestaurantSettingsProps> = ({ restaurant, onUpdateRestaurant }) => {
    const [formData, setFormData] = useState(restaurant);
    const [isSaved, setIsSaved] = useState(false);
    const [isSpecialModalOpen, setIsSpecialModalOpen] = useState(false);
    const [editingSpecial, setEditingSpecial] = useState<DailySpecial | null>(null);

    useEffect(() => {
        setFormData(restaurant);
    }, [restaurant]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'currencyCode') {
            const selectedCurrency = CURRENCIES.find(c => c.code === value);
            if (selectedCurrency) {
                setFormData(prev => ({ ...prev, currency: selectedCurrency }));
            }
            return;
        }
        
        const keys = name.split('.');
        if (keys.length > 1) {
            setFormData(prev => {
                const newState = { ...prev };
                let current: any = newState;
                for (let i = 0; i < keys.length - 1; i++) {
                    if (current[keys[i]] === undefined) {
                        current[keys[i]] = {};
                    }
                    current = current[keys[i]];
                }
                const finalKey = keys[keys.length - 1];
                const isNumber = e.target.type === 'number';
                current[finalKey] = isNumber ? parseFloat(value) : value;
                return newState;
            });
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleToggle = (name: string) => {
        const keys = name.split('.');
        setFormData(prev => {
            const newState = { ...prev };
            let current: any = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                 if (current[keys[i]] === undefined) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }
            const finalKey = keys[keys.length - 1];
            current[finalKey] = !current[finalKey];
            return newState;
        });
    };

    const handleSpecialSave = (special: DailySpecial) => {
        const specials = formData.theme.specials || [];
        const existingIndex = specials.findIndex(s => s.id === special.id);
        let updatedSpecials;
        if (existingIndex > -1) {
            updatedSpecials = [...specials];
            updatedSpecials[existingIndex] = special;
        } else {
            updatedSpecials = [...specials, special];
        }
        setFormData(prev => ({ ...prev, theme: { ...prev.theme, specials: updatedSpecials } }));
    };

    const handleSpecialDelete = (specialId: string) => {
        const updatedSpecials = formData.theme.specials.filter(s => s.id !== specialId);
        setFormData(prev => ({ ...prev, theme: { ...prev.theme, specials: updatedSpecials } }));
    };
    
    const handleSpecialToggle = (specialId: string) => {
        const updatedSpecials = formData.theme.specials.map(s => s.id === specialId ? { ...s, active: !s.active } : s);
        setFormData(prev => ({ ...prev, theme: { ...prev.theme, specials: updatedSpecials } }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateRestaurant(formData);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };
    
    const canOfferDelivery = restaurant.subscription !== 'basic';
    const specialsLimit = restaurant.subscription === 'basic' ? 2 : 7;
    const specialsCount = formData.theme.specials?.length || 0;
    const canAddMoreSpecials = specialsCount < specialsLimit;

    const inputStyles = "mt-1 block w-full rounded-md border-border bg-background shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm text-copy";

    return (
        <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit}>
                <div className="bg-surface shadow-md rounded-lg p-8 border border-border">
                    <h2 className="text-2xl font-bold text-copy-rich mb-6">General Settings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-copy-light">Restaurant Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputStyles} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-copy-light">Cuisine Type</label>
                            <input type="text" name="cuisine" value={formData.cuisine} onChange={handleChange} className={inputStyles} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-copy-light">Logo Image URL</label>
                            <input type="url" name="logoUrl" value={formData.logoUrl} onChange={handleChange} className={inputStyles} placeholder="https://example.com/logo.png" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-copy-light">Banner Image URL</label>
                            <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className={inputStyles} placeholder="https://example.com/banner.png" required />
                        </div>
                        <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-copy-light">Currency</label>
                            <select name="currencyCode" value={formData.currency.code} onChange={handleChange} className={inputStyles}>
                                {CURRENCIES.map(c => (
                                    <option key={c.code} value={c.code}>{c.code} - {c.symbol} {c.code === 'KES' ? '(Default)' : ''}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-surface shadow-md rounded-lg p-8 mt-6 border border-border">
                     <h2 className="text-2xl font-bold text-copy-rich mb-6">Diner Experience</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-copy-light">Welcome Message</label>
                             <textarea name="theme.welcomeMessage" value={formData.theme.welcomeMessage} onChange={handleChange} rows={3} className={inputStyles} placeholder="A short, welcoming message for your customers." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-copy-light">Primary Brand Color</label>
                            <div className="mt-1 flex items-center gap-2">
                                <input type="color" name="theme.primaryColor" value={formData.theme.primaryColor} onChange={handleChange} className="p-1 h-10 w-14 block bg-surface border border-border rounded-md shadow-sm cursor-pointer" />
                                <input type="text" value={formData.theme.primaryColor} onChange={handleChange} name="theme.primaryColor" className={inputStyles} placeholder="#C5A052" />
                            </div>
                        </div>
                     </div>
                     <div className="mt-8 pt-6 border-t border-border">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold text-copy-rich">Specials & Announcements</h3>
                                <p className="text-sm text-copy-light">Feature special items or messages in a carousel on the diner's menu.</p>
                                <p className="text-xs text-copy-lighter mt-1">
                                    {specialsCount} of {specialsLimit} slots used.
                                </p>
                            </div>
                            <button
                                type="button"
                                disabled={!canAddMoreSpecials}
                                onClick={() => { setEditingSpecial(null); setIsSpecialModalOpen(true); }}
                                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-copy-rich rounded-md hover:bg-opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                <PlusIcon className="w-4 h-4" /> Add New
                            </button>
                        </div>
                        <div className="space-y-3 mt-4">
                            {formData.theme.specials?.map(special => (
                                <div key={special.id} className="p-3 bg-background rounded-lg border border-border flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="font-semibold text-copy">{special.title}</p>
                                        <p className="text-xs text-copy-light truncate">{special.description}</p>
                                    </div>
                                    <div className="flex items-center gap-3 ml-4">
                                        <ToggleSwitch checked={special.active} onChange={() => handleSpecialToggle(special.id)} />
                                        <button type="button" onClick={() => { setEditingSpecial(special); setIsSpecialModalOpen(true); }} className="text-copy-lighter hover:text-brand-gold"><EditIcon className="w-4 h-4"/></button>
                                        <button type="button" onClick={() => handleSpecialDelete(special.id)} className="text-copy-lighter hover:text-red-500"><Trash2Icon className="w-4 h-4"/></button>
                                    </div>
                                </div>
                            ))}
                            {specialsCount === 0 && <p className="text-center text-sm text-copy-light py-4">No specials added yet.</p>}
                        </div>
                     </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-surface shadow-md rounded-lg p-8 mt-6 border border-border">
                    <h2 className="text-2xl font-bold text-copy-rich mb-6">Notification Preferences</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-copy">New Order Alerts</p>
                                <p className="text-sm text-copy-light">Receive push notifications when a new order is placed.</p>
                            </div>
                            <ToggleSwitch checked={formData.notificationSettings?.pushNewOrder ?? false} onChange={() => handleToggle('notificationSettings.pushNewOrder')} />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-copy">Order Status Updates</p>
                                <p className="text-sm text-copy-light">Receive notifications when order status changes (e.g., Driver Picked Up).</p>
                            </div>
                            <ToggleSwitch checked={formData.notificationSettings?.pushOrderStatus ?? false} onChange={() => handleToggle('notificationSettings.pushOrderStatus')} />
                        </div>
                         <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-copy">Table Service Alerts</p>
                                <p className="text-sm text-copy-light">Receive alerts when a customer requests a waiter or bill.</p>
                            </div>
                            <ToggleSwitch checked={formData.notificationSettings?.pushTableAlert ?? false} onChange={() => handleToggle('notificationSettings.pushTableAlert')} />
                        </div>
                         <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-copy">Daily Sales Report</p>
                                <p className="text-sm text-copy-light">Receive a summary of daily sales via email.</p>
                            </div>
                            <ToggleSwitch checked={formData.notificationSettings?.emailDailyReport ?? false} onChange={() => handleToggle('notificationSettings.emailDailyReport')} />
                        </div>
                    </div>
                </div>

                {/* Delivery Settings */}
                {canOfferDelivery && (
                     <div className="bg-surface shadow-md rounded-lg p-8 mt-6 border border-border">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-copy-rich">Delivery Settings</h2>
                                <p className="text-sm text-copy-light">Manage your delivery service.</p>
                            </div>
                            <ToggleSwitch checked={formData.deliveryConfig?.enabledByAdmin ?? false} onChange={() => handleToggle('deliveryConfig.enabledByAdmin')} />
                        </div>
                         {formData.deliveryConfig?.enabledByAdmin && (
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 pt-6 border-t border-border">
                                <div>
                                    <label className="block text-sm font-medium text-copy-light">Delivery Fee ({formData.currency.symbol})</label>
                                    <input type="number" step="0.01" name="deliveryConfig.deliveryFee" value={formData.deliveryConfig?.deliveryFee || 0} onChange={handleChange} className={inputStyles} />
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-copy-light">Delivery Radius (miles)</label>
                                    <input type="number" name="deliveryConfig.deliveryRadius" value={formData.deliveryConfig?.deliveryRadius || 0} onChange={handleChange} className={inputStyles} />
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-copy-light">Est. Time (minutes)</label>
                                    <input type="number" name="deliveryConfig.estimatedTime" value={formData.deliveryConfig?.estimatedTime || 0} onChange={handleChange} className={inputStyles} />
                                </div>
                            </div>
                        )}
                    </div>
                )}
                
                 <div className="bg-surface shadow-md rounded-lg p-8 mt-6 border border-border">
                    <h2 className="text-2xl font-bold text-copy-rich mb-6">Payment Settings</h2>
                    <div className="space-y-8">
                        {/* Stripe */}
                        <div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <StripeIcon className="h-8 w-auto"/>
                                    <div>
                                        <h3 className="text-lg font-bold text-copy-rich">Stripe</h3>
                                         <p className={`text-xs font-medium ${formData.paymentSettings.stripe.enabled ? 'text-green-600' : 'text-copy-light'}`}>{formData.paymentSettings.stripe.enabled ? 'Active' : 'Inactive'}</p>
                                    </div>
                                </div>
                                <ToggleSwitch checked={formData.paymentSettings.stripe.enabled} onChange={() => handleToggle('paymentSettings.stripe.enabled')} />
                            </div>
                            {formData.paymentSettings.stripe.enabled && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-4 p-4 bg-background rounded-lg border border-border">
                                    <div>
                                        <label className="block text-sm font-medium text-copy-light">Publishable Key</label>
                                        <input type="password" name="paymentSettings.stripe.publicKey" value={formData.paymentSettings.stripe.publicKey} onChange={handleChange} className={inputStyles} placeholder="pk_live_************************" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-copy-light">Secret Key</label>
                                        <input type="password" name="paymentSettings.stripe.secretKey" value={formData.paymentSettings.stripe.secretKey} onChange={handleChange} className={inputStyles} placeholder="sk_live_************************" />
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* M-Pesa */}
                        <div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <MpesaIcon className="h-8 w-auto" />
                                    <div>
                                        <h3 className="text-lg font-bold text-copy-rich">M-Pesa</h3>
                                         <p className={`text-xs font-medium ${formData.paymentSettings.mpesa.enabled ? 'text-green-600' : 'text-copy-light'}`}>{formData.paymentSettings.mpesa.enabled ? 'Active' : 'Inactive'}</p>
                                    </div>
                                </div>
                                <ToggleSwitch checked={formData.paymentSettings.mpesa.enabled} onChange={() => handleToggle('paymentSettings.mpesa.enabled')} />
                            </div>
                             {formData.paymentSettings.mpesa.enabled && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-4 p-4 bg-background rounded-lg border border-border">
                                    <div>
                                        <label className="block text-sm font-medium text-copy-light">Short Code</label>
                                        <input type="text" name="paymentSettings.mpesa.shortCode" value={formData.paymentSettings.mpesa.shortCode} onChange={handleChange} className={inputStyles} placeholder="123456" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-copy-light">Consumer Key</label>
                                        <input type="password" name="paymentSettings.mpesa.consumerKey" value={formData.paymentSettings.mpesa.consumerKey} onChange={handleChange} className={inputStyles} placeholder="************************" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-copy-light">Consumer Secret</label>
                                        <input type="password" name="paymentSettings.mpesa.consumerSecret" value={formData.paymentSettings.mpesa.consumerSecret} onChange={handleChange} className={inputStyles} placeholder="************************" />
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Pesapal */}
                        <div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <CreditCardIcon className="h-8 w-8 p-1 bg-blue-600 text-white rounded-md"/>
                                    <div>
                                        <h3 className="text-lg font-bold text-copy-rich">Pesapal</h3>
                                         <p className={`text-xs font-medium ${formData.paymentSettings.pesapal.enabled ? 'text-green-600' : 'text-copy-light'}`}>{formData.paymentSettings.pesapal.enabled ? 'Active' : 'Inactive'}</p>
                                    </div>
                                </div>
                                <ToggleSwitch checked={formData.paymentSettings.pesapal.enabled} onChange={() => handleToggle('paymentSettings.pesapal.enabled')} />
                            </div>
                            {formData.paymentSettings.pesapal.enabled && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-4 p-4 bg-background rounded-lg border border-border">
                                    <div>
                                        <label className="block text-sm font-medium text-copy-light">Consumer Key</label>
                                        <input type="password" name="paymentSettings.pesapal.consumerKey" value={formData.paymentSettings.pesapal.consumerKey} onChange={handleChange} className={inputStyles} placeholder="************************" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-copy-light">Consumer Secret</label>
                                        <input type="password" name="paymentSettings.pesapal.consumerSecret" value={formData.paymentSettings.pesapal.consumerSecret} onChange={handleChange} className={inputStyles} placeholder="************************" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                 </div>

                 <div className="mt-8 flex justify-end">
                    <button type="submit" className={`px-6 py-2 text-sm font-medium text-white rounded-md transition-colors ${isSaved ? 'bg-green-600' : 'bg-copy-rich hover:bg-opacity-90'}`}>
                        {isSaved ? 'Saved!' : 'Save Changes'}
                    </button>
                </div>
            </form>

            <SpecialModal
                isOpen={isSpecialModalOpen}
                onClose={() => setIsSpecialModalOpen(false)}
                onSave={handleSpecialSave}
                special={editingSpecial}
            />
        </div>
    );
};

export default RestaurantSettings;
