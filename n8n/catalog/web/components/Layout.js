import Link from 'next/link';
import { useCart } from './CartContext';

export default function Layout({ children }) {
  const { cart } = useCart();
  const totalItens = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header className="bg-white shadow sticky top-0 z-40">
        <nav className="max-w-7xl mx-auto flex items-center justify-between py-4 px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-2xl font-bold text-green-700">Catálogo</Link>
            <Link href="/carrinho" className="relative text-lg font-medium text-gray-700 hover:text-green-700 transition">
              Carrinho
              {totalItens > 0 && (
                <span className="ml-1 bg-green-600 text-white rounded-full px-2 py-0.5 text-xs font-bold">{totalItens}</span>
              )}
            </Link>
            <Link href="/checkout" className="text-lg font-medium text-gray-700 hover:text-green-700 transition">Checkout</Link>
          </div>
        </nav>
      </header>
      <main className="min-h-screen bg-gray-50">{children}</main>
      <footer className="bg-white border-t mt-10 py-6 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Catálogo Web. Todos os direitos reservados.
      </footer>
    </>
  );
}
