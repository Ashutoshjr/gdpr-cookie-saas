'use client';
import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KeyRound, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, getErrorMessage } from '@/lib/api';

const schema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
type FormData = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    if (!token) {
      toast.error('Reset token is missing. Please request a new link.');
      return;
    }
    try {
      await api.post('/api/auth/reset-password', {
        token,
        newPassword: data.newPassword,
      });
      toast.success('Password reset successfully! You can now sign in.');
      router.push('/login');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (!token) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          Missing reset token. Please request a new password reset link.
        </div>
        <Link href="/forgot-password" className="text-sm text-indigo-600 underline">
          Request new link
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
          <KeyRound className="w-6 h-6 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Set new password</h1>
        <p className="text-slate-500">Choose a strong password for your account.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="newPassword" className="text-slate-700 font-medium">New password</Label>
          <Input
            id="newPassword"
            type="password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            className="h-11 rounded-xl border-slate-200"
            {...register('newPassword')}
          />
          {errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">Confirm new password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Re-enter your new password"
            autoComplete="new-password"
            className="h-11 rounded-xl border-slate-200"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {isSubmitting ? 'Resetting…' : 'Reset password'}
        </Button>
      </form>

      <Link href="/login" className="block text-center text-sm text-slate-500 hover:text-slate-700">
        Back to sign in
      </Link>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="space-y-8 animate-pulse"><div className="h-8 bg-slate-100 rounded w-48" /><div className="h-64 bg-slate-100 rounded" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
