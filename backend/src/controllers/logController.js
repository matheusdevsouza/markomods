import { LogService } from '../services/LogService.js';
import { logError } from '../config/logger.js';

export const getLogs = async (req, res) => {
  try {
    const { 
      level, 
      category, 
      search, 
      limit = 25, 
      userId, 
      resourceType, 
      dateFrom, 
      dateTo,
      page = 1,
      roleFilter = 'all'
    } = req.query;
    
    const filters = {
      level: level || 'all',
      category: category || 'all',
      search: search || '',
      limit: parseInt(limit),
      userId: userId || null,
      resourceType: resourceType || null,
      dateFrom: dateFrom || null,
      dateTo: dateTo || null,
      page: parseInt(page),
      roleFilter: roleFilter || 'all'
    };
    
    const result = await LogService.getLogs(filters);
    
    res.json({
      success: true,
      data: result.logs || [],
      pagination: result.pagination || {
        page: 1,
        limit: 25,
        total: 0,
        totalPages: 0
      }
    });
  } catch (error) {
    logError('Erro ao buscar logs', error, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const getRecentActivity = async (req, res) => {
  try {
    const { roleFilter = 'admin' } = req.query;
    
    const filters = {
      limit: 10,
      page: 1,
      roleFilter: roleFilter || 'admin'
    };
    
    const result = await LogService.getLogs(filters);
    
    res.json({
      success: true,
      data: result.logs || []
    });
  } catch (error) {
    console.error('❌ Erro no controller getRecentActivity:', error);
    console.error('❌ Stack:', error.stack);
    try {
    logError('Erro ao buscar atividade recente', error, { userId: req.user?.id });
    } catch (logErr) {
      console.error('❌ Erro ao criar log de erro:', logErr);
    }
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getLogsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 50, page = 1 } = req.query;
    
    const filters = {
      category,
      limit: parseInt(limit),
      page: parseInt(page)
    };
    
    const result = await LogService.getLogs(filters);
    
    res.json({
      success: true,
      data: result.logs,
      pagination: result.pagination,
      category
    });
  } catch (error) {
    logError('Erro ao buscar logs por categoria', error, { userId: req.user?.id, category: req.params.category });
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const getLogsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 100, page = 1 } = req.query;
    
    const filters = {
      userId,
      limit: parseInt(limit),
      page: parseInt(page)
    };
    
    const result = await LogService.getLogs(filters);
    
    res.json({
      success: true,
      data: result.logs,
      pagination: result.pagination,
      userId
    });
  } catch (error) {
    logError('Erro ao buscar logs por usuário', error, { userId: req.user?.id, targetUserId: req.params.userId });
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const getLogsByResource = async (req, res) => {
  try {
    const { resourceType, resourceId } = req.params;
    const { limit = 100, page = 1 } = req.query;
    
    const filters = {
      resourceType,
      resourceId,
      limit: parseInt(limit),
      page: parseInt(page)
    };
    
    const result = await LogService.getLogs(filters);
    
    res.json({
      success: true,
      data: result.logs,
      pagination: result.pagination,
      resourceType,
      resourceId
    });
  } catch (error) {
    logError('Erro ao buscar logs por recurso', error, { userId: req.user?.id, resourceType: req.params.resourceType, resourceId: req.params.resourceId });
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const getLogsByDateRange = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const { limit = 200, page = 1 } = req.query;
    
    if (!dateFrom || !dateTo) {
      return res.status(400).json({
        success: false,
        message: 'Data de início e fim são obrigatórias'
      });
    }
    
    const filters = {
      dateFrom,
      dateTo,
      limit: parseInt(limit),
      page: parseInt(page)
    };
    
    const result = await LogService.getLogs(filters);
    
    res.json({
      success: true,
      data: result.logs,
      pagination: result.pagination,
      dateRange: { dateFrom, dateTo }
    });
  } catch (error) {
    logError('Erro ao buscar logs por período', error, { userId: req.user?.id, dateFrom: req.query.dateFrom, dateTo: req.query.dateTo });
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const getLogsSummary = async (req, res) => {
  try {
    const { period = '24h' } = req.query;
    
    let dateFrom = new Date();
    if (period === '7d') {
      dateFrom.setDate(dateFrom.getDate() - 7);
    } else if (period === '30d') {
      dateFrom.setDate(dateFrom.getDate() - 30);
    } else {
      dateFrom.setHours(dateFrom.getHours() - 24);
    }
    
    const filters = {
      dateFrom: dateFrom.toISOString(),
      limit: 1000,
      page: 1,
      roleFilter: 'all'
    };
    
    const result = await LogService.getLogs(filters);
    const logs = result.logs || [];
    
    const summary = {
      total: result.pagination?.total || 0,
      byCategory: {},
      byLevel: {},
      byHour: {},
      period
    };
    
    logs.forEach(log => {
      if (log.category) {
      if (!summary.byCategory[log.category]) {
        summary.byCategory[log.category] = 0;
      }
      summary.byCategory[log.category]++;
      }
      
      if (log.level) {
      if (!summary.byLevel[log.level]) {
        summary.byLevel[log.level] = 0;
      }
      summary.byLevel[log.level]++;
      }
      
      if (log.created_at) {
        try {
      const hour = new Date(log.created_at).getHours();
          if (!isNaN(hour)) {
      if (!summary.byHour[hour]) {
        summary.byHour[hour] = 0;
      }
      summary.byHour[hour]++;
          }
        } catch (dateError) {
          console.error('❌ Erro ao processar data do log:', dateError);
        }
      }
    });
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('❌ Erro no controller getLogsSummary:', error);
    console.error('❌ Stack:', error.stack);
    try {
    logError('Erro ao buscar resumo dos logs', error, { userId: req.user?.id });
    } catch (logErr) {
      console.error('❌ Erro ao criar log de erro:', logErr);
    }
    res.json({
      success: true,
      data: {
        total: 0,
        byCategory: {},
        byLevel: {},
        byHour: {},
        period: req.query.period || '24h'
      }
    });
  }
};

export const exportLogs = async (req, res) => {
  try {
    const { 
      level, 
      category, 
      search, 
      dateFrom, 
      dateTo,
      format = 'csv'
    } = req.query;
    
    const filters = {
      level: level || 'all',
      category: category || 'all',
      search: search || '',
      dateFrom: dateFrom || null,
      dateTo: dateTo || null,
      limit: 10000,
      page: 1
    };
    
    const result = await LogService.getLogs(filters);
    const logs = result.logs;
    
    if (format === 'json') {
      res.json({
        success: true,
        data: logs,
        exportInfo: {
          format: 'json',
          totalRecords: result.pagination.total,
          exportedAt: new Date().toISOString()
        }
      });
    } else {
      const csvContent = [
        ['Timestamp', 'Nível', 'Categoria', 'Ação', 'Usuário', 'IP', 'Recurso', 'Detalhes', 'Metadados'],
        ...logs.map(log => [
          log.created_at,
          log.level,
          log.category,
          log.action,
          log.username || log.display_name || 'Sistema',
          log.ip_address || 'N/A',
          log.resource_type ? `${log.resource_type}:${log.resource_id}` : 'N/A',
          log.details || '',
          log.metadata ? JSON.stringify(log.metadata) : ''
        ])
      ].map(row => row.join(',')).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=logs_${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvContent);
    }
  } catch (error) {
    logError('Erro ao exportar logs', error, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const clearOldLogs = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    res.json({
      success: true,
      message: `Funcionalidade de limpeza de logs será implementada em breve. Serão removidos logs mais antigos que ${days} dias.`
    });
  } catch (error) {
    logError('Erro ao limpar logs antigos', error, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};








