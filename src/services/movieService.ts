import axios from 'axios';
import type { Movie } from '../types/movie';

const BASE_URL = 'https://api.themoviedb.org/3';

// Опис структури відповіді TMDB
interface FetchMoviesResponse {
  results: Movie[];
}

export const fetchMovies = async (query: string): Promise<Movie[]> => {
  try {
    const response = await axios.get<FetchMoviesResponse>(`${BASE_URL}/search/movie`, {
      params: { query },
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}`,
      },
    });

    return response.data.results;
  } catch {
    throw new Error('Failed to fetch movies');
  }
};
