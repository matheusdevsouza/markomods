import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// função para verificar os magicnumbers
const checkMagicNumbers = (filePath, expectedMimeType) => {
  try {
    const buffer = fs.readFileSync(filePath);
    const signature = Array.from(buffer.slice(0, 8));
    
    const magicNumbers = {
      'image/jpeg': [0xFF, 0xD8, 0xFF],
      'image/png': [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
      'image/webp': [0x52, 0x49, 0x46, 0x46], 
      'image/gif': [0x47, 0x49, 0x46, 0x38] 
    };
    
    const expectedSignature = magicNumbers[expectedMimeType];
    if (!expectedSignature) return false;
    
    // verificar se a assinatura corresponde
    return expectedSignature.every((byte, index) => signature[index] === byte);
  } catch (error) {
    console.error('Erro ao verificar magic numbers:', error);
    return false;
  }
};

// garantir diretório
const ensureDir = (dirPath) => {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  } catch {}
};

// configuração de armazenamento para thumbnail, vídeo e arquivos de download
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dir;
    if (file.fieldname === 'thumbnail_file') {
      dir = path.join(__dirname, '../../uploads/thumbnails');
    } else if (file.fieldname === 'video_file') {
      dir = path.join(__dirname, '../../uploads/videos');
    } else if (file.fieldname === 'download_file_pc' || file.fieldname === 'download_file_mobile') {
      dir = path.join(__dirname, '../../uploads/downloads');
    } else {
      dir = path.join(__dirname, '../../uploads');
    }
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    let prefix;
    
    if (file.fieldname === 'thumbnail_file') {
      prefix = 'thumbnail';
    } else if (file.fieldname === 'video_file') {
      prefix = 'video';
    } else if (file.fieldname === 'download_file_pc') {
      prefix = 'download-pc';
    } else if (file.fieldname === 'download_file_mobile') {
      prefix = 'download-mobile';
    } else {
      prefix = 'file';
    }
    
    if ((file.fieldname === 'download_file_pc' || file.fieldname === 'download_file_mobile') && req.body.name) {
      const modName = req.body.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50);
      
      if (modName) {
        cb(null, `${prefix}-${modName}-${uniqueSuffix}${ext}`);
        return;
      }
    }
    
    cb(null, `${prefix}-${uniqueSuffix}${ext}`);
  }
});

// filtro de arquivos com regras específicas por campo
const fileFilter = (req, file, cb) => {
  const isThumbnail = file.fieldname === 'thumbnail_file';
  const isVideo = file.fieldname === 'video_file';
  const isDownloadPc = file.fieldname === 'download_file_pc';
  const isDownloadMobile = file.fieldname === 'download_file_mobile';

  if (!isThumbnail && !isVideo && !isDownloadPc && !isDownloadMobile) {
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
  } else if (isDownloadPc || isDownloadMobile) {
    const allowedMimeTypes = [
      'application/java-archive',
      'application/zip',
      'application/x-zip-compressed',
      'application/octet-stream',
      'application/x-java-archive',
      'application/x-zip',
      'application/zip-compressed',
      'application/x-jar',
      'application/x-mcpack',
      'application/x-mcaddon',
      'application/vnd.java.archive',
      'application/vnd.zip',
      'application/force-download',
      'application/download' 
    ];
    const allowedExtensions = ['.jar', '.zip', '.mcpack', '.mcaddon'];
    
    console.log(`Upload de arquivo de download: ${file.originalname}, MIME: ${mime}, Extensão: ${ext}`);
    
    if (!allowedExtensions.includes(ext)) {
      console.log(`Extensão não permitida: ${ext}`);
      return cb(new Error(`Extensão de arquivo não suportada: ${ext}. Permitidas: ${allowedExtensions.join(', ')}`), false);
    }
    
    if (!allowedMimeTypes.includes(mime)) {
      console.log(`MIME type não reconhecido: ${mime}, mas permitindo por extensão`);
    }
  }

  cb(null, true);
};

// configuração do limite geral para suportar vídeo e arquivos de download
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 210 * 1024 * 1024, 
    files: 4
  }
});

// middleware para upload de thumb/video/download de mod
export const uploadModMedia = upload.fields([
  { name: 'thumbnail_file', maxCount: 1 },
  { name: 'video_file', maxCount: 1 },
  { name: 'download_file_pc', maxCount: 1 },
  { name: 'download_file_mobile', maxCount: 1 }
]);

// validação e anexação de metadados dos arquivos
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

  const downloadFilePc = files.download_file_pc?.[0];
  if (downloadFilePc) {
    req.downloadPcInfo = {
      filename: downloadFilePc.filename,
      path: downloadFilePc.path,
      mimetype: downloadFilePc.mimetype,
      size: downloadFilePc.size,
      validated: true
    };
  }

  const downloadFileMobile = files.download_file_mobile?.[0];
  if (downloadFileMobile) {
    req.downloadMobileInfo = {
      filename: downloadFileMobile.filename,
      path: downloadFileMobile.path,
      mimetype: downloadFileMobile.mimetype,
      size: downloadFileMobile.size,
      validated: true
    };
  }

  next();
};

// configuração para upload de avatares
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/avatars'));
  },
  filename: (req, file, cb) => {

    // gerar um nome único para o arquivo (padronizar e evitar uma possivel duplicaçao)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, 
    files: 1
  }
});



// middleware para upload de avatar
export const uploadAvatar = avatarUpload.single('avatar');

// filtro de arquivos para imagens do editor
const editorFileFilter = (req, file, cb) => {
  const isEditorImage = file.fieldname === 'image';

  if (!isEditorImage) {
    return cb(new Error('Campo de upload não suportado'), false);
  }

  const suspiciousChars = /[<>:"/\\|?*\x00-\x1f]/;
  if (suspiciousChars.test(file.originalname)) {
    return cb(new Error('Nome de arquivo contém caracteres inválidos'), false);
  }

  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  
  if (!allowedMimeTypes.includes(mime) || !allowedExtensions.includes(ext)) {
    return cb(new Error('Tipo de imagem não suportado'), false);
  }

  cb(null, true);
};

// configuração para upload de imagens do editor
const editorStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/editor-images');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `editor-${uniqueSuffix}${ext}`);
  }
});

const editorUpload = multer({
  storage: editorStorage,
  fileFilter: editorFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, 
    files: 1
  }
});

// middleware para upload de imagens do editor
export const uploadEditorImage = editorUpload.single('image');

export default upload;





