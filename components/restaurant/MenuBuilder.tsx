// FIX: Import useEffect to resolve 'Cannot find name' error.
import React, { useState, useMemo, useEffect } from 'react';
import { Restaurant, MenuItem, MenuItemTag } from '../../types';
import { PlusIcon, EditIcon, Trash2Icon } from '../Icons';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

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

const CategoryModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (categories: string[]) => void;
    initialCategories: string[];
}> = ({ isOpen, onClose, onSave, initialCategories }) => {
    const [categories, setCategories] = useState(initialCategories);
    const [newCategory, setNewCategory] = useState('');

    if (!isOpen) return null;

    const handleAddCategory = () => {
        if (newCategory && !categories.includes(newCategory)) {
            setCategories([...categories, newCategory]);
            setNewCategory('');
        }
    };

    const handleRemoveCategory = (catToRemove: string) => {
        setCategories(categories.filter(c => c !== catToRemove));
    };

    const handleSave = () => {
        onSave(categories);
        onClose();
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h2 className="text-2xl font-bold text-brand-charcoal mb-4">Manage Categories</h2>
                <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                    {categories.map(cat => (
                        <div key={cat} className="flex justify-between items-center bg-gray-100 p-2 rounded-md">
                            <span>{cat}</span>
                            <button onClick={() => handleRemoveCategory(cat)} className="text-red-500 hover:text-red-700">
                                <Trash2Icon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 mb-6">
                    <input 
                        type="text"
                        value={newCategory}
                        onChange={e => setNewCategory(e.target.value)}
                        placeholder="Add new category"
                        className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm"
                    />
                    <button onClick={handleAddCategory} type="button" className="px-4 py-2 text-sm font-medium text-white bg-brand-charcoal rounded-md">Add</button>
                </div>
                 <div className="flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                    <button type="button" onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-brand-emerald rounded-md hover:bg-opacity-90">Save Categories</button>
                </div>
            </div>
        </div>
    )
};

const MenuItemModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (itemData: Omit<MenuItem, 'id'> | MenuItem) => void;
    item: Omit<MenuItem, 'id'> | MenuItem | null;
    categories: string[];
}> = ({ isOpen, onClose, onSave, item, categories }) => {
    const isEditing = item && 'id' in item;
    const [formData, setFormData] = useState<Omit<MenuItem, 'id' | 'tags'> & { tags: string }>({
        name: '', description: '', price: 0, imageUrl: '', category: categories[0] || '', tags: ''
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        if (item) {
            setFormData({ ...item, tags: item.tags.join(', ') });
            setImagePreview(item.imageUrl);
        } else {
             setFormData({
                name: '', description: '', price: 0, imageUrl: '', category: categories[0] || '', tags: ''
            });
            setImagePreview(null);
        }
    }, [item, categories]);

    if (!isOpen) return null;
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) : value }));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const base64 = await fileToBase64(e.target.files[0]);
            setFormData(prev => ({ ...prev, imageUrl: base64 }));
            setImagePreview(base64);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalTags = formData.tags.split(',').map(t => t.trim()).filter(Boolean) as MenuItemTag[];
        const finalData = { ...formData, tags: finalTags };
        if (isEditing) {
            onSave({ ...finalData, id: item.id });
        } else {
            onSave(finalData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-brand-charcoal mb-4">{isEditing ? 'Edit' : 'Create'} Menu Item</h2>
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md" required />
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-gray-700">Price</label>
                                    <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="mt-1 block w-full rounded-md" required />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Category</label>
                                    <select name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full rounded-md" required>
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                                    <input type="text" name="tags" value={formData.tags} onChange={handleChange} className="mt-1 block w-full rounded-md" placeholder="e.g. vegetarian, spicy" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Item Image</label>
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="mt-1 block w-full text-sm"/>
                                    {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 h-24 w-full rounded-md object-cover"/>}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-4 flex justify-end gap-4 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-brand-charcoal rounded-md hover:bg-opacity-90">Save Item</button>
                    </div>
                </form>
            </div>
        </div>
    )
};

interface MenuBuilderProps {
    restaurant: Restaurant;
    menu: MenuItem[];
    onUpdateRestaurant: (restaurant: Restaurant) => void;
    onAddMenuItem: (itemData: Omit<MenuItem, 'id'>) => void;
    onUpdateMenuItem: (item: MenuItem) => void;
    onDeleteMenuItem: (itemId: string) => void;
}

const MenuBuilder: React.FC<MenuBuilderProps> = ({ restaurant, menu, onUpdateRestaurant, onAddMenuItem, onUpdateMenuItem, onDeleteMenuItem }) => {
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

    const handleSaveCategories = (newCategories: string[]) => {
        onUpdateRestaurant({ ...restaurant, categories: newCategories });
    };

    const handleOpenItemModal = (item: MenuItem | null = null) => {
        setEditingItem(item);
        setIsItemModalOpen(true);
    };

    const handleSaveItem = (itemData: Omit<MenuItem, 'id'> | MenuItem) => {
        if ('id' in itemData) {
            onUpdateMenuItem(itemData);
        } else {
            onAddMenuItem(itemData);
        }
        setIsItemModalOpen(false);
        setEditingItem(null);
    };

    const handleDeleteItemConfirm = () => {
        if (itemToDelete) {
            onDeleteMenuItem(itemToDelete.id);
            setItemToDelete(null);
        }
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-brand-charcoal">Build Your Menu</h3>
                <div className="flex gap-2">
                    <button onClick={() => setIsCategoryModalOpen(true)} className="px-4 py-2 text-sm font-medium text-brand-charcoal bg-white border rounded-md hover:bg-gray-50">Manage Categories</button>
                    <button onClick={() => handleOpenItemModal()} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-charcoal rounded-md hover:bg-opacity-90">
                        <PlusIcon className="w-5 h-5"/>
                        Add Menu Item
                    </button>
                </div>
            </div>

            <div className="space-y-8">
                {restaurant.categories.length > 0 ? restaurant.categories.map(category => (
                    <div key={category}>
                        <h4 className="text-lg font-bold text-gray-700 mb-3 border-b pb-2">{category}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {menu.filter(item => item.category === category).map(item => (
                                <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                    <img src={item.imageUrl} alt={item.name} className="h-32 w-full object-cover"/>
                                    <div className="p-4">
                                        <div className="flex justify-between items-start">
                                            <h5 className="font-bold text-brand-charcoal">{item.name}</h5>
                                            <p className="font-semibold">${item.price.toFixed(2)}</p>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                                        <div className="mt-3 text-right space-x-2">
                                            <button onClick={() => handleOpenItemModal(item)} className="p-1 text-gray-400 hover:text-brand-gold"><EditIcon className="w-4 h-4"/></button>
                                            <button onClick={() => setItemToDelete(item)} className="p-1 text-gray-400 hover:text-red-600"><Trash2Icon className="w-4 h-4"/></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-16 bg-white rounded-lg shadow-md">
                        <p className="text-gray-500">No categories found.</p>
                        <p className="text-sm text-gray-400 mt-2">Start by adding a category to organize your menu items.</p>
                    </div>
                )}
            </div>
            
            <CategoryModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} onSave={handleSaveCategories} initialCategories={restaurant.categories} />
            <MenuItemModal isOpen={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} onSave={handleSaveItem} item={editingItem} categories={restaurant.categories} />
            <ConfirmationModal 
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={handleDeleteItemConfirm}
                title="Confirm Deletion"
            >
                Are you sure you want to delete "{itemToDelete?.name}"? This action cannot be undone.
            </ConfirmationModal>
        </div>
    );
};

export default MenuBuilder;