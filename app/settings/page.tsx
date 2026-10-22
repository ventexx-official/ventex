'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Shield,
  Upload,
  Lock,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Globe,
  Building,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DashboardShell, UserRole } from '@/components/ui-kit/DashboardShell';

export default function SharedSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Profile Form
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>('visitor');
  const [displayName, setDisplayName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [company, setCompany] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Password Form
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          router.replace('/login?next=/settings');
          return;
        }

        setUserId(session.user.id);

        const { data: prof, error: err } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (err) throw err;
        if (prof) {
          setRole(prof.role as UserRole);
          setDisplayName(prof.display_name || '');
          setHeadline(prof.headline || '');
          setBio(prof.bio || '');
          setCompany(prof.company || '');
          setCountry(prof.country || '');
          setCity(prof.city || '');
          setAvatarUrl(prof.avatar_url || null);
        }
      } catch (err: any) {
        setProfileError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  // Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    if (displayName.length > 100) {
      setProfileError('Display name must be 100 characters or less');
      return;
    }
    if (headline.length > 200) {
      setProfileError('Headline must be 200 characters or less');
      return;
    }
    if (bio.length > 2000) {
      setProfileError('Bio must be 2000 characters or less');
      return;
    }
    if (company.length > 150) {
      setProfileError('Company must be 150 characters or less');
      return;
    }

    try {
      setSavingProfile(true);
      setProfileError(null);
      setProfileSuccess(null);

      const { error: updErr } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim() || null,
          headline: headline.trim() || null,
          bio: bio.trim() || null,
          company: company.trim() || null,
          country: country.trim() || null,
          city: city.trim() || null,
        })
        .eq('id', userId);

      if (updErr) throw updErr;
      setProfileSuccess('Profile details saved successfully.');
    } catch (err: any) {
      setProfileError(err.message || 'Could not update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // Avatar Upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!userId || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Avatar must be a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Avatar image must be smaller than 2MB.');
      return;
    }

    try {
      setUploadingAvatar(true);
      const ext = file.name.split('.').pop() || 'png';
      const filePath = `${userId}/avatar.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: pubData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = pubData.publicUrl;

      // Update profile
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId);

      setAvatarUrl(publicUrl);
      setProfileSuccess('Avatar updated successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    try {
      setChangingPassword(true);
      const { error: pwdErr } = await supabase.auth.updateUser({ password: newPassword });
      if (pwdErr) throw pwdErr;

      setPasswordSuccess('Password updated successfully.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Could not update password');
    } finally {
      setChangingPassword(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <DashboardShell role={role}>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="border-b border-[var(--line)]/50 pb-6">
          <h1 className="text-2xl sm:text-3xl font-mono uppercase tracking-tight text-[var(--paper)]">
            Account & Settings
          </h1>
          <p className="text-xs sm:text-sm text-[var(--smoke)] mt-1">
            Manage your personal profile, secure credentials, and workspace preferences.
          </p>
        </div>

        {loading ? (
          <div className="p-8 rounded-2xl bg-[var(--card)] border border-[var(--line)] animate-pulse h-64" />
        ) : (
          <div className="space-y-8">
            {/* 1. Profile Details Form */}
            <section className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--line)]/50 pb-4">
                <div>
                  <h2 className="text-sm font-mono uppercase tracking-wider text-[var(--paper)] flex items-center gap-2">
                    <User className="w-4 h-4 text-[var(--red)]" />
                    Profile Details
                  </h2>
                  <p className="text-xs text-[var(--smoke)] mt-0.5">
                    Your public identifier visible across pitches and marketplace queries.
                  </p>
                </div>
                {/* Role badge (read only) */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[var(--smoke)]">Role:</span>
                  <span className="text-xs font-mono uppercase px-2.5 py-1 rounded-full bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)]">
                    {role}
                  </span>
                </div>
              </div>

              {profileSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {profileError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              {/* Avatar Upload */}
              <div className="flex items-center gap-4 py-2 border-b border-[var(--line)]/40">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName || 'Avatar'}
                    className="w-16 h-16 rounded-full object-cover border border-[var(--line)]"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[var(--ink)] border border-[var(--line)] flex items-center justify-center font-mono text-base font-bold text-[var(--paper)]">
                    {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div>
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono border border-[var(--line)] hover:border-[var(--red)] bg-[var(--ink)] cursor-pointer transition-colors min-h-[44px]">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingAvatar ? 'Uploading...' : 'Upload Avatar (max 2MB)'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      className="sr-only"
                    />
                  </label>
                  <p className="text-[10px] text-[var(--smoke)] mt-1 font-mono">JPG, PNG, or WebP</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-mono">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[var(--smoke)] uppercase mb-1">
                      Display Name (max 100)
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)] focus:outline-none focus:border-[var(--red)]"
                    />
                  </div>

                  <div>
                    <label className="block text-[var(--smoke)] uppercase mb-1">
                      Company / Organization (max 150)
                    </label>
                    <input
                      type="text"
                      maxLength={150}
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Venture Capital Partners / Studio"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)] focus:outline-none focus:border-[var(--red)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[var(--smoke)] uppercase mb-1">
                    Headline (max 200)
                  </label>
                  <input
                    type="text"
                    maxLength={200}
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Early Stage Angel & CleanTech Enthusiast"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)] focus:outline-none focus:border-[var(--red)]"
                  />
                </div>

                <div>
                  <label className="block text-[var(--smoke)] uppercase mb-1">
                    Bio (max 2000)
                  </label>
                  <textarea
                    rows={3}
                    maxLength={2000}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Brief background about yourself, investment thesis, or product interests"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)] focus:outline-none focus:border-[var(--red)] leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[var(--smoke)] uppercase mb-1">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g. United Kingdom"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)] focus:outline-none focus:border-[var(--red)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--smoke)] uppercase mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. London"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)] focus:outline-none focus:border-[var(--red)]"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-5 py-2.5 rounded-xl bg-[var(--red)] text-white hover:bg-[var(--red)]/90 transition-colors min-h-[44px] cursor-pointer disabled:opacity-50 font-semibold"
                  >
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </section>

            {/* 2. Change Password Form */}
            <section className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] space-y-4">
              <div className="border-b border-[var(--line)]/50 pb-3">
                <h2 className="text-sm font-mono uppercase tracking-wider text-[var(--paper)] flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[var(--smoke)]" />
                  Change Password
                </h2>
                <p className="text-xs text-[var(--smoke)] mt-0.5">
                  Update your account password (minimum 8 characters).
                </p>
              </div>

              {passwordSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 text-xs font-mono max-w-md">
                <div>
                  <label className="block text-[var(--smoke)] uppercase mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)] focus:outline-none focus:border-[var(--red)]"
                  />
                </div>
                <div>
                  <label className="block text-[var(--smoke)] uppercase mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)] focus:outline-none focus:border-[var(--red)]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-4 py-2.5 rounded-xl border border-[var(--line)] text-[var(--paper)] hover:border-[var(--red)] transition-colors min-h-[44px] cursor-pointer disabled:opacity-50"
                >
                  {changingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </section>

            {/* 3. Session & Log out */}
            <section className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] flex items-center justify-between">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--paper)]">
                  Session & Sign out
                </h3>
                <p className="text-[11px] text-[var(--smoke)] mt-0.5 font-mono">
                  Sign out of this device. Your data will remain securely saved.
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-xs font-mono min-h-[44px] cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </section>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
