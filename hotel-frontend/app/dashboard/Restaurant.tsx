"use client";

import { useState, useEffect } from "react";
import { UtensilsCrossed, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import { toast } from "sonner";

export default function RestaurantMenuManagement() {
  const { user, activeHotel } = useAuth();

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [meals, setMeals] = useState<any[]>([]);

  const [newMeal, setNewMeal] = useState({
    mealName: "",
    category: "",
    price: "",
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const headers: Record<string, string> = {
        "X-Owner-Email": user?.email || "",
      };

      if (activeHotel) {
        headers["X-Hotel-Id"] = activeHotel._id;
      }

      const res = await fetch("/api/hotel-profile", {
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        setMeals(data.meals || []);
      }
    } catch (err) {
      console.error("Error loading menu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.email, activeHotel?._id]);

  const handleSave = async (updatedMeals: any[]) => {
    setIsSaving(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Owner-Email": user?.email || "",
      };

      if (activeHotel) {
        headers["X-Hotel-Id"] = activeHotel._id;
      }

      const res = await fetch("/api/hotel-profile", {
        method: "PUT",
        headers,
        body: JSON.stringify({
          meals: updatedMeals,
        }),
      });

      if (res.ok) {
        setMeals(updatedMeals);
        toast.success("Menu updated successfully");
      } else {
        toast.error("Failed to update menu");
      }
    } catch (err) {
      console.error("Error updating menu:", err);
      toast.error("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddMeal = () => {
    if (!newMeal.mealName || !newMeal.price) {
      toast.error("Please enter meal name and price");
      return;
    }

    const meal = {
      mealName: newMeal.mealName,
      category: newMeal.category,
      price: Number(newMeal.price),
    };

    const updatedMeals = [...meals, meal];

    setNewMeal({
      mealName: "",
      category: "",
      price: "",
    });

    handleSave(updatedMeals);
  };

  const handleDeleteMeal = (index: number) => {
    const updatedMeals = meals.filter((_, i) => i !== index);
    handleSave(updatedMeals);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Restaurant Menu Management
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Create and manage meals, food items, and prices for your restaurant.
        </p>
      </div>

      {/* Add Meal Form */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <UtensilsCrossed className="w-4 h-4 text-brand" />
          Add New Meal
        </h3>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={newMeal.mealName}
              onChange={(e) =>
                setNewMeal({
                  ...newMeal,
                  mealName: e.target.value,
                })
              }
              placeholder="Meal Name (e.g. Chicken Fried Rice)"
              className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />

            <input
              type="number"
              value={newMeal.price}
              onChange={(e) =>
                setNewMeal({
                  ...newMeal,
                  price: e.target.value,
                })
              }
              placeholder="Price (LKR)"
              className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <input
            type="text"
            value={newMeal.category}
            onChange={(e) =>
              setNewMeal({
                ...newMeal,
                category: e.target.value,
              })
            }
            placeholder="Category (e.g. Main Course, Dessert, Beverage)"
            className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />

          <button
            type="button"
            disabled={isSaving}
            onClick={handleAddMeal}
            className="bg-brand text-white px-4 py-2 rounded-xl font-medium hover:bg-brand-hover flex items-center gap-2 disabled:opacity-70"
          >
            <Plus className="w-4 h-4" />
            Add Meal
          </button>
        </div>
      </div>

      {/* Menu List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Restaurant Menu
          </h3>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">
            Loading meals...
          </div>
        ) : meals.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No meals available. Add your first meal above!
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {meals.map((meal, index) => (
              <div
                key={index}
                className="p-4 relative group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => handleDeleteMeal(index)}
                  className="absolute top-6 right-6 text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="pr-12">
                  <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-3">
                    {meal.mealName}

                    <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded text-sm font-bold">
                      LKR {meal.price?.toLocaleString()}
                    </span>
                  </h4>

                  <p className="text-slate-600 dark:text-slate-400 mt-2">
                    Category: {meal.category || "Uncategorized"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
