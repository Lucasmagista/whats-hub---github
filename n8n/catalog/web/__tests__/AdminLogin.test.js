import { render, screen, fireEvent } from '@testing-library/react';
import AdminLogin from '../pages/admin/login';

describe('AdminLogin', () => {
  it('renderiza o formulário de login', () => {
    render(<AdminLogin />);
    expect(screen.getByPlaceholderText('Usuário')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('exibe erro ao tentar login inválido', () => {
    render(<AdminLogin />);
    fireEvent.change(screen.getByPlaceholderText('Usuário'), { target: { value: 'errado' } });
    fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: 'errado' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    expect(screen.getByRole('alert')).toHaveTextContent('Usuário ou senha inválidos');
  });
});
