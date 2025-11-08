import ModsModel from '../models/ModsModel.js';
import fs from 'fs';
import path from 'path';
import { logError } from '../config/logger.js';
import { LogService } from '../services/LogService.js';
import { trackActivity, untrackActivity } from '../services/ActivityService.js';
import encryptionService from '../services/EncryptionService.js';

// criar novo mod
export const createMod = async (req, res) => {
  try {

    const {
      name, slug, version, minecraft_version, mod_loader, short_description, full_description,
      tags, thumbnail_url, download_url_pc, download_url_mobile, video_url, content_type_id = 1
    } = req.body;

    if (!name || !slug || !version || !minecraft_version || !mod_loader || !short_description || !full_description) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos obrigatórios devem ser preenchidos'
      });
    }

    const finalSlug = await ModsModel.generateUniqueSlug(slug);

    let finalThumbnailUrl = thumbnail_url || null;
    if (req.thumbnailInfo) {

      finalThumbnailUrl = `/uploads/thumbnails/${req.thumbnailInfo.filename}`;
    }

    let finalVideoUrl = video_url || null;
    if (req.videoInfo) {
      finalVideoUrl = `/uploads/videos/${req.videoInfo.filename}`;
    }

    let finalDownloadUrlPc = download_url_pc || null;
    if (req.downloadPcInfo) {
      finalDownloadUrlPc = `/uploads/downloads/${req.downloadPcInfo.filename}`;
    }

    let finalDownloadUrlMobile = download_url_mobile || null;
    if (req.downloadMobileInfo) {
      finalDownloadUrlMobile = `/uploads/downloads/${req.downloadMobileInfo.filename}`;
    }

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
      download_url_pc: finalDownloadUrlPc,
      download_url_mobile: finalDownloadUrlMobile,
      video_url: finalVideoUrl,
      author_id: req.user.id,
      content_type_id
    };

    const newMod = await ModsModel.create(modData);

    try {
      const decryptedUser = encryptionService.decryptUserData(req.user, true);
    await LogService.logMods(
      req.user.id,
      'Mod criado',
        `Mod "${name}" criado por ${decryptedUser.username}`,
        req.ip || 'N/A',
        req.get('User-Agent') || 'N/A',
        newMod.id,
        { modTitle: name, modId: newMod.id }
      );
    } catch (logErr) {
      console.error('❌ Erro ao criar log de criação de mod:', logErr);
    }

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

// buscar todos os mods (admin)
export const getAllMods = async (req, res) => {
  try {

    const { status, featured, minecraft_version, search } = req.query;

    const filters = {};

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

// buscar mods públicos (frontend)
export const getPublicMods = async (req, res) => {
  try {
    const { featured, minecraft_version, search, limit = 50, offset = 0, content_type } = req.query;

    const filters = {
      status: 'published',
      featured: featured === 'true',
      minecraft_version,
      search,
      content_type, 
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

// buscar mod por id
export const getModById = async (req, res) => {
  try {
    const { id } = req.params;

    let mod;
    if (req.user && req.user.role === 'admin') {

      mod = await ModsModel.findByIdAdmin(id);
    } else {

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

// buscar mod por slug (url)
export const getModBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    let mod;
    if (req.user && req.user.role === 'admin') {

      mod = await ModsModel.findBySlugAdmin(slug);
    } else {

      mod = await ModsModel.findBySlug(slug);
    }

    if (!mod) {
      return res.status(404).json({
        success: false,
        message: 'Mod não encontrado'
      });
    }

    if (!req.user || req.user.role !== 'admin') {
      if (!mod.is_published || mod.is_archived) {
        return res.status(404).json({
          success: false,
          message: 'Mod não encontrado'
        });
      }
    }

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

// atualizar mod existente
export const updateMod = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const existingMod = await ModsModel.findByIdAdmin(id);
    if (!existingMod) {
      return res.status(404).json({
        success: false,
        message: 'Mod não encontrado'
      });
    }

      if (existingMod.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para editar este mod'
      });
    }

    if (updateData.name) {
      updateData.title = updateData.name;
      delete updateData.name;

      if (updateData.title !== existingMod.title) {
        updateData.slug = await ModsModel.generateUniqueSlug(updateData.title);
      }
    }

    if (req.thumbnailInfo) {
      updateData.thumbnail_url = `/uploads/thumbnails/${req.thumbnailInfo.filename}`;
    }

    if (req.videoInfo) {
      updateData.video_url = `/uploads/videos/${req.videoInfo.filename}`;
    }

    if (req.downloadPcInfo) {
      updateData.download_url_pc = `/uploads/downloads/${req.downloadPcInfo.filename}`;
    }

    if (req.downloadMobileInfo) {
      updateData.download_url_mobile = `/uploads/downloads/${req.downloadMobileInfo.filename}`;
    }

    const removeFlag = updateData.video_remove === true || updateData.video_remove === 'true' || updateData.video_remove === '1';
    if (removeFlag && !req.videoInfo) {

      if (existingMod.video_url && existingMod.video_url.startsWith('/uploads/')) {
        try {
          const filePath = path.join(process.cwd(), existingMod.video_url);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (e) {

        }
      }
      updateData.video_url = null;
    }

    if (Object.prototype.hasOwnProperty.call(updateData, 'video_remove')) {
      delete updateData.video_remove;
    }

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

    if (updateData.mod_Loader) {
      updateData.mod_loader = updateData.mod_Loader;
      delete updateData.mod_Loader;
    }

    if (updateData.content_type_id) {
    }

    if (updateData.download_url_pc) {
    }
    if (updateData.download_url_mobile) {
    }

    const updatedMod = await ModsModel.update(id, updateData);

    try {
      const decryptedUser = encryptionService.decryptUserData(req.user, true);
    await LogService.logMods(
      req.user.id,
      'Mod atualizado',
        `Mod "${updatedMod.title}" atualizado por ${decryptedUser.username}`,
        req.ip || 'N/A',
        req.get('User-Agent') || 'N/A',
        id,
        { modTitle: updatedMod.title, modId: id }
      );
    } catch (logErr) {
      console.error('❌ Erro ao criar log de atualização de mod:', logErr);
    }

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

// deletar mod
export const deleteMod = async (req, res) => {
  try {
    const { id } = req.params;

    const existingMod = await ModsModel.findByIdAdmin(id);
    if (!existingMod) {
      return res.status(404).json({
        success: false,
        message: 'Mod não encontrado'
      });
    }

      if (existingMod.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para deletar este mod'
      });
    }

    await ModsModel.delete(id);

    try {
      const decryptedUser = encryptionService.decryptUserData(req.user, true);
      await LogService.logDelete(
      req.user.id,
      'Mod deletado',
        `Mod "${existingMod.title}" deletado por ${decryptedUser.username}`,
        req.ip || 'N/A',
        req.get('User-Agent') || 'N/A',
        id,
        'mod',
        { modTitle: existingMod.title, modId: id }
      );
    } catch (logErr) {
      console.error('❌ Erro ao criar log de exclusão de mod:', logErr);
    }

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

// alternar status do mod (publicado, privado ou destaque)
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

    const existingMod = await ModsModel.findByIdAdmin(id);
    if (!existingMod) {
      return res.status(404).json({
        success: false,
        message: 'Mod não encontrado'
      });
    }

      if (existingMod.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para alterar este mod'
      });
    }

    const updatedMod = await ModsModel.toggleStatus(id, field);

    const action = field === 'is_published' ? 'publicação' : 
                   field === 'is_archived' ? 'arquivamento' : 'destaque';
    try {
      const decryptedUser = encryptionService.decryptUserData(req.user, true);
    await LogService.logMods(
      req.user.id,
      `Status do mod alterado`,
        `Status de ${action} do mod "${updatedMod.title}" alterado por ${decryptedUser.username}`,
        req.ip || 'N/A',
        req.get('User-Agent') || 'N/A',
        id,
        { modTitle: updatedMod.title, modId: id, field, action }
      );
    } catch (logErr) {
      console.error('❌ Erro ao criar log de alteração de status:', logErr);
    }

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

// buscar estatísticas gerais dos mods
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

const normalizeText = (text) => {
  const map = {
    'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a',
    'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
    'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
    'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o',
    'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u',
    'ç': 'c', 'ñ': 'n',
    'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A', 'Å': 'A',
    'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E',
    'Ì': 'I', 'Í': 'I', 'Î': 'I', 'Ï': 'I',
    'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ö': 'O',
    'Ù': 'U', 'Ú': 'U', 'Û': 'U', 'Ü': 'U',
    'Ç': 'C', 'Ñ': 'N'
  };
  
  return text.replace(/[àáâãäåèéêëìíîïòóôõöùúûüçñÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÇÑ]/g, (char) => map[char] || char);
};

// registrar download do mod
export const downloadMod = async (req, res) => {
  try {
    const { id } = req.params;

    let mod;
    if (req.user && req.user.role === 'admin') {

      mod = await ModsModel.findByIdAdmin(id);
    } else {

      mod = await ModsModel.findById(id);
    }

    if (!mod || !mod.is_published || mod.is_archived) {
      return res.status(404).json({
        success: false,
        message: 'Mod não encontrado ou não disponível para download'
      });
    }

    await ModsModel.registerDownload(id, req.user?.id);

    const downloadUrl = mod.download_url_pc || mod.download_url_mobile || mod.download_url;
    
    if (!downloadUrl) {
      return res.status(404).json({
        success: false,
        message: 'Arquivo de download não disponível'
      });
    }

    let directDownloadUrl = downloadUrl;
    if (downloadUrl.startsWith('/uploads/downloads/')) {
      const filename = downloadUrl.split('/').pop();
      const rawModName = mod.name || mod.title || 'mod';
      const normalizedName = normalizeText(rawModName);
      const sanitizedName = normalizedName.replace(/[^a-zA-Z0-9\-_\s]/g, '').replace(/\s+/g, '-').toLowerCase();
      const modName = encodeURIComponent(sanitizedName);
      const modLoader = encodeURIComponent(mod.mod_loader || '');
      const minecraftVersion = encodeURIComponent(mod.minecraft_version || '');
      const modVersion = encodeURIComponent(mod.version || '');
      directDownloadUrl = `/download/${filename}?modName=${modName}&modLoader=${modLoader}&minecraftVersion=${minecraftVersion}&modVersion=${modVersion}`;
    }

    if (req.user?.id) {
      try {
        console.log('📝 Criando log de download...');
        await LogService.logDownloads(
          req.user.id,
          'Mod baixado',
          `Usuário baixou o mod: ${mod.name || mod.title || id}`,
          req.ip || 'N/A',
          req.get('User-Agent') || 'N/A',
          id,
          {
            mod_title: mod.name || mod.title,
            mod_id: id,
            mod_version: mod.version,
            minecraft_version: mod.minecraft_version,
            mod_loader: mod.mod_loader
          }
        );
        console.log('✅ Log de download criado com sucesso');
      } catch (logErr) {
        console.error('❌ Erro ao criar log de download:', logErr);
        logError('Erro ao criar log de download', logErr, { userId: req.user.id, modId: id });
      }
    }

    res.json({
      success: true,
      message: 'Download registrado com sucesso',
      data: {
        download_url: directDownloadUrl,
        original_url: downloadUrl,
        mod_name: mod.name || mod.title
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

// busca avançada com filtros
export const advancedSearch = async (req, res) => {
  try {
    const { 
      q,
      version,
      loader,
      category,
      sort,
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

// buscar tipos de conteúdo disponíveis
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

// buscar contagem de mods por categoria
export const getModsCount = async (req, res) => {
  try {
    const counts = await ModsModel.getModsCount();
    const statsService = (await import('../services/StatsService.js')).default;
    const stats = statsService.getAllStats();
    
    const result = {
      ...counts,
      totalDownloads: stats.totalDownloads !== null && stats.totalDownloads !== undefined ? parseInt(stats.totalDownloads) : 0,
      avgDownloadsPerMod: stats.avgDownloadsPerMod !== null && stats.avgDownloadsPerMod !== undefined ? parseFloat(stats.avgDownloadsPerMod) : 0,
      statsLastUpdated: stats.lastUpdated
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logError('Erro ao buscar contagem de mods', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

const viewCache = new Map();

// registrar visualização do mod
export const registerView = async (req, res) => {
  try {
    const { id } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';

    const cacheKey = `${ipAddress}_${id}`;
    const now = Date.now();

    if (viewCache.has(cacheKey)) {
      const lastView = viewCache.get(cacheKey);
      const timeDiff = now - lastView;

      if (timeDiff < 5000) { 
        return res.json({
          success: true,
          message: 'Visualização já registrada recentemente',
          data: { cached: true }
        });
      }
    }

    viewCache.set(cacheKey, now);

    for (const [key, timestamp] of viewCache.entries()) {
      if (now - timestamp > 60000) {
        viewCache.delete(key);
      }
    }

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

// registrar download
export const registerDownload = async (req, res) => {
  try {
    const { modId } = req.params;
    const userId = req.user?.id || null;

    const result = await ModsModel.registerDownload(modId, userId);

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

// buscar contagem total de downloads do usuário
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

// buscar histórico de downloads do usuário
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

    let dateCondition = '';
    const now = new Date();

    switch (period) {
      case 'today':

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

// alternar favorito do mod
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

    console.log('🔍 toggleFavorite - Iniciando:', { modId: id, userId });

    const result = await ModsModel.toggleFavorite(id, userId);
    console.log('✅ toggleFavorite - Resultado:', result);
    
    const mod = await ModsModel.findById(id);
    console.log('📦 Mod encontrado:', { id: mod?.id, title: mod?.title || mod?.name });

    if (result.isFavorite) {
      try {
      await trackActivity({
        userId,
        modId: id,
        activityType: 'favorite',
        activityData: {
          category: result.mod?.category || 'Geral'
        }
      });
      } catch (activityError) {
        console.error('⚠️ Erro ao trackActivity:', activityError);
      }
      
      try {
        console.log('📝 Criando log de favorito...');
        const logResult = await LogService.logFavorites(
          userId,
          'Mod favoritado',
          `Usuário favoritou o mod: ${mod?.title || mod?.name || id}`,
          req.ip || 'N/A',
          req.get('User-Agent') || 'N/A',
          id,
          {
            mod_title: mod?.title || mod?.name,
            mod_id: id
          }
        );
        console.log('✅ Log de favorito criado:', logResult);
      } catch (logErr) {
        console.error('❌ Erro ao criar log de favorito:', logErr);
        logError('Erro ao criar log de favorito', logErr, { userId, modId: id });
      }
    } else {
      try {
      await untrackActivity({
        userId,
        modId: id,
        activityType: 'favorite'
      });
      } catch (activityError) {
        console.error('⚠️ Erro ao untrackActivity:', activityError);
      }
      
      try {
        console.log('📝 Criando log de desfavorito...');
        const logResult = await LogService.logFavorites(
          userId,
          'Mod desfavoritado',
          `Usuário removeu dos favoritos o mod: ${mod?.title || mod?.name || id}`,
          req.ip || 'N/A',
          req.get('User-Agent') || 'N/A',
          id,
          {
            mod_title: mod?.title || mod?.name,
            mod_id: id
          }
        );
        console.log('✅ Log de desfavorito criado:', logResult);
      } catch (logErr) {
        console.error('❌ Erro ao criar log de desfavorito:', logErr);
        logError('Erro ao criar log de desfavorito', logErr, { userId, modId: id });
      }
    }

    res.json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) { 
    console.error('❌ Erro geral em toggleFavorite:', error);
    logError('Erro ao alternar favorito', error, { modId: req.params.id, userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// verificar se mod está nos favoritos
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

// buscar todos os favoritos do usuário
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
