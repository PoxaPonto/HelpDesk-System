import { useState } from 'react';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { changePassword, updateProfile } from '../services/authService.js';
import { roleLabels } from '../utils/roleLabels.js';

function Profile() {
  const { user, updateStoredUser } = useAuth();
  const toast = useToast();
  const [profileForm, setProfileForm] = useState({ name: user?.name ?? '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setSavingProfile(true);

    try {
      const updated = await updateProfile(profileForm);
      updateStoredUser(updated);
      toast?.showToast('Perfil atualizado com sucesso.');
    } catch (err) {
      toast?.showToast(err.response?.data?.message ?? 'Nao foi possivel atualizar o perfil.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast?.showToast('A confirmacao de senha nao confere.', 'error');
      return;
    }

    setSavingPassword(true);

    try {
      await changePassword(passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast?.showToast('Senha alterada com sucesso.');
    } catch (err) {
      toast?.showToast(err.response?.data?.message ?? 'Nao foi possivel alterar a senha.', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <section className="content-section narrow-section">
      <div className="page-heading">
        <div>
          <p className="header-eyebrow">Conta</p>
          <h2>Perfil</h2>
        </div>
      </div>

      <article className="details-panel">
        <div className="details-grid profile-grid">
          <div>
            <span>Nome</span>
            <strong>{user?.name}</strong>
          </div>
          <div>
            <span>E-mail</span>
            <strong>{user?.email}</strong>
          </div>
          <div>
            <span>Perfil</span>
            <strong>{roleLabels[user?.role] ?? user?.role}</strong>
          </div>
        </div>
      </article>

      <form className="ticket-form" onSubmit={handleProfileSubmit}>
        <Input
          id="profile-name"
          label="Alterar nome"
          name="name"
          value={profileForm.name}
          onChange={(event) => setProfileForm({ name: event.target.value })}
          required
        />
        <Button type="submit" disabled={savingProfile}>
          {savingProfile ? 'Salvando...' : 'Salvar nome'}
        </Button>
      </form>

      <form className="ticket-form" onSubmit={handlePasswordSubmit}>
        <Input id="currentPassword" label="Senha atual" name="currentPassword" type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))} required />
        <Input id="newPassword" label="Nova senha" name="newPassword" type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))} minLength="6" required />
        <Input id="confirmNewPassword" label="Confirmar nova senha" name="confirmPassword" type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))} minLength="6" required />
        <Button type="submit" disabled={savingPassword}>
          {savingPassword ? 'Alterando...' : 'Alterar senha'}
        </Button>
      </form>
    </section>
  );
}

export default Profile;
