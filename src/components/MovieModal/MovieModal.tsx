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

const MovieModal = ({ movie, onClose }: MovieModalProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleClose = useCallback(() => {
    setImageLoaded(false);
    setImageError(false);
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
    };
  }, [handleClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const handleImageError = () => {
    setImageError(true);
    toast.error('Failed to load movie image', {
      id: 'movie-image-error',
      duration: 4000,
      position: 'top-center',
      style: {
        background: '#ff4d4f',
        color: '#fff',
        fontWeight: 'bold',
        padding: '12px 20px',
        borderRadius: '8px',
        zIndex: 10000,
      },
    });
  };

  return createPortal(
    <div className={styles.backdrop} onClick={handleBackdropClick} role="dialog" aria-modal="true">
      <Toaster containerStyle={{ position: 'absolute', width: '100%' }} />

      <div className={styles.modal}>
        <button className={styles.closeButton} aria-label="Close modal" onClick={handleClose}>
          &times;
        </button>

        {!imageLoaded && !imageError && <Loader />}

        {/* Рендеримо зображення тільки якщо бекенд повернув шлях */}
        {!imageError && movie.backdrop_path && (
          <img
            key={movie.id} // примушує перевантаження при новому фільмі
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
