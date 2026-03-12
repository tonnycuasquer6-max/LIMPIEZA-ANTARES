/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { supabase } from '../services/supabase';

export default function Auth({ onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(''); 

    // VALIDACIÓN OBLIGATORIA
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Por favor, ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onClose(); 
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setErrorMsg('Registro exitoso. Revisa tu correo electrónico.');
      }
    } catch (error) {
      setErrorMsg(error.message || 'Ocurrió un error de autenticación.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  const hexagonClipPath = {
    clipPath: 'polygon(15px 0, calc(100% - 15px) 0, 100% 50%, calc(100% - 15px) 100%, 15px 100%, 0 50%)'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-serif animate-fade-in">
      
      {/* FONDO DEL FORMULARIO: CRISTAL DESENFOCADO CLARO */}
      <div className="bg-white/5 backdrop-blur-3xl border border-white/10 w-full max-w-md p-8 md:p-12 relative shadow-2xl rounded-sm">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors bg-transparent border-none outline-none cursor-pointer w-8 h-8 flex items-center justify-center"
        >
          <svg stroke="currentColor" fill="none" strokeWidth="1.5" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <div className="flex justify-center gap-8 border-b border-white/10 mb-8 pb-4 mt-2">
          <button 
            onClick={() => { setIsLogin(true); setErrorMsg(''); }}
            className={`text-xs tracking-[0.2em] uppercase font-bold bg-transparent border-none outline-none cursor-pointer transition-colors relative ${isLogin ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Iniciar Sesión
            {isLogin && <div className="absolute -bottom-[17px] left-0 w-full h-0.5 bg-white"></div>}
          </button>
          <button 
            onClick={() => { setIsLogin(false); setErrorMsg(''); }}
            className={`text-xs tracking-[0.2em] uppercase font-bold bg-transparent border-none outline-none cursor-pointer transition-colors relative ${!isLogin ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Registrarse
            {!isLogin && <div className="absolute -bottom-[17px] left-0 w-full h-0.5 bg-white"></div>}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {errorMsg && (
            <div className="text-red-500 text-[10px] tracking-[0.1em] uppercase text-center mb-2">
              {errorMsg}
            </div>
          )}

          {/* CAJA DE TEXTO: CRISTAL NEGRO BORROSO + FORMA HEXAGONAL */}
          <input 
            type="email" 
            placeholder="USUARIO O EMAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black/60 backdrop-blur-2xl text-white placeholder-gray-500 text-[10px] tracking-[0.2em] uppercase px-6 py-4 outline-none border-none shadow-[inset_0_1px_3px_rgba(255,255,255,0.05)]"
            style={hexagonClipPath}
          />

          {/* CAJA DE TEXTO: CRISTAL NEGRO BORROSO + FORMA HEXAGONAL */}
          <input 
            type="password" 
            placeholder="CONTRASEÑA"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black/60 backdrop-blur-2xl text-white placeholder-gray-500 text-[10px] tracking-[0.2em] uppercase px-6 py-4 outline-none border-none shadow-[inset_0_1px_3px_rgba(255,255,255,0.05)]"
            style={hexagonClipPath}
          />

          {/* BOTÓN ENTRAR: BLANCO + FORMA HEXAGONAL */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-white hover:bg-gray-200 text-black text-[10px] font-bold tracking-[0.3em] uppercase py-4 mt-4 transition-colors border-none outline-none cursor-pointer disabled:opacity-50"
            style={hexagonClipPath}
          >
            {loading ? 'Procesando...' : (isLogin ? 'Entrar' : 'Crear Cuenta')}
          </button>
        </form>

        <hr className="border-white/10 my-8" />

        {/* BOTÓN GOOGLE: CRISTAL NEGRO BORROSO + FORMA HEXAGONAL */}
        <button 
          type="button"
          onClick={handleGoogleLogin}
          className="w-full mx-auto max-w-[200px] flex items-center justify-center gap-3 bg-black/60 backdrop-blur-2xl hover:bg-black/80 text-white text-[9px] font-bold tracking-[0.2em] uppercase py-3 transition-colors border-none outline-none cursor-pointer shadow-[inset_0_1px_3px_rgba(255,255,255,0.05)]"
          style={hexagonClipPath}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
              <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
              <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
              <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
              <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
            </g>
          </svg>
          Google Login
        </button>

      </div>
    </div>
  );
}