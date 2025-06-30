
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function AdminProdutos() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('admin_auth')) {
      router.replace('/admin/login');
    }
  }, [router]);
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState('');
  const [imagem, setImagem] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Buscar produtos existentes
  async function fetchProdutos() {
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await axios.get(`${API_URL}/products`);
      setProdutos(res.data);
    } catch {
      setMensagem('Erro ao buscar produtos.');
    }
    setLoading(false);
  }

  // Carregar produtos ao abrir
  useEffect(() => { fetchProdutos(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMensagem('');
    try {
      await axios.post(`${API_URL}/products`, {
        name: nome,
        price: preco,
        stock: estoque,
        imageUrl: imagem
      });
      setMensagem('Produto cadastrado com sucesso!');
      setNome(''); setPreco(''); setEstoque(''); setImagem('');
      fetchProdutos();
    } catch {
      setMensagem('Erro ao cadastrar produto.');
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Administração de Produtos</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mb-10">
        <input value={nome} onChange={e => setNome(e.target.value)} required placeholder="Nome" className="w-full border p-2 rounded" />
        <input value={preco} onChange={e => setPreco(e.target.value)} required placeholder="Preço" type="number" min="0" step="0.01" className="w-full border p-2 rounded" />
        <input value={estoque} onChange={e => setEstoque(e.target.value)} required placeholder="Estoque" type="number" min="0" className="w-full border p-2 rounded" />
        <input value={imagem} onChange={e => setImagem(e.target.value)} placeholder="URL da Imagem" className="w-full border p-2 rounded" />
        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700">Cadastrar Produto</button>
      </form>
      {mensagem && <div className="mb-4 text-center text-sm text-blue-700">{mensagem}</div>}
      <h2 className="text-xl font-semibold mb-4">Produtos cadastrados</h2>
      {loading ? <div>Carregando...</div> : (
        <ul className="divide-y divide-gray-200">
          {produtos.map(prod => (
            <li key={prod.id} className="py-3 flex items-center gap-4">
              <img src={prod.imageUrl || '/placeholder.png'} alt={prod.name} className="w-16 h-16 object-cover rounded" />
              <div className="flex-1">
                <div className="font-bold">{prod.name}</div>
                <div className="text-sm">R$ {Number(prod.price).toFixed(2)} | Estoque: {prod.stock}</div>
              </div>
              <button
                onClick={async () => {
                  const novoNome = prompt('Novo nome do produto:', prod.name);
                  if (!novoNome) return;
                  const novoPreco = prompt('Novo preço:', prod.price);
                  if (!novoPreco) return;
                  const novoEstoque = prompt('Novo estoque:', prod.stock);
                  if (!novoEstoque) return;
                  const novaImagem = prompt('Nova URL da imagem:', prod.imageUrl || '');
                  setMensagem('');
                  try {
                    await axios.put(`${API_URL}/products/${prod.id}`, {
                      name: novoNome,
                      price: novoPreco,
                      stock: novoEstoque,
                      imageUrl: novaImagem
                    });
                    setMensagem('Produto atualizado!');
                    fetchProdutos();
                  } catch {
                    setMensagem('Erro ao atualizar produto.');
                  }
                }}
                className="text-blue-600 hover:underline mr-2"
              >Editar</button>
              <button
                onClick={async () => {
                  if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
                  setMensagem('');
                  try {
                    await axios.delete(`${API_URL}/products/${prod.id}`);
                    setMensagem('Produto excluído!');
                    fetchProdutos();
                  } catch {
                    setMensagem('Erro ao excluir produto.');
                  }
                }}
                className="text-red-600 hover:underline"
              >Excluir</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
