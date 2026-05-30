import fs from 'fs';
import path from 'path';

const STORAGE_TYPE = process.env.STORAGE_TYPE || 'local';
const BASE_PATH = process.env.LOCAL_STORAGE_PATH || './uploads';

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function zeroPad(num, places = 3) {
  return String(num).padStart(places, '0');
}

export function saveChunk(sessionId, questionIndex, chunkIndex, buffer) {
  if (STORAGE_TYPE !== 'local') {
    throw new Error(`Storage type "${STORAGE_TYPE}" is not yet implemented. Use "local".`);
  }

  const dirPath = path.join(BASE_PATH, sessionId, `q${questionIndex}`);
  ensureDir(dirPath);

  const fileName = `chunk_${zeroPad(chunkIndex)}.webm`;
  const filePath = path.join(dirPath, fileName);

  fs.writeFileSync(filePath, buffer);

  return filePath;
}

export function getChunkPaths(sessionId, questionIndex) {
  if (STORAGE_TYPE !== 'local') {
    throw new Error(`Storage type "${STORAGE_TYPE}" is not yet implemented. Use "local".`);
  }

  const dirPath = path.join(BASE_PATH, sessionId, `q${questionIndex}`);

  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const files = fs.readdirSync(dirPath)
    .filter((file) => file.startsWith('chunk_') && file.endsWith('.webm'))
    .sort((a, b) => {
      const numA = parseInt(a.replace('chunk_', '').replace('.webm', ''), 10);
      const numB = parseInt(b.replace('chunk_', '').replace('.webm', ''), 10);
      return numA - numB;
    })
    .map((file) => path.join(dirPath, file));

  return files;
}

export function saveMergedFile(sessionId, questionIndex, buffer) {
  if (STORAGE_TYPE !== 'local') {
    throw new Error(`Storage type "${STORAGE_TYPE}" is not yet implemented. Use "local".`);
  }

  const dirPath = path.join(BASE_PATH, sessionId);
  ensureDir(dirPath);

  const fileName = `q${questionIndex}_merged.webm`;
  const filePath = path.join(dirPath, fileName);

  fs.writeFileSync(filePath, buffer);

  return filePath;
}

export function getMergedFilePath(sessionId, questionIndex) {
  if (STORAGE_TYPE !== 'local') {
    throw new Error(`Storage type "${STORAGE_TYPE}" is not yet implemented. Use "local".`);
  }

  const filePath = path.join(BASE_PATH, sessionId, `q${questionIndex}_merged.webm`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  return filePath;
}

export function deleteChunks(sessionId, questionIndex) {
  if (STORAGE_TYPE !== 'local') {
    throw new Error(`Storage type "${STORAGE_TYPE}" is not yet implemented. Use "local".`);
  }

  const dirPath = path.join(BASE_PATH, sessionId, `q${questionIndex}`);

  if (!fs.existsSync(dirPath)) {
    return;
  }

  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error(`Failed to delete chunk ${filePath}:`, err.message);
    }
  }

  try {
    fs.rmdirSync(dirPath);
  } catch (err) {
    console.error(`Failed to remove chunk directory ${dirPath}:`, err.message);
  }
}

export function getFileStream(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  return fs.createReadStream(filePath);
}
