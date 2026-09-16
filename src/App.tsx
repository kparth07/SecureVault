import React, { useState } from 'react';
import PasswordGenerator from './components/PasswordGenerator';
import Encryptor from './components/Encryptor';
import Decryptor from './components/Decryptor';
import TextEncryptor from './components/TextEncryptor';
import ThemeToggle from './components/ThemeToggle';

type View = 'landing' | 'encrypt' | 'decrypt' | 'passwords' | 'text' | 'privacy' | 'terms' | 'security';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';
const REPO_URL = import.meta.env.VITE_REPO_URL || '';

function App() {
  const [activeView, setActiveView] = useState<View>('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigate = (view: View, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setActiveView(view);
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-[#0d1117] text-on-surface dark:text-gray-100 transition-colors duration-200">
      <header className="bg-surface/80 dark:bg-[#0d1117]/80 backdrop-blur-md docked full-width top sticky z-50 border-b border-outline-variant/20 dark:border-gray-800">
        <div className="flex justify-between items-center w-full px-gutter py-space-sm max-w-7xl mx-auto">
          <div className="flex items-center gap-2 cursor-pointer z-50" onClick={() => handleNavigate('landing')}>
            <div className="w-9 h-9 rounded-xl bg-primary-container dark:bg-indigo-900/50 flex items-center justify-center text-on-primary-container dark:text-indigo-400 shadow-sm">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>shield_locked</span>
            </div>
            <a className="text-headline-sm font-headline-sm font-semibold text-on-surface dark:text-gray-100 tracking-tight">SecureVault</a>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a onClick={(e) => handleNavigate('encrypt', e)} className="cursor-pointer text-on-surface-variant dark:text-gray-400 hover:text-primary dark:hover:text-indigo-400 transition-colors duration-200 font-medium">Encrypt</a>
            <a onClick={(e) => handleNavigate('decrypt', e)} className="cursor-pointer text-on-surface-variant dark:text-gray-400 hover:text-primary dark:hover:text-indigo-400 transition-colors duration-200 font-medium">Decrypt</a>
            <a onClick={(e) => handleNavigate('text', e)} className="cursor-pointer text-on-surface-variant dark:text-gray-400 hover:text-primary dark:hover:text-indigo-400 transition-colors duration-200 font-medium">Text</a>
            <a onClick={(e) => handleNavigate('passwords', e)} className="cursor-pointer text-on-surface-variant dark:text-gray-400 hover:text-primary dark:hover:text-indigo-400 transition-colors duration-200 font-medium">Passwords</a>
          </nav>
          
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <a onClick={() => handleNavigate('encrypt')} className="cursor-pointer bg-primary-container dark:bg-indigo-600 text-on-primary-container dark:text-white px-4 py-2 rounded-xl text-label-md font-medium shadow-sm hover:opacity-90 transition-opacity">Encrypt a file</a>
          </div>

          <div className="md:hidden flex items-center gap-2 z-50">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-on-surface-variant dark:text-gray-400">
              <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-surface dark:bg-[#0d1117] border-b border-outline-variant/20 dark:border-gray-800 p-4 flex flex-col gap-4 shadow-xl z-40">
            <a onClick={(e) => handleNavigate('encrypt', e)} className="px-4 py-3 rounded-lg hover:bg-surface-container-low dark:hover:bg-gray-800 text-on-surface dark:text-gray-200 font-medium">Encrypt a File</a>
            <a onClick={(e) => handleNavigate('decrypt', e)} className="px-4 py-3 rounded-lg hover:bg-surface-container-low dark:hover:bg-gray-800 text-on-surface dark:text-gray-200 font-medium">Decrypt a File</a>
            <a onClick={(e) => handleNavigate('text', e)} className="px-4 py-3 rounded-lg hover:bg-surface-container-low dark:hover:bg-gray-800 text-on-surface dark:text-gray-200 font-medium">Text Encryptor</a>
            <a onClick={(e) => handleNavigate('passwords', e)} className="px-4 py-3 rounded-lg hover:bg-surface-container-low dark:hover:bg-gray-800 text-on-surface dark:text-gray-200 font-medium">Password Generator</a>
            <div className="border-t border-outline-variant/20 dark:border-gray-800 my-2 pt-4 px-4 flex justify-between items-center">
              <span className="text-label-sm text-on-surface-variant dark:text-gray-500">Theme Preference</span>
              <ThemeToggle />
            </div>
          </div>
        )}
      </header>

      {activeView === 'landing' && (
        <>
          <main className="max-w-7xl mx-auto px-gutter pt-space-xl pb-space-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed/50 dark:bg-indigo-900/30 text-on-primary-fixed dark:text-indigo-300 text-label-sm font-medium">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                  PRIVATE BY DESIGN
                </div>
                <h1 className="text-headline-xl text-on-surface dark:text-gray-100 tracking-tight font-headline-xl">
                  Your files. <br/>Finally private.
                </h1>
                <p className="text-body-lg text-on-surface-variant dark:text-gray-400 max-w-lg">
                  SecureVault encrypts your files and text directly on your device. Your password and plaintext never need to leave your browser.
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <button onClick={() => handleNavigate('encrypt')} className="bg-primary dark:bg-indigo-600 text-on-primary dark:text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-indigo-500/10 dark:shadow-none hover:bg-primary/90 dark:hover:bg-indigo-500 transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined">lock</span>
                    Encrypt a file
                  </button>
                  <button onClick={() => handleNavigate('decrypt')} className="bg-surface-container-high dark:bg-gray-800 text-on-surface dark:text-gray-200 px-6 py-3 rounded-xl font-medium hover:bg-surface-container-highest dark:hover:bg-gray-700 transition-all flex items-center gap-2 border border-outline-variant/30 dark:border-gray-700">
                    <span className="material-symbols-outlined">key</span>
                    Decrypt a file
                  </button>
                </div>
                <div className="flex flex-wrap gap-6 pt-6 border-t border-outline-variant/20 dark:border-gray-800 text-on-surface-variant dark:text-gray-500 text-body-sm">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary dark:text-indigo-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    No account required
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary dark:text-indigo-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    Client-side encryption
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary dark:text-indigo-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    AES-256-GCM
                  </div>
                </div>
              </div>

              {/* Hero Visual */}
              <div className="lg:col-span-6 relative">
                <div className="absolute -inset-4 bg-gradient-to-tr from-primary-container/20 to-secondary-fixed/40 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-3xl blur-2xl -z-10"></div>
                {DEMO_MODE ? (
                  <div className="bg-surface-container-lowest/80 dark:bg-gray-900/80 backdrop-blur-xl border border-outline-variant/30 dark:border-gray-800 rounded-3xl p-8 shadow-xl shadow-indigo-500/5 dark:shadow-none relative">
                    <div className="absolute -top-3 -right-3 bg-error dark:bg-red-900 text-white dark:text-red-100 px-2 py-1 text-[10px] font-bold rounded shadow-lg uppercase tracking-wider">Demo Mode</div>
                    <div className="flex items-center justify-between pb-6 border-b border-outline-variant/20 dark:border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-error/80 dark:bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-400 dark:bg-amber-500"></div>
                        <div className="w-3 h-3 rounded-full bg-emerald-400 dark:bg-emerald-500"></div>
                      </div>
                      <span className="text-label-sm text-outline dark:text-gray-500 font-mono">SECUREVAULT_ENGINE_V2.4</span>
                    </div>
                    
                    <div className="py-12 flex flex-col items-center justify-center space-y-8">
                      <div className="relative w-full max-w-md bg-surface-container-low dark:bg-gray-800/50 rounded-2xl p-6 border border-outline-variant/20 dark:border-gray-700 flex items-center justify-between group hover:border-primary/50 dark:hover:border-indigo-500/50 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary-container/20 dark:bg-indigo-900/40 text-primary dark:text-indigo-400 flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">description</span>
                          </div>
                          <div>
                            <div className="text-body-md font-medium text-on-surface dark:text-gray-200">document.pdf</div>
                            <div className="text-body-sm text-outline dark:text-gray-500">2.4 MB &bull; Unencrypted source</div>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-outline dark:text-gray-600">arrow_forward</span>
                      </div>
                      
                      <div className="w-10 h-10 rounded-full bg-primary dark:bg-indigo-600 text-on-primary dark:text-white flex items-center justify-center shadow-md dark:shadow-none animate-bounce">
                        <span className="material-symbols-outlined">lock</span>
                      </div>
                      
                      <div className="relative w-full max-w-md bg-primary/5 dark:bg-indigo-900/20 rounded-2xl p-6 border border-primary/30 dark:border-indigo-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary dark:bg-indigo-600 text-on-primary dark:text-white flex items-center justify-center shadow-sm">
                            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                          </div>
                          <div>
                            <div className="text-body-md font-medium text-primary dark:text-indigo-300">document.svault</div>
                            <div className="text-body-sm text-on-surface-variant dark:text-indigo-200/70">AES-256-GCM &bull; Securely sealed</div>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-primary dark:text-indigo-400" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-outline-variant/20 dark:border-gray-800 text-label-md text-on-surface-variant dark:text-gray-400 gap-4">
                      <span>Status: Ready for deployment</span>
                      <a onClick={() => handleNavigate('security')} className="text-primary dark:text-indigo-400 font-medium hover:underline flex-shrink-0 cursor-pointer">Client-Side Privacy Model</a>
                    </div>
                  </div>
                ) : (
                  <div className="bg-surface-container-lowest/80 dark:bg-gray-900/80 backdrop-blur-xl border border-outline-variant/30 dark:border-gray-800 rounded-3xl p-8 shadow-xl shadow-indigo-500/5 dark:shadow-none flex flex-col items-center justify-center min-h-[420px] text-center space-y-8">
                    <div className="w-24 h-24 rounded-full bg-primary-container/30 dark:bg-indigo-900/30 text-primary dark:text-indigo-400 flex items-center justify-center shadow-inner">
                      <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield_locked</span>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-headline-sm font-headline-sm text-on-surface dark:text-gray-100">Zero-Knowledge Processing</h3>
                      <p className="text-body-md text-on-surface-variant dark:text-gray-400 max-w-sm mx-auto text-balance">
                        Your files are securely encrypted locally in your browser. Plaintext and keys never touch our servers.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-6 border-t border-outline-variant/20 dark:border-gray-800 w-full">
                      <span className="bg-surface-container-high dark:bg-gray-800 px-3 py-1 rounded-full text-xs font-mono text-on-surface-variant dark:text-gray-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">vpn_key</span> AES-256-GCM
                      </span>
                      <span className="bg-surface-container-high dark:bg-gray-800 px-3 py-1 rounded-full text-xs font-mono text-on-surface-variant dark:text-gray-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">memory</span> Argon2id KDF
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center pt-2 w-full gap-2">
                      <a onClick={() => handleNavigate('security')} className="text-primary dark:text-indigo-400 text-label-md font-medium hover:underline cursor-pointer">View Security Architecture</a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>

          <section className="max-w-7xl mx-auto px-gutter py-space-xl">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <h2 className="text-headline-lg font-headline-lg text-on-surface dark:text-gray-100">What would you like to protect?</h2>
              <p className="text-body-lg text-on-surface-variant dark:text-gray-400">Select a module below to begin your secure local encryption workflow.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div onClick={() => handleNavigate('encrypt')} className="cursor-pointer bg-surface-container-lowest dark:bg-gray-900/50 rounded-3xl p-6 border border-outline-variant/30 dark:border-gray-800 hover:shadow-lg hover:border-primary/40 dark:hover:border-indigo-500/50 transition-all flex flex-col justify-between group" id="encrypt">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-container/20 dark:bg-indigo-900/40 text-primary dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">upload_file</span>
                  </div>
                  <h3 className="text-headline-sm font-headline-sm text-on-surface dark:text-gray-200">Encrypt a file</h3>
                  <p className="text-body-sm text-on-surface-variant dark:text-gray-400">PDFs, photos, documents and more.</p>
                </div>
                <div className="pt-8">
                  <a className="inline-flex items-center gap-2 text-label-md text-primary dark:text-indigo-400 font-medium group-hover:underline">
                    Launch encryptor <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </a>
                </div>
              </div>
              
              <div onClick={() => handleNavigate('text')} className="cursor-pointer bg-surface-container-lowest dark:bg-gray-900/50 rounded-3xl p-6 border border-outline-variant/30 dark:border-gray-800 hover:shadow-lg hover:border-primary/40 dark:hover:border-indigo-500/50 transition-all flex flex-col justify-between group" id="text">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-container/20 dark:bg-indigo-900/40 text-primary dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">edit_note</span>
                  </div>
                  <h3 className="text-headline-sm font-headline-sm text-on-surface dark:text-gray-200">Protect text</h3>
                  <p className="text-body-sm text-on-surface-variant dark:text-gray-400">Secure sensitive text locally.</p>
                </div>
                <div className="pt-8">
                  <a className="inline-flex items-center gap-2 text-label-md text-primary dark:text-indigo-400 font-medium group-hover:underline">
                    Open notepad <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </a>
                </div>
              </div>
              
              <div onClick={() => handleNavigate('passwords')} className="cursor-pointer bg-surface-container-lowest dark:bg-gray-900/50 rounded-3xl p-6 border border-outline-variant/30 dark:border-gray-800 hover:shadow-lg hover:border-primary/40 dark:hover:border-indigo-500/50 transition-all flex flex-col justify-between group" id="passwords">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-container/20 dark:bg-indigo-900/40 text-primary dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">key</span>
                  </div>
                  <h3 className="text-headline-sm font-headline-sm text-on-surface dark:text-gray-200">Generate a password</h3>
                  <p className="text-body-sm text-on-surface-variant dark:text-gray-400">Create a strong password in seconds.</p>
                </div>
                <div className="pt-8">
                  <a className="inline-flex items-center gap-2 text-label-md text-primary dark:text-indigo-400 font-medium group-hover:underline">
                    Generate now <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </a>
                </div>
              </div>
              
              <div onClick={() => handleNavigate('decrypt')} className="cursor-pointer bg-surface-container-lowest dark:bg-gray-900/50 rounded-3xl p-6 border border-outline-variant/30 dark:border-gray-800 hover:shadow-lg hover:border-primary/40 dark:hover:border-indigo-500/50 transition-all flex flex-col justify-between group" id="decrypt">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-container/20 dark:bg-indigo-900/40 text-primary dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">lock_open</span>
                  </div>
                  <h3 className="text-headline-sm font-headline-sm text-on-surface dark:text-gray-200">Decrypt a .svault</h3>
                  <p className="text-body-sm text-on-surface-variant dark:text-gray-400">Restore your original file.</p>
                </div>
                <div className="pt-8">
                  <a className="inline-flex items-center gap-2 text-label-md text-primary dark:text-indigo-400 font-medium group-hover:underline">
                    Decrypt file <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section className="max-w-7xl mx-auto px-gutter py-space-xl" id="security">
            <div className="bg-surface-container-low dark:bg-[#161b22] rounded-3xl p-12 border border-outline-variant/20 dark:border-gray-800">
              <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                <h2 className="text-headline-lg font-headline-lg text-on-surface dark:text-gray-100">Security without the complexity</h2>
                <p className="text-body-lg text-on-surface-variant dark:text-gray-400">How SecureVault ensures total data privacy using zero-knowledge client architecture.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-surface-container-lowest dark:bg-gray-900/50 p-8 rounded-2xl border border-outline-variant/20 dark:border-gray-800 space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-primary dark:bg-indigo-600 text-on-primary dark:text-white flex items-center justify-center font-bold">01</div>
                  <h3 className="text-headline-sm font-headline-sm text-on-surface dark:text-gray-200">Your device</h3>
                  <p className="text-body-sm text-on-surface-variant dark:text-gray-400">All cryptographic operations run directly inside your browser via WebCrypto API. Data never touches external servers.</p>
                </div>
                
                <div className="bg-surface-container-lowest dark:bg-gray-900/50 p-8 rounded-2xl border border-outline-variant/20 dark:border-gray-800 space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-primary dark:bg-indigo-600 text-on-primary dark:text-white flex items-center justify-center font-bold">02</div>
                  <h3 className="text-headline-sm font-headline-sm text-on-surface dark:text-gray-200">Your password</h3>
                  <p className="text-body-sm text-on-surface-variant dark:text-gray-400">Your decryption key is derived locally using Argon2id with strict memory and time costs. We cannot reset or recover lost passwords.</p>
                </div>
                
                <div className="bg-surface-container-lowest dark:bg-gray-900/50 p-8 rounded-2xl border border-outline-variant/20 dark:border-gray-800 space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-primary dark:bg-indigo-600 text-on-primary dark:text-white flex items-center justify-center font-bold">03</div>
                  <h3 className="text-headline-sm font-headline-sm text-on-surface dark:text-gray-200">Your data</h3>
                  <p className="text-body-sm text-on-surface-variant dark:text-gray-400">Encrypted outputs are safely stored or transferred only after being transformed into fully sealed binary format.</p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {activeView === 'passwords' && <PasswordGenerator onBack={() => handleNavigate('landing')} />}
      {activeView === 'encrypt' && <Encryptor onBack={() => handleNavigate('landing')} />}
      {activeView === 'decrypt' && <Decryptor onBack={() => handleNavigate('landing')} />}
      {activeView === 'text' && <TextEncryptor onBack={() => handleNavigate('landing')} />}

      {activeView === 'privacy' && (
        <div className="max-w-3xl mx-auto py-12 px-gutter">
          <button onClick={() => handleNavigate('landing')} className="mb-8 flex items-center gap-2 text-on-surface-variant dark:text-gray-400 hover:text-primary dark:hover:text-indigo-400">
            <span className="material-symbols-outlined">arrow_back</span> Back
          </button>
          <h1 className="text-headline-lg mb-6 dark:text-gray-100">Privacy Policy</h1>
          <div className="prose dark:prose-invert">
            <p><strong>Effective Date:</strong> Today</p>
            <p>SecureVault is a zero-knowledge architecture application. Because all data processing happens locally in your browser through the Web Crypto API, we collect absolutely no data regarding your files, passwords, or plaintext content.</p>
            <h3>1. Local Processing</h3>
            <p>When you select a file or enter text, it is loaded into the device's RAM. It is never transmitted to any external server.</p>
            <h3>2. Cookies and Tracking</h3>
            <p>We do not use analytics, tracking pixels, or third-party cookies.</p>
          </div>
        </div>
      )}

      {activeView === 'terms' && (
        <div className="max-w-3xl mx-auto py-12 px-gutter">
          <button onClick={() => handleNavigate('landing')} className="mb-8 flex items-center gap-2 text-on-surface-variant dark:text-gray-400 hover:text-primary dark:hover:text-indigo-400">
            <span className="material-symbols-outlined">arrow_back</span> Back
          </button>
          <h1 className="text-headline-lg mb-6 dark:text-gray-100">Terms of Service</h1>
          <div className="prose dark:prose-invert">
            <p>By using SecureVault, you acknowledge that you are using a client-side cryptographic tool provided "as-is".</p>
            <h3>No Recovery</h3>
            <p>Because SecureVault is zero-knowledge, we cannot recover your passwords or decrypted data if you lose your encryption key. You are solely responsible for managing your keys.</p>
          </div>
        </div>
      )}

      {activeView === 'security' && (
        <div className="max-w-3xl mx-auto py-12 px-gutter">
          <button onClick={() => handleNavigate('landing')} className="mb-8 flex items-center gap-2 text-on-surface-variant dark:text-gray-400 hover:text-primary dark:hover:text-indigo-400">
            <span className="material-symbols-outlined">arrow_back</span> Back
          </button>
          <h1 className="text-headline-lg mb-6 dark:text-gray-100">Security Documentation</h1>
          <div className="prose dark:prose-invert">
            <p>SecureVault's security model is designed around the principle of Zero-Knowledge local processing.</p>
            <h3>Cryptography</h3>
            <ul>
              <li><strong>Algorithm:</strong> AES-256-GCM</li>
              <li><strong>KDF:</strong> Argon2id</li>
              <li><strong>Chunking:</strong> Files are processed in chunks for memory safety, each authenticated independently.</li>
            </ul>
            <h3>Audits</h3>
            <p>While SecureVault relies on industry-standard algorithms, the application as a whole has not been independently audited. Use at your own risk.</p>
          </div>
        </div>
      )}

      <footer className="border-t border-outline-variant/20 dark:border-gray-800 mt-20 py-12 bg-surface-container-low dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-gutter flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-container dark:bg-indigo-900/50 flex items-center justify-center text-on-primary-container dark:text-indigo-400">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
            </div>
            <span className="text-label-md font-semibold text-on-surface dark:text-gray-300">SecureVault Protocol 2026</span>
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-6 text-label-md text-on-surface-variant dark:text-gray-500 mt-4 md:mt-0">
            <a className="hover:text-primary dark:hover:text-indigo-400 transition-colors cursor-pointer" onClick={() => handleNavigate('privacy')}>Privacy Policy</a>
            <a className="hover:text-primary dark:hover:text-indigo-400 transition-colors cursor-pointer" onClick={() => handleNavigate('terms')}>Terms of Service</a>
            {REPO_URL && <a className="hover:text-primary dark:hover:text-indigo-400 transition-colors cursor-pointer" href={REPO_URL} target="_blank" rel="noopener noreferrer">Open Source</a>}
            <a className="hover:text-primary dark:hover:text-indigo-400 transition-colors cursor-pointer" onClick={() => handleNavigate('security')}>Security Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

