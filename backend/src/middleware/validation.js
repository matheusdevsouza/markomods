import { body, param, query, validationResult } from 'express-validator';
import { logWarn } from '../config/logger.js';

// Middleware para verificar erros de validação
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    logWarn('Erro de validação', {
      url: req.originalUrl,
      method: req.method,
      errors: errorMessages
    });
    
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errorMessages
    });
  }
  
  next();
};

// Validações para autenticação
export const validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username deve ter entre 3 e 50 caracteres')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username deve conter apenas letras, números, hífens e underscores'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Senha deve ter pelo menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número'),
  
  body('display_name')
    .notEmpty()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome de exibição deve ter entre 2 e 100 caracteres'),
  
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória'),
  
  handleValidationErrors
];

export const validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  
  handleValidationErrors
];

export const validateResetPassword = [
  body('token')
    .notEmpty()
    .withMessage('Token é obrigatório'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Senha deve ter pelo menos 8 caracteres'),
  
  handleValidationErrors
];

// Validações para usuários
export const validateUpdateProfile = [
  body('display_name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Nome de exibição deve ter no máximo 100 caracteres'),
  
  handleValidationErrors
];

export const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Senha atual é obrigatória'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Nova senha deve ter pelo menos 8 caracteres'),
  
  handleValidationErrors
];

// Validações para mods
export const validateCreateMod = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Título deve ter entre 3 e 255 caracteres'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Descrição deve ter entre 10 e 500 caracteres'),
  
  body('long_description_markdown')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Descrição longa deve ter pelo menos 10 caracteres'),
  
  body('minecraft_version')
    .trim()
    .notEmpty()
    .withMessage('Versão do Minecraft é obrigatória'),
  
  body('mod_loader')
    .isIn(['forge', 'fabric', 'quilt', 'other'])
    .withMessage('Mod loader deve ser forge, fabric, quilt ou other'),
  
  body('category_id')
    .optional()
    .isUUID()
    .withMessage('ID da categoria deve ser um UUID válido'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags deve ser um array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Cada tag deve ter entre 1 e 100 caracteres'),
  
  handleValidationErrors
];

export const validateUpdateMod = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Título deve ter entre 3 e 255 caracteres'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Descrição deve ter entre 10 e 500 caracteres'),
  
  body('long_description_markdown')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Descrição longa deve ter pelo menos 10 caracteres'),
  
  body('minecraft_version')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Versão do Minecraft não pode estar vazia'),
  
  body('mod_loader')
    .optional()
    .isIn(['forge', 'fabric', 'quilt', 'other'])
    .withMessage('Mod loader deve ser forge, fabric, quilt ou other'),
  
  body('category_id')
    .optional()
    .isUUID()
    .withMessage('ID da categoria deve ser um UUID válido'),
  
  handleValidationErrors
];

// Validações para comentários
export const validateCreateComment = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comentário deve ter entre 1 e 1000 caracteres'),
  
  body('parent_id')
    .optional()
    .isUUID()
    .withMessage('ID do comentário pai deve ser um UUID válido'),
  
  handleValidationErrors
];

export const validateUpdateComment = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comentário deve ter entre 1 e 1000 caracteres'),
  
  handleValidationErrors
];

// Validações para busca
export const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Termo de busca deve ter entre 1 e 100 caracteres'),
  
  query('category')
    .optional()
    .isUUID()
    .withMessage('ID da categoria deve ser um UUID válido'),
  
  query('minecraft_version')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Versão do Minecraft não pode estar vazia'),
  
  query('mod_loader')
    .optional()
    .isIn(['forge', 'fabric', 'quilt', 'other'])
    .withMessage('Mod loader deve ser forge, fabric, quilt ou other'),
  
  query('sort')
    .optional()
    .isIn(['relevance', 'newest', 'oldest', 'popular', 'downloads', 'views'])
    .withMessage('Ordenação inválida'),
  
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Ordem deve ser asc ou desc'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número inteiro maior que 0'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser um número entre 1 e 100'),
  
  handleValidationErrors
];

// Validações para parâmetros de rota
export const validateUUID = [
  param('id')
    .isUUID()
    .withMessage('ID deve ser um UUID válido'),
  
  handleValidationErrors
];

export const validateModId = [
  param('modId')
    .isUUID()
    .withMessage('ID do mod deve ser um UUID válido'),
  
  handleValidationErrors
];

export const validateUserId = [
  param('userId')
    .isUUID()
    .withMessage('ID do usuário deve ser um UUID válido'),
  
  handleValidationErrors
];

export const validateCommentId = [
  param('commentId')
    .isUUID()
    .withMessage('ID do comentário deve ser um UUID válido'),
  
  handleValidationErrors
];

// Validações para admin
export const validateUpdateUserRole = [
  body('role')
    .isIn(['member', 'moderator', 'admin', 'super_admin'])
    .withMessage('Role deve ser member, moderator, admin ou super_admin'),
  
  handleValidationErrors
];

export const validateBanUser = [
  body('is_banned')
    .isBoolean()
    .withMessage('is_banned deve ser true ou false'),
  
  body('ban_reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Motivo do ban deve ter no máximo 500 caracteres'),
  
  handleValidationErrors
];

