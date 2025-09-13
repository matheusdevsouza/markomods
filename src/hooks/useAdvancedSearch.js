import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '@/config/api';

export const useAdvancedSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Estado dos filtros
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    version: searchParams.get('version') || 'all',
    loader: searchParams.get('loader') || 'all',
    category: searchParams.get('category') || 'all',
    sort: searchParams.get('sort') || 'relevance',
    featured: searchParams.get('featured') || 'all',
    author: searchParams.get('author') || ''
  });

  // Constantes para opções de filtro
  const sortOptions = [
    { value: 'relevance', label: 'Relevância' },
    { value: 'latest', label: 'Mais Recentes' },
    { value: 'downloads', label: 'Mais Baixados' },
    { value: 'views', label: 'Mais Visualizados' },
    { value: 'name_asc', label: 'Nome (A-Z)' },
    { value: 'name_desc', label: 'Nome (Z-A)' },
    { value: 'popularity', label: 'Popularidade' }
  ];

  const featuredOptions = [
    { value: 'all', label: 'Todos os Mods' },
    { value: 'true', label: 'Apenas Destaques' },
    { value: 'false', label: 'Sem Destaque' }
  ];

  // Função para executar a busca
  const executeSearch = useCallback(async (searchFilters = filters, page = 1) => {
    try {
      setLoading(true);
      setError(null);

      // Construir query string
      const queryParams = new URLSearchParams();
      
      if (searchFilters.q) queryParams.set('q', searchFilters.q);
      if (searchFilters.version && searchFilters.version !== 'all') queryParams.set('version', searchFilters.version);
      if (searchFilters.loader && searchFilters.loader !== 'all') queryParams.set('loader', searchFilters.loader);
      if (searchFilters.category && searchFilters.category !== 'all') queryParams.set('category', searchFilters.category);
      if (searchFilters.sort && searchFilters.sort !== 'relevance') queryParams.set('sort', searchFilters.sort);
      if (searchFilters.featured && searchFilters.featured !== 'all') queryParams.set('featured', searchFilters.featured);
      if (searchFilters.author) queryParams.set('author', searchFilters.author);
      
      // Paginação
      const limit = 12; // 12 mods por página
      const offset = (page - 1) * limit;
      queryParams.set('limit', limit.toString());
      queryParams.set('offset', offset.toString());

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout
      
      const response = await fetch(`${API_BASE_URL}/api/mods/search?${queryParams.toString()}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        let errorMessage = '';
        
        if (response.status === 429) {
          errorMessage = 'Muitas requisições. Tente novamente em alguns segundos.';
        } else if (response.status === 500) {
          errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
        } else if (response.status === 404) {
          errorMessage = 'API não encontrada. Verifique se o servidor está rodando.';
        } else if (response.status === 0) {
          errorMessage = 'Erro de conexão. Verifique sua internet ou se o servidor está rodando.';
        } else {
          errorMessage = `Erro na busca: ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.data || []);
        setTotalResults(data.pagination?.total || 0);
        setCurrentPage(page);
        
        // Atualizar URL com os filtros
        const newSearchParams = new URLSearchParams();
        Object.entries(searchFilters).forEach(([key, value]) => {
          if (value && value !== 'all') {
            newSearchParams.set(key, value);
          }
        });
        setSearchParams(newSearchParams, { replace: true });
      } else {
        throw new Error(data.message || 'Erro na busca');
      }
    } catch (err) {
      let errorMessage = err.message;
      
      if (err.name === 'AbortError') {
        errorMessage = 'A busca demorou muito. Tente novamente.';
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Erro de conexão. Verifique se o servidor está rodando.';
      }
      
      setError(errorMessage);
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }, [filters, setSearchParams]);

  // Função para atualizar filtros
  const updateFilters = useCallback((newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setCurrentPage(1); // Reset para primeira página
    executeSearch(updatedFilters, 1);
  }, [filters, executeSearch]);

  // Função para limpar filtros
  const clearFilters = useCallback(() => {
    const defaultFilters = {
      q: '',
      version: 'all',
      loader: 'all',
      category: 'all',
      sort: 'relevance',
      featured: 'all',
      author: ''
    };
    setFilters(defaultFilters);
    setCurrentPage(1);
    setSearchParams({}, { replace: true });
    executeSearch(defaultFilters, 1);
  }, [executeSearch, setSearchParams]);

  // Função para mudar de página
  const changePage = useCallback((page) => {
    setCurrentPage(page);
    executeSearch(filters, page);
  }, [filters, executeSearch]);

  // Executar busca inicial apenas se houver um termo de busca
  useEffect(() => {
    if (filters.q && filters.q.trim()) {
      executeSearch(filters, 1);
    }
  }, []); // Executar apenas uma vez na montagem

  // Calcular total de páginas
  const totalPages = Math.ceil(totalResults / 12);

  return {
    // Estado
    searchResults,
    loading,
    error,
    totalResults,
    currentPage,
    totalPages,
    filters,
    
    // Constantes
    sortOptions,
    featuredOptions,
    
    // Funções
    executeSearch,
    updateFilters,
    clearFilters,
    changePage
  };
};
