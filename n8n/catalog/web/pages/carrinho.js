import { useCart } from '../components/CartContext';
import Link from 'next/link';

export default function Carrinho() {
  const { cart, removeFromCart, clearCart } = useCart();
  const total = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">Carrinho de Compras</h1>
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
                    <div className="font-bold text-green-700">R$ {(item.unitPrice * item.quantity).toFixed(2)}</div>
                    <button onClick={() => removeFromCart(item.productId, item.variationId)} className="text-red-600 hover:underline">Remover</button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex justify-between items-center mb-6">
              <div className="text-xl font-bold">Total: R$ {total.toFixed(2)}</div>
              <button onClick={clearCart} className="text-blue-600 hover:underline">Limpar carrinho</button>
            </div>
            <Link href="/checkout" className="block w-full bg-green-600 text-white text-center py-3 rounded font-bold hover:bg-green-700 transition">Finalizar Pedido</Link>
          </>
        )}
      </div>
    </div>
  );
}
