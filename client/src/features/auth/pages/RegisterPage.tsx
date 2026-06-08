import { Link } from 'react-router-dom';
import { AuthLayout } from '../../../components/layout/AuthLayout';
import { RegisterForm } from '../components/RegisterForm';

export function RegisterPage() {
  return (
    <AuthLayout>
      <h2 className="text-xl font-bold text-stone-800 mb-1">Create account</h2>
      <p className="text-sm text-stone-500 mb-5">Start planning your camping trips</p>

      <RegisterForm />

      <p className="text-sm text-center text-stone-500 mt-5">
        Already have an account?{' '}
        <Link to="/login" className="text-forest-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
