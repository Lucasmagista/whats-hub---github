import { useCart } from '../components/CartContext';
import { useState } from 'react';
import Link from 'next/link';

function formatOrderMessage(cart, total, desconto) {
  let msg = '*Pedido via Catálogo Web*%0A';
  cart.forEach(item => {
    msg += `• ${item.productName}${item.variation ? ' (' + item.variation + ')' : ''} x${item.quantity} - R$ ${(item.unitPrice * item.quantity).toFixed(2)}%0A`;
  });
  msg += `%0ATotal: R$ ${total.toFixed(2)}`;
  if (desconto > 0) msg += `%0ADesconto aplicado: R$ ${desconto.toFixed(2)}`;
  msg += `%0A%0APara finalizar, envie seu nome e endereço completo!`;
  return msg;
}

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const [showModal, setShowModal] = useState(true);
  const [isLocal, setIsLocal] = useState(null);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState('');

  // Exemplo de promoção: 10% off acima de R$ 300
  const promoMin = Number(process.env.NEXT_PUBLIC_PROMO_MIN_TOTAL || 300);
  const promoPercent = Number(process.env.NEXT_PUBLIC_PROMO_PERCENT || 10);
  const promoMsg = process.env.NEXT_PUBLIC_PROMO_MSG || '';
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const desconto = subtotal >= promoMin ? subtotal * (promoPercent / 100) : 0;
  const total = subtotal - desconto;

  function handleRedirect() {
    if (cart.length === 0) {
      setError('Seu carrinho está vazio.');
      return;
    }
    setRedirecting(true);
    setTimeout(() => {
      const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '5599999999999'; // Substitua pelo número da empresa
      const msg = formatOrderMessage(cart, total, desconto);
      window.location.href = `https://wa.me/${phone}?text=${msg}`;
      clearCart();
    }, 800);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">Finalizar Pedido</h1>
        {cart.length === 0 ? (
          <div className="text-center text-lg">Seu carrinho está vazio.</div>
        ) : (
          <>
            <ul className="divide-y divide-gray-200 mb-6">
              {cart.map((item, idx) => (
                <li key={idx} className="flex items-center justify-between py-4">
                  <div>
                    <div className="font-semibold">{item.productName}</div>
                    {item.variation && <div className="text-sm text-gray-500">{item.variation}</div>}
                    <div className="text-sm">Qtd: {item.quantity}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <img src={item.imageUrl || '/placeholder.png'} alt="img" className="w-16 h-16 object-cover rounded" />
                    <div className="font-bold text-green-700">R$ {(item.unitPrice * item.quantity).toFixed(2)}</div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex justify-between items-center mb-4">
              <div className="text-xl font-bold">Subtotal: R$ {subtotal.toFixed(2)}</div>
              {desconto > 0 && <div className="text-lg text-blue-700 font-semibold">Desconto: -R$ {desconto.toFixed(2)}</div>}
            </div>
            <div className="text-2xl font-bold mb-6">Total: R$ {total.toFixed(2)}</div>
            {error && <div className="text-red-600 mb-4">{error}</div>}
            <button onClick={() => setShowModal(true)} className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 transition">Finalizar pelo WhatsApp</button>
          </>
        )}
      </div>
      {/* Modal de localidade */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <h2 className="text-xl font-bold mb-4">Você é cliente da cidade da empresa?</h2>
            <div className="flex gap-4 justify-center mb-6">
              <button onClick={() => { setIsLocal(true); setShowModal(false); }} className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700">Sim</button>
              <button onClick={() => { setIsLocal(false); setShowModal(false); }} className="bg-gray-300 text-gray-800 px-6 py-2 rounded font-bold hover:bg-gray-400">Não</button>
            </div>
            <button onClick={() => setShowModal(false)} className="text-blue-600 hover:underline">Cancelar</button>
          </div>
        </div>
      )}
      {/* Modal de redirecionamento/agradecimento */}
      {isLocal === false && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <h2 className="text-xl font-bold mb-4">Atendemos apenas clientes da cidade.</h2>
            <p className="mb-4">Confira nossa loja oficial nas plataformas:</p>
            <a href={process.env.NEXT_PUBLIC_LOJA_MERCADO_LIVRE} target="_blank" rel="noopener" className="block mb-2 text-blue-700 hover:underline">Mercado Livre</a>
            <a href={process.env.NEXT_PUBLIC_LOJA_SHOPEE} target="_blank" rel="noopener" className="block mb-2 text-orange-600 hover:underline">Shopee</a>
            <a href={process.env.NEXT_PUBLIC_INSTAGRAM} target="_blank" rel="noopener" className="block mb-6 text-pink-600 hover:underline">Instagram</a>
            <button onClick={() => setIsLocal(null)} className="text-blue-600 hover:underline">Voltar</button>
          </div>
        </div>
      )}
      {/* Loader de redirecionamento */}
      {redirecting && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center animate-pulse">
            <h2 className="text-xl font-bold mb-4">Redirecionando para o WhatsApp...</h2>
            <div className="w-16 h-16 mx-auto border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Aguarde um instante.</p>
          </div>
        </div>
      )}
      {/* Se cliente local, inicia redirect ao clicar */}
      {isLocal && !showModal && !redirecting && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <h2 className="text-xl font-bold mb-4">Pronto para finalizar seu pedido?</h2>
            <button onClick={handleRedirect} className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 transition">Ir para o WhatsApp</button>
            <button onClick={() => setIsLocal(null)} className="mt-4 text-blue-600 hover:underline">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
