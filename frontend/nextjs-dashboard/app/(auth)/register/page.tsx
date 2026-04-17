'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, getErrorMessage } from '@/lib/api';
import { setStoredUser, setAuthCookie } from '@/lib/auth';
import type { AuthUser } from '@/lib/types';

const schema = z
  .object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post<AuthUser>('/api/auth/register', {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      });
      setStoredUser(res.data);
      setAuthCookie();
      toast.success('Account created! Welcome aboard.');
      router.push('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create your account</h1>
        <p className="text-slate-500">Free forever · No credit card required.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-slate-700 font-medium">Full name</Label>
          <Input
            id="fullName"
            placeholder="Jane Doe"
            autoComplete="name"
            className="h-11 rounded-xl border-slate-200"
            {...register('fullName')}
          />
          {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
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

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              className="h-11 rounded-xl border-slate-200 pr-10"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            autoComplete="new-password"
            className="h-11 rounded-xl border-slate-200"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-sm"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {isSubmitting ? 'Creating account…' : 'Create free account'}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
          Sign in
        </Link>
      </p>

      <p className="text-center text-xs text-slate-400 leading-relaxed">
        By creating an account, you agree to our{' '}
        <Link href="#" className="underline">Terms of Service</Link>{' '}
        and{' '}
        <Link href="#" className="underline">Privacy Policy</Link>.
      </p>
    </div>
  );
}
