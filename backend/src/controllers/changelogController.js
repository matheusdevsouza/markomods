import ChangelogModel from '../models/ChangelogModel.js';
import { logError } from '../config/logger.js';

export const createChangelog = async (req, res) => {
  try {
    const { title, slug, summary, tags = [], entries = [], is_published = false } = req.body || {};
    if (!title || !slug) return res.status(400).json({ success: false, message: 'title e slug são obrigatórios' });
    const item = await ChangelogModel.create({ title, slug, summary, tags, entries, is_published, author_id: req.user?.id });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    logError('Erro ao criar changelog', error);
    res.status(500).json({ success: false, message: 'Erro ao criar changelog' });
  }
};

export const updateChangelog = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await ChangelogModel.update(id, req.body || {});
    res.json({ success: true, data: updated });
  } catch (error) {
    logError('Erro ao atualizar changelog', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar changelog' });
  }
};

export const deleteChangelog = async (req, res) => {
  try {
    const { id } = req.params;
    await ChangelogModel.delete(id);
    res.json({ success: true, message: 'Changelog removido' });
  } catch (error) {
    logError('Erro ao deletar changelog', error);
    res.status(500).json({ success: false, message: 'Erro ao deletar changelog' });
  }
};

export const listPublicChangelogs = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const items = await ChangelogModel.listPublic(limit, offset);
    res.json({ success: true, data: items });
  } catch (error) {
    logError('Erro ao listar changelogs públicos', error);
    res.status(500).json({ success: false, message: 'Erro ao listar changelogs' });
  }
};

export const listAllChangelogs = async (req, res) => {
  try {
    const { limit = 50, offset = 0, search = '' } = req.query;
    const items = await ChangelogModel.listAll(limit, offset, search);
    res.json({ success: true, data: items });
  } catch (error) {
    logError('Erro ao listar changelogs', error);
    res.status(500).json({ success: false, message: 'Erro ao listar changelogs' });
  }
};

export const getChangelogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const item = await ChangelogModel.findBySlug(slug);
    if (!item || (!item.is_published && !['admin', 'super_admin', 'moderator'].includes(req.user?.role))) {
      return res.status(404).json({ success: false, message: 'Changelog não encontrado' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    logError('Erro ao buscar changelog por slug', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar changelog' });
  }
};


