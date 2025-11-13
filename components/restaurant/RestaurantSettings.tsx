import React, { useState, useEffect } from 'react';
import { Restaurant } from '../../types';

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

interface RestaurantSettingsProps {
    restaurant: Restaurant;
    onUpdateRestaurant: (restaurant: Restaurant) => void;
}

const RestaurantSettings: React.FC<RestaurantSettingsProps> = ({ restaurant, onUpdateRestaurant }) => {
    const [formData, setFormData] = useState(restaurant);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setFormData(restaurant);
    }, [restaurant]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('theme.dailySpecial.')) {
             const field = name.split('.')[2];
             setFormData(prev => ({
                ...prev,
                theme: {
                    ...prev.theme,
                    dailySpecial: {
                        ...prev.theme.dailySpecial!,
                        [field]: value,
                    }
                }
             }));
        } else if (name.startsWith('theme.')) {
            const themeField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                theme: {
                    ...prev.theme,
                    [themeField]: value,
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleToggle = () => {
        setFormData(prev => ({
            ...prev,
            theme: {
                ...prev.theme,
                dailySpecial: {
                    ...prev.theme.dailySpecial!,
                    active: !prev.theme.dailySpecial?.active
                }
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateRestaurant(formData);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit}>
                <div className="bg-white shadow-md rounded-lg p-8">
                    <h2 className="text-2xl font-bold text-brand-charcoal mb-6">General Settings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Restaurant Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Cuisine Type</label>
                            <input type="text" name="cuisine" value={formData.cuisine} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Logo Image URL</label>
                            <input type="url" name="logoUrl" value={formData.logoUrl} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm" placeholder="https://example.com/logo.png" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Banner Image URL</label>
                            <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm" placeholder="https://example.com/banner.png" required />
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow-md rounded-lg p-8 mt-6">
                     <h2 className="text-2xl font-bold text-brand-charcoal mb-6">Diner Experience</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-gray-700">Welcome Message</label>
                             <textarea name="theme.welcomeMessage" value={formData.theme.welcomeMessage} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm" placeholder="A short, welcoming message for your customers." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Primary Brand Color</label>
                            <div className="mt-1 flex items-center gap-2">
                                <input type="color" name="theme.primaryColor" value={formData.theme.primaryColor} onChange={handleChange} className="p-1 h-10 w-14 block bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer" />
                                <input type="text" value={formData.theme.primaryColor} onChange={handleChange} name="theme.primaryColor" className="focus:ring-brand-gold focus:border-brand-gold block w-full sm:text-sm border-gray-300 rounded-md shadow-sm" placeholder="#C5A052" />
                            </div>
                        </div>
                     </div>
                     <div className="mt-8 pt-6 border-t">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-brand-charcoal">Daily Special / Announcement</h3>
                                <p className="text-sm text-gray-500">Feature a special item or message on the diner's menu.</p>
                            </div>
                            <ToggleSwitch checked={formData.theme.dailySpecial?.active ?? false} onChange={handleToggle} />
                        </div>
                        {formData.theme.dailySpecial?.active && (
                            <div className="grid grid-cols-1 gap-6 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Title</label>
                                    <input type="text" name="theme.dailySpecial.title" value={formData.theme.dailySpecial?.title || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm" placeholder="e.g. Chef's Special" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea name="theme.dailySpecial.description" value={formData.theme.dailySpecial?.description || ''} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm" placeholder="Describe the daily special." />
                                </div>
                            </div>
                        )}
                     </div>
                </div>
                 <div className="mt-6 flex justify-end">
                    <button type="submit" className={`px-6 py-2 text-sm font-medium text-white rounded-md transition-colors ${isSaved ? 'bg-green-600' : 'bg-brand-charcoal hover:bg-opacity-90'}`}>
                        {isSaved ? 'Saved!' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RestaurantSettings;