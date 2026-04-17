'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, User, Lock, BarChart2, Trash2, Shield, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { api, getErrorMessage } from '@/lib/api';
import { clearStoredUser, clearAuthCookie } from '@/lib/auth';
import type { UserProfileDto, UsageSummary } from '@/lib/types';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
});
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z.string().min(8, 'At least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match', path: ['confirmPassword'],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  const profileForm = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    Promise.all([
      api.get<UserProfileDto>('/api/auth/profile'),
      api.get<UsageSummary>('/api/auth/usage'),
    ]).then(([pRes, uRes]) => {
      setProfile(pRes.data);
      setUsage(uRes.data);
      profileForm.reset({ fullName: pRes.data.fullName, email: pRes.data.email });
    }).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onProfileSave = async (data: ProfileForm) => {
    try {
      const res = await api.put<UserProfileDto>('/api/auth/profile', data);
      setProfile(res.data);
      toast.success('Profile updated!');
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const onPasswordChange = async (data: PasswordForm) => {
    try {
      await api.post('/api/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      passwordForm.reset();
      toast.success('Password changed successfully!');
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const handleUpgrade = async (plan: string) => {
    setUpgrading(true);
    try {
      const res = await api.post<UserProfileDto>('/api/auth/upgrade', { plan });
      setProfile(res.data);
      const uRes = await api.get<UsageSummary>('/api/auth/usage');
      setUsage(uRes.data);
      toast.success(`Switched to ${plan === 'pro' ? 'Pro' : 'Free'} plan!`);
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setUpgrading(false); }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/api/auth/account');
      clearStoredUser();
      clearAuthCookie();
      toast.success('Account deleted.');
      router.push('/login');
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const usagePct = (used: number, limit: number) =>
    limit === -1 ? 0 : Math.min(100, Math.round((used / limit) * 100));

  if (loading) {
    return <div className="flex items-center justify-center py-32"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Account Settings" description="Manage your profile, security, and billing." />

      {/* Plan & Usage */}
      {usage && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${usage.plan === 'pro' ? 'bg-indigo-50' : 'bg-slate-50'}`}>
                {usage.plan === 'pro' ? <Zap className="w-5 h-5 text-indigo-600" /> : <Shield className="w-5 h-5 text-slate-500" />}
              </div>
              <div>
                <h2 className="font-semibold text-slate-800">Plan & Usage</h2>
                <Badge variant="secondary" className={`text-xs mt-1 ${usage.plan === 'pro' ? 'bg-indigo-100 text-indigo-700' : ''}`}>
                  {usage.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
                </Badge>
              </div>
            </div>
            {usage.plan === 'free' ? (
              <Button
                onClick={() => handleUpgrade('pro')}
                disabled={upgrading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
              >
                {upgrading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                Upgrade to Pro
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => handleUpgrade('free')}
                disabled={upgrading}
                className="rounded-xl text-slate-600"
              >
                Downgrade to Free
              </Button>
            )}
          </div>

          <Separator />

          {/* Websites usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 font-medium">Websites</span>
              <span className="text-slate-500">
                {usage.websitesUsed} / {usage.websitesLimit === -1 ? '∞' : usage.websitesLimit}
              </span>
            </div>
            {usage.websitesLimit !== -1 && (
              <Progress value={usagePct(usage.websitesUsed, usage.websitesLimit)} className="h-2" />
            )}
          </div>

          {/* Consents usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 font-medium">Consents this month</span>
              <span className="text-slate-500">
                {usage.consentsThisMonth.toLocaleString()} / {usage.consentsLimit === -1 ? '∞' : usage.consentsLimit.toLocaleString()}
              </span>
            </div>
            {usage.consentsLimit !== -1 && (
              <Progress value={usagePct(usage.consentsThisMonth, usage.consentsLimit)} className="h-2" />
            )}
          </div>

          {/* Free plan comparison */}
          {usage.plan === 'free' && (
            <div className="bg-indigo-50 rounded-xl p-4 text-sm">
              <p className="font-semibold text-indigo-800 mb-2">Unlock Pro features</p>
              <ul className="space-y-1 text-indigo-700 text-xs">
                <li>• Unlimited websites & consents</li>
                <li>• Multi-language banners (8 languages)</li>
                <li>• EU/EEA geo-restriction</li>
                <li>• Priority support</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Edit Profile */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-xl bg-slate-50"><User className="w-5 h-5 text-slate-500" /></div>
          <h2 className="font-semibold text-slate-800">Account Info</h2>
        </div>
        <form onSubmit={profileForm.handleSubmit(onProfileSave)} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-slate-700 font-medium">Full name</Label>
            <Input className="h-11 rounded-xl border-slate-200" {...profileForm.register('fullName')} />
            {profileForm.formState.errors.fullName && (
              <p className="text-sm text-red-500">{profileForm.formState.errors.fullName.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-700 font-medium">Email address</Label>
            <Input type="email" className="h-11 rounded-xl border-slate-200" {...profileForm.register('email')} />
            {profileForm.formState.errors.email && (
              <p className="text-sm text-red-500">{profileForm.formState.errors.email.message}</p>
            )}
          </div>
          <Button
            type="submit"
            disabled={profileForm.formState.isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
          >
            {profileForm.formState.isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save changes
          </Button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-xl bg-slate-50"><Lock className="w-5 h-5 text-slate-500" /></div>
          <h2 className="font-semibold text-slate-800">Change Password</h2>
        </div>
        <form onSubmit={passwordForm.handleSubmit(onPasswordChange)} className="space-y-4">
          {(['currentPassword', 'newPassword', 'confirmPassword'] as const).map((field) => (
            <div key={field} className="space-y-1.5">
              <Label className="text-slate-700 font-medium capitalize">
                {field.replace(/([A-Z])/g, ' $1').trim()}
              </Label>
              <Input
                type="password"
                className="h-11 rounded-xl border-slate-200"
                {...passwordForm.register(field)}
              />
              {passwordForm.formState.errors[field] && (
                <p className="text-sm text-red-500">{passwordForm.formState.errors[field]?.message}</p>
              )}
            </div>
          ))}
          <Button
            type="submit"
            disabled={passwordForm.formState.isSubmitting}
            variant="outline"
            className="rounded-xl border-slate-200"
          >
            {passwordForm.formState.isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Update password
          </Button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl border-2 border-red-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-red-50"><Trash2 className="w-5 h-5 text-red-500" /></div>
          <h2 className="font-semibold text-red-700">Danger Zone</h2>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Permanently delete your account and all associated data including websites, consent records, and analytics. This action is irreversible.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="rounded-xl">Delete my account</Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete account permanently?</AlertDialogTitle>
              <AlertDialogDescription>
                All websites, consent logs, and analytics will be permanently deleted. You cannot undo this.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700 rounded-xl">
                Yes, delete everything
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
