import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function fetchPedidos() {
      setLoading(true);
      setErro('');
      try {
        // Exemplo: GET /api/orders (ajuste conforme seu backend)
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const res = await axios.get(`${API_URL}/orders`);
        setPedidos(res.data);
      } catch {
        setErro('Erro ao buscar pedidos.');
      }
      setLoading(false);
    }
    fetchPedidos();
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Meus Pedidos</h1>
      {loading ? <div>Carregando...</div> : erro ? <div className="text-red-600">{erro}</div> : pedidos.length === 0 ? (
        <div>Nenhum pedido encontrado.</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {pedidos.map(ped => (
            <li key={ped.id} className="py-4">
              <div className="font-bold">Pedido #{ped.id}</div>
              <div className="text-sm text-gray-600">Data: {new Date(ped.createdAt).toLocaleString()}</div>
              <div className="text-sm">Status: {ped.status}</div>
              <ul className="ml-4 mt-2 list-disc text-sm">
                {ped.items.map(item => (
                  <li key={item.id}>{item.productName} x{item.quantity} - R$ {(item.unitPrice * item.quantity).toFixed(2)}</li>
                ))}
              </ul>
              <div className="font-bold mt-2">Total: R$ {ped.total.toFixed(2)}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
