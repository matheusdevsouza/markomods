import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para verificar magic numbers (assinatura real do arquivo)
const checkMagicNumbers = (filePath, expectedMimeType) => {
  try {
    const buffer = fs.readFileSync(filePath);
    const signature = Array.from(buffer.slice(0, 8));
    
    const magicNumbers = {
      'image/jpeg': [0xFF, 0xD8, 0xFF],
      'image/png': [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
      'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF
      'image/gif': [0x47, 0x49, 0x46, 0x38] // GIF8
    };
    
    const expectedSignature = magicNumbers[expectedMimeType];
    if (!expectedSignature) return false;
    
    // Verificar se a assinatura corresponde
    return expectedSignature.every((byte, index) => signature[index] === byte);
  } catch (error) {
    console.error('Erro ao verificar magic numbers:', error);
    return false;
  }
};

// Configuração do storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/thumbnails'));
  },
  filename: (req, file, cb) => {
    // Gerar nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `thumbnail-${uniqueSuffix}${ext}`);
  }
});

// Filtro de arquivos ULTRA RIGOROSO para máxima segurança
const fileFilter = (req, file, cb) => {
  // Lista de tipos MIME permitidos
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  
  // Verificar se o tipo MIME está na lista permitida
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error(`Tipo de arquivo não suportado. Tipos aceitos: ${allowedMimeTypes.join(', ')}`), false);
  }
  
  // Verificar extensão do arquivo
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (!allowedExtensions.includes(fileExtension)) {
    return cb(new Error(`Extensão de arquivo não permitida. Extensões aceitas: ${allowedExtensions.join(', ')}`), false);
  }
  
  // Verificar se o nome do arquivo não contém caracteres suspeitos
  const suspiciousChars = /[<>:"/\\|?*\x00-\x1f]/;
  if (suspiciousChars.test(file.originalname)) {
    return cb(new Error('Nome de arquivo contém caracteres inválidos'), false);
  }
  
  // Verificar tamanho do arquivo (já limitado pelo multer, mas dupla verificação)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size && file.size > maxSize) {
    return cb(new Error('Arquivo muito grande. Tamanho máximo: 5MB'), false);
  }
  
  
  cb(null, true);
};

// Configuração do multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1 // Apenas 1 arquivo
  }
});

// Middleware para upload de thumbnail
export const uploadThumbnail = upload.single('thumbnail_file');

// Middleware para verificar se o arquivo foi enviado e validar magic numbers
export const validateThumbnail = (req, res, next) => {
  if (req.file) {
    // Verificar magic numbers para garantir que o arquivo é realmente do tipo declarado
    const isValidFile = checkMagicNumbers(req.file.path, req.file.mimetype);
    
    if (!isValidFile) {
      // Remover arquivo suspeito
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Arquivo corrompido ou tipo inválido. Verificação de assinatura falhou.'
      });
    }
    
    // Arquivo foi enviado e validado, adicionar informações ao request
    req.thumbnailInfo = {
      filename: req.file.filename,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      validated: true
    };

  }
  next();
};

// Configuração para upload de avatares
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/avatars'));
  },
  filename: (req, file, cb) => {
    // Gerar nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB para avatares
    files: 1
  }
});



// Middleware para upload de avatar
export const uploadAvatar = avatarUpload.single('avatar');

// Configuração para upload de imagens do editor
const editorStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/editor-images'));
  },
  filename: (req, file, cb) => {
    // Gerar nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `editor-${uniqueSuffix}${ext}`);
  }
});

const editorUpload = multer({
  storage: editorStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB para imagens do editor
    files: 1
  }
});

// Middleware para upload de imagens do editor
export const uploadEditorImage = editorUpload.single('image');

export default upload;



