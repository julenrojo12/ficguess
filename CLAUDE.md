# FicGuess

Juego web estilo Wordle para adivinar personajes de ficcion. Los usuarios intentan adivinar un personaje secreto comparando atributos (genero, edad, afiliacion, etc.) con feedback visual de coincidencia.

## Stack Tecnologico

- **Frontend**: React 19 + TypeScript + Vite 7
- **Backend/DB**: Supabase (PostgreSQL + Auth + RLS)
- **State**: TanStack Query v5 para cache y fetching
- **Routing**: React Router v7
- **Estilos**: CSS vanilla (sin framework)

## Estructura del Proyecto

```
src/
├── api/            # Funciones de acceso a Supabase
│   ├── supabase.ts # Cliente Supabase
│   ├── games.ts    # CRUD de juegos
│   └── characters.ts # CRUD de personajes y schemas
├── components/
│   ├── common/     # UI reutilizable (Button, Card, Input, Modal, Tag, Loading, Navbar)
│   └── game/       # Componentes del juego (GameBoard, GuessRow, AttributeCell, CharacterInput, GameResult)
├── contexts/       # AuthContext para estado de autenticacion
├── hooks/          # useAuth, useGame (logica de partida)
├── pages/          # Paginas de la app
│   ├── Home.tsx         # Landing page
│   ├── Browse.tsx       # Explorar juegos publicados
│   ├── Play.tsx         # Jugar una partida
│   ├── Login.tsx        # Inicio de sesion
│   ├── Register.tsx     # Registro de creador
│   ├── CreatorGames.tsx         # Lista de juegos del creador
│   ├── CreatorGameNew.tsx       # Crear nuevo juego
│   ├── CreatorGameEdit.tsx      # Editar juego existente
│   ├── CreatorGameSchemas.tsx   # Configurar atributos del juego
│   └── CreatorGameCharacters.tsx # Gestionar personajes
├── types/          # game.types.ts - tipos TypeScript
├── utils/          # compareAttributes.ts - logica de comparacion
├── router.tsx      # Configuracion de rutas
├── Layout.tsx      # Layout con Navbar
├── App.tsx         # Provider de React Query
└── main.tsx        # Entry point

supabase/
├── schema.sql           # Schema completo de la DB
├── seed-harry-potter.sql # Datos de ejemplo Harry Potter
└── seed-one-piece.sql    # Datos de ejemplo One Piece
```

## Modelo de Datos

### Tablas principales

- **creators**: Usuarios que crean juegos (vinculados a auth.users)
- **games**: Juegos/quizzes con configuracion (max_attempts, hints, daily_mode)
- **tags**: Categorias predefinidas (Anime, Peliculas, Videojuegos, etc.)
- **game_tags**: Relacion N:M entre games y tags
- **attribute_schemas**: Definicion de atributos por juego (nombre, tipo, orden)
- **characters**: Personajes con atributos en JSONB
- **play_sessions**: Partidas de jugadores (intentos, resultado)

### Tipos de Atributos

Los schemas soportan estos tipos:
- `text`: Texto simple (comparacion exacta)
- `number`: Numerico (muestra mayor/menor)
- `year`: Ano (muestra mayor/menor)
- `select`: Seleccion unica de opciones
- `multi`: Seleccion multiple (puede ser parcialmente correcta)
- `boolean`: Si/No

### Resultados de Comparacion

- `correct` (verde): Coincidencia exacta
- `partial` (amarillo): Parcialmente correcto (solo para `multi`)
- `incorrect` (gris): No coincide
- `higher`/`lower`: Para numeros, indica direccion

## Flujo del Juego

1. Usuario selecciona un juego desde `/browse` o home
2. Se carga el juego con sus schemas y personajes en `/play/:slug`
3. Se selecciona un personaje objetivo aleatorio
4. Usuario busca y selecciona personajes para adivinar
5. Cada intento muestra comparacion de atributos con colores
6. Gana si adivina antes de agotar `max_attempts`

## Rutas

| Ruta | Pagina | Descripcion |
|------|--------|-------------|
| `/` | Home | Landing con juegos destacados y populares |
| `/browse` | Browse | Explorar todos los juegos con filtros |
| `/play/:slug` | Play | Jugar una partida |
| `/login` | Login | Inicio de sesion |
| `/register` | Register | Registro de creador |
| `/creator/games` | CreatorGames | Mis juegos (requiere auth) |
| `/creator/games/new` | CreatorGameNew | Crear juego |
| `/creator/games/:id` | CreatorGameEdit | Editar juego |
| `/creator/games/:id/schemas` | CreatorGameSchemas | Configurar atributos |
| `/creator/games/:id/characters` | CreatorGameCharacters | Gestionar personajes |

## Comandos

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de produccion
npm run preview  # Preview del build
npm run lint     # ESLint
```

## Configuracion

Variables de entorno en `.env.local`:
```
VITE_SUPABASE_URL=<url>
VITE_SUPABASE_ANON_KEY=<key>
```

## Row Level Security (RLS)

- Juegos publicados son publicos; borradores solo visibles para el creador
- Creadores solo pueden modificar sus propios juegos/personajes
- Play sessions son publicas (jugadores anonimos)
- Tags son de solo lectura publica

## Hook Principal: useGame

El hook `useGame` maneja toda la logica de una partida activa:
- Estado: guesses, comparisons, currentAttempt, isWon, isLost
- Acciones: makeGuess, resetGame
- Helpers: isCharacterGuessed, availableCharacters
