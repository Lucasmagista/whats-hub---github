import React from 'react';

export type EmailProvider = 'mailersend' | 'emailjs';

interface EmailProviderSwitcherProps {
  provider: EmailProvider;
  onChange: (provider: EmailProvider) => void;
}

const EmailProviderSwitcher: React.FC<EmailProviderSwitcherProps> = ({ provider, onChange }) => {
  return (
    <div style={{ margin: '16px 0' }}>
      <label style={{ fontWeight: 600 }}>Provedor de Email:</label>
      <select
        value={provider}
        onChange={e => onChange(e.target.value as EmailProvider)}
        style={{ marginLeft: 8, padding: 4 }}
      >
        <option value="mailersend">MailerSend</option>
        <option value="emailjs">EmailJS (Legado)</option>
      </select>
    </div>
  );
};

export default EmailProviderSwitcher;
