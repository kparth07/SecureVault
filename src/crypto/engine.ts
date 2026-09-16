import { deriveKey } from './kdf';
import { importAESKey, getChunkNonce, encryptChunk, decryptChunk } from './aes';
import { buildHeaderAAD, parseHeaderAAD } from './format';
import type { FileMetadata } from './format';
import { DEFAULT_CHUNK_SIZE, AES_GCM_NONCE_LENGTH } from './constants';

export async function encryptFile(
  file: File,
  password: string,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const fileMetadata: FileMetadata = {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: file.lastModified,
  };
  const jsonBytes = new TextEncoder().encode(JSON.stringify(fileMetadata));
  
  // 1. Derive Key
  const { key: rawKey, salt, params } = await deriveKey(password);
  const cryptoKey = await importAESKey(rawKey);
  
  // 2. Generate Base Nonce
  const baseNonce = crypto.getRandomValues(new Uint8Array(AES_GCM_NONCE_LENGTH));
  
  // 3. Prepare Header
  const totalChunks = Math.ceil(file.size / DEFAULT_CHUNK_SIZE);
  const aad = buildHeaderAAD({
    kdfMem: params.mem,
    kdfTime: params.time,
    kdfParallelism: params.parallelism,
    salt,
    baseNonce,
    chunkSize: DEFAULT_CHUNK_SIZE,
    totalChunks,
    fileMetadataBytes: jsonBytes,
  });
  
  // 4. Process File in Chunks
  const chunks: BlobPart[] = [aad as BlobPart]; // start the final file with the header AAD
  
  let offset = 0;
  for (let i = 0; i < totalChunks; i++) {
    const chunkBlob = file.slice(offset, offset + DEFAULT_CHUNK_SIZE);
    const chunkBuffer = await chunkBlob.arrayBuffer();
    
    const chunkNonce = getChunkNonce(baseNonce, i);
    const encryptedBuffer = await encryptChunk(cryptoKey, chunkNonce, chunkBuffer, aad);
    
    chunks.push(encryptedBuffer as BlobPart);
    offset += DEFAULT_CHUNK_SIZE;
    
    if (onProgress) {
      onProgress(Math.min((i + 1) / totalChunks, 1));
    }
  }
  
  return new Blob(chunks, { type: 'application/octet-stream' });
}

export async function decryptFile(
  svaultBlob: Blob,
  password: string,
  onProgress?: (progress: number) => void
): Promise<File> {
  // We need to read enough to parse the header.
  // The fixed metadata size is 58 bytes, plus the dynamic JSON string.
  // Let's read the first 64KB, which is more than enough for any reasonable JSON metadata.
  const maxHeaderRead = Math.min(svaultBlob.size, 64 * 1024);
  const headerPreviewBuffer = await svaultBlob.slice(0, maxHeaderRead).arrayBuffer();
  
  // 1. Parse Header
  let parsed;
  try {
    parsed = parseHeaderAAD(headerPreviewBuffer);
  } catch (error) {
    throw new Error("Decryption failed. The file may be invalid, or corrupted.");
  }
  
  const { header, headerLength } = parsed;
  
  // 2. Derive Key
  const { key: rawKey } = await deriveKey(password, header.salt, {
    mem: header.kdfMem,
    time: header.kdfTime,
    parallelism: header.kdfParallelism,
    hashLen: 32,
    type: 2
  });
  const cryptoKey = await importAESKey(rawKey);
  
  // Reconstruct AAD exactly as it was during encryption
  const aad = await svaultBlob.slice(0, headerLength).arrayBuffer();
  
  // 3. Process Ciphertext Chunks
  const decryptedChunks: BlobPart[] = [];
  let currentOffset = headerLength;
  let chunkIndex = 0;
  
  while (currentOffset < svaultBlob.size) {
    if (chunkIndex >= header.totalChunks) {
      throw new Error("Decryption failed. The file has more data than specified.");
    }
    
    // Each chunk size on disk = original payload size + 16 bytes (AES-GCM tag)
    // Wait, the final chunk will be smaller.
    // The exact size on disk can be derived. But since we stream, we can just read
    // up to (chunkSize + 16), or the rest of the file if it's the last chunk.
    const expectedDiskSize = (chunkIndex === header.totalChunks - 1)
      ? svaultBlob.size - currentOffset
      : header.chunkSize + 16;
      
    const encryptedBlob = svaultBlob.slice(currentOffset, currentOffset + expectedDiskSize);
    const encryptedBuffer = await encryptedBlob.arrayBuffer();
    
    const chunkNonce = getChunkNonce(header.baseNonce, chunkIndex);
    
    try {
      const decryptedBuffer = await decryptChunk(cryptoKey, chunkNonce, encryptedBuffer, aad);
      decryptedChunks.push(decryptedBuffer as BlobPart);
    } catch (err) {
      // If ANY chunk fails AAD verification or ciphertext tamper check, throw generic error
      throw new Error("Decryption failed. The password may be incorrect or the encrypted file may have been modified.");
    }
    
    currentOffset += expectedDiskSize;
    chunkIndex++;
    
    if (onProgress) {
      onProgress(Math.min(chunkIndex / header.totalChunks, 1));
    }
  }
  
  if (chunkIndex !== header.totalChunks) {
    throw new Error("Decryption failed. The encrypted file may have been modified (missing chunks).");
  }
  
  // 4. Reconstruct original file
  return new File(decryptedChunks, header.fileMetadata.name, {
    type: header.fileMetadata.type,
    lastModified: header.fileMetadata.lastModified,
  });
}
