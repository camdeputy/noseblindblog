'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Loader2, LogOut } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import HouseEditor from '@/components/HouseEditor';
import FragranceEditor from '@/components/FragranceEditor';
import { getAdminPosts, getAdminHouses, getAdminFragrances } from '@/lib/api';
import { Post } from '@/types/post';
import { FragranceHouse, Fragrance } from '@/types/fragrance';

type Tab = 'posts' | 'brands' | 'fragrances';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatPrice(cents: number | null, currency: string | null): string {
  if (cents == null) return '—';
  const dollars = (cents / 100).toFixed(2);
  return `${currency || 'USD'} $${dollars}`;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('posts');

  // Posts state
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState('');

  // Brands state
  const [houses, setHouses] = useState<FragranceHouse[]>([]);
  const [housesLoading, setHousesLoading] = useState(false);
  const [housesError, setHousesError] = useState('');
  const [showHouseForm, setShowHouseForm] = useState(false);

  // Fragrances state
  const [fragrances, setFragrances] = useState<Fragrance[]>([]);
  const [fragrancesLoading, setFragrancesLoading] = useState(false);
  const [fragrancesError, setFragrancesError] = useState('');
  const [showFragranceForm, setShowFragranceForm] = useState(false);

  // Load posts on mount
  useEffect(() => {
    async function fetchPosts() {
      try {
        const data = await getAdminPosts();
        setPosts(data);
      } catch (err) {
        setPostsError(err instanceof Error ? err.message : 'Failed to load posts');
      } finally {
        setPostsLoading(false);
      }
    }
    fetchPosts();
  }, []);

  // Load brands when tab becomes active
  const fetchHouses = useCallback(async () => {
    setHousesLoading(true);
    setHousesError('');
    try {
      const data = await getAdminHouses();
      setHouses(data);
    } catch (err) {
      setHousesError(err instanceof Error ? err.message : 'Failed to load brands');
    } finally {
      setHousesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'brands' && houses.length === 0 && !housesLoading) {
      fetchHouses();
    }
  }, [activeTab, houses.length, housesLoading, fetchHouses]);

  // Load fragrances when tab becomes active
  const fetchFragrances = useCallback(async () => {
    setFragrancesLoading(true);
    setFragrancesError('');
    try {
      const data = await getAdminFragrances();
      setFragrances(data);
    } catch (err) {
      setFragrancesError(err instanceof Error ? err.message : 'Failed to load fragrances');
    } finally {
      setFragrancesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'fragrances' && fragrances.length === 0 && !fragrancesLoading) {
      fetchFragrances();
    }
  }, [activeTab, fragrances.length, fragrancesLoading, fetchFragrances]);

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
    router.refresh();
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'posts', label: 'Posts' },
    { key: 'brands', label: 'Brands' },
    { key: 'fragrances', label: 'Fragrances' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your blog content and catalog</p>
        </div>
        <Button variant="secondary" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
              activeTab === tab.key
                ? 'text-primary'
                : 'text-gray-500 hover:text-primary/70'
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <PostsTab
          posts={posts}
          isLoading={postsLoading}
          error={postsError}
        />
      )}

      {/* Brands Tab */}
      {activeTab === 'brands' && (
        <BrandsTab
          houses={houses}
          isLoading={housesLoading}
          error={housesError}
          showForm={showHouseForm}
          onToggleForm={() => setShowHouseForm(!showHouseForm)}
          onCreated={() => {
            setShowHouseForm(false);
            fetchHouses();
          }}
          onCancel={() => setShowHouseForm(false)}
        />
      )}

      {/* Fragrances Tab */}
      {activeTab === 'fragrances' && (
        <FragrancesTab
          fragrances={fragrances}
          isLoading={fragrancesLoading}
          error={fragrancesError}
          showForm={showFragranceForm}
          onToggleForm={() => setShowFragranceForm(!showFragranceForm)}
          onCreated={() => {
            setShowFragranceForm(false);
            fetchFragrances();
          }}
          onCancel={() => setShowFragranceForm(false)}
        />
      )}
    </div>
  );
}

// --- Posts Tab ---

function PostsTab({
  posts,
  isLoading,
  error,
}: {
  posts: Post[];
  isLoading: boolean;
  error: string;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-primary">Blog Posts</h2>
        <Link href="/admin/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-tertiary rounded-xl">
          <p className="text-gray-500 text-lg mb-4">No posts yet.</p>
          <Link href="/admin/new">
            <Button>Create your first post</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-tertiary">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Title</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Created</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Updated</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-primary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-primary">{post.title}</p>
                      <p className="text-sm text-gray-500">{post.slug}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={post.status === 'published' ? 'success' : 'warning'}>
                      {post.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(post.createdAt)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(post.updatedAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/edit/${post.slug}`}>
                      <Button variant="secondary" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// --- Brands Tab ---

function BrandsTab({
  houses,
  isLoading,
  error,
  showForm,
  onToggleForm,
  onCreated,
  onCancel,
}: {
  houses: FragranceHouse[];
  isLoading: boolean;
  error: string;
  showForm: boolean;
  onToggleForm: () => void;
  onCreated: () => void;
  onCancel: () => void;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-primary">Fragrance Houses</h2>
        {!showForm && (
          <Button onClick={onToggleForm}>
            <Plus className="w-4 h-4 mr-2" />
            New Brand
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <HouseEditor onSuccess={onCreated} onCancel={onCancel} />
        </div>
      )}

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      ) : houses.length === 0 && !showForm ? (
        <div className="text-center py-12 bg-tertiary rounded-xl">
          <p className="text-gray-500 text-lg mb-4">No brands yet.</p>
          <Button onClick={onToggleForm}>Create your first brand</Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-tertiary">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Description</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {houses.map((house) => (
                <tr key={house.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-primary">{house.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {house.description || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {house.created_at ? formatDate(house.created_at) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// --- Fragrances Tab ---

function FragrancesTab({
  fragrances,
  isLoading,
  error,
  showForm,
  onToggleForm,
  onCreated,
  onCancel,
}: {
  fragrances: Fragrance[];
  isLoading: boolean;
  error: string;
  showForm: boolean;
  onToggleForm: () => void;
  onCreated: () => void;
  onCancel: () => void;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-primary">Fragrances</h2>
        {!showForm && (
          <Button onClick={onToggleForm}>
            <Plus className="w-4 h-4 mr-2" />
            New Fragrance
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <FragranceEditor onSuccess={onCreated} onCancel={onCancel} />
        </div>
      )}

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      ) : fragrances.length === 0 && !showForm ? (
        <div className="text-center py-12 bg-tertiary rounded-xl">
          <p className="text-gray-500 text-lg mb-4">No fragrances yet.</p>
          <Button onClick={onToggleForm}>Create your first fragrance</Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-tertiary">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Brand</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Rating</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Price</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {fragrances.map((frag) => (
                <tr key={frag.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-primary">{frag.name}</p>
                    {frag.description && (
                      <p className="text-sm text-gray-500 truncate max-w-xs">{frag.description}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {frag.fragrance_houses?.name || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {frag.rating != null ? `${frag.rating}/5` : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatPrice(frag.price_cents, frag.currency)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {frag.created_at ? formatDate(frag.created_at) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
