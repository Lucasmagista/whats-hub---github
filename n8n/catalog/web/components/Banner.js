import CustomHead from '../components/CustomHead';

export default function Banner() {
  return (
    <div className="w-full bg-gradient-to-r from-green-600 to-green-400 text-white py-8 px-4 text-center mb-8 rounded shadow">
      <CustomHead title="Bem-vindo ao Catálogo Web" description="Compre fácil, rápido e seguro!" />
      <h2 className="text-3xl font-bold mb-2">Bem-vindo ao Catálogo Web</h2>
      <p className="text-lg">Ofertas especiais, entrega rápida e atendimento personalizado.</p>
    </div>
  );
}
