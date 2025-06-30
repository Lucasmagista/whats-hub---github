import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Upload, Eye, EyeOff } from 'lucide-react';
import { UserProfile } from '@/hooks/use-screen-lock';

interface PasswordSetupModalProps {
  isOpen: boolean;
  onSave: (password: string, autoLockTime: number, userProfile: UserProfile) => Promise<boolean>;
  onCancel: () => void;
}

export const PasswordSetupModal: React.FC<PasswordSetupModalProps> = ({
  isOpen,
  onSave,
  onCancel
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [autoLockTime, setAutoLockTime] = useState(15);
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState<string | undefined>();
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = [];
    if (pwd.length < 6) errors.push('Mínimo 6 caracteres');
    if (pwd.length > 128) errors.push('Máximo 128 caracteres');
    if (!/[A-Z]/.test(pwd)) errors.push('Pelo menos 1 letra maiúscula');
    if (!/[a-z]/.test(pwd)) errors.push('Pelo menos 1 letra minúscula');
    if (!/\d/.test(pwd)) errors.push('Pelo menos 1 número');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) errors.push('Pelo menos 1 símbolo especial');
    return errors;
  };

  const validateForm = (): boolean => {
    const validationErrors: string[] = [];
    
    // Validar nome
    if (!userName.trim()) {
      validationErrors.push('Nome é obrigatório');
    } else if (userName.trim().length < 2) {
      validationErrors.push('Nome deve ter pelo menos 2 caracteres');
    }
    
    // Validar senha
    const passwordErrors = validatePassword(password);
    validationErrors.push(...passwordErrors);
    
    // Validar confirmação
    if (password !== confirmPassword) {
      validationErrors.push('Senhas não coincidem');
    }
    
    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const userProfile: UserProfile = {
        name: userName.trim(),
        photoUrl: userPhoto
      };
      
      const success = await onSave(password, autoLockTime, userProfile);
      
      if (success) {
        // Reset form
        setPassword('');
        setConfirmPassword('');
        setUserName('');
        setUserPhoto(undefined);
        setErrors([]);
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setErrors(['Erro ao salvar configurações. Tente novamente.']);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>      <DialogContent 
        className="sm:max-w-md max-h-[90vh] overflow-y-auto"
        aria-describedby="password-setup-description"
      >
        <DialogDescription id="password-setup-description">
          Configure uma senha para proteger o acesso ao WhatsApp Hub. Você também pode personalizar seu perfil com nome e foto.
        </DialogDescription>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🔒 Definir senha do dispositivo
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Seção do Usuário */}
          <div className="space-y-4">
            <div className="text-center">
              <div 
                className="relative inline-block cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <Avatar className="w-20 h-20">
                  <AvatarImage src={userPhoto} alt={userName} />
                  <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white text-lg">
                    {userName ? getInitials(userName) : '👤'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Clique para escolher uma foto
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            
            <div>
              <Label htmlFor="userName">Nome</Label>
              <Input
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Digite seu nome"
                maxLength={50}
              />
            </div>
          </div>

          {/* Seção da Senha */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua senha"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Requisitos da senha */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm font-medium mb-2">A senha deve ter de 6 a 128 caracteres e só pode conter letras, números e sinais de pontuação.</p>
            <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
              <div className={password.length >= 6 && password.length <= 128 ? 'text-green-600' : ''}>
                ✓ 6-128 caracteres
              </div>
              <div className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
                ✓ Letra maiúscula
              </div>
              <div className={/[a-z]/.test(password) ? 'text-green-600' : ''}>
                ✓ Letra minúscula
              </div>
              <div className={/\d/.test(password) ? 'text-green-600' : ''}>
                ✓ Número
              </div>
              <div className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600' : ''}>
                ✓ Símbolo especial
              </div>
            </div>
          </div>
          
          {/* Tempo de bloqueio */}
          <div>
            <Label>Bloqueio Automático</Label>
            <Select value={autoLockTime.toString()} onValueChange={(value) => setAutoLockTime(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Após 1 minuto</SelectItem>
                <SelectItem value="15">Após 15 minutos</SelectItem>
                <SelectItem value="60">Após 1 hora</SelectItem>
                <SelectItem value="480">Após 8 horas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Erros */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-sm text-red-800">
                <ul className="list-disc pl-4 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {/* Botões */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isLoading || !userName.trim() || !password || !confirmPassword}
              className="min-w-[80px]"
            >
              {isLoading ? 'Salvando...' : 'OK'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
