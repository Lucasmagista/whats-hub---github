import '../styles/globals.css';
import { CartProvider } from '../components/CartContext';
import Layout from '../components/Layout';

export default function App({ Component, pageProps }) {
  return (
    <CartProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </CartProvider>
  );
}
