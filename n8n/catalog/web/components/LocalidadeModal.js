import { useState } from 'react';

export default function LocalidadeModal({ cidade, onConfirm }) {
  const [open, setOpen] = useState(true);

  function handle(resposta) {
    setOpen(false);
    onConfirm(resposta);
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-lg font-bold mb-4">Você é cliente de {cidade}?</h2>
        <div className="flex gap-4">
          <button onClick={() => handle(true)} className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700">Sim</button>
          <button onClick={() => handle(false)} className="bg-gray-300 text-gray-800 px-6 py-2 rounded font-bold hover:bg-gray-400">Não</button>
        </div>
      </div>
    </div>
  );
}
