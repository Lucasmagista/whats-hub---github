
import axios from 'axios';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Banner from '../components/Banner';
import CustomHead from '../components/CustomHead';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    axios.get(`${API_URL}/products`)
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <CustomHead title="Catálogo de Produtos" description="Veja todos os produtos disponíveis para compra!" />
      <Banner />
      <div className="max-w-7xl mx-auto py-10 px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full text-center text-lg">Carregando produtos...</div>
        ) : products.length === 0 ? (
          <div className="col-span-full text-center text-lg">Nenhum produto encontrado.</div>
        ) : products.map(prod => (
          <Link key={prod.id} href={`/produto/${prod.id}`} className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 flex flex-col">
            <img src={prod.imageUrl || '/placeholder.png'} alt={prod.name} className="w-full h-48 object-cover rounded mb-4" loading="lazy" />
            <h2 className="text-xl font-semibold mb-2">{prod.name}</h2>
            <div className="text-lg font-bold text-green-700 mb-1">R$ {Number(prod.price).toFixed(2)}</div>
            <div className="text-sm text-gray-500">{prod.stock > 0 ? `Em estoque: ${prod.stock}` : 'Esgotado'}</div>
          </Link>
        ))}
      </div>
    </>
  );
}
