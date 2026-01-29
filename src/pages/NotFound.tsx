import { Link } from 'react-router-dom';
import { Button } from '../components/common';
import styles from './NotFound.module.css';

export function NotFound() {
  return (
    <div className={styles.page}>
      <h1 className={styles.code}>404</h1>
      <h2 className={styles.title}>Pagina no encontrada</h2>
      <p className={styles.description}>
        La pagina que buscas no existe o ha sido movida.
      </p>
      <Link to="/">
        <Button>Volver al inicio</Button>
      </Link>
    </div>
  );
}
