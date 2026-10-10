import React, { useState } from 'react';
import { X, Copy, Check, Download, Terminal, Send, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface PostmanGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PostmanGuideModal: React.FC<PostmanGuideModalProps> = ({ isOpen, onClose }) => {
  const { token } = useAuth();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sampleToken = token || 'YOUR_JWT_TOKEN_HERE';

  const endpoints = [
    {
      category: 'Authentication',
      method: 'POST',
      url: '/api/auth/login',
      auth: false,
      body: JSON.stringify({ email: 'admin@recipehub.com', password: 'admin123' }, null, 2),
      desc: 'Authenticates user and returns JWT token.',
    },
    {
      category: 'Authentication',
      method: 'POST',
      url: '/api/auth/register',
      auth: false,
      body: JSON.stringify({ name: 'Maria Gomez', email: 'maria@example.com', password: 'password123' }, null, 2),
      desc: 'Creates a new user account with hashed password.',
    },
    {
      category: 'Authentication',
      method: 'GET',
      url: '/api/auth/me',
      auth: true,
      desc: 'Retrieves current user identity, role, and favorites.',
    },
    {
      category: 'Recipes (CRUD)',
      method: 'GET',
      url: '/api/recipes?category=Dinner&sort=newest',
      auth: false,
      desc: 'Searches, filters by category, difficulty, or tags, and sorts.',
    },
    {
      category: 'Recipes (CRUD)',
      method: 'POST',
      url: '/api/recipes',
      auth: true,
      body: JSON.stringify(
        {
          title: 'Lemon Herb Butter Salmon',
          description: 'Pan-seared crisp skin salmon with garlicky herb butter.',
          category: 'Dinner',
          preparationTime: 10,
          cookingTime: 12,
          servings: 2,
          difficulty: 'Easy',
          dietaryTags: ['Gluten-Free', 'High-Protein'],
          ingredients: [
            { name: 'Fresh Salmon Fillet', quantity: '2 fillets' },
            { name: 'Butter', quantity: '2 tbsp' },
            { name: 'Lemon juice', quantity: '1 tbsp' },
          ],
          instructions: [
            'Season salmon with salt and pepper.',
            'Sear in a smoking hot pan skin side down for 5 minutes, flip, baste with lemon butter.',
          ],
        },
        null,
        2
      ),
      desc: 'Creates a new recipe linked to the authenticated user.',
    },
    {
      category: 'Recipes (CRUD)',
      method: 'PUT',
      url: '/api/recipes/:recipeId',
      auth: true,
      body: JSON.stringify({ preparationTime: 15, servings: 4 }, null, 2),
      desc: 'Updates a recipe if user is owner or admin.',
    },
    {
      category: 'Recipes (CRUD)',
      method: 'DELETE',
      url: '/api/recipes/:recipeId',
      auth: true,
      desc: 'Deletes recipe and removes associated favorites.',
    },
    {
      category: 'Favorites',
      method: 'GET',
      url: '/api/favorites',
      auth: true,
      desc: 'Returns all recipes favorited by the logged-in user.',
    },
    {
      category: 'Favorites',
      method: 'POST',
      url: '/api/favorites/:recipeId',
      auth: true,
      desc: 'Saves recipe to favorites (prevents duplicate insertion).',
    },
    {
      category: 'Favorites',
      method: 'DELETE',
      url: '/api/favorites/:recipeId',
      auth: true,
      desc: 'Removes recipe from user favorites.',
    },
    {
      category: 'Administration (RBAC)',
      method: 'GET',
      url: '/api/admin/users',
      auth: true,
      adminOnly: true,
      desc: 'Admin only: Lists all registered accounts and recipe counts.',
    },
    {
      category: 'Administration (RBAC)',
      method: 'GET',
      url: '/api/admin/recipes',
      auth: true,
      adminOnly: true,
      desc: 'Admin only: Full access to all platform recipes.',
    },
  ];

  const handleDownloadPostmanCollection = () => {
    const baseUrl = window.location.origin;
    const postmanJson = {
      info: {
        name: 'RecipeHub MERN API Collection',
        description: 'Complete Postman test suite for RecipeHub MERN stack application',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      },
      item: endpoints.map((ep) => ({
        name: `${ep.method} ${ep.url}`,
        request: {
          method: ep.method,
          header: [
            { key: 'Content-Type', value: 'application/json' },
            ...(ep.auth ? [{ key: 'Authorization', value: `Bearer {{JWT_TOKEN}}` }] : []),
          ],
          url: {
            raw: `${baseUrl}${ep.url}`,
            protocol: baseUrl.startsWith('https') ? 'https' : 'http',
            host: [baseUrl.replace(/https?:\/\//, '')],
            path: ep.url.replace(/^\//, '').split('/'),
          },
          ...(ep.body ? { body: { mode: 'raw', raw: ep.body } } : {}),
          description: ep.desc,
        },
      })),
    };

    const blob = new Blob([JSON.stringify(postmanJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'RecipeHub_Postman_Collection.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#E8E2D8] max-h-[92vh] flex flex-col my-auto text-left">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E2D8] bg-[#FAF7F2]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E86A33]/15 text-[#E86A33] flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-['Playfair_Display',serif] text-xl font-bold text-[#2D2A26]">
                Postman & REST API Testing Suite
              </h2>
              <p className="text-xs text-[#7B7368]">
                Complete reference for testing endpoints, JWT tokens, and RBAC authorization
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPostmanCollection}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2E7D32] hover:bg-[#256629] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Postman JSON</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white border border-[#E8E2D8] text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Guide Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6 text-xs sm:text-sm">
          {/* Quick Token Bar */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-stone-800 flex items-center gap-1.5 text-xs">
                <Shield className="w-3.5 h-3.5 text-[#2E7D32]" />
                Current Active Session Bearer Token:
              </span>
              <button
                onClick={() => copyToClipboard(`Bearer ${sampleToken}`, 'bearer')}
                className="inline-flex items-center gap-1 text-xs text-[#E86A33] font-semibold hover:underline cursor-pointer"
              >
                {copiedKey === 'bearer' ? <Check className="w-3 h-3 text-[#2E7D32]" /> : <Copy className="w-3 h-3" />}
                {copiedKey === 'bearer' ? 'Copied' : 'Copy Header'}
              </button>
            </div>
            <code className="block p-2.5 rounded-lg bg-stone-900 text-stone-200 font-mono text-[11px] truncate">
              Authorization: Bearer {sampleToken}
            </code>
          </div>

          {/* Endpoints Table / Cards */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-[#2D2A26]">Tested REST API Endpoints:</h3>
            <div className="grid grid-cols-1 gap-3">
              {endpoints.map((ep, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-[#E8E2D8] bg-white hover:border-[#D5CDC0] transition-colors"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          ep.method === 'GET'
                            ? 'bg-blue-100 text-blue-700'
                            : ep.method === 'POST'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ep.method === 'PUT'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {ep.method}
                      </span>
                      <code className="text-xs font-mono font-semibold text-stone-800">{ep.url}</code>
                    </div>

                    <div className="flex items-center gap-2">
                      {ep.auth && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium">
                          JWT Required
                        </span>
                      )}
                      {ep.adminOnly && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">
                          Admin Role
                        </span>
                      )}
                      <button
                        onClick={() => copyToClipboard(ep.url, `url_${idx}`)}
                        className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                        title="Copy endpoint"
                      >
                        {copiedKey === `url_${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 mb-2">{ep.desc}</p>

                  {ep.body && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
                        <span>Sample JSON Payload:</span>
                        <button
                          onClick={() => copyToClipboard(ep.body!, `body_${idx}`)}
                          className="hover:text-stone-800 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === `body_${idx}` ? 'Copied' : 'Copy Body'}
                        </button>
                      </div>
                      <pre className="p-2.5 rounded-lg bg-stone-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-36">
                        {ep.body}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E8E2D8] bg-[#FAF7F2] flex items-center justify-between">
          <span className="text-xs text-stone-500">
            Export directly to Postman or use curl in your terminal.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#2D2A26] text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
