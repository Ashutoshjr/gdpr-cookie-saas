'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, getErrorMessage } from '@/lib/api';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post<{ message: string; resetToken: string }>(
        '/api/auth/forgot-password',
        { email: data.email }
      );
      setResetToken(res.data.resetToken);
      setSent(true);
      toast.success('Check your email for reset instructions.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
          <Mail className="w-6 h-6 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Reset your password</h1>
        <p className="text-slate-500">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      {!sent ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-slate-700 font-medium">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className="h-11 rounded-xl border-slate-200"
              {...register('email')}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {isSubmitting ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">
            If an account with that email exists, a reset link has been sent.
          </div>

          {/* Dev-mode token box */}
          {resetToken && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                Development mode — Reset Token
              </p>
              <p className="text-xs text-amber-600 break-all font-mono">{resetToken}</p>
              <Link
                href={`/reset-password?token=${resetToken}`}
                className="inline-block text-xs font-semibold text-indigo-600 underline"
              >
                → Use this token to reset password
              </Link>
            </div>
          )}
        </div>
      )}

      <Link
        href="/login"
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to sign in
      </Link>
    </div>
  );
}
