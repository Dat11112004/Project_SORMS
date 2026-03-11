import { useEffect, useState } from 'react';
import { residentApi } from '../../api/residents';
import type { ResidentDto } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Save, User } from 'lucide-react';

export default function MyProfilePage() {
  const [profile, setProfile] = useState<ResidentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [profileForm, setProfileForm] = useState({ address: '', emergencyContact: '', notes: '' });
  const [accountForm, setAccountForm] = useState({ email: '', phone: '' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await residentApi.getMyProfile();
      setProfile(res.data);
      setProfileForm({ address: res.data.address || '', emergencyContact: res.data.emergencyContact || '', notes: res.data.notes || '' });
      setAccountForm({ email: res.data.email || '', phone: res.data.phone || res.data.phoneNumber || '' });
    } catch { /* noop */ } finally { setLoading(false); }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      await residentApi.updateProfile(profileForm);
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.response?.data || 'Failed to update.');
    } finally { setSaving(false); }
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      await residentApi.updateAccount(accountForm);
      setSuccess('Account updated successfully!');
    } catch (err: any) {
      setError(err.response?.data || 'Failed to update.');
    } finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner />;
  if (!profile) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Profile not found. Please contact admin.</div>;

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="gradient-primary" style={{
          width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.25rem', fontWeight: 700, color: '#fff',
        }}><User size={24} /></div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>My Profile</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{profile.fullName} • Room {profile.roomNumber || 'N/A'}</p>
        </div>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.8125rem', color: '#f87171' }}>{error}</div>}
      {success && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.8125rem', color: '#34d399' }}>{success}</div>}

      {/* Account Settings */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Account Settings</h3>
        <form onSubmit={handleUpdateAccount}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div><label className="form-label">Email</label><input type="email" className="form-input" value={accountForm.email} onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })} /></div>
            <div><label className="form-label">Phone</label><input className="form-input" value={accountForm.phone} onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })} /></div>
          </div>
          <button type="submit" className="btn btn-primary btn-sm" disabled={saving} style={{ marginTop: '1rem' }}><Save size={16} /> Save Account</button>
        </form>
      </div>

      {/* Profile Info */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Profile Information</h3>
        <form onSubmit={handleUpdateProfile}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div><label className="form-label">Address</label><input className="form-input" value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} /></div>
            <div><label className="form-label">Emergency Contact</label><input className="form-input" value={profileForm.emergencyContact} onChange={(e) => setProfileForm({ ...profileForm, emergencyContact: e.target.value })} /></div>
            <div><label className="form-label">Notes</label><textarea className="form-input" rows={3} value={profileForm.notes} onChange={(e) => setProfileForm({ ...profileForm, notes: e.target.value })} /></div>
          </div>
          <button type="submit" className="btn btn-primary btn-sm" disabled={saving} style={{ marginTop: '1rem' }}><Save size={16} /> Save Profile</button>
        </form>
      </div>
    </div>
  );
}
