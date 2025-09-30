import ModsModel from '../models/ModsModel.js';
import fs from 'fs';
import path from 'path';
import { logError } from '../config/logger.js';
import { LogService } from '../services/LogService.js';
import { trackActivity, untrackActivity } from '../services/ActivityService.js';

// Criar novo mod
export const createMod = async (req, res) => {
  try {
    
    const {
      name, slug, version, minecraft_version, mod_loader, short_description, full_description,
      tags, thumbnail_url, download_url_pc, download_url_mobile, video_url, content_type_id = 1
    } = req.body;

    // Validações básicas
    if (!name || !slug || !version || !minecraft_version || !mod_loader || !short_description || !full_description) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos obrigatórios devem ser preenchidos'
      });
    }

    // Verificar se o slug é único
    const finalSlug = await ModsModel.generateUniqueSlug(slug);

    // Processar thumbnail
    let finalThumbnailUrl = thumbnail_url || null;
    if (req.thumbnailInfo) {
      // Arquivo foi enviado, gerar URL
      finalThumbnailUrl = `/uploads/thumbnails/${req.thumbnailInfo.filename}`;
    }

    // Processar vídeo
    let finalVideoUrl = video_url || null;
    if (req.videoInfo) {
      finalVideoUrl = `/uploads/videos/${req.videoInfo.filename}`;
    }

    // Processar tags (pode vir como string ou array)
    let finalTags = tags || [];
    if (Array.isArray(tags)) {
      finalTags = tags;
    } else if (typeof tags === 'string') {
      try {
        finalTags = JSON.parse(tags);
      } catch {
        finalTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      }
    }
    

    const modData = {
      name,
      slug: finalSlug,
      version,
      minecraft_version,
      mod_loader,
      short_description,
      full_description,
      tags: finalTags,
      thumbnail_url: finalThumbnailUrl,
      download_url_pc: download_url_pc || null,
      download_url_mobile: download_url_mobile || null,
      video_url: finalVideoUrl,
      author_id: req.user.id,
      content_type_id
    };

    const newMod = await ModsModel.create(modData);

    // Log da atividade
    await LogService.logMods(
      req.user.id,
      'Mod criado',
      `Mod "${name}" criado por ${req.user.username}`,
      req.ip,
      req.get('User-Agent')
    );

    res.status(201).json({
      success: true,
      message: 'Mod criado com sucesso',
      data: newMod
    });
  } catch (error) {
    logError('Erro ao criar mod', error, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Buscar todos os mods (requer autenticação de admin)
export const getAllMods = async (req, res) => {
  try {

    
    const { status, featured, minecraft_version, search } = req.query;
    
    const filters = {};
    // Para rota /admin, mostrar todos os mods por padrão (não filtrar por status)
    if (status) filters.status = status;
    if (featured !== undefined) filters.featured = featured === 'true';
    if (minecraft_version) filters.minecraft_version = minecraft_version;
    if (search) filters.search = search;


    const mods = await ModsModel.findAll(filters);
    

    res.json({
      success: true,
      data: mods
    });
  } catch (error) {
    logError('Erro ao buscar mods', error, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Buscar mods públicos (não requer autenticação)
export const getPublicMods = async (req, res) => {
  try {
    const { featured, minecraft_version, search, limit = 50, offset = 0, content_type } = req.query;
    
    const filters = {
      status: 'published', // Apenas mods publicados
      featured: featured === 'true',
      minecraft_version,
      search,
      content_type, // Novo filtro por tipo de conteúdo
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    const mods = await ModsModel.findPublic(filters);

    res.json({
      success: true,
      data: mods
    });
  } catch (error) {
    logError('Erro ao buscar mods públicos', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Buscar mod por ID
export const getModById = async (req, res) => {
  try {
    const { id } = req.params;
    

    
    // Para usuários não autenticados, sempre usar método público
    let mod;
    if (req.user && req.user.role === 'super_admin') {
      // Admin pode ver todos os mods

      mod = await ModsModel.findByIdAdmin(id);
    } else {
      // Usuários normais e não autenticados só veem mods publicados

      mod = await ModsModel.findById(id);
    }

    if (!mod) {

      return res.status(404).json({
        success: false,
        message: 'Mod não encontrado'
      });
    }

    res.json({
      success: true,
      data: mod
    });
  } catch (error) {
    logError('Erro ao buscar mod', error, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Buscar mod por slug (público)
export const getModBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Usar método diferente baseado no tipo de usuário
    let mod;
    if (req.user && req.user.role === 'super_admin') {
      // Admin pode ver todos os mods
      mod = await ModsModel.findBySlugAdmin(slug);
    } else {
      // Usuários normais só veem mods publicados
      mod = await ModsModel.findBySlug(slug);
    }

    if (!mod) {
      return res.status(404).json({
        success: false,
        message: 'Mod não encontrado'
      });
    }

    // Verificar se o mod está publicado e não arquivado (apenas para usuários não-admin)
    if (!req.user || req.user.role !== 'super_admin') {
      if (!mod.is_published || mod.is_archived) {
        return res.status(404).json({
          success: false,
          message: 'Mod não encontrado'
        });
      }
    }

    // Incrementar contador de visualizações
    await ModsModel.incrementCount(mod.id, 'view_count');

    res.json({
      success: true,
      data: mod
    });
  } catch (error) {
    logError('Erro ao buscar mod', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar mod
export const updateMod = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;


    // Verificar se o mod existe (admin pode ver todos os mods)
    const existingMod = await ModsModel.findByIdAdmin(id);
    if (!existingMod) {
      return res.status(404).json({
        success: false,
        message: 'Mod não encontrado'
      });
    }


    // Verificar se o usuário é o autor ou um admin
    if (existingMod.author_id !== req.user.id && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para editar este mod'
      });
    }


    // Mapear name para title sempre (se name foi enviado)
    if (updateData.name) {
      updateData.title = updateData.name;
      delete updateData.name;
      
      // Se o nome foi alterado, gerar novo slug
      if (updateData.title !== existingMod.title) {
        updateData.slug = await ModsModel.generateUniqueSlug(updateData.title);
      }
    }

    // Processar thumbnail se foi enviado um arquivo
    if (req.thumbnailInfo) {
      updateData.thumbnail_url = `/uploads/thumbnails/${req.thumbnailInfo.filename}`;
    }

    // Processar vídeo se foi enviado um arquivo
    if (req.videoInfo) {
      updateData.video_url = `/uploads/videos/${req.videoInfo.filename}`;
    }

    // Remover vídeo atual, se solicitado e nenhum novo vídeo foi enviado
    const removeFlag = updateData.video_remove === true || updateData.video_remove === 'true' || updateData.video_remove === '1';
    if (removeFlag && !req.videoInfo) {
      // Apagar arquivo antigo, se houver
      if (existingMod.video_url && existingMod.video_url.startsWith('/uploads/')) {
        try {
          const filePath = path.join(process.cwd(), existingMod.video_url);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (e) {
          // falha silenciosa para não quebrar update
        }
      }
      updateData.video_url = null;
    }

    // limpar campo auxiliar para não tentar atualizar coluna inexistente
    if (Object.prototype.hasOwnProperty.call(updateData, 'video_remove')) {
      delete updateData.video_remove;
    }

    // Processar tags se foram enviadas
    if (updateData.tags) {
      if (Array.isArray(updateData.tags)) {
        updateData.tags = updateData.tags;
      } else if (typeof updateData.tags === 'string') {
        try {
          updateData.tags = JSON.parse(updateData.tags);
        } catch {
          updateData.tags = updateData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }
      }
    }

    // Manter full_description como está (não mapear para description)
    // O campo full_description já existe na tabela

    // Mapear mod_loader se foi enviado (corrigir case)
    if (updateData.mod_Loader) {
      updateData.mod_loader = updateData.mod_Loader;
      delete updateData.mod_Loader;
    }

    // Processar tipo de conteúdo se foi enviado
    if (updateData.content_type_id) {
    }

    // Processar URLs de download se foram enviadas
    if (updateData.download_url_pc) {
    }
    if (updateData.download_url_mobile) {
    }

    const updatedMod = await ModsModel.update(id, updateData);

    // Log da atividade
    await LogService.logMods(
      req.user.id,
      'Mod atualizado',
      `Mod "${updatedMod.title}" atualizado por ${req.user.username}`,
      req.ip,
      req.get('User-Agent')
    );


    res.json({
      success: true,
      message: 'Mod atualizado com sucesso',
      data: updatedMod
    });
  } catch (error) {
    logError('Erro ao atualizar mod', error, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Deletar mod
export const deleteMod = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o mod existe (admin pode ver todos os mods)
    const existingMod = await ModsModel.findByIdAdmin(id);
    if (!existingMod) {
      return res.status(404).json({
        success: false,
        message: 'Mod não encontrado'
      });
    }

    // Verificar se o usuário é o autor ou um admin
    if (existingMod.author_id !== req.user.id && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para deletar este mod'
      });
    }

    await ModsModel.delete(id);

    // Log da atividade
    await LogService.logMods(
      req.user.id,
      'Mod deletado',
      `Mod "${existingMod.title}" deletado por ${req.user.username}`,
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      success: true,
      message: 'Mod deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar mod:', error);
    logError('Erro ao deletar mod', error, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Toggle de status (publicar/arquivar/destaque)
export const toggleModStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { field } = req.body;

    const allowedFields = ['is_published', 'is_archived', 'is_featured'];
    if (!allowedFields.includes(field)) {
      return res.status(400).json({
        success: false,
        message: 'Campo de status inválido'
      });
    }

    // Verificar se o mod existe (admin pode ver todos os mods)
    const existingMod = await ModsModel.findByIdAdmin(id);
    if (!existingMod) {
      return res.status(404).json({
        success: false,
        message: 'Mod não encontrado'
      });
    }

    // Verificar permissões
    if (existingMod.author_id !== req.user.id && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para alterar este mod'
      });
    }

    const updatedMod = await ModsModel.toggleStatus(id, field);

    // Log da atividade
    const action = field === 'is_published' ? 'publicação' : 
                   field === 'is_archived' ? 'arquivamento' : 'destaque';
    await LogService.logMods(
      req.user.id,
      `Status do mod alterado`,
              `Status de ${action} do mod "${updatedMod.title}" alterado por ${req.user.username}`,
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      success: true,
      message: `Status do mod alterado com sucesso`,
      data: updatedMod
    });
  } catch (error) {
    console.error('Erro ao alterar status do mod:', error);
    logError('Erro ao alterar status do mod', error, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Buscar estatísticas dos mods
export const getModStats = async (req, res) => {
  try {
    const stats = await ModsModel.getStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    logError('Erro ao buscar estatísticas dos mods', error, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Download de mod (incrementar contador)
export const downloadMod = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o mod existe e está publicado
    let mod;
    if (req.user && req.user.role === 'super_admin') {
      // Admin pode ver todos os mods
      mod = await ModsModel.findByIdAdmin(id);
    } else {
      // Usuários normais só veem mods publicados
      mod = await ModsModel.findById(id);
    }
    
    if (!mod || !mod.is_published || mod.is_archived) {
      return res.status(404).json({
        success: false,
        message: 'Mod não encontrado ou não disponível para download'
      });
    }


    // Registrar download usando o novo sistema
    await ModsModel.registerDownload(id, req.user?.id);


    res.json({
      success: true,
      message: 'Download registrado com sucesso',
      data: {
        download_url: mod.download_url
      }
    });
  } catch (error) {
    logError('Erro ao registrar download', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Busca avançada com múltiplos filtros
export const advancedSearch = async (req, res) => {
  try {
    const { 
      q, // termo de busca
      version, // versão do minecraft
      loader, // tipo de loader (forge, fabric, etc)
      category, // categoria/tag
      sort, // ordenação
      limit = 50, 
      offset = 0,
      featured,
      author
    } = req.query;
    
    
    const filters = {
      search: q,
      minecraft_version: version,
      mod_loader: loader,
      category,
      featured: featured === 'true',
      author,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    // Remover filtros vazios
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined || filters[key] === null || filters[key] === '') {
        delete filters[key];
      }
    });


    const result = await ModsModel.advancedSearch(filters, sort);

    res.json({
      success: true,
      data: result.mods,
      total: result.total,
      filters: filters,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: result.total,
        pages: Math.ceil(result.total / parseInt(limit))
      }
    });
  } catch (error) {
    logError('Erro na busca avançada', error, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Buscar tipos de conteúdo disponíveis
export const getContentTypes = async (req, res) => {
  try {
    const result = await ModsModel.getContentTypes();
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logError('Erro ao buscar tipos de conteúdo', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Buscar contagem total de mods (para estatísticas)
export const getModsCount = async (req, res) => {
  try {
    const counts = await ModsModel.getModsCount();
    
    res.json({
      success: true,
      data: counts
    });
  } catch (error) {
    logError('Erro ao buscar contagem de mods', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Registrar visualização de um mod
export const registerView = async (req, res) => {
  try {
    const { id } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
    
    
    const result = await ModsModel.registerView(id, ipAddress);
    
    res.json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    logError('Erro ao registrar visualização', error, { modId: id, ipAddress: req.ip });
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Registrar download de um mod
export const registerDownload = async (req, res) => {
  try {
    const { modId } = req.params;
    const userId = req.user?.id || null;
    
    
    const result = await ModsModel.registerDownload(modId, userId);
    
    // Buscar o mod atualizado para retornar o contador correto
    const updatedMod = await ModsModel.findById(modId);
    
    res.json({
      success: true,
      message: result.message,
      data: {
        ...result,
        download_count: updatedMod?.download_count || 0
      }
    });
  } catch (error) {
    logError('Erro ao registrar download', error, { modId: req.params.modId, userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Contagem de downloads por usuário
export const getUserDownloadsCount = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    }
    
    const total = await ModsModel.getUserDownloadsCount(userId);
    res.json({ success: true, data: { total } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
};

// Histórico de downloads do usuário
export const getUserDownloadHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    }
    
    const { 
      limit = '20', 
      page = '1', 
      search = '', 
      period = 'all', 
      type = 'all' 
    } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Construir filtros de data
    let dateCondition = '';
    const now = new Date();
    
    switch (period) {
      case 'today':
        // Para hoje, vamos buscar downloads do dia atual
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        dateCondition = `AND d.created_at >= '${today.toISOString()}' AND d.created_at < '${tomorrow.toISOString()}'`;
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateCondition = `AND d.created_at >= '${weekAgo.toISOString()}'`;
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateCondition = `AND d.created_at >= '${monthAgo.toISOString()}'`;
        break;
    }
    
    const history = await ModsModel.getUserDownloadHistory({
      userId,
      offset: parseInt(offset),
      limit: parseInt(limit),
      search: search.trim(),
      dateCondition,
      type: type === 'all' ? null : type
    });
    
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
};

// Alternar favorito de um mod
export const toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID do mod não fornecido'
      });
    }
    
    
    const result = await ModsModel.toggleFavorite(id, userId);
    
    // Registrar ou remover atividade de favorito
    if (result.isFavorite) {
      await trackActivity({
        userId,
        modId: id,
        activityType: 'favorite',
        activityData: {
          category: result.mod?.category || 'Geral'
        }
      });
    } else {
      await untrackActivity({
        userId,
        modId: id,
        activityType: 'favorite'
      });
    }
    
    res.json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) { 
    logError('Erro ao alternar favorito', error, { modId: req.params.id, userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Verificar se um mod é favorito para um usuário
export const checkFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    
    if (!userId) {
      return res.json({
        success: true,
        data: { isFavorite: false }
      });
    }
    
    if (!id) {
      console.error('❌ checkFavorite - ID do mod não fornecido');
      return res.status(400).json({
        success: false,
        message: 'ID do mod não fornecido'
      });
    }
    
    const isFavorite = await ModsModel.isFavorite(id, userId);
    
    res.json({
      success: true,
      data: { isFavorite }
    });
  } catch (error) {
    console.error('Erro ao verificar favorito:', error);
    logError('Erro ao verificar favorito', error, { modId: req.params.id, userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Buscar todos os favoritos do usuário
export const getUserFavorites = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }
    
    
    const favorites = await ModsModel.getUserFavorites(userId);
    
    res.json({
      success: true,
      data: favorites,
      total: favorites.length
    });
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    logError('Erro ao buscar favoritos', error, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

