import { Link } from 'react-router-dom';
import { AuthLayout } from '../../../components/layout/AuthLayout';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  return (
    <AuthLayout>
      <h2 className="text-xl font-bold text-stone-800 mb-1">Welcome back</h2>
      <p className="text-sm text-stone-500 mb-5">Sign in to your account</p>

      <LoginForm />

      <p className="text-sm text-center text-stone-500 mt-5">
        No account?{' '}
        <Link to="/register" className="text-forest-600 font-medium hover:underline">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
