import { useState } from 'react';
import { useRouter } from 'next/router';

export default function AdminLogin() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const router = useRouter();

  function handleLogin(e) {
    e.preventDefault();
    setErro('');
    // Simples: usuário admin, senha admin123 (troque para produção!)
    if (usuario === 'admin' && senha === 'admin123') {
      localStorage.setItem('admin_auth', 'true');
      router.push('/admin');
    } else {
      setErro('Usuário ou senha inválidos');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow max-w-sm w-full space-y-4" aria-label="Formulário de login admin">
        <h1 className="text-2xl font-bold mb-4 text-center">Login Admin</h1>
        <label htmlFor="usuario" className="sr-only">Usuário</label>
        <input id="usuario" value={usuario} onChange={e => setUsuario(e.target.value)} placeholder="Usuário" className="w-full border p-2 rounded" autoComplete="username" required />
        <label htmlFor="senha" className="sr-only">Senha</label>
        <input id="senha" value={senha} onChange={e => setSenha(e.target.value)} placeholder="Senha" type="password" className="w-full border p-2 rounded" autoComplete="current-password" required />
        {erro && <div className="text-red-600 text-sm text-center" role="alert">{erro}</div>}
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700">Entrar</button>
      </form>
    </div>
  );
}
