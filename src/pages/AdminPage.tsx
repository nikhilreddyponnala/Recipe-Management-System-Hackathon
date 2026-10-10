import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Trash2, BookOpen, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { User, Recipe } from '../types/index.ts';
import { adminService, recipeService } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface AdminPageProps {
  onSelectRecipe: (recipe: Recipe) => void;
  onDeleteRecipe: (recipe: Recipe) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onSelectRecipe, onDeleteRecipe }) => {
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'recipes'>('users');

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, recipesRes] = await Promise.all([
        adminService.getUsers(),
        adminService.getAllRecipes(),
      ]);

      if (usersRes.success) setUsers(usersRes.users);
      if (recipesRes.success) setAllRecipes(recipesRes.recipes);
    } catch (err: any) {
      toast.error('Failed to load administrative data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (userId === user?.id) {
      toast.error('You cannot delete your own admin account.');
      return;
    }

    if (!confirm(`Are you sure you want to delete user account "${userName}" and all their recipes?`)) {
      return;
    }

    try {
      const res = await adminService.deleteUser(userId);
      toast.success(res.message || 'User deleted successfully.');
      loadAdminData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-white border border-red-200 text-center shadow-lg">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
        <h2 className="font-['Playfair_Display',serif] text-xl font-bold text-[#2D2A26] mb-2">
          Administrator Access Required
        </h2>
        <p className="text-xs text-[#7B7368] leading-relaxed mb-4">
          This panel is restricted to verified administrators. Please log in with an administrator account (e.g. Chef Marcus Vance) to access moderation controls.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D8] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2E7D32] uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Administrator Console (Role-Based Access Control)</span>
          </div>
          <h1 className="font-['Playfair_Display',serif] text-3xl sm:text-4xl font-bold text-[#2D2A26]">
            Platform Moderation & Management
          </h1>
          <p className="text-xs sm:text-sm text-[#7B7368] mt-1">
            Manage registered members, inspect recipe content, and enforce community standards
          </p>
        </div>

        <button
          onClick={loadAdminData}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-[#E8E2D8] text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Admin Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E8E2D8] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#7B7368] uppercase">Registered Users</p>
            <p className="text-2xl font-extrabold text-[#2D2A26] font-mono tabular-nums mt-1">
              {users.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E8E2D8] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#7B7368] uppercase">Total Recipes</p>
            <p className="text-2xl font-extrabold text-[#2D2A26] font-mono tabular-nums mt-1">
              {allRecipes.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#E86A33]/15 text-[#E86A33] flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E8E2D8] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#7B7368] uppercase">Security Status</p>
            <p className="text-sm font-bold text-[#2E7D32] mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>JWT & Role Verified</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E8E2D8] text-xs font-semibold">
        <button
          onClick={() => setActiveTab('users')}
          className={`py-3 px-5 transition-colors cursor-pointer ${
            activeTab === 'users'
              ? 'text-[#2D2A26] border-b-2 border-[#2E7D32] font-bold'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Registered Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('recipes')}
          className={`py-3 px-5 transition-colors cursor-pointer ${
            activeTab === 'recipes'
              ? 'text-[#2D2A26] border-b-2 border-[#2E7D32] font-bold'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          All Recipes Moderation ({allRecipes.length})
        </button>
      </div>

      {/* Table: Registered Users */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-3xl bg-white border border-[#E8E2D8] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E8E2D8] text-[#7B7368] font-semibold">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Recipes</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EBE1]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-stone-900">{u.name}</td>
                    <td className="py-3.5 px-4 text-stone-600 font-mono text-[11px]">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold tabular-nums text-stone-700">
                      {u.recipeCount ?? 0}
                    </td>
                    <td className="py-3.5 px-4 text-stone-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.id !== user?.id && (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="p-1.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-100 transition-colors cursor-pointer"
                          title="Remove user account and their recipes"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Table: All Recipes Moderation */}
      {activeTab === 'recipes' && (
        <div className="p-6 rounded-3xl bg-white border border-[#E8E2D8] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E8E2D8] text-[#7B7368] font-semibold">
                  <th className="py-3 px-4">Recipe Title</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EBE1]">
                {allRecipes.map((r) => (
                  <tr key={r._id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="py-3 px-4">
                      <div
                        onClick={() => onSelectRecipe(r)}
                        className="font-semibold text-stone-900 hover:text-[#E86A33] transition-colors cursor-pointer line-clamp-1"
                      >
                        {r.title}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-stone-600">
                      {r.author?.name || 'Chef'} ({r.author?.email || 'contributor'})
                    </td>
                    <td className="py-3 px-4 text-stone-600">{r.category}</td>
                    <td className="py-3 px-4">
                      <span className="text-[#2E7D32] font-medium">{r.difficulty}</span>
                    </td>
                    <td className="py-3 px-4 text-stone-500">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onDeleteRecipe(r)}
                        className="p-1.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-100 transition-colors cursor-pointer"
                        title="Remove inappropriate recipe"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
