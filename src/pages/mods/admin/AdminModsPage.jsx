
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { useTranslation } from '../../../hooks/useTranslation';

import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  EyeOff, 
  Star,
  Download,
  Calendar,
  User,
  Tag,
  Globe,
  Play,
  FileText,
  AlignLeft,
  Image,
  Link,
  Upload,
  ExternalLink,
  X,
  Monitor,
  
  Smartphone,
  Package
} from 'lucide-react';
import { RichTextEditor } from '../../../components/ui/RichTextEditor';
import { useAuth } from '../../../contexts/AuthContextMods';
import { usePermissions } from '../../../hooks/usePermissions';
import { processHtmlComplete, processHtmlForDatabase } from '../../../utils/htmlProcessor';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../components/ui/use-toast';


const AdminModsPage = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { hasPermission, loading: permissionsLoading } = usePermissions();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mods, setMods] = useState([]);
  const [filteredMods, setFilteredMods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMinecraftVersion, setSelectedMinecraftVersion] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMod, setEditingMod] = useState(null);
  const [feedback, setFeedback] = useState({ show: false, message: '', type: '' });
  const [loadingActions, setLoadingActions] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!permissionsLoading && currentUser) {
      if (currentUser.role !== 'admin' && !hasPermission('view_mods')) {
        toast({
          title: 'Acesso Negado',
          description: 'Você não tem permissão para acessar esta página. Entre em contato com um administrador se precisar desta funcionalidade.',
          variant: 'destructive'
        });
        navigate('/admin');
      }
    }
  }, [currentUser, hasPermission, permissionsLoading, navigate, toast]);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    version: '',
    minecraft_version: '',
    mod_loader: '',
    content_type_id: 1, 
    short_description: '',
    full_description: '',
    tags: '',
    thumbnail_url: '',
    thumbnail_file: null,
    download_url_pc: '',
    download_url_mobile: '',
    download_file_pc: null,
    download_file_mobile: null,
    video_url: '',
    video_file: null
  });

  const [thumbnailMode, setThumbnailMode] = useState('url');
  const [downloadMode, setDownloadMode] = useState('url');

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  useEffect(() => {
    fetchMods();
  }, []);

  useEffect(() => {
    filterMods();
  }, [mods, searchTerm, selectedStatus, selectedMinecraftVersion]);

  const fetchMods = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/mods/admin', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMods(data.data || []);
        setFilteredMods(data.data || []);
      } else {
        console.error('Erro ao buscar mods:', response.status);
      }
    } catch (error) {
      console.error('Erro ao buscar mods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterMods = () => {
    let filtered = [...mods];

    if (searchTerm) {
      filtered = filtered.filter(mod => 
          (getSafeValue(mod.title || mod.name).toLowerCase().includes(searchTerm.toLowerCase())) ||
        (getSafeValue(mod.short_description).toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedStatus !== 'all') {
      if (selectedStatus === 'published') {
        filtered = filtered.filter(mod => mod.is_published);
      } else if (selectedStatus === 'draft') {
        filtered = filtered.filter(mod => !mod.is_published);
      }
    }

    if (selectedMinecraftVersion !== 'all') {
      filtered = filtered.filter(mod => getSafeValue(mod.minecraft_version) === selectedMinecraftVersion);
    }

    setFilteredMods(filtered);
  };

  const getSafeValue = (value, defaultValue = '') => {
    if (value === null || value === undefined) return defaultValue;
    return value;
  };

  const getSafeTags = (tags) => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    if (typeof tags === 'string') {
      try {
        const parsed = JSON.parse(tags);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const handleCreateMod = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!formData.name || !formData.slug || !formData.version || !formData.minecraft_version || !formData.mod_loader || !formData.short_description || !formData.full_description) {
        const missingFields = [];
        if (!formData.name) missingFields.push('Nome');
        if (!formData.slug) missingFields.push('Slug');
        if (!formData.version) missingFields.push('Versão');
        if (!formData.minecraft_version) missingFields.push('Versão do Minecraft');
        if (!formData.mod_loader) missingFields.push('Loader do Mod');
        if (!formData.short_description) missingFields.push('Descrição Curta');
        if (!formData.full_description) missingFields.push('Descrição Completa');
        
        setFeedback({ show: true, message: `Campos obrigatórios faltando: ${missingFields.join(', ')}`, type: 'error' });
        return;
      }
      
      let requestBody;
      let headers = {
        'Authorization': `Bearer ${token}`
      };
      
      if (thumbnailMode === 'upload' && formData.thumbnail_file) {
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('slug', formData.slug);
        formDataToSend.append('version', formData.version);
        formDataToSend.append('minecraft_version', formData.minecraft_version);
        formDataToSend.append('mod_loader', formData.mod_loader);
        formDataToSend.append('content_type_id', formData.content_type_id);
        formDataToSend.append('short_description', formData.short_description);
        formDataToSend.append('full_description', processHtmlForDatabase(formData.full_description));
        formDataToSend.append('tags', formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag));
        formDataToSend.append('thumbnail_file', formData.thumbnail_file);
        formDataToSend.append('download_url_pc', formData.download_url_pc);
        formDataToSend.append('download_url_mobile', formData.download_url_mobile);
        if (formData.download_file_pc) {
          formDataToSend.append('download_file_pc', formData.download_file_pc);
        }
        if (formData.download_file_mobile) {
          formDataToSend.append('download_file_mobile', formData.download_file_mobile);
        }
        if (formData.video_file) {
          formDataToSend.append('video_file', formData.video_file);
        }
        
        requestBody = formDataToSend;
      } else {
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('slug', formData.slug);
        formDataToSend.append('version', formData.version);
        formDataToSend.append('minecraft_version', formData.minecraft_version);
        formDataToSend.append('mod_loader', formData.mod_loader);
        formDataToSend.append('content_type_id', formData.content_type_id);
        formDataToSend.append('short_description', formData.short_description);
        formDataToSend.append('full_description', processHtmlForDatabase(formData.full_description));
        formDataToSend.append('tags', formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag));
        formDataToSend.append('thumbnail_url', formData.thumbnail_url);
        formDataToSend.append('download_url_pc', formData.download_url_pc);
        formDataToSend.append('download_url_mobile', formData.download_url_mobile);
        if (formData.download_file_pc) {
          formDataToSend.append('download_file_pc', formData.download_file_pc);
        }
        if (formData.download_file_mobile) {
          formDataToSend.append('download_file_mobile', formData.download_file_mobile);
        }
        if (formData.video_file) {
          formDataToSend.append('video_file', formData.video_file);
        }
        requestBody = formDataToSend;
      }
      
      const response = await fetch('/api/mods', {
        method: 'POST',
        headers,
        body: requestBody
      });

      if (response.ok) {
        const result = await response.json();
        setFeedback({ show: true, message: result.message, type: 'success' });
        setShowCreateModal(false);
        resetForm();
        fetchMods();
      } else {
        const errorData = await response.json();
        setFeedback({ show: true, message: errorData.message, type: 'error' });
      }
    } catch (error) {
      setFeedback({ show: true, message: 'Erro ao criar mod', type: 'error' });
    }
  };

  const handleUpdateMod = async () => {
    try {
      setIsUpdating(true);
      const token = localStorage.getItem('authToken');
      
      console.log('🔄 Tentando atualizar mod:', editingMod.id);
      console.log('📝 Dados do formulário:', formData);
      console.log('🔑 Token:', token ? `${token.substring(0, 20)}...` : 'Nenhum token encontrado');
      
      console.log('🔍 Validando campos obrigatórios:');
      console.log('  - name:', formData.name, '✅', !!formData.name);
      console.log('  - version:', formData.version, '✅', !!formData.version);
      console.log('  - minecraft_version:', formData.minecraft_version, '✅', !!formData.minecraft_version);
      console.log('  - short_description:', formData.short_description, '✅', !!formData.short_description);
      console.log('  - full_description:', formData.full_description, '✅', !!formData.full_description);
      
      if (!formData.name || !formData.slug || !formData.version || !formData.minecraft_version || !formData.mod_loader || !formData.short_description || !formData.full_description) {
        const missingFields = [];
        if (!formData.name) missingFields.push('Nome');
        if (!formData.slug) missingFields.push('Slug');
        if (!formData.version) missingFields.push('Versão');
        if (!formData.minecraft_version) missingFields.push('Versão do Minecraft');
        if (!formData.mod_loader) missingFields.push('Loader do Mod');
        if (!formData.short_description) missingFields.push('Descrição Curta');
        if (!formData.full_description) missingFields.push('Descrição Completa');
        
        console.log('❌ Campos faltando:', missingFields);
        setFeedback({ show: true, message: `Campos obrigatórios faltando: ${missingFields.join(', ')}`, type: 'error' });
        return;
      }
      
      console.log('✅ Todos os campos obrigatórios estão preenchidos');

      let requestBody;
      
      if (thumbnailMode === 'upload' && formData.thumbnail_file) {
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('slug', formData.slug);
        formDataToSend.append('version', formData.version);
        formDataToSend.append('minecraft_version', formData.minecraft_version);
        formDataToSend.append('mod_loader', formData.mod_loader);
        formDataToSend.append('content_type_id', formData.content_type_id);
        formDataToSend.append('short_description', formData.short_description);
        formDataToSend.append('full_description', processHtmlForDatabase(formData.full_description));
        formDataToSend.append('tags', formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag));
        formDataToSend.append('thumbnail_file', formData.thumbnail_file);
        formDataToSend.append('download_url_pc', formData.download_url_pc);
        formDataToSend.append('download_url_mobile', formData.download_url_mobile);
        if (formData.download_file_pc) {
          formDataToSend.append('download_file_pc', formData.download_file_pc);
        }
        if (formData.download_file_mobile) {
          formDataToSend.append('download_file_mobile', formData.download_file_mobile);
        }
        if (formData.video_file) {
          formDataToSend.append('video_file', formData.video_file);
        }
        formDataToSend.append('video_remove', (!formData.video_file && !formData.video_url) ? 'true' : 'false');
        
        requestBody = formDataToSend;
      } else {
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('slug', formData.slug);
        formDataToSend.append('version', formData.version);
        formDataToSend.append('minecraft_version', formData.minecraft_version);
        formDataToSend.append('mod_loader', formData.mod_loader);
        formDataToSend.append('content_type_id', formData.content_type_id);
        formDataToSend.append('short_description', formData.short_description);
        formDataToSend.append('full_description', processHtmlForDatabase(formData.full_description));
        formDataToSend.append('tags', formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag));
        formDataToSend.append('thumbnail_url', formData.thumbnail_url);
        formDataToSend.append('download_url_pc', formData.download_url_pc);
        formDataToSend.append('download_url_mobile', formData.download_url_mobile);
        if (formData.download_file_pc) {
          formDataToSend.append('download_file_pc', formData.download_file_pc);
        }
        if (formData.download_file_mobile) {
          formDataToSend.append('download_file_mobile', formData.download_file_mobile);
        }
        if (formData.video_file) {
          formDataToSend.append('video_file', formData.video_file);
        }
        formDataToSend.append('video_remove', (!formData.video_file && !formData.video_url) ? 'true' : 'false');
        requestBody = formDataToSend;
      }

      console.log('📤 Dados sendo enviados para API:', requestBody);

      let headers = {
        'Authorization': `Bearer ${token}`
      };
      
      
      const response = await fetch(`/api/mods/${editingMod.id}`, {
        method: 'PUT',
        headers,
        body: requestBody
      });

      console.log('📡 Resposta da API:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Resposta de sucesso:', result);
        setFeedback({ show: true, message: result.message || 'Mod atualizado com sucesso!', type: 'success' });
        setEditingMod(null);
        resetForm();
        fetchMods();
      } else {
        const errorData = await response.json();
        console.error('❌ Erro da API:', errorData);
        setFeedback({ show: true, message: errorData.message || 'Erro ao atualizar mod', type: 'error' });
      }
    } catch (error) {
      console.error('💥 Erro ao atualizar mod:', error);
      setFeedback({ show: true, message: 'Erro ao atualizar mod. Verifique sua conexão.', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [modToDelete, setModToDelete] = useState(null);

  const handleDeleteMod = async (modId) => {
    try {
      setIsDeleting(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/mods/${modId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setFeedback({ show: true, message: 'Mod deletado com sucesso', type: 'success' });
        fetchMods();
      } else {
        const errorData = await response.json();
        setFeedback({ show: true, message: errorData.message, type: 'error' });
      }
    } catch (error) {
      console.error('Erro ao deletar mod:', error);
      setFeedback({ show: true, message: 'Erro ao deletar mod. Verifique sua conexão.', type: 'error' });
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setModToDelete(null);
    }
  };

  const openDeleteModal = (mod) => {
    setModToDelete(mod);
    setDeleteModalOpen(true);
  };

  const handleToggleStatus = async (modId, field) => {
    try {
      setLoadingActions(prev => ({ ...prev, [`${modId}-${field}`]: true }));
      
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/mods/${modId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ field })
      });

      if (response.ok) {
        const result = await response.json();
        
        let message = '';
        if (field === 'is_published') {
          message = result.data.is_published ? 'Mod publicado com sucesso!' : 'Mod despublicado com sucesso!';
        } else if (field === 'is_featured') {
          message = result.data.is_featured ? 'Destaque adicionado com sucesso!' : 'Destaque removido com sucesso!';
        }
        
        setFeedback({ show: true, message, type: 'success' });
        fetchMods();
      } else {
        const errorData = await response.json();
        setFeedback({ show: true, message: errorData.message || 'Erro ao alterar status', type: 'error' });
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      setFeedback({ show: true, message: 'Erro ao alterar status. Verifique sua conexão.', type: 'error' });
    } finally {
      setLoadingActions(prev => ({ ...prev, [`${modId}-${field}`]: false }));
    }
  };

  const normalizeModLoader = (loader) => {
    if (!loader) return '';
    if (loader === 'padrao' || loader === 'padrão') return 'padrão';
    return loader;
  };

  const formatModLoaderDisplay = (loader) => {
    if (!loader) return '';
    if (loader === 'padrao' || loader === 'padrão') return 'Padrão';
    if (loader === 'forge') return 'Forge';
    if (loader === 'fabric') return 'Fabric';
    return loader;
  };

  const openEditModal = (mod) => {
    console.log('🔓 Abrindo modal de edição para mod:', mod);
    console.log('📝 Dados do mod:', {
      name: mod.title || mod.name,
      version: mod.version,
      minecraft_version: mod.minecraft_version,
      short_description: mod.short_description,
      full_description: mod.description || mod.full_description,
      tags: mod.tags,
      thumbnail_url: mod.thumbnail_url,
      download_url: mod.download_url,
      video_url: mod.video_url
    });
    
    setEditingMod(mod);
    const formDataToSet = {
      name: getSafeValue(mod.title || mod.name),
      slug: getSafeValue(mod.slug),
      version: getSafeValue(mod.version),
      minecraft_version: getSafeValue(mod.minecraft_version),
      mod_loader: normalizeModLoader(getSafeValue(mod.mod_loader)),
      content_type_id: mod.content_type_id || 1,
      short_description: getSafeValue(mod.short_description),
      full_description: getSafeValue(mod.full_description || mod.description),
      tags: getSafeTags(mod.tags).join(', '),
      thumbnail_url: getSafeValue(mod.thumbnail_url),
      thumbnail_file: null,
      download_url_pc: getSafeValue(mod.download_url_pc || mod.download_url),
      download_url_mobile: getSafeValue(mod.download_url_mobile),
      download_file_pc: null,
      download_file_mobile: null,
      video_url: getSafeValue(mod.video_url),
      video_file: null
    };
    
    setThumbnailMode(mod.thumbnail_url ? 'url' : 'upload');
    
    console.log('📋 Dados do formulário sendo definidos:', formDataToSet);
    console.log('📋 Carregando mod para edição:', mod);
    console.log('📝 Full description do mod:', mod.full_description);
    console.log('📝 Description do mod:', mod.description);
    console.log('📝 FormData full_description:', formDataToSet.full_description);
    
    setFormData(formDataToSet);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      version: '',
      minecraft_version: '',
      mod_loader: '',
      content_type_id: 1,
      short_description: '',
      full_description: '',
      tags: '',
      thumbnail_url: '',
      thumbnail_file: null,
      download_url_pc: '',
      download_url_mobile: '',
      download_file_pc: null,
      download_file_mobile: null,
      video_url: '',
      video_file: null
    });
    setThumbnailMode('url');
    setDownloadMode('url');
  };

  const getStatusBadge = (mod) => {
    if (mod.is_published) {
      return <Badge variant="default">Publicado</Badge>;
    }
    return <Badge variant="outline">Rascunho</Badge>;
  };

  const getMinecraftVersions = () => {
    const versions = [...new Set(mods.map(mod => getSafeValue(mod.minecraft_version)).filter(Boolean))];
    return versions.sort();
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 sm:space-y-6 p-4 sm:p-6"
    >
      {feedback.show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`p-4 rounded-lg border ${
            feedback.type === 'success' 
              ? 'bg-green-500/10 border-green-500/20 text-green-600' 
              : 'bg-red-500/10 border-red-500/20 text-red-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <span>{feedback.message}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFeedback({ show: false, message: '', type: '' })}
              className="text-current hover:bg-current/10"
            >
              ✕
            </Button>
          </div>
        </motion.div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent flex items-center gap-3">
            <Package className="h-8 w-8 md:h-10 md:w-10 text-primary" />
            Gerenciar Conteúdo
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">Gerencie mods para Java e addons para Bedrock</p>
        </div>
        {(currentUser?.role === 'admin' || hasPermission('manage_mods')) && (
          <Button onClick={() => setShowCreateModal(true)} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Novo Mod/Addon</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base sm:text-lg">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nome ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm sm:text-base"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2 border border-border rounded-md bg-background text-foreground text-sm sm:text-base"
              >
                <option value="all">Todos</option>
                <option value="published">Publicados</option>
                <option value="draft">Rascunhos</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2">Versão Minecraft</label>
              <select
                value={selectedMinecraftVersion}
                onChange={(e) => setSelectedMinecraftVersion(e.target.value)}
                className="w-full p-2 border border-border rounded-md bg-background text-foreground text-sm sm:text-base"
              >
                <option value="all">Todas</option>
                {getMinecraftVersions().map(version => (
                  <option key={version} value={version}>{version}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              <Button 
                variant="outline" 
                onClick={fetchMods}
                className="w-full"
              >
                Atualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base sm:text-lg">
            <span>Mods ({filteredMods.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMods.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm sm:text-base">Nenhum mod encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMods.map((mod) => (
                <div key={mod.id} className="border border-border/50 rounded-xl p-4 sm:p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-200 group bg-card">
                  <div className="flex flex-col space-y-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 space-y-3 sm:space-y-0">
                        <div className="flex-1">
                          <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                            {getSafeValue(mod.title || mod.name, 'Sem título')}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {getStatusBadge(mod)}
                            {mod.is_featured && (
                              <Badge variant="secondary" className="bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300 shadow-sm text-xs">
                                <Star className="h-3 w-3 mr-1 fill-yellow-600" />
                                Destaque
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm sm:text-base text-muted-foreground mb-4 leading-relaxed">
                        {getSafeValue(mod.short_description, 'Sem descrição')}
                      </p>
                      
                      {getSafeTags(mod.tags).length > 0 && (
                        <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
                          {getSafeTags(mod.tags).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
                        <div className="flex flex-col space-y-2 sm:space-y-3">
                          <div className="flex items-center space-x-2 text-xs sm:text-sm">
                            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                              <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Minecraft</p>
                              <p className="font-medium text-sm sm:text-base">{getSafeValue(mod.minecraft_version, 'N/A')}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-xs sm:text-sm">
                            <div className="p-1.5 sm:p-2 bg-blue-500/10 rounded-lg">
                              <Tag className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Versão</p>
                              <p className="font-medium text-sm sm:text-base">v{getSafeValue(mod.version, 'N/A')}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 sm:space-y-3">
                          <div className="flex items-center space-x-2 text-xs sm:text-sm">
                            <div className="p-1.5 sm:p-2 bg-blue-500/10 rounded-lg">
                              <Download className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Downloads</p>
                              <p className="font-semibold text-sm sm:text-base text-foreground">{getSafeValue(mod.download_count, 0).toLocaleString()}</p>
                            </div>
                          </div>
                    
                          <div className="flex items-center space-x-2 text-xs sm:text-sm">
                            <div className="p-1.5 sm:p-2 bg-green-500/10 rounded-lg">
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Visualizações</p>
                              <p className="font-semibold text-sm sm:text-base text-foreground">{getSafeValue(mod.view_count, 0).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2 sm:space-y-3 sm:col-span-2 lg:col-span-1">
                          <div className="flex items-center space-x-2 text-xs sm:text-sm">
                            <div className="p-1.5 sm:p-2 bg-green-500/10 rounded-lg">
                              <User className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-muted-foreground">{t('modDetail.author')}</p>
                              <p className="font-medium text-sm sm:text-base truncate">{getSafeValue(mod.author_display_name || mod.author_name, 'Usuário desconhecido')}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-xs sm:text-sm">
                            <div className="p-1.5 sm:p-2 bg-purple-500/10 rounded-lg">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Criado</p>
                              <p className="font-medium text-sm sm:text-base">{mod.created_at ? new Date(mod.created_at).toLocaleDateString('pt-BR') : 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                        
                        <div className="mt-4 pt-4 border-t border-border/30">
                          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                            {mod.download_url_pc && (
                              <div className="flex items-center space-x-2 text-xs">
                                <div className="p-1.5 bg-blue-500/10 rounded">
                                  <Monitor className="h-3 w-3 text-blue-500" />
                                </div>
                                <span className="text-muted-foreground">PC</span>
                              </div>
                            )}
                            
                            {mod.download_url_mobile && (
                              <div className="flex items-center space-x-2 text-xs">
                                <div className="p-1.5 bg-green-500/10 rounded">
                                  <Smartphone className="h-3 w-3 text-green-500" />
                                </div>
                                <span className="text-muted-foreground">Mobile</span>
                              </div>
                            )}
                            
                            {!mod.download_url_pc && !mod.download_url_mobile && (
                              <span className="text-xs text-muted-foreground">Sem downloads disponíveis</span>
                            )}
                          </div>
                        </div>
                    </div>
                    
                    {(currentUser?.role === 'admin' || hasPermission('manage_mods')) && (
                      <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-2">
                        <Button
                          onClick={() => handleToggleStatus(mod.id, 'is_published')}
                          disabled={loadingActions[`${mod.id}-is_published`]}
                          size="sm"
                          className={`
                            w-8 h-8 sm:w-10 sm:h-10 p-0 rounded-lg sm:rounded-xl border-2 transition-all duration-300 ease-out
                            ${mod.is_published 
                              ? 'bg-green-500/20 border-green-500 text-green-600 hover:bg-green-500/30 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25' 
                              : 'bg-gray-700/50 border-gray-600 text-gray-400 hover:bg-gray-600/50 hover:border-gray-500 hover:text-gray-300 hover:scale-105'
                            }
                            ${loadingActions[`${mod.id}-is_published`] ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                          title={mod.is_published ? 'Despublicar - O mod ficará visível apenas para administradores' : 'Publicar - O mod ficará visível para todos os usuários'}
                        >
                          {loadingActions[`${mod.id}-is_published`] ? (
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-green-500"></div>
                          ) : (
                            <>
                              {mod.is_published 
                                ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" /> 
                                : <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                              }
                            </>
                          )}
                        </Button>
                        
                        <Button
                          onClick={() => handleToggleStatus(mod.id, 'is_featured')}
                          disabled={loadingActions[`${mod.id}-is_featured`]}
                          size="sm"
                          className={`
                            w-8 h-8 sm:w-10 sm:h-10 p-0 rounded-lg sm:rounded-xl border-2 transition-all duration-300 ease-out
                            ${mod.is_featured 
                              ? 'bg-yellow-500/20 border-yellow-500 text-yellow-600 hover:bg-yellow-500/30 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/25' 
                              : 'bg-gray-700/50 border-gray-600 text-gray-400 hover:bg-gray-600/50 hover:border-gray-500 hover:text-gray-300 hover:scale-105'
                            }
                            ${loadingActions[`${mod.id}-is_featured`] ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                          title={mod.is_featured ? 'Remover destaque - O mod não aparecerá mais na seção de destaque' : 'Adicionar destaque - O mod aparecerá na seção de destaque da página inicial'}
                        >
                          {loadingActions[`${mod.id}-is_featured`] ? (
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-yellow-500"></div>
                          ) : (
                            <>
                              {mod.is_featured 
                                ? <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 fill-yellow-500" /> 
                                : <Star className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                              }
                            </>
                          )}
                        </Button>
                        
                        <Button
                          onClick={() => openEditModal(mod)}
                          size="sm"
                          className="
                            w-8 h-8 sm:w-10 sm:h-10 p-0 rounded-lg sm:rounded-xl border-2 border-blue-500/50 bg-blue-500/10 
                            text-blue-500 hover:bg-blue-500/20 hover:border-blue-500 hover:scale-105 
                            hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 ease-out
                          "
                          title="Editar mod"
                        >
                          <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                        
                        <Button
                          onClick={() => openDeleteModal(mod)}
                          size="sm"
                          className="
                            w-8 h-8 sm:w-10 sm:h-10 p-0 rounded-lg sm:rounded-xl border-2 border-red-500/50 bg-red-500/10 
                            text-red-500 hover:bg-red-500/20 hover:border-red-500 hover:scale-105 
                            hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 ease-out
                          "
                          title="Deletar mod permanentemente"
                        >
                          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {(showCreateModal || editingMod) && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden"
          >
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-2xl font-bold text-foreground">
              {editingMod ? 'Editar Conteúdo' : 'Criar Novo Mod/Addon'}
            </h3>
                  <p className="text-muted-foreground mt-1">
                    {editingMod ? 'Atualize as informações do conteúdo' : 'Preencha as informações para criar um novo mod ou addon'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingMod(null);
                    resetForm();
                  }}
                  className="text-muted-foreground hover:text-foreground hover:bg-background/80"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
              <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-6">
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    {t('modDetail.information')}
                  </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                      <Label htmlFor="name" className="text-sm font-medium">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    const newSlug = generateSlug(newName);
                    setFormData({ 
                      ...formData, 
                      name: newName,
                      slug: newSlug
                    });
                  }}
                  placeholder="Nome do mod ou addon"
                  required
                        className="mt-1"
                />
              </div>
              
              <div>
                      <Label htmlFor="slug" className="text-sm font-medium">Slug (URL) *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="slug-do-mod"
                  required
                        className="mt-1"
                />
                      <p className="text-xs text-muted-foreground mt-1">
                        URL amigável para o mod (gerado automaticamente baseado no nome)
                      </p>
              </div>
              
              <div>
                      <Label htmlFor="version" className="text-sm font-medium">Versão *</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="1.0.0"
                  required
                        className="mt-1"
                />
              </div>
              
              <div>
                      <Label htmlFor="minecraft_version" className="text-sm font-medium">Versão do Minecraft *</Label>
                <Input
                  id="minecraft_version"
                  value={formData.minecraft_version}
                  onChange={(e) => setFormData({ ...formData, minecraft_version: e.target.value })}
                  placeholder="1.20.1"
                  required
                        className="mt-1"
                />
              </div>
              
                                  <div>
                      <Label htmlFor="mod_loader" className="text-sm font-medium">Loader do Mod *</Label>
                      <select
                        id="mod_loader"
                        value={formData.mod_loader || ''}
                        onChange={(e) => setFormData({ ...formData, mod_loader: e.target.value })}
                        required
                        className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">Selecione o loader...</option>
                        <option value="padrão">Padrão</option>
                        <option value="forge">Forge</option>
                        <option value="fabric">Fabric</option>
                      </select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Escolha o mod loader compatível com seu mod
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="content_type_id" className="text-sm font-medium">Tipo de Conteúdo *</Label>
                      <select
                        id="content_type_id"
                        value={formData.content_type_id || 1}
                        onChange={(e) => setFormData({ ...formData, content_type_id: parseInt(e.target.value) })}
                        required
                        className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value={1}>Mods - Minecraft Java Edition</option>
                        <option value={2}>Addons - Minecraft Bedrock Edition</option>
                      </select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Escolha se é um mod para Java ou addon para Bedrock
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="tags" className="text-sm font-medium">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="tag1, tag2, tag3"
                        className="mt-1"
                />
                    </div>
                  </div>
              </div>
              
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                    <AlignLeft className="h-5 w-5 mr-2 text-primary" />
                    Descrições
                  </h4>
                  
                  <div className="space-y-4">
              <div>
                      <Label htmlFor="short_description" className="text-sm font-medium">Descrição Curta *</Label>
                <Input
                  id="short_description"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  placeholder="Descrição curta do mod ou addon"
                  required
                        className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="full_description" className="text-sm font-medium">Descrição Completa *</Label>
                <div className="mt-1">
                  <RichTextEditor
                    value={formData.full_description}
                    onChange={(html) => setFormData({ ...formData, full_description: html })}
                  />
                </div>
              </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                    <Image className="h-5 w-5 mr-2 text-primary" />
                    Imagem de Capa
                  </h4>
                  
                  <div className="flex space-x-2 mb-4">
                    <Button
                      type="button"
                      variant={thumbnailMode === 'url' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setThumbnailMode('url')}
                      className="text-xs"
                    >
                      <Link className="h-3 w-3 mr-1" />
                      URL
                    </Button>
                    <Button
                      type="button"
                      variant={thumbnailMode === 'upload' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setThumbnailMode('upload')}
                      className="text-xs"
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Upload
                    </Button>
                  </div>
                  
                  {thumbnailMode === 'url' && (
                    <div className="space-y-3">
                <Input
                  id="thumbnail_url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  placeholder="https://exemplo.com/thumbnail.jpg"
                        className="mt-1"
                      />
                      {formData.thumbnail_url && (
                        <div className="relative w-32 h-32 border border-border rounded-lg overflow-hidden shadow-md">
                          <img
                            src={formData.thumbnail_url}
                            alt="Prévia da thumbnail"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="absolute inset-0 bg-muted items-center justify-center text-xs text-muted-foreground" style={{ display: 'none' }}>
                            Imagem não carregada
              </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {thumbnailMode === 'upload' && (
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          id="thumbnail_file"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              if (!file.type.startsWith('image/')) {
                                setFeedback({ show: true, message: 'Por favor, selecione apenas arquivos de imagem', type: 'error' });
                                return;
                              } 
                              if (file.size > 5 * 1024 * 1024) {
                                setFeedback({ show: true, message: 'A imagem deve ter no máximo 5MB', type: 'error' });
                                return;
                              }
                              setFormData({ ...formData, thumbnail_file: file });
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        
                        <div className={`
                          border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ease-out
                          ${formData.thumbnail_file 
                            ? 'border-green-500 bg-green-500/5' 
                            : 'border-muted-foreground/30 bg-muted/20 hover:border-primary/50 hover:bg-muted/30'
                          }
                        `}>
                          
                          <div className="space-y-3">
                            {formData.thumbnail_file ? (
                              <div className="space-y-3">
                                <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                                  <Image className="h-8 w-8 text-green-500" />
                                </div>
              <div>
                                  <p className="text-sm font-medium text-green-600">
                                    Imagem selecionada
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formData.thumbnail_file.name}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="mx-auto w-16 h-16 bg-muted-foreground/20 rounded-full flex items-center justify-center">
                                  <Image className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-foreground">
                                    Clique para selecionar ou arraste uma imagem
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    PNG, JPG, GIF até 5MB
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {!formData.thumbnail_file && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-4 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50"
                              onClick={() => document.getElementById('thumbnail_file').click()}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Escolher Arquivo
                            </Button>
                          )}
                          
                          {formData.thumbnail_file && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-4 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50"
                              onClick={() => {
                                setFormData({ ...formData, thumbnail_file: null });
                                document.getElementById('thumbnail_file').value = '';
                              }}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Trocar Imagem
                            </Button>
                            )}
                        </div>
                      </div>
                      
                      {formData.thumbnail_file && (
                        <div className="mt-4 p-4 bg-muted/20 rounded-lg border border-green-500/20">
                          <div className="flex items-center space-x-3">
                            <img 
                              src={URL.createObjectURL(formData.thumbnail_file)} 
                              alt="Preview" 
                              className="w-16 h-16 object-cover rounded-lg border-2 border-green-500/30"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">
                                {formData.thumbnail_file.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(formData.thumbnail_file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                    <Download className="h-5 w-5 mr-2 text-primary" />
                    Arquivos de Download
                  </h4>
                  
                  <div className="flex space-x-2 mb-4">
                    <Button
                      type="button"
                      variant={downloadMode === 'url' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDownloadMode('url')}
                      className="text-xs"
                    >
                      <Link className="h-3 w-3 mr-1" />
                      URL
                    </Button>
                    <Button
                      type="button"
                      variant={downloadMode === 'upload' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDownloadMode('upload')}
                      className="text-xs"
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Upload
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {downloadMode === 'url' ? (
                      <>
                        <div>
                          <Label htmlFor="download_url_pc" className="text-sm font-medium flex items-center">
                            <Monitor className="h-4 w-4 mr-2 text-blue-500" />
                            Download Principal *
                          </Label>
                          <Input
                            id="download_url_pc"
                            value={formData.download_url_pc}
                            onChange={(e) => setFormData({ ...formData, download_url_pc: e.target.value })}
                            placeholder={formData.content_type_id === 1 ? "https://exemplo.com/download-pc.jar" : "https://exemplo.com/download-pc.mcpack"}
                            className="mt-1"
                            required
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {formData.content_type_id === 1 ? 'Arquivo .jar para Minecraft Java Edition' : 'Arquivo .mcpack para Minecraft Bedrock Edition'}
                          </p>
                        </div>
                        
                        <div>
                          <Label htmlFor="download_url_mobile" className="text-sm font-medium flex items-center">
                            <Smartphone className="h-4 w-4 mr-2 text-green-500" />
                            Download Alternativo
                          </Label>
                          <Input
                            id="download_url_mobile"
                            value={formData.download_url_mobile}
                            onChange={(e) => setFormData({ ...formData, download_url_mobile: e.target.value })}
                            placeholder={formData.content_type_id === 1 ? "https://exemplo.com/download-mobile.jar" : "https://exemplo.com/download-mobile.mcpack"}
                            className="mt-1"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {formData.content_type_id === 1 ? 'Arquivo .jar para Minecraft Java Edition' : 'Arquivo .mcpack para Minecraft Bedrock Edition'}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <Label className="text-sm font-medium flex items-center">
                            <Monitor className="h-4 w-4 mr-2 text-blue-500" />
                            Arquivo Principal *
                          </Label>
                          <div className="mt-1">
                            <input
                              id="download_file_pc"
                              type="file"
                              accept={formData.content_type_id === 1 ? ".jar,.zip" : ".mcpack,.mcaddon"}
                              onChange={(e) => {
                                const file = e.target.files && e.target.files[0];
                                setFormData({ ...formData, download_file_pc: file });
                              }}
                              className="hidden"
                            />
                            <div
                              className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                              onClick={() => document.getElementById('download_file_pc')?.click()}
                            >
                              <div className="space-y-3">
                                <div className="mx-auto w-16 h-16 bg-muted-foreground/20 rounded-full flex items-center justify-center">
                                  <Download className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-foreground">
                                    Clique para selecionar arquivo principal
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formData.content_type_id === 1 ? 'JAR, ZIP até 100MB' : 'MCPACK, MCADDON até 100MB'}
                                  </p>
                                </div>
                                <div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mt-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50"
                                    onClick={() => document.getElementById('download_file_pc')?.click()}
                                  >
                                    Escolher Arquivo
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {formData.download_file_pc && (
                          <div className="mt-4 p-4 bg-muted/20 rounded-lg border border-green-500/20">
                            <div className="flex items-center space-x-3">
                              <div className="w-16 h-16 bg-blue-500/10 rounded-lg border-2 border-blue-500/30 flex items-center justify-center">
                                <Download className="h-8 w-8 text-blue-500" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">
                                  {formData.download_file_pc.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {(formData.download_file_pc.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <Label className="text-sm font-medium flex items-center">
                            <Smartphone className="h-4 w-4 mr-2 text-green-500" />
                            Arquivo Alternativo
                          </Label>
                          <div className="mt-1">
                            <input
                              id="download_file_mobile"
                              type="file"
                              accept={formData.content_type_id === 1 ? ".jar,.zip" : ".mcpack,.mcaddon"}
                              onChange={(e) => {
                                const file = e.target.files && e.target.files[0];
                                setFormData({ ...formData, download_file_mobile: file });
                              }}
                              className="hidden"
                            />
                            <div
                              className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                              onClick={() => document.getElementById('download_file_mobile')?.click()}
                            >
                              <div className="space-y-3">
                                <div className="mx-auto w-16 h-16 bg-muted-foreground/20 rounded-full flex items-center justify-center">
                                  <Download className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-foreground">
                                    Clique para selecionar arquivo alternativo
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formData.content_type_id === 1 ? 'JAR, ZIP até 100MB' : 'MCPACK, MCADDON até 100MB'}
                                  </p>
                                </div>
                                <div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mt-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50"
                                    onClick={() => document.getElementById('download_file_mobile')?.click()}
                                  >
                                    Escolher Arquivo
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {formData.download_file_mobile && (
                          <div className="mt-4 p-4 bg-muted/20 rounded-lg border border-green-500/20">
                            <div className="flex items-center space-x-3">
                              <div className="w-16 h-16 bg-green-500/10 rounded-lg border-2 border-green-500/30 flex items-center justify-center">
                                <Download className="h-8 w-8 text-green-500" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">
                                  {formData.download_file_mobile.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {(formData.download_file_mobile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-foreground flex items-center">
                    <ExternalLink className="h-5 w-5 mr-2 text-primary" />
                      Vídeo do Mod
                  </h4>
                    {editingMod && formData.video_url && !formData.video_file && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="h-8"
                        onClick={() => setFormData({ ...formData, video_url: '', video_file: null })}
                      >
                        Remover vídeo
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        id="video_file"
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files && e.target.files[0];
                          if (!file) return;
                          const maxSize = 200 * 1024 * 1024; // 200MB
                          if (file.size > maxSize) {
                            setFeedback({ show: true, message: 'O vídeo deve ter no máximo 200MB', type: 'error' });
                            return;
                          }
                          const allowed = ['video/mp4','video/webm','video/ogg','video/x-matroska','video/quicktime'];
                          if (!allowed.includes(file.type)) {
                            setFeedback({ show: true, message: 'Formato não suportado. Use MP4, WEBM, OGG, MKV ou MOV.', type: 'error' });
                            return;
                          }
                          setFormData({ ...formData, video_file: file });
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />

                      <div className={`
                        border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ease-out
                        ${formData.video_file 
                          ? 'border-purple-500 bg-purple-500/5' 
                          : 'border-muted-foreground/30 bg-muted/20 hover:border-primary/50 hover:bg-muted/30'
                        }
                      `}>
                        <div className="space-y-3">
                          {formData.video_file ? (
                            <div className="space-y-2">
                              <div className="mx-auto w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
                                <Play className="h-8 w-8 text-purple-500" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">Vídeo selecionado</p>
                                <p className="text-xs text-muted-foreground">{formData.video_file.name} • {(formData.video_file.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                              <div className="flex items-center justify-center gap-2 pt-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50"
                                  onClick={() => {
                                    setFormData({ ...formData, video_file: null });
                                    const el = document.getElementById('video_file');
                                    if (el) el.value = '';
                                  }}
                                >
                                  Trocar Vídeo
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="mx-auto w-16 h-16 bg-muted-foreground/20 rounded-full flex items-center justify-center">
                                <Play className="h-8 w-8 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  Clique para selecionar ou arraste um vídeo
                                </p>
                                <p className="text-xs text-muted-foreground">MP4, WEBM, OGG, MKV ou MOV até 200MB</p>
                    </div>
                              <div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="mt-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50"
                                  onClick={() => document.getElementById('video_file')?.click()}
                                >
                                  Escolher Arquivo
                                </Button>
                  </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {editingMod && !formData.video_file && formData.video_url && (
                        <p className="mt-2 text-xs text-muted-foreground">Vídeo atual manterá: {formData.video_url.split('/').pop()}</p>
                      )}
                    </div>
                  </div>
              </div>
            </div>
            
            </div>
            
            <div className="bg-muted/30 border-t border-border p-6">
              <div className="flex space-x-3">
              <Button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingMod(null);
                  resetForm();
                }}
                variant="outline"
                  className="flex-1 h-12 text-base"
              >
                Cancelar
              </Button>
              <Button
                onClick={editingMod ? handleUpdateMod : handleCreateMod}
                  disabled={!formData.name || !formData.slug || !formData.version || !formData.minecraft_version || !formData.short_description || !formData.full_description || isUpdating}
                  className="flex-1 h-12 text-base bg-primary hover:bg-primary/90 shadow-lg"
                >
                  {editingMod ? (
                    isUpdating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Atualizando...
                      </>
                    ) : (
                      'Atualizar Mod'
                    )
                  ) : (
                    'Criar Mod'
                  )}
              </Button>
            </div>
          </div>
          </motion.div>
        </div>
      )}

      {deleteModalOpen && modToDelete && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-md"
          >
            <div className="bg-gradient-to-r from-red-500/10 to-red-600/5 border-b border-border p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-red-100 rounded-full">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Confirmar Exclusão</h3>
                  <p className="text-sm text-muted-foreground">Esta ação não pode ser desfeita</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium">
                  Você está prestes a deletar permanentemente o mod <strong>"{modToDelete.name}"</strong>.
                </p>
                <p className="text-sm text-red-700 mt-2">
                  Todos os dados, downloads e comentários relacionados serão perdidos.
                </p>
              </div>
            </div>
            
            <div className="bg-muted/30 border-t border-border p-6">
              <div className="flex space-x-3">
                <Button
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setModToDelete(null);
                  }}
                  variant="outline"
                  className="flex-1 h-11"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => handleDeleteMod(modToDelete.id)}
                  disabled={isDeleting}
                  className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white shadow-lg"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deletando...
                    </>
                  ) : (
                    'Deletar'
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminModsPage;
