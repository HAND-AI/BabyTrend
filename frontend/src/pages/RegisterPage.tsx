import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import authService from '../services/auth';
import { isAdmin } from '../utils/token';

const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (data: { username: string; password: string }) => {
    setLoading(true);
    setError('');

    try {
      await authService.register(data);
      
      // Redirect based on user role (new users are typically not admin)
      const userIsAdmin = isAdmin();
      navigate(userIsAdmin ? '/admin' : '/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      mode="register"
      onSubmit={handleRegister}
      loading={loading}
      error={error}
    />
  );
};

export default RegisterPage; 