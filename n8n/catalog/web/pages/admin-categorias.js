import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [editando, setEditando] = useState(null);
  const [loading, setLoading] = useState(false);

  async function fetchCategorias() {
    setLoading(true);
    try {
      const res = await axios.get('/api/categories');
      setCategorias(res.data);
    } catch {
      setMensagem('Erro ao buscar categorias.');
    }
    setLoading(false);
  }

  useEffect(() => { fetchCategorias(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMensagem('');
    try {
      if (editando) {
        await axios.put(`/api/categories/${editando.id}`, { name: nome, description: descricao });
        setMensagem('Categoria atualizada!');
      } else {
        await axios.post('/api/categories', { name: nome, description: descricao });
        setMensagem('Categoria criada!');
      }
      setNome(''); setDescricao(''); setEditando(null);
      fetchCategorias();
    } catch {
      setMensagem('Erro ao salvar categoria.');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Deseja excluir esta categoria?')) return;
    setMensagem('');
    try {
      await axios.delete(`/api/categories/${id}`);
      setMensagem('Categoria excluída!');
      fetchCategorias();
    } catch {
      setMensagem('Erro ao excluir categoria.');
    }
  }

  function handleEdit(cat) {
    setEditando(cat);
    setNome(cat.name);
    setDescricao(cat.description || '');
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Administração de Categorias</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mb-10">
        <input value={nome} onChange={e => setNome(e.target.value)} required placeholder="Nome" className="w-full border p-2 rounded" />
        <input value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Descrição" className="w-full border p-2 rounded" />
        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700">
          {editando ? 'Atualizar' : 'Cadastrar'} Categoria
        </button>
        {editando && <button type="button" onClick={() => { setEditando(null); setNome(''); setDescricao(''); }} className="ml-4 text-gray-600 underline">Cancelar edição</button>}
      </form>
      {mensagem && <div className="mb-4 text-center text-sm text-blue-700">{mensagem}</div>}
      <h2 className="text-xl font-semibold mb-4">Categorias cadastradas</h2>
      {loading ? <div>Carregando...</div> : (
        <ul className="divide-y divide-gray-200">
          {categorias.map(cat => (
            <li key={cat.id} className="py-3 flex items-center gap-4">
              <div className="flex-1">
                <div className="font-bold">{cat.name}</div>
                <div className="text-sm text-gray-500">{cat.description}</div>
              </div>
              <button onClick={() => handleEdit(cat)} className="text-blue-600 hover:underline mr-2">Editar</button>
              <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:underline">Excluir</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
