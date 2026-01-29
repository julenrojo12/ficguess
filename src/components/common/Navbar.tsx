import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from './Button';
import styles from './Navbar.module.css';

export function Navbar() {
  const { user, signOut, isLoading } = useAuth();

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>?</span>
          <span className={styles.logoText}>Fandomle</span>
        </Link>

        <div className={styles.links}>
          <Link to="/browse" className={styles.link}>
            Explorar
          </Link>
        </div>

        <div className={styles.actions}>
          {isLoading ? null : user ? (
            <>
              <Link to="/creator/games">
                <Button variant="secondary" size="sm">
                  Mis Juegos
                </Button>
              </Link>
              <button
                onClick={() => signOut()}
                className={styles.avatarButton}
                title="Cerrar sesion"
              >
                <div className={styles.avatar}>
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Iniciar sesion
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Crear cuenta
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
