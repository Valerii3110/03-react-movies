import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import toast, { Toaster } from 'react-hot-toast';
import type { Movie } from '../../types/movie';
import Loader from '../Loader/Loader';
import styles from './MovieModal.module.css';

interface MovieModalProps {
  movie: Movie;
  onClose: () => void;
}

// Константа для id тоста — використовуємо всюди ту саму
const IMAGE_ERROR_TOAST_ID = 'movie-image-error';

const MovieModal = ({ movie, onClose }: MovieModalProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // handleClose обгорнутий у useCallback — стабільна функція
  const handleClose = useCallback(() => {
    // явно прибираємо toast (якщо він був показаний)
    toast.dismiss(IMAGE_ERROR_TOAST_ID); // можна використовувати toast.dismiss() щоб закрити всі тости
    // скидаємо локальні стани
    setImageLoaded(false);
    setImageError(false);
    // викликаємо батьківську функцію закриття
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };

    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
      // Додатковий захист: при анмаунті модалки прибираємо тост
      toast.dismiss(IMAGE_ERROR_TOAST_ID);
    };
  }, [handleClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const handleImageError = () => {
    setImageError(true);

    // показуємо тост з фіксованим id — потім ми його зможемо однозначно прибрати
    toast.error('Failed to load movie image', {
      id: IMAGE_ERROR_TOAST_ID,
      duration: 4000,
      position: 'top-center',
      style: {
        background: '#ff4d4f',
        color: '#fff',
        fontWeight: '600',
        padding: '10px 16px',
        borderRadius: '8px',
        zIndex: 10000,
      },
    });
  };

  return createPortal(
    <div className={styles.backdrop} onClick={handleBackdropClick} role="dialog" aria-modal="true">
      {/* Локальний Toaster всередині модалки — позиціювання робимо через containerStyle */}
      <Toaster
        containerStyle={{ position: 'absolute', width: '100%', top: 10, left: 0, zIndex: 10001 }}
      />

      <div className={styles.modal}>
        <button className={styles.closeButton} aria-label="Close modal" onClick={handleClose}>
          &times;
        </button>

        {!imageLoaded && !imageError && <Loader />}

        {!imageError && (
          <img
            className={styles.image}
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt={movie.title}
            style={{ display: imageLoaded ? 'block' : 'none' }}
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
          />
        )}

        {imageLoaded && !imageError && (
          <div className={styles.content}>
            <h2>{movie.title}</h2>
            <p>{movie.overview}</p>
            <p>
              <strong>Release Date:</strong> {movie.release_date}
            </p>
            <p>
              <strong>Rating:</strong> {movie.vote_average}/10
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default MovieModal;
