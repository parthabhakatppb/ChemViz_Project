import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

interface FavoriteDataset {
  id: number;
  dataset: {
    id: number;
    filename: string;
    uploaded_at: string;
  };
  added_at: string;
}

export const FavoritesPanel: React.FC = () => {
  const [favorites, setFavorites] = useState<FavoriteDataset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/favorites/');
      const data = await response.json();
      setFavorites(data);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (datasetId: number) => {
    try {
      await fetch(`http://localhost:8000/api/favorite/${datasetId}/`, {
        method: 'DELETE',
      });
      setFavorites(favorites.filter(f => f.dataset.id !== datasetId));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  if (loading) return <div className="text-center py-8">Loading favorites...</div>;

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <Heart className="w-5 h-5 fill-red-500 text-red-500" />
        <h2 className="text-xl font-bold">Favorites ({favorites.length})</h2>
      </div>
      
      {favorites.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No favorite datasets yet</p>
      ) : (
        <div className="space-y-2">
          {favorites.map((favorite) => (
            <div key={favorite.id} className="flex items-center justify-between p-3 bg-gray-100 rounded-lg hover:bg-gray-200">
              <div>
                <p className="font-medium">{favorite.dataset.filename}</p>
                <p className="text-sm text-gray-500">{new Date(favorite.added_at).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => removeFavorite(favorite.dataset.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Heart className="w-5 h-5 fill-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
