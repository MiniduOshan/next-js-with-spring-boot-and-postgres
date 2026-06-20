"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from "@/components/AuthContext";
import {
    Building2,
    Plus,
    Trash2,
    Edit2,
    Save,
    X,
    MapPin,
    Sparkles,
    CheckCircle2,
    Compass,
    Heart,
    Tag,
    HelpCircle,
    Undo,
    DollarSign,
    Layers,
    Settings
} from 'lucide-react';
import {
    getCategories,
    saveCategories,
    getFilterGroups,
    saveFilterGroups,
    CategoryData,
    FilterGroup,
    renderLucideIcon
} from "@/lib/adminData";
import { toast } from 'sonner';

// Sample visual colors for category builder
const COLOR_PRESETS = [
    { value: 'bg-blue-50 text-blue-600', label: 'Blue Theme' },
    { value: 'bg-amber-50 text-amber-600', label: 'Amber Theme' },
    { value: 'bg-emerald-50 text-emerald-600', label: 'Emerald Theme' },
    { value: 'bg-purple-50 text-purple-600', label: 'Purple Theme' },
    { value: 'bg-rose-50 text-rose-600', label: 'Rose Theme' },
    { value: 'bg-green-50 text-green-600', label: 'Green Theme' },
    { value: 'bg-pink-50 text-pink-600', label: 'Pink Theme' },
    { value: 'bg-slate-100 text-slate-600 dark:text-slate-400', label: 'Slate Theme' },
];

const ICON_PRESETS = [
    'Palmtree',
    'Star',
    'Mountain',
    'Building2',
    'Users',
    'Tent',
    'Heart',
    'Map',
    'Coffee',
    'Compass',
    'Anchor',
    'Waves',
    'Trees',
    'Sunset',
    'Key',
    'Utensils'
];

function ManageSiteData() {
    const { user } = useAuth();
    const isAdmin = user?.isAdmin;

    // State management
    const [activeTab, setActiveTab] = useState<'categories' | 'filters'>('categories');
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([]);

    // Category Form State
    const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [catId, setCatId] = useState('');
    const [catName, setCatName] = useState('');
    const [catDescription, setCatDescription] = useState('');
    const [catCount, setCatCount] = useState('');
    const [catIcon, setCatIcon] = useState('Palmtree');
    const [catImage, setCatImage] = useState('');
    const [catColor, setCatColor] = useState('bg-blue-50 text-blue-600');

    // New Custom Main Filter Group parameters
    const [isNewGroupFormOpen, setIsNewGroupFormOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDesc, setNewGroupDesc] = useState('');

    // Per-category tag insertion fields
    const [newItemInputs, setNewItemInputs] = useState<Record<string, string>>({});

    // Handle Loading Data on mount
    useEffect(() => {
        setCategories(getCategories());
        setFilterGroups(getFilterGroups());
    }, []);

    if (!isAdmin) {
        return (
            <div className="max-w-4xl mx-auto p-6 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Admin Privileges Required</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Only system administrators can access and edit category configuration or metadata filters.</p>
            </div>
        );
    }

    // Categories CRUD operations
    const handleOpenNewForm = () => {
        setEditingCategory(null);
        setCatId('');
        setCatName('');
        setCatDescription('');
        setCatCount('10 Properties');
        setCatIcon('Palmtree');
        setCatImage('https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1000');
        setCatColor('bg-blue-50 text-blue-600');
        setIsFormOpen(true);
    };

    const handleOpenEditForm = (category: CategoryData) => {
        setEditingCategory(category);
        setCatId(category.id);
        setCatName(category.name);
        setCatDescription(category.description);
        setCatCount(category.count);
        setCatIcon(category.icon);
        setCatImage(category.image);
        setCatColor(category.color);
        setIsFormOpen(true);
    };

    const handleSaveCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!catId.trim() || !catName.trim()) {
            toast.error("Category code (ID) and Name are required.");
            return;
        }

        const updatedCategory: CategoryData = {
            id: catId.trim().toLowerCase(),
            name: catName.trim(),
            description: catDescription.trim(),
            count: catCount.trim() || '0 Properties',
            icon: catIcon,
            image: catImage.trim() || 'https://images.unsplash.com/photo-154055570591-112f2f40a3f4?w=800',
            color: catColor,
        };

        let newCategories = [...categories];

        if (editingCategory) {
            // Update
            newCategories = newCategories.map(c => c.id === editingCategory.id ? updatedCategory : c);
            toast.success(`Category "${catName}" updated successfully.`);
        } else {
            // Add
            if (newCategories.some(c => c.id === updatedCategory.id)) {
                toast.error(`A category with code "${catId}" already exists.`);
                return;
            }
            newCategories.push(updatedCategory);
            toast.success(`Category "${catName}" created successfully.`);
        }

        setCategories(newCategories);
        saveCategories(newCategories);
        setIsFormOpen(false);
        setEditingCategory(null);
    };

    const handleDeleteCategory = (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete the category "${name}"?`)) {
            const remaining = categories.filter(c => c.id !== id);
            setCategories(remaining);
            saveCategories(remaining);
            toast.success(`Category "${name}" removed.`);
        }
    };

    // Dynamic Custom Filters CRUD Operations
    const handleCreateFilterGroup = (e: React.FormEvent) => {
        e.preventDefault();
        const name = newGroupName.trim();
        if (!name) {
            toast.error("Please enter a name for the filter group.");
            return;
        }

        const id = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!id) {
            toast.error("Invalid group name.");
            return;
        }

        if (filterGroups.some(g => g.id === id)) {
            toast.error(`A filter group with equivalent key ("${id}") already exists.`);
            return;
        }

        const newGroup: FilterGroup = {
            id,
            name,
            description: newGroupDesc.trim() || `Refine stays matching ${name} criteria.`,
            items: []
        };

        const updated = [...filterGroups, newGroup];
        setFilterGroups(updated);
        saveFilterGroups(updated);

        setNewGroupName('');
        setNewGroupDesc('');
        setIsNewGroupFormOpen(false);
        toast.success(`Filter category "${name}" created dynamically!`);
    };

    const handleDeleteFilterGroup = (groupId: string, name: string) => {
        const isStandard = ['locations', 'priceRanges', 'propertyTypes', 'amenities'].includes(groupId);
        if (isStandard) {
            toast.error(`"${name}" is a standard hotel filter type and cannot be deleted. However, you can manage its tags freely.`);
            return;
        }

        if (window.confirm(`Are you sure you want to delete the main search filter "${name}"? This removes it permanently for all travelers.`)) {
            const updated = filterGroups.filter(g => g.id !== groupId);
            setFilterGroups(updated);
            saveFilterGroups(updated);
            toast.success(`Filter Group "${name}" removed.`);
        }
    };

    const handleAddItemToGroup = (groupId: string, e: React.FormEvent) => {
        e.preventDefault();
        const val = (newItemInputs[groupId] || '').trim();
        if (!val) return;

        const group = filterGroups.find(g => g.id === groupId);
        if (!group) return;

        if (group.items.map(i => i.toLowerCase()).includes(val.toLowerCase())) {
            toast.error(`"${val}" already exists in the list.`);
            return;
        }

        const updated = filterGroups.map(g => {
            if (g.id === groupId) {
                return {
                    ...g,
                    items: [...g.items, val]
                };
            }
            return g;
        });

        setFilterGroups(updated);
        saveFilterGroups(updated);
        setNewItemInputs({ ...newItemInputs, [groupId]: '' });
        toast.success(`"${val}" added to "${group.name}".`);
    };

    const handleRemoveItemFromGroup = (groupId: string, itemIdx: number, val: string) => {
        const updated = filterGroups.map(g => {
            if (g.id === groupId) {
                return {
                    ...g,
                    items: g.items.filter((_, idx) => idx !== itemIdx)
                };
            }
            return g;
        });

        setFilterGroups(updated);
        saveFilterGroups(updated);
        toast.success(`"${val}" removed.`);
    };

    const handleResetFiltersToDefault = () => {
        if (window.confirm("Do you want to reset all site filters and categories to system defaults? Any custom modifications will be lost.")) {
            localStorage.removeItem('yme_admin_categories');
            localStorage.removeItem('yme_admin_filter_groups');
            localStorage.removeItem('yme_admin_filters');
            setCategories(getCategories());
            setFilterGroups(getFilterGroups());
            toast.success("All configurations restored to default settings.");
        }
    };

    const getIconForGroup = (id: string) => {
        if (id === 'locations') return <MapPin className="w-4 h-4 text-emerald-500" />;
        if (id === 'priceRanges') return <Compass className="w-4 h-4 text-cyan-500" />;
        if (id === 'propertyTypes') return <Building2 className="w-4 h-4 text-amber-500" />;
        if (id === 'amenities') return <CheckCircle2 className="w-4 h-4 text-indigo-500" />;
        return <Layers className="w-4 h-4 text-pink-500" />;
    };

    return (
        <div className="max-w-6xl mx-auto space-y-4">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div className="text-left">
                    <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <Settings className="w-8 h-8 text-brand" /> Manage Site Data
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Configure hotel categorization cards and search refinement checklist items displayed across the traveler interface.
                    </p>
                </div>
                <button
                    onClick={handleResetFiltersToDefault}
                    className="px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto select-none"
                >
                    <Undo className="w-3.5 h-3.5" /> Restore Defaults
                </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 border-b border-slate-100 dark:border-slate-850">
                <button
                    onClick={() => { setActiveTab('categories'); setIsFormOpen(false); }}
                    className={`px-4 py-2 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'categories'
                            ? 'border-brand text-brand'
                            : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                >
                    <Sparkles className="w-4 h-4" /> Categories Page ({categories.length})
                </button>
                <button
                    onClick={() => { setActiveTab('filters'); setIsFormOpen(false); }}
                    className={`px-4 py-2 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'filters'
                            ? 'border-brand text-brand'
                            : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                >
                    <Layers className="w-4 h-4" /> Dynamic Search Filters ({filterGroups.length})
                </button>
            </div>

            {activeTab === 'categories' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-xs">
                        <div className="text-left">
                            <h3 className="font-bold text-slate-800 dark:text-white">Active Hotel Categories</h3>
                            <p className="text-xs text-slate-400 dark:text-slate-500">Edit, add or remove landing page/trending hotel collections as shown on search triggers.</p>
                        </div>
                        <button
                            onClick={handleOpenNewForm}
                            className="bg-[#00A67E] hover:bg-[#008f6c] text-white px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Add Category
                        </button>
                    </div>

                    {/* New / Edit Category Inline Panel Form */}
                    {isFormOpen && (
                        <div className="bg-white dark:bg-slate-900 border border-brand/20 rounded-3xl p-5 shadow-md space-y-4 animate-in fade-in duration-200">
                            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                                <h3 className="font-bold text-slate-900 dark:text-white-left">
                                    {editingCategory ? `Update Category: ${editingCategory.name}` : "Create New Site Category"}
                                </h3>
                                <button
                                    onClick={() => { setIsFormOpen(false); setEditingCategory(null); }}
                                    className="p-1 text-slate-400 hover:text-slate-350 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSaveCategory} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">Category URL Slug ID <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        disabled={!!editingCategory}
                                        value={catId}
                                        onChange={(e) => setCatId(e.target.value)}
                                        placeholder="e.g. eco, beachfront, luxury, budget"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white outline-none focus:border-brand focus:ring-1 focus:ring-brand disabled:opacity-50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">Display Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={catName}
                                        onChange={(e) => setCatName(e.target.value)}
                                        placeholder="e.g. Eco Lodges"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white outline-none focus:border-brand"
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">Short Description</label>
                                    <input
                                        type="text"
                                        value={catDescription}
                                        onChange={(e) => setCatDescription(e.target.value)}
                                        placeholder="Describe what hotels fall under this category..."
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white outline-none focus:border-brand"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">Visual Count Text</label>
                                    <input
                                        type="text"
                                        value={catCount}
                                        onChange={(e) => setCatCount(e.target.value)}
                                        placeholder="e.g. 120 Properties"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white outline-none focus:border-brand"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">Image URL (Unsplash or direct URL)</label>
                                    <input
                                        type="text"
                                        value={catImage}
                                        onChange={(e) => setCatImage(e.target.value)}
                                        placeholder="https://images.unsplash.com/..."
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white outline-none focus:border-brand"
                                    />
                                </div>

                                {/* Icon Presets */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase block mb-1">Select Category Icon</label>
                                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                                        {ICON_PRESETS.map((icon) => (
                                            <button
                                                key={icon}
                                                type="button"
                                                onClick={() => setCatIcon(icon)}
                                                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${catIcon === icon
                                                        ? 'border-brand bg-brand/5 text-brand font-bold'
                                                        : 'border-slate-150 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-750 text-slate-600 dark:text-slate-400'
                                                    }`}
                                            >
                                                {renderLucideIcon(icon, 'w-4 h-4')}
                                                <span className="text-[9px] truncate w-full text-center">{icon}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Color Presets */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase block mb-1">Accent Theme Tint</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {COLOR_PRESETS.map((col) => (
                                            <button
                                                key={col.value}
                                                type="button"
                                                onClick={() => setCatColor(col.value)}
                                                className={`p-2 px-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold cursor-pointer transition-all ${catColor === col.value
                                                        ? 'border-brand ring-2 ring-brand/10'
                                                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/20'
                                                    }`}
                                            >
                                                <span className="truncate">{col.label}</span>
                                                <span className={`w-3.5 h-3.5 rounded-md ${col.value}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="md:col-span-2 pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-850 shadow-none">
                                    <button
                                        type="button"
                                        onClick={() => { setIsFormOpen(false); setEditingCategory(null); }}
                                        className="px-4 py-2 rounded-xl font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 transition-colors pointer-events-auto cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-[#00A67E] hover:bg-[#008f6c] text-white px-4 py-2 rounded-xl font-bold transition-all shadow-md flex items-center gap-1 cursor-pointer"
                                    >
                                        <Save className="w-4 h-4" /> Save Category Page
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Categories Grid Table */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map((cat) => (
                            <div key={cat.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between">
                                <div className="relative h-36">
                                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-slate-900/40"></div>
                                    <div className="absolute top-3 left-3 flex items-center gap-2">
                                        <span className={`p-2 rounded-xl backdrop-blur-md bg-white/95 dark:bg-slate-900/95 shadow-xs`}>
                                            {renderLucideIcon(cat.icon, `w-4 h-4 ${cat.color.split(' ')[1]}`)}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-3 left-4 text-left">
                                        <h4 className="text-white font-extrabold text-base drop-shadow">{cat.name}</h4>
                                        <span className="text-xs text-white/90 font-semibold drop-shadow">{cat.count}</span>
                                    </div>
                                </div>
                                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-left">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-left line-clamp-2">
                                        {cat.description || "No description provided."}
                                    </p>
                                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-3">
                                        <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider">code: {cat.id}</span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleOpenEditForm(cat)}
                                                className="p-1.5 text-slate-500 hover:text-brand bg-slate-50 dark:bg-slate-950 rounded-lg hover:bg-brand/5 border border-slate-100 dark:border-slate-850 transition-colors cursor-pointer"
                                                title="Edit Details"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                                className="p-1.5 text-slate-500 hover:text-red-500 bg-slate-50 dark:bg-slate-950 rounded-lg hover:bg-red-500/5 border border-slate-100 dark:border-slate-850 transition-colors cursor-pointer"
                                                title="Delete Category"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {categories.length === 0 && (
                            <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-750 rounded-3xl">
                                <Tag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-650 dark:text-slate-400 font-bold">No active site categories</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Add a category to show collections of stays on the categories page.</p>
                                <button onClick={handleOpenNewForm} className="mt-4 bg-brand text-white px-4 py-2 rounded-full text-xs font-bold shadow-xs cursor-pointer">Add First Category</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'filters' && (
                <div className="space-y-4 text-left">

                    {/* Section Top Controls */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm gap-3">
                        <div className="text-left">
                            <h3 className="font-bold text-slate-900 dark:text-white">Traveler Refinement Sidebar Configurator</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Add, modify or delete search options. Dynamic options are automatically integrated into the traveler sidebar.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsNewGroupFormOpen(!isNewGroupFormOpen)}
                            className="bg-[#00A67E] hover:bg-[#008f6c] text-white px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 self-start cursor-pointer transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Create Custom Main Filter
                        </button>
                    </div>

                    {/* Brand New Custom Main Filter Group Form */}
                    {isNewGroupFormOpen && (
                        <div className="bg-white dark:bg-slate-900 border border-[#00A67E]/40 rounded-3xl p-5 shadow-md space-y-3 animate-in fade-in duration-200 text-left">
                            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2.5">
                                <h4 className="font-bold text-slate-900 dark:text-white">Create Custom Main Filter Group</h4>
                                <button
                                    onClick={() => setIsNewGroupFormOpen(false)}
                                    className="p-1 text-slate-400 hover:text-slate-650 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateFilterGroup} className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">Filter Group Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={newGroupName}
                                        onChange={(e) => setNewGroupName(e.target.value)}
                                        placeholder="e.g. Hotel View, Distance, Bed Options"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-950 dark:text-white outline-none focus:border-[#001D4A]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">Short Explanation</label>
                                    <input
                                        type="text"
                                        value={newGroupDesc}
                                        onChange={(e) => setNewGroupDesc(e.target.value)}
                                        placeholder="e.g. Filter listings based on landscape backdrop"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-950 dark:text-white outline-none focus:border-[#001D4A]"
                                    />
                                </div>

                                <div className="md:col-span-2 pt-2 flex justify-end gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => setIsNewGroupFormOpen(false)}
                                        className="px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-[#00A67E] hover:bg-[#008f6c] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                    >
                                        Build Dynamic Filter Group
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* VERTICALLY STACKED FILTER GROUPS LIST */}
                    <div className="flex flex-col gap-4">
                        {filterGroups.map((group) => {
                            const isStandard = ['locations', 'priceRanges', 'propertyTypes', 'amenities'].includes(group.id);
                            return (
                                <div
                                    key={group.id}
                                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 shadow-xs space-y-3 hover:shadow-sm transition-shadow text-left"
                                >
                                    {/* Card Header & Metadata */}
                                    <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800/80 pb-3">
                                        <div className="flex items-center gap-3 text-left">
                                            <span className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl">
                                                {getIconForGroup(group.id)}
                                            </span>
                                            <div>
                                                <h4 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                                                    {group.name}
                                                    {isStandard ? (
                                                        <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/30">System Standard</span>
                                                    ) : (
                                                        <span className="bg-pink-50 dark:bg-pink-950/40 text-pink-650 dark:text-pink-400 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-pink-100 dark:border-pink-900/30">Admin Custom</span>
                                                    )}
                                                </h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{group.description || "No description configured."}</p>
                                            </div>
                                        </div>

                                        {!isStandard && (
                                            <button
                                                onClick={() => handleDeleteFilterGroup(group.id, group.name)}
                                                className="p-2 text-slate-450 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 border border-transparent rounded-xl transition-all cursor-pointer"
                                                title={`Delete custom filter "${group.name}"`}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Add Tag Form for this Filter Group */}
                                    <form onSubmit={(e) => handleAddItemToGroup(group.id, e)} className="flex items-center gap-2 max-w-sm">
                                        <input
                                            type="text"
                                            required
                                            placeholder={
                                                group.id === 'priceRanges'
                                                    ? 'e.g. LKR 100,000+'
                                                    : `Add option to ${group.name}...`
                                            }
                                            value={newItemInputs[group.id] || ''}
                                            onChange={(e) => setNewItemInputs({ ...newItemInputs, [group.id]: e.target.value })}
                                            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-950 dark:text-white outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                                        />
                                        <button
                                            type="submit"
                                            className="bg-[#00A67E] hover:bg-[#008f6c] text-white p-2.5 rounded-xl font-bold cursor-pointer transition-colors"
                                            title="Add option"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </form>

                                    {/* Tag Checklist flow details */}
                                    <div className="flex flex-wrap gap-2.5 pt-1 min-h-[50px] items-center">
                                        {group.items.map((item, index) => (
                                            <div
                                                key={`${item}-${index}`}
                                                className="flex items-center gap-2 py-1.5 px-3.5 bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-950/40 dark:hover:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                                            >
                                                <span>{item}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItemFromGroup(group.id, index, item)}
                                                    className="text-slate-400 hover:text-red-500 transition-colors p-0.5 hover:bg-slate-200/50 dark:hover:bg-slate-850 rounded-full cursor-pointer"
                                                    title={`Remove option "${item}"`}
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}

                                        {group.items.length === 0 && (
                                            <div className="text-slate-400 dark:text-slate-500 text-xs italic py-2">
                                                No configuration items specified. Add items to make this filter visible to travelers.
                                            </div>
                                        )}
                                    </div>

                                </div>
                            );
                        })}

                        {filterGroups.length === 0 && (
                            <div className="text-center py-16 bg-white dark:bg-slate-900 border border-dashed border-slate-305 dark:border-slate-800 rounded-2xl">
                                <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="font-bold text-slate-700 dark:text-slate-305">Zero Filter Groups Loaded</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Please restore defaults or wait for site synchronization.</p>
                            </div>
                        )}
                    </div>

                </div>
            )}

        </div>
    );
}


import DashboardLayout from "@/components/layout/DashboardLayout";
export default function PageWrapper(props: any) {
  return (
    <DashboardLayout>
      <ManageSiteData {...props} />
    </DashboardLayout>
  );
}
