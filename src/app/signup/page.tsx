'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import Header from '@/components/ui/header';
import { SessionProvider } from 'next-auth/react';

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignUpForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (data: SignupFormData) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (res.ok) setSuccess(true);
      else alert('Signup failed.');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>

    <div className="flex min-h-screen min-w-8 items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">

    <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-gray-800">
            Sign up
          </CardTitle>
        </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="fullname">Full Name</Label>
            <Input id="fullname" {...register('name')} />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Signing Up...' : 'Sign Up'}
          </Button>

          {success && <p className="text-green-600 text-sm">✅ Signup successful!</p>}
        </form>
      </CardContent>
    </Card>
    </div>
    </>
  );
}
