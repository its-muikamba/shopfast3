// FIX: Import useEffect to resolve 'Cannot find name' error.
import React, { useState, useMemo, useEffect } from 'react';
import { Restaurant, MenuItem, MenuItemTag } from '../../types';
import { PlusIcon, EditIcon, Trash2Icon, XCircleIcon } from '../Icons';

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
            <div className="bg-surface rounded-lg shadow-xl w-full max-w-md border border-border">
                <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-copy-rich">{title}</h3>
                    <div className="mt-2 text-sm text-copy-light">{children}</div>
                </div>
                <div className="bg-background px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                    <button onClick={onClose} type="button" className="px-4 py-2 text-sm font-medium text-copy-rich bg-surface border border-border rounded-md hover:bg-border">Cancel</button>
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
            <div className="bg-surface rounded-lg shadow-xl w-full max-w-md p-6 border border-border">
                <h2 className="text-2xl font-bold text-copy-rich mb-4">Manage Categories</h2>
                <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                    {categories.map(cat => (
                        <div key={cat} className="flex justify-between items-center bg-background p-2 rounded-md">
                            <span className="text-copy">{cat}</span>
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
                        className="flex-grow rounded-md border-border bg-background shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm text-copy"
                    />
                    <button onClick={handleAddCategory} type="button" className="px-4 py-2 text-sm font-medium text-white bg-copy-rich rounded-md">Add</button>
                </div>
                 <div className="flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-copy-rich bg-surface-light rounded-md hover:bg-border">Cancel</button>
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
    const [formData, setFormData] = useState<Omit<MenuItem, 'id' | 'tags'> & { tags: string, status: 'active' | 'disabled' }>({
        name: '', description: '', price: 0, imageUrl: '', category: categories[0] || '', tags: '', status: 'active'
    });
    const inputStyles = "mt-1 block w-full rounded-md border-border bg-background shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm text-copy";

    useEffect(() => {
        if (item) {
            setFormData({ ...item, tags: item.tags.join(', ') });
        } else {
             setFormData({
                name: '', description: '', price: 0, imageUrl: '', category: categories[0] || '', tags: '', status: 'active'
            });
        }
    }, [item, categories]);

    if (!isOpen) return null;
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) : value }));
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
            <div className="bg-surface rounded-lg shadow-xl w-full max-w-2xl border border-border">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-copy-rich mb-4">{isEditing ? 'Edit' : 'Create'} Menu Item</h2>
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-copy-light">Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputStyles} required />
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-copy-light">Price</label>
                                    <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className={inputStyles} required />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-copy-light">Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={inputStyles} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-copy-light">Category</label>
                                    <select name="category" value={formData.category} onChange={handleChange} className={inputStyles} required>
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-copy-light">Tags (comma-separated)</label>
                                    <input type="text" name="tags" value={formData.tags} onChange={handleChange} className={inputStyles} placeholder="e.g. vegetarian, spicy" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-copy-light">Item Image URL</label>
                                    <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className={inputStyles} placeholder="https://example.com/item.jpg" />
                                    {formData.imageUrl && <img src={formData.imageUrl} alt="Preview" className="mt-2 h-24 w-full rounded-md object-cover"/>}
                                </div>
                                <div className="md:col-span-2 flex items-center justify-between">
                                    <label className="block text-sm font-medium text-copy-light">Item Status</label>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-semibold ${formData.status === 'active' ? 'text-brand-emerald' : 'text-copy-lighter'}`}>Active</span>
                                        <ToggleSwitch checked={formData.status === 'active'} onChange={() => setFormData(prev => ({...prev, status: prev.status === 'active' ? 'disabled' : 'active'}))} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-background px-6 py-4 flex justify-end gap-4 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-copy-rich bg-surface-light rounded-md hover:bg-border">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-copy-rich rounded-md hover:bg-opacity-90">Save Item</button>
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
    onUpdateMenuItemsStatus: (itemIds: string[], status: 'active' | 'disabled') => void;
    onDeleteMenuItems: (itemIds: string[]) => void;
}

const BulkActionBar: React.FC<{
    count: number;
    onCancel: () => void;
    onEnable: () => void;
    onDisable: () => void;
    onDelete: () => void;
}> = ({ count, onCancel, onEnable, onDisable, onDelete }) => (
    <div className="fixed bottom-0 left-64 right-0 bg-surface shadow-lg z-20 border-t border-border transform transition-transform duration-300 ease-in-out">
        <div className="p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <button onClick={onCancel} className="text-copy-light hover:text-copy-rich"><XCircleIcon className="w-6 h-6"/></button>
                <p className="font-semibold text-copy-rich">{count} item{count > 1 ? 's' : ''} selected</p>
            </div>
            <div className="flex items-center gap-3">
                <button onClick={onEnable} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">Enable</button>
                <button onClick={onDisable} className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700">Disable</button>
                <button onClick={onDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Delete</button>
            </div>
        </div>
    </div>
);


const MenuBuilder: React.FC<MenuBuilderProps> = ({ restaurant, menu, onUpdateRestaurant, onAddMenuItem, onUpdateMenuItem, onDeleteMenuItem, onUpdateMenuItemsStatus, onDeleteMenuItems }) => {
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [actionToConfirm, setActionToConfirm] = useState<'delete' | null>(null);


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
    
    const toggleSelectMode = () => {
        setIsSelectMode(!isSelectMode);
        setSelectedItems([]);
    };

    const handleItemSelect = (itemId: string) => {
        setSelectedItems(prev => 
            prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
        );
    };

    const handleBulkEnable = () => {
        onUpdateMenuItemsStatus(selectedItems, 'active');
        toggleSelectMode();
    };
    
    const handleBulkDisable = () => {
        onUpdateMenuItemsStatus(selectedItems, 'disabled');
        toggleSelectMode();
    };
    
    const handleBulkDelete = () => {
        onDeleteMenuItems(selectedItems);
        toggleSelectMode();
        setActionToConfirm(null);
    };

    return (
        <div className="pb-20">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-copy-rich">Build Your Menu</h3>
                <div className="flex gap-2">
                    <button onClick={toggleSelectMode} className="px-4 py-2 text-sm font-medium text-copy-rich bg-surface border border-border rounded-md hover:bg-surface-light">
                        {isSelectMode ? 'Cancel Selection' : 'Select Items'}
                    </button>
                    <button onClick={() => setIsCategoryModalOpen(true)} className="px-4 py-2 text-sm font-medium text-copy-rich bg-surface border border-border rounded-md hover:bg-surface-light">Manage Categories</button>
                    <button onClick={() => handleOpenItemModal()} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-copy-rich rounded-md hover:bg-opacity-90">
                        <PlusIcon className="w-5 h-5"/>
                        Add Menu Item
                    </button>
                </div>
            </div>

            <div className="space-y-8">
                {restaurant.categories.length > 0 ? restaurant.categories.map(category => (
                    <div key={category}>
                        <h4 className="text-lg font-bold text-copy-light mb-3 border-b border-border pb-2">{category}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {menu.filter(item => item.category === category).map(item => (
                                <div key={item.id} className={`relative bg-surface rounded-lg shadow-md overflow-hidden border border-border group ${item.status === 'disabled' ? 'opacity-50' : ''}`}>
                                    {isSelectMode && (
                                        <div className="absolute top-2 left-2 z-10">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedItems.includes(item.id)}
                                                onChange={() => handleItemSelect(item.id)}
                                                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                        </div>
                                    )}
                                    {item.status === 'disabled' && (
                                        <div className="absolute top-2 right-2 z-10 bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">
                                            Disabled
                                        </div>
                                    )}
                                    <img src={item.imageUrl} alt={item.name} className="h-32 w-full object-cover"/>
                                    <div className="p-4">
                                        <div className="flex justify-between items-start">
                                            <h5 className="font-bold text-copy-rich">{item.name}</h5>
                                            <p className="font-semibold text-copy">${item.price.toFixed(2)}</p>
                                        </div>
                                        <p className="text-sm text-copy-light mt-1">{item.description}</p>
                                        <div className="mt-3 text-right space-x-2">
                                            <button onClick={() => handleOpenItemModal(item)} className="p-1 text-copy-lighter hover:text-brand-gold"><EditIcon className="w-4 h-4"/></button>
                                            <button onClick={() => setItemToDelete(item)} className="p-1 text-copy-lighter hover:text-red-600"><Trash2Icon className="w-4 h-4"/></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-16 bg-surface rounded-lg shadow-md border border-border">
                        <p className="text-copy-light">No categories found.</p>
                        <p className="text-sm text-copy-lighter mt-2">Start by adding a category to organize your menu items.</p>
                    </div>
                )}
            </div>
            
            {selectedItems.length > 0 && (
                <BulkActionBar 
                    count={selectedItems.length}
                    onCancel={toggleSelectMode}
                    onEnable={handleBulkEnable}
                    onDisable={handleBulkDisable}
                    onDelete={() => setActionToConfirm('delete')}
                />
            )}
            
            <CategoryModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} onSave={handleSaveCategories} initialCategories={restaurant.categories} />
            <MenuItemModal isOpen={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} onSave={handleSaveItem} item={editingItem} categories={restaurant.categories} />
            <ConfirmationModal 
                isOpen={!!itemToDelete || (actionToConfirm === 'delete' && selectedItems.length > 0)}
                onClose={() => { setItemToDelete(null); setActionToConfirm(null); }}
                onConfirm={itemToDelete ? handleDeleteItemConfirm : handleBulkDelete}
                title="Confirm Deletion"
            >
                {itemToDelete 
                    ? `Are you sure you want to delete "${itemToDelete.name}"? This action cannot be undone.`
                    : `Are you sure you want to delete the ${selectedItems.length} selected items? This action cannot be undone.`
                }
            </ConfirmationModal>
        </div>
    );
};

export default MenuBuilder;
