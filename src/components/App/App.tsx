import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import SearchBar from '../SearchBar/SearchBar';
import MovieGrid from '../MovieGrid/MovieGrid';
import MovieModal from '../MovieModal/MovieModal';
import Loader from '../Loader/Loader';
import { fetchMovies } from '../services/movieService';
import type { Movie } from '../../types/movie';

const App = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  // Пошук фільмів
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      toast('Please enter your search query.');
      return;
    }

    setLoading(true);
    setError(false);
    setMovies([]);

    try {
      const results = await fetchMovies(query);
      if (!results.length) {
        toast('No movies found for your request.');
      }
      setMovies(results);
    } catch {
      toast.error('Network error or server error. Please reload the page.');
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMovie = (movie: Movie) => setSelectedMovie(movie);

  const handleCloseModal = () => setSelectedMovie(null);

  return (
    <div>
      <Toaster position="top-center" />
      <SearchBar onSubmit={handleSearch} />
      {loading && <Loader />}
      {error && !loading && (
        <p style={{ textAlign: 'center', marginTop: 20 }}>
          Something went wrong. Please reload the page.
        </p>
      )}
      {!loading && !error && <MovieGrid movies={movies} onSelect={handleSelectMovie} />}
      {selectedMovie && <MovieModal movie={selectedMovie} onClose={handleCloseModal} />}
    </div>
  );
};

export default App;
