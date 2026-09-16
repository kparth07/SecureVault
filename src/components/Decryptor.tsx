import React, { useState, useRef } from 'react';
import { decryptFile } from '../crypto/engine';
import { formatBytes } from '../utils/format';

export default function Decryptor({ onBack }: { onBack: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [originalFilename, setOriginalFilename] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setDownloadUrl(null);
      setError(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setDownloadUrl(null);
      setError(null);
    }
  };

  const handleDecrypt = async () => {
    if (!file || !password) {
      setError("Please select a file and enter a password.");
      return;
    }

    // Large File Safety Check (500MB)
    const MAX_FILE_SIZE = 1024 * 1024 * 500;
    if (file.size > MAX_FILE_SIZE) {
      setError("This file is too large to safely process on this device. Max safe size is 500MB.");
      return;
    }
    
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setDownloadUrl(null);

    try {
      const originalFile = await decryptFile(file, password, (p) => setProgress(p));
      const url = URL.createObjectURL(originalFile);
      setDownloadUrl(url);
      setOriginalFilename(originalFile.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Decryption failed. The password may be incorrect or the file may have been modified.");
    } finally {
      setIsProcessing(false);
    }
  };

  let statusText = "Waiting for file";
  if (file && !isProcessing && !downloadUrl) statusText = "Ready to decrypt";
  if (isProcessing) statusText = "Decrypting...";
  if (downloadUrl) statusText = "Decryption complete";
  if (error) statusText = "Decryption failed";

  return (
    <div className="max-w-2xl mx-auto py-12 px-gutter animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={onBack} className="flex items-center gap-2 text-on-surface-variant dark:text-gray-400 hover:text-primary dark:text-indigo-400 mb-8 transition-colors">
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Back to Dashboard
      </button>

      <div className="bg-surface-container-lowest dark:bg-gray-900/50 rounded-3xl p-8 border border-outline-variant/30 dark:border-gray-700 shadow-xl shadow-indigo-500/5">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-container/20 dark:bg-indigo-900/40 text-primary dark:text-indigo-400 flex items-center justify-center">
              <span className="material-symbols-outlined">lock_open</span>
            </div>
            <div>
              <h2 className="text-headline-md font-headline-md text-on-surface dark:text-gray-100">Decrypt a File</h2>
              <p className="text-body-sm text-on-surface-variant dark:text-gray-400">{statusText}</p>
            </div>
          </div>
        </div>

        {/* File Dropzone */}
        {!file ? (
          <div 
            onDragOver={(e) => e.preventDefault()} 
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-48 rounded-2xl border-2 border-dashed border-outline-variant/50 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-surface-container-low dark:bg-gray-800 transition-all mb-8 group"
          >
            <span className="material-symbols-outlined text-4xl text-outline mb-2 group-hover:text-primary dark:text-indigo-400 transition-colors">inventory_2</span>
            <p className="text-body-md text-on-surface dark:text-gray-100 font-medium">Drop your .svault file here</p>
            <p className="text-body-sm text-on-surface-variant dark:text-gray-400 mt-1">or click to browse</p>
            <input type="file" accept=".svault" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
          </div>
        ) : (
          <div className="w-full rounded-2xl border border-primary/30 bg-primary/5 dark:bg-indigo-900/20 p-4 flex flex-col mb-8 gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="material-symbols-outlined text-primary dark:text-indigo-400" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                <div className="truncate">
                  <p className="text-body-md font-medium text-on-surface dark:text-gray-100 truncate">{file.name}</p>
                  <p className="text-label-sm text-on-surface-variant dark:text-gray-400">{formatBytes(file.size)} &bull; {file.type || '.svault'}</p>
                </div>
              </div>
              {!isProcessing && !downloadUrl && (
                <button onClick={() => setFile(null)} className="p-2 text-outline hover:text-error transition-colors rounded-full hover:bg-error/10">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>

            {downloadUrl && (
              <div className="pt-4 border-t border-primary/20 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-primary dark:text-indigo-400">
                  <span className="material-symbols-outlined text-sm">arrow_downward</span>
                  <p className="text-body-md font-medium truncate">{originalFilename}</p>
                </div>
                <div className="flex gap-2 text-label-sm text-on-surface-variant dark:text-gray-400">
                  <span className="bg-surface-container-high dark:bg-gray-700 px-2 py-0.5 rounded text-xs font-mono">AES-256-GCM</span>
                  <span className="bg-surface-container-high dark:bg-gray-700 px-2 py-0.5 rounded text-xs font-mono">Argon2id</span>
                  <span className="bg-surface-container-high dark:bg-gray-700 px-2 py-0.5 rounded text-xs font-mono">Verified</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Password Input */}
        <div className="space-y-2 mb-8">
          <label className="text-label-md text-on-surface-variant dark:text-gray-400">Decryption Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isProcessing || downloadUrl !== null}
              className="w-full bg-surface-container-low dark:bg-gray-800 border border-outline-variant/30 dark:border-gray-700 rounded-xl px-4 py-3 text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:opacity-50 pr-12"
              placeholder="Enter the password used to encrypt this file"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface dark:text-gray-100"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 rounded-xl bg-error-container text-on-error-container flex items-start gap-3 text-body-sm">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <p>{error}</p>
          </div>
        )}

        {/* Progress & Actions */}
        {isProcessing ? (
          <div className="space-y-3">
            <div className="flex justify-between text-label-md">
              <span className="text-on-surface-variant dark:text-gray-400">Decrypting...</span>
              <span className="text-primary dark:text-indigo-400 font-medium">{Math.round(progress * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-surface-container-high dark:bg-gray-700est rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        ) : downloadUrl ? (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-start gap-3 text-body-sm border border-emerald-500/20">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <p>File successfully decrypted and verified.</p>
            </div>
            <a 
              href={downloadUrl}
              download={originalFilename || "decrypted_file"}
              className="w-full bg-primary text-on-primary py-4 rounded-xl font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20"
            >
              <span className="material-symbols-outlined">download</span>
              Download {originalFilename}
            </a>
            <button 
              onClick={() => { setFile(null); setPassword(''); setDownloadUrl(null); }}
              className="w-full bg-surface-container-high dark:bg-gray-700 text-on-surface dark:text-gray-100 py-3 rounded-xl font-medium hover:bg-surface-container-high dark:bg-gray-700est transition-all"
            >
              Decrypt Another File
            </button>
          </div>
        ) : (
          <button 
            onClick={handleDecrypt}
            disabled={!file || !password}
            className="w-full bg-primary text-on-primary py-4 rounded-xl font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20"
          >
            <span className="material-symbols-outlined">lock_open</span>
            Decrypt File
          </button>
        )}
      </div>
    </div>
  );
}


