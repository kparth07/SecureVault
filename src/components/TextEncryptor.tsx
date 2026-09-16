import { useState } from 'react';
import { encryptFile, decryptFile } from '../crypto/engine';

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

export default function TextEncryptor({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [output, setOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleProcess = async () => {
    if (!input || !password) {
      setError("Please enter both text and a password.");
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    setOutput('');

    try {
      if (mode === 'encrypt') {
        // Treat the text as a simple text file
        const file = new File([input], "message.txt", { type: "text/plain", lastModified: Date.now() });
        const svaultBlob = await encryptFile(file, password);
        const arrayBuffer = await svaultBlob.arrayBuffer();
        const base64 = arrayBufferToBase64(arrayBuffer);
        setOutput(base64);
      } else {
        // Mode is decrypt
        const arrayBuffer = base64ToArrayBuffer(input.trim());
        const blob = new Blob([arrayBuffer]);
        const decryptedFile = await decryptFile(blob, password);
        const text = await decryptedFile.text();
        setOutput(text);
      }
      
      // Clear the input box for privacy once processed successfully
      setInput('');
    } catch (err) {
      if (mode === 'decrypt') {
        setError("Decryption failed. The password may be incorrect, or the input may be invalid/tampered.");
      } else {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
              <span className="material-symbols-outlined">edit_note</span>
            </div>
            <div>
              <h2 className="text-headline-md font-headline-md text-on-surface dark:text-gray-100">Text Encryptor</h2>
              <p className="text-body-sm text-on-surface-variant dark:text-gray-400">Securely encrypt and decrypt messages</p>
            </div>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-surface-container-low dark:bg-gray-800 p-1 rounded-xl mb-8">
          <button 
            onClick={() => { setMode('encrypt'); setInput(''); setOutput(''); setPassword(''); setError(null); }}
            className={`flex-1 py-2 rounded-lg text-label-md font-medium transition-all ${mode === 'encrypt' ? 'bg-surface-container-lowest dark:bg-gray-900/50 shadow text-primary dark:text-indigo-400' : 'text-on-surface-variant dark:text-gray-400 hover:text-on-surface dark:text-gray-100'}`}
          >
            Encrypt
          </button>
          <button 
            onClick={() => { setMode('decrypt'); setInput(''); setOutput(''); setPassword(''); setError(null); }}
            className={`flex-1 py-2 rounded-lg text-label-md font-medium transition-all ${mode === 'decrypt' ? 'bg-surface-container-lowest dark:bg-gray-900/50 shadow text-primary dark:text-indigo-400' : 'text-on-surface-variant dark:text-gray-400 hover:text-on-surface dark:text-gray-100'}`}
          >
            Decrypt
          </button>
        </div>

        {/* Input Textarea */}
        <div className="space-y-2 mb-6">
          <label className="text-label-md text-on-surface-variant dark:text-gray-400">
            {mode === 'encrypt' ? 'Plaintext Message' : 'Encrypted Ciphertext (Base64)'}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-32 bg-surface-container-low dark:bg-gray-800 border border-outline-variant/30 dark:border-gray-700 rounded-xl px-4 py-3 text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none font-mono"
            placeholder={mode === 'encrypt' ? 'Type your secret message here...' : 'Paste your encrypted message here...'}
          />
        </div>

        {/* Password Input */}
        <div className="space-y-2 mb-8">
          <label className="text-label-md text-on-surface-variant dark:text-gray-400">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isProcessing}
              className="w-full bg-surface-container-low dark:bg-gray-800 border border-outline-variant/30 dark:border-gray-700 rounded-xl px-4 py-3 text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:opacity-50 pr-12"
              placeholder={mode === 'encrypt' ? 'Enter a strong password' : 'Enter the decryption password'}
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

        {/* Action Button */}
        <button 
          onClick={handleProcess}
          disabled={!input || !password || isProcessing}
          className="w-full bg-primary text-on-primary py-4 rounded-xl font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20 mb-8"
        >
          {isProcessing ? (
            <span className="material-symbols-outlined animate-spin">sync</span>
          ) : (
            <span className="material-symbols-outlined">{mode === 'encrypt' ? 'lock' : 'lock_open'}</span>
          )}
          {isProcessing ? 'Processing...' : mode === 'encrypt' ? 'Encrypt Text' : 'Decrypt Text'}
        </button>

        {/* Output */}
        {output && (
          <div className="space-y-2 pt-8 border-t border-outline-variant/20 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <label className="text-label-md text-primary dark:text-indigo-400 font-medium">
                {mode === 'encrypt' ? 'Encrypted Ciphertext' : 'Decrypted Message'}
              </label>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1 text-label-sm text-on-surface-variant dark:text-gray-400 hover:text-primary dark:text-indigo-400 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">{copied ? 'check' : 'content_copy'}</span>
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="w-full bg-primary/5 dark:bg-indigo-900/20 border border-primary/20 rounded-xl p-4 text-body-sm font-mono break-all text-on-surface dark:text-gray-100 h-32 overflow-y-auto select-all">
              {output}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


