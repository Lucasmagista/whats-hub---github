import { useState } from 'react';

export default function Perfil() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');
  const [msg, setMsg] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    // Aqui você pode salvar no backend ou localStorage
    setMsg('Dados salvos com sucesso!');
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome completo" className="w-full border p-2 rounded" />
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="E-mail" type="email" className="w-full border p-2 rounded" />
        <input value={endereco} onChange={e => setEndereco(e.target.value)} placeholder="Endereço" className="w-full border p-2 rounded" />
        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700">Salvar</button>
      </form>
      {msg && <div className="text-green-700 text-center mb-4">{msg}</div>}
    </div>
  );
}
