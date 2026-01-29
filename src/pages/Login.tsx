import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../components/common';
import { useAuth } from '../hooks/useAuth';
import styles from './Auth.module.css';

export function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const { error } = await signIn(emailOrUsername, password);

    if (error) {
      setError('Usuario, email o contrasena incorrectos');
      setIsLoading(false);
      return;
    }

    navigate('/');
  };

  return (
    <div className={styles.page}>
      <Card padding="lg" className={styles.card}>
        <h1 className={styles.title}>Iniciar sesion</h1>
        <p className={styles.subtitle}>
          Accede a tu cuenta para crear y gestionar tus juegos
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            type="text"
            label="Email o nombre de usuario"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            placeholder="tu@email.com o tu_usuario"
            required
          />

          <Input
            type="password"
            label="Contrasena"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tu contrasena"
            required
          />

          {error && <p className={styles.error}>{error}</p>}

          <Button type="submit" fullWidth isLoading={isLoading}>
            Iniciar sesion
          </Button>
        </form>

        <p className={styles.footer}>
          No tienes cuenta?{' '}
          <Link to="/register" className={styles.link}>
            Registrate
          </Link>
        </p>
      </Card>
    </div>
  );
}
