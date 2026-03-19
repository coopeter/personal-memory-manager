import * as React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';

export default function Search() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'fulltext' | 'semantic'>('fulltext');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await api.get('/api/search', {
        params: { query, type },
      });
      setResults(res.data);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Search</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          className="flex-1 px-4 py-2 border rounded"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <select
          className="px-4 py-2 border rounded"
          value={type}
          onChange={(e) => setType(e.target.value as any)}
        >
          <option value="fulltext">Full Text</option>
          <option value="semantic">Semantic</option>
        </select>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div className="space-y-3">
        {results.map((doc: any) => (
          <Link
            key={doc.id}
            to={`/document/${doc.projectId}/${doc.folderId}/${doc.id}`}
            className="block p-4 bg-white rounded shadow hover:shadow-md transition-shadow"
          >
            <div className="font-medium text-lg">{doc.title}</div>
            <div className="text-sm text-gray-500 mb-2">
              {new Date(doc.createdAt).toLocaleString()}
              {doc.tags.length > 0 && (
                <span className="ml-2">
                  • {doc.tags.map((t: string) => `#${t}`).join(' ')}
                </span>
              )}
            </div>
            <div className="text-gray-600 text-sm line-clamp-2">
              {doc.content.slice(0, 200)}...
            </div>
          </Link>
        ))}
        {results.length === 0 && !loading && query && (
          <div className="text-center text-gray-500 p-8">
            No results found
          </div>
        )}
      </div>
    </div>
  );
}
