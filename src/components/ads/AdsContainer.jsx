import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContextMods';
import { Edit3, Save, X, Trash2, Plus, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';

const AdsContainer = () => {
  const { currentUser } = useAuth();
  const [ads, setAds] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [adContent, setAdContent] = useState('');
  const [adType, setAdType] = useState('google_ads');
  const [loading, setLoading] = useState(false);

  const isSuperAdmin = currentUser?.role === 'super_admin';

  // Tipos de anúncios disponíveis
  const adTypes = [
    { value: 'google_ads', label: 'Google Ads', description: 'Anúncios do Google AdSense' },
    { value: 'facebook', label: 'Facebook', description: 'Anúncios do Facebook/Meta' },
    { value: 'instagram', label: 'Instagram', description: 'Anúncios do Instagram' },
    { value: 'twitter', label: 'Twitter/X', description: 'Anúncios do Twitter/X' },
    { value: 'youtube', label: 'YouTube', description: 'Anúncios do YouTube' },
    { value: 'tiktok', label: 'TikTok', description: 'Anúncios do TikTok' },
    { value: 'linkedin', label: 'LinkedIn', description: 'Anúncios do LinkedIn' },
    { value: 'custom', label: 'Personalizado', description: 'Código HTML personalizado' }
  ];

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const response = await fetch('/api/ads');
      if (response.ok) {
        const data = await response.json();
        setAds(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar anúncios:', error);
    }
  };

  const handleEditClick = (ad = null) => {
    setEditingAd(ad);
    setAdContent(ad ? ad.content : '');
    setAdType(ad ? ad.ad_type : 'google_ads');
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!adContent.trim()) {
      toast.error('Conteúdo do anúncio não pode estar vazio');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const url = editingAd ? `/api/ads/${editingAd.id}` : '/api/ads';
      const method = editingAd ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: adContent.trim(), ad_type: adType })
      });

      if (response.ok) {
        toast.success(editingAd ? 'Anúncio atualizado com sucesso!' : 'Anúncio criado com sucesso!');
        await fetchAds();
        setIsEditing(false);
        setEditingAd(null);
        setAdContent('');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erro ao salvar anúncio');
      }
    } catch (error) {
      console.error('Erro ao salvar anúncio:', error);
      toast.error('Erro ao salvar anúncio');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (adId) => {
    if (!confirm('Tem certeza que deseja excluir este anúncio?')) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/ads/${adId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Anúncio excluído com sucesso!');
        await fetchAds();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erro ao excluir anúncio');
      }
    } catch (error) {
      console.error('Erro ao excluir anúncio:', error);
      toast.error('Erro ao excluir anúncio');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingAd(null);
    setAdContent('');
    setAdType('google_ads');
  };

  // Se não é super admin e não há anúncios, não renderiza nada
  if (!isSuperAdmin && ads.length === 0) {
    return null;
  }

  return (
    <div className={`relative transition-all duration-300 w-full ${
      isSuperAdmin ? 'group' : ''
    }`}>
      {/* Container principal */}
      <div className={`bg-gradient-to-br from-gray-900/30 to-gray-800/20 rounded-xl p-6 border transition-all duration-300 w-full ${
        isSuperAdmin 
          ? 'border-dashed border-primary/50 hover:border-primary/70 cursor-pointer' 
          : 'border-gray-700/30'
      }`}>
        
        {/* Conteúdo dos anúncios */}
        {ads.length > 0 ? (
          <div className="space-y-4">
            {ads.map((ad) => (
              <div key={ad.id} className="relative">
                {/* Badge do tipo de anúncio */}
                <div className="mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30">
                    {adTypes.find(t => t.value === ad.ad_type)?.label || ad.ad_type}
                  </span>
                </div>
                
                <div 
                  className="prose prose-invert max-w-none text-gray-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: ad.content }}
                />
                
                {/* Botões de ação para super admin */}
                {isSuperAdmin && (
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditClick(ad)}
                      className="h-8 w-8 p-0 bg-primary/10 border-primary/30 hover:bg-primary/20"
                    >
                      <Edit3 className="h-4 w-4 text-primary" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(ad.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 text-sm">
              {isSuperAdmin ? 'Nenhum anúncio configurado' : ''}
            </div>
          </div>
        )}

        {/* Botão de adicionar para super admin */}
        {isSuperAdmin && !isEditing && (
          <div className="mt-4 flex justify-center">
            <Button
              onClick={() => handleEditClick()}
              variant="outline"
              className="border-dashed border-primary/50 text-primary hover:bg-primary/10 hover:border-primary/70 hover:text-primary hover:[&_svg]:text-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Anúncio
            </Button>
          </div>
        )}
      </div>

      {/* Modal de edição */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-primary/30 rounded-xl p-6 w-full max-w-2xl mx-4 shadow-2xl shadow-primary/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                {editingAd ? 'Editar Anúncio' : 'Adicionar Anúncio'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Seleção do tipo de anúncio */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de Anúncio
                </label>
                <div className="relative">
                  <select
                    value={adType}
                    onChange={(e) => setAdType(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-600 text-white rounded-lg px-3 py-2 focus:border-primary focus:ring-primary appearance-none"
                  >
                    {adTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label} - {type.description}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Conteúdo do anúncio */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Conteúdo do Anúncio (HTML permitido)
                </label>
                <Textarea
                  value={adContent}
                  onChange={(e) => setAdContent(e.target.value)}
                  placeholder={`Cole aqui o código do ${adTypes.find(t => t.value === adType)?.label || 'anúncio'}...`}
                  className="min-h-[200px] bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-primary focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading || !adContent.trim()}
                  className="bg-primary hover:bg-primary/80"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingAd ? 'Atualizar' : 'Salvar'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdsContainer;
