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

// Utilitário: garantir diretório
const ensureDir = (dirPath) => {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  } catch {}
};

// Configuração de storage única para múltiplos campos (thumbnail e vídeo)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isThumbnail = file.fieldname === 'thumbnail_file';
    const dir = isThumbnail
      ? path.join(__dirname, '../../uploads/thumbnails')
      : path.join(__dirname, '../../uploads/videos');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    const prefix = file.fieldname === 'thumbnail_file' ? 'thumbnail' : 'video';
    cb(null, `${prefix}-${uniqueSuffix}${ext}`);
  }
});

// Filtro de arquivos com regras específicas por campo
const fileFilter = (req, file, cb) => {
  const isThumbnail = file.fieldname === 'thumbnail_file';
  const isVideo = file.fieldname === 'video_file';

  if (!isThumbnail && !isVideo) {
    return cb(new Error('Campo de upload não suportado'), false);
  }

  const suspiciousChars = /[<>:"/\\|?*\x00-\x1f]/;
  if (suspiciousChars.test(file.originalname)) {
    return cb(new Error('Nome de arquivo contém caracteres inválidos'), false);
  }

  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (isThumbnail) {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    if (!allowedMimeTypes.includes(mime) || !allowedExtensions.includes(ext)) {
      return cb(new Error('Tipo de imagem não suportado'), false);
    }
  } else if (isVideo) {
    const allowedMimeTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/x-matroska', 'video/quicktime'];
    const allowedExtensions = ['.mp4', '.webm', '.ogg', '.mkv', '.mov'];
    if (!allowedMimeTypes.includes(mime) || !allowedExtensions.includes(ext)) {
      return cb(new Error('Tipo de vídeo não suportado'), false);
    }
  }

  cb(null, true);
};

// Configuração do multer (limite geral alto para suportar vídeo)
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 210 * 1024 * 1024, // 210MB
    files: 2
  }
});

// Middleware unificado para upload de mídia de mod (thumbnail + vídeo)
export const uploadModMedia = upload.fields([
  { name: 'thumbnail_file', maxCount: 1 },
  { name: 'video_file', maxCount: 1 }
]);

// Validação e anexação de metadados dos arquivos
export const validateModMedia = (req, res, next) => {
  const files = req.files || {};

  const imageFile = files.thumbnail_file?.[0];
  if (imageFile) {
    const isValidImage = checkMagicNumbers(imageFile.path, imageFile.mimetype);
    if (!isValidImage) {
      try { fs.unlinkSync(imageFile.path); } catch {}
      return res.status(400).json({ success: false, message: 'Thumbnail inválida (assinatura incorreta).' });
    }
    req.thumbnailInfo = {
      filename: imageFile.filename,
      path: imageFile.path,
      mimetype: imageFile.mimetype,
      size: imageFile.size,
      validated: true
    };
  }

  const videoFile = files.video_file?.[0];
  if (videoFile) {
    req.videoInfo = {
      filename: videoFile.filename,
      path: videoFile.path,
      mimetype: videoFile.mimetype,
      size: videoFile.size,
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



// Removidos: middlewares separados de vídeo (substituídos por uploadModMedia/validateModMedia)

