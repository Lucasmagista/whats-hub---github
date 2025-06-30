
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useCart } from '../../components/CartContext';
import clsx from 'clsx';

export default function ProdutoDetalhe() {
  const router = useRouter();
  const { id } = router.query;
  const [produto, setProduto] = useState(null);
  const [imagens, setImagens] = useState([]);
  const [varSel, setVarSel] = useState(null);
  const [variacoes, setVariacoes] = useState([]);
  const [qtd, setQtd] = useState(1);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [imgIdx, setImgIdx] = useState(0);
  const [promo, setPromo] = useState(null);
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    axios.get(`${API_URL}/products/${id}`)
      .then(async res => {
        setProduto(res.data);
        setImagens(res.data.images || [res.data.imageUrl || '/placeholder.png']);
        // Buscar variações
        const vRes = await axios.get(`${API_URL}/products/${id}/variations`);
        setVariacoes(vRes.data);
        // Buscar promoções
        const promoRes = await axios.get(`${API_URL}/products/${id}/promo`).catch(() => null);
        if (promoRes?.data) setPromo(promoRes.data);
      })
      .catch(() => setErro('Produto não encontrado'))
      .finally(() => setLoading(false));
  }, [id]);

  function handleAddToCart() {
    if (!produto) return;
    setAdding(true);
    addToCart({
      productId: produto.id,
      productName: produto.name,
      variationId: varSel?.id || null,
      variation: varSel ? `${varSel.attribute}: ${varSel.value}` : null,
      unitPrice: promo ? promo.price : produto.price,
      quantity: qtd,
      imageUrl: imagens[imgIdx] || produto.imageUrl
    });
    setAdding(false);
    setToast('Produto adicionado ao carrinho!');
    setTimeout(() => setToast(null), 2000);
  }

  if (loading) return <div className="p-8 text-center animate-pulse">Carregando...</div>;
  if (erro) return <div className="p-8 text-center text-red-600">{erro}</div>;
  if (!produto) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-10 px-4">
        <button onClick={() => router.back()} className="mb-4 text-blue-600 hover:underline">← Voltar</button>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row gap-8">
          <div className="flex flex-col items-center md:w-80">
            <div className="relative w-full h-80 mb-2">
              <img src={imagens[imgIdx]} alt={produto.name} className="w-full h-80 object-cover rounded border" />
              {imagens.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                  {imagens.map((img, idx) => (
                    <button key={idx} onClick={() => setImgIdx(idx)} className={clsx('w-3 h-3 rounded-full', imgIdx === idx ? 'bg-blue-600' : 'bg-gray-300')}></button>
                  ))}
                </div>
              )}
            </div>
            {imagens.length > 1 && (
              <div className="flex gap-2 mt-2">
                {imagens.map((img, idx) => (
                  <img key={idx} src={img} alt="thumb" className={clsx('w-12 h-12 object-cover rounded cursor-pointer border', imgIdx === idx ? 'border-blue-600' : 'border-gray-200')} onClick={() => setImgIdx(idx)} />
                ))}
              </div>
            )}
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <h1 className="text-2xl font-bold">{produto.name}</h1>
            <div className="text-lg text-gray-700">{produto.description}</div>
            {promo ? (
              <div>
                <span className="text-2xl font-bold text-green-700 mr-2">R$ {Number(promo.price).toFixed(2)}</span>
                <span className="line-through text-gray-400">R$ {Number(produto.price).toFixed(2)}</span>
                <span className="ml-2 bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs font-bold">Promoção</span>
              </div>
            ) : (
              <div className="text-2xl font-bold text-green-700">R$ {Number(produto.price).toFixed(2)}</div>
            )}
            <div className="text-sm text-gray-500">{produto.stock > 0 ? `Em estoque: ${produto.stock}` : 'Esgotado'}</div>
            {variacoes.length > 0 && (
              <div>
                <div className="font-semibold mb-1">Variações:</div>
                <div className="flex gap-2 flex-wrap">
                  {variacoes.map(v => (
                    <button key={v.id} onClick={() => setVarSel(v)} className={clsx('px-3 py-1 rounded border', varSel?.id === v.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300')}>{v.value}</button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 mt-2">
              <button onClick={() => setQtd(q => Math.max(1, q - 1))} className="px-3 py-1 border rounded">-</button>
              <span className="font-bold text-lg">{qtd}</span>
              <button onClick={() => setQtd(q => q + 1)} className="px-3 py-1 border rounded">+</button>
            </div>
            <button disabled={produto.stock === 0 || adding} onClick={handleAddToCart} className="mt-4 bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {adding ? 'Adicionando...' : 'Adicionar ao Carrinho'}
            </button>
            {toast && <div className="mt-2 text-green-700 font-semibold animate-pulse">{toast}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
