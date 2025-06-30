import React from 'react';

/**
 * Componente para esconder visualmente um elemento, mas mantê-lo acessível para leitores de tela.
 */

const VisuallyHidden = ({ children }: { children: React.ReactNode }) => (
  <span className="sr-only">
    {children}
  </span>
);

export default VisuallyHidden;
