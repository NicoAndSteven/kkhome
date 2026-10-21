import { useState, useEffect, useCallback } from 'react';

export interface CatalogSummary {
  total: number;
  categories: Array<{ id: string; title: string; count: number }>;
  generatedAt: string | null;
  available: boolean;
  hint: string | null;
}

/**
 * 读取服务端工具目录摘要。
 * 目录不可用时返回 available=false，前端据此提示先运行 sync:catalog，不伪造数量。
 */
export function useCatalog() {
  const [catalog, setCatalog] = useState<CatalogSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/catalog');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setCatalog(await res.json());
    } catch (error) {
      console.error('Failed to load catalog:', error);
      setCatalog(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  return { catalog, loading, fetchCatalog };
}
