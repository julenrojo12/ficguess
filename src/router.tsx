import { createBrowserRouter } from 'react-router-dom';
import {
  Home,
  Browse,
  Play,
  Login,
  Register,
  CreatorGames,
  CreatorGameNew,
  CreatorGameEdit,
  CreatorGameSchemas,
  CreatorGameCharacters,
  NotFound,
} from './pages';
import { Layout } from './Layout';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Layout />,
      children: [
        { index: true, element: <Home /> },
        { path: 'browse', element: <Browse /> },
        { path: 'play/:slug', element: <Play /> },
        { path: 'login', element: <Login /> },
        { path: 'register', element: <Register /> },
        { path: 'creator/games', element: <CreatorGames /> },
        { path: 'creator/games/new', element: <CreatorGameNew /> },
        { path: 'creator/games/:id', element: <CreatorGameEdit /> },
        { path: 'creator/games/:id/schemas', element: <CreatorGameSchemas /> },
        { path: 'creator/games/:id/characters', element: <CreatorGameCharacters /> },
        { path: '*', element: <NotFound /> },
      ],
    },
  ],
  {
    basename: '/ficguess',
  }
);
