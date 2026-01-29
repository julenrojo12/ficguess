import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../components/common';
import { useAuth } from '../hooks/useAuth';
import styles from './Auth.module.css';

export function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contrasenas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres');
      return;
    }

    if (username.length < 3) {
      setError('El nombre de usuario debe tener al menos 3 caracteres');
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(email, password, username);

    if (error) {
      setError(error.message || 'Error al crear la cuenta');
      setIsLoading(false);
      return;
    }

    navigate('/');
  };

  return (
    <div className={styles.page}>
      <Card padding="lg" className={styles.card}>
        <h1 className={styles.title}>Crear cuenta</h1>
        <p className={styles.subtitle}>
          Registrate para crear tus propios juegos
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            type="text"
            label="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="tu_nombre"
            required
          />

          <Input
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
          />

          <Input
            type="password"
            label="Contrasena"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimo 6 caracteres"
            required
          />

          <Input
            type="password"
            label="Confirmar contrasena"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repite tu contrasena"
            required
          />

          {error && <p className={styles.error}>{error}</p>}

          <Button type="submit" fullWidth isLoading={isLoading}>
            Crear cuenta
          </Button>
        </form>

        <p className={styles.footer}>
          Ya tienes cuenta?{' '}
          <Link to="/login" className={styles.link}>
            Inicia sesion
          </Link>
        </p>
      </Card>
    </div>
  );
}
