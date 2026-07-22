'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { signUpWithEmail } from './actions';

export default function SignUpForm() {

  const [state, formAction, isPending] = useActionState(signUpWithEmail, null);

  return (
    <form action={formAction}
      className="flex flex-col gap-3 min-h-screen items-center justify-center bg-black">

      <div className="w-sm">
        <h1 className="mt-10 text-center text-2xl/9 font-bold text-white">Create new account</h1>
      </div>

      <div className='flex flex-col gap-1.5 w-sm'>
        <label htmlFor="name" className="block text-sm font-medium text-gray-100">Name</label>
        <input id="name" name="name" type="text" required placeholder="John Doe"
          className="block rounded-md w-full bg-white/5 px-2 py-1.5 placeholder:text-gray-500 text-white outline-1 outline-white/10 focus:outline-indigo-500"
        />
      </div>

      <div className='flex flex-col gap-1.5 w-sm'>
        <label htmlFor="email" className="block text-sm font-medium text-gray-100">Email address</label>
        <input id="email" name="email" type="email" required placeholder="john@my-company.com"
          className="block rounded-md w-full bg-white/5 px-2 py-1.5 placeholder:text-gray-500 text-white outline-1 outline-white/10  focus:outline-indigo-500"/>
      </div>

      <div className='flex flex-col gap-1.5 w-sm'>
        <label htmlFor="password" className="block text-sm font-medium text-gray-100">Password</label>
        <input id="password" name="password" type="password" required placeholder="*****"
          className="block rounded-md w-full bg-white/5 px-2 py-1.5 placeholder:text-gray-500 text-white outline-1 outline-white/10  focus:outline-indigo-500"/>
      </div>

      {state?.error && (
        <div className="rounded-md px-3 py-2 text-sm text-red-500">
          {state.error}
        </div>
      )}

      <label>Have An Account? <a href="/sign-in" className='cursor-pointer underline hover:no-underline'>Sign In</a></label>

      <button type="submit" disabled={isPending}
        className="flex w-sm justify-center rounded-md rounded-t-2xl cursor-pointer transition-all duration-500 mt-1 bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400">
        {isPending ? 'Creating account...' : 'Create Account'}
      </button>

      <Link href="/"
        className="flex w-sm justify-center rounded-md rounded-b-2xl border-2 px-3 py-1.5 text-sm/6 font-semibold transition-all duration-500 text-white hover:bg-white hover:text-black hover:border-indigo-700">
        Home Page
      </Link>
    </form>
  );
}