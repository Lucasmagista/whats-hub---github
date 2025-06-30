import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getMailerSendConfig, MAILERSEND_CONFIG } from '@/config/emailConfig';

interface EmailConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EmailConfigModal: React.FC<EmailConfigModalProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const [config, setConfig] = useState({
    apiToken: '',
    domain: '',
    fromEmail: '',
    fromName: ''
  });

  useEffect(() => {
    if (open) {
      setConfig(getMailerSendConfig());
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // Aqui você pode implementar a lógica para salvar no localStorage ou backend
    toast({ title: 'Configuração salva!', description: 'As configurações do MailerSend foram atualizadas.' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configuração do Email (MailerSend)</DialogTitle>
          <DialogDescription>Configure o envio de emails pelo MailerSend.</DialogDescription>
        </DialogHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Label>API Token</Label>
          <Input name="apiToken" value={config.apiToken} onChange={handleChange} />
          <Label>Domain</Label>
          <Input name="domain" value={config.domain} onChange={handleChange} />
          <Label>Email do Remetente</Label>
          <Input name="fromEmail" value={config.fromEmail} onChange={handleChange} />
          <Label>Nome do Remetente</Label>
          <Input name="fromName" value={config.fromName} onChange={handleChange} />
          <Button onClick={handleSave}>Salvar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailConfigModal;
