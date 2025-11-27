'use client'

import { useState, useEffect } from 'react';
import { MenuCategory } from '@/lib/googleSheets';

interface UseMenuDataReturn {
  menuData: MenuCategory[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  lastUpdated: string | null;
  stats: {
    categories: number;
    totalItems: number;
  };
}

export function useMenuData(): UseMenuDataReturn {
  const [menuData, setMenuData] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [stats, setStats] = useState({ categories: 0, totalItems: 0 });

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching menu data...');
      
      const response = await fetch('/api/menu', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store' // Siempre obtener datos frescos
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setMenuData(result.data);
        setLastUpdated(result.lastUpdated);
        setStats(result.stats || { categories: 0, totalItems: 0 });
        console.log('✅ Menu data loaded successfully:', result.stats);
      } else {
        throw new Error(result.message || 'Failed to fetch menu data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('❌ Error fetching menu:', err);
      
      // Fallback a datos locales si existen
      if (menuData.length === 0) {
        console.log('📦 Using fallback menu data...');
        // Aquí podrías cargar datos de fallback desde menuData.ts
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, []);

  return {
    menuData,
    loading,
    error,
    refetch: fetchMenuData,
    lastUpdated,
    stats
  };
}

// Hook para probar la conexión
export function useConnectionTest() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const testConnection = async () => {
    try {
      setTesting(true);
      setResult(null);
      
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setResult(data);
      
      return data.success;
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed'
      });
      return false;
    } finally {
      setTesting(false);
    }
  };

  return {
    testConnection,
    testing,
    result
  };
}