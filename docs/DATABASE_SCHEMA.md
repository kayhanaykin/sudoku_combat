# Database Schema - Sudoku Combat

**Last Updated:** March 9, 2026

## Overview

The Sudoku Combat application uses a microservices architecture with multiple databases:

- **User Service**: PostgreSQL (Django ORM) - User accounts, authentication, profiles, friends
- **Room Service**: TypeORM with PostgreSQL - Game rooms and multiplayer sessions
- **Combat Service**: TypeORM with PostgreSQL - Real-time combat game data
- **Game Service**: PostgreSQL (C++ PQXX) - Game statistics and leaderboards
- **Play Service**: SQLAlchemy with PostgreSQL - Detailed game records

---

## 1. User Service Database

### Schema: User Management & Social Features

```
┌─────────────────────────────────────────────────────────────┐
│                     CustomUser (Django User)                │
├─────────────────────────────────────────────────────────────┤
│ PK: id (Integer)                                            │
│ ├─ username (VARCHAR 150) - UNIQUE                          │
│ ├─ email (VARCHAR 254)                                      │
│ ├─ password (VARCHAR 128) - hashed                          │
│ ├─ first_name (VARCHAR 150)                                 │
│ ├─ last_name (VARCHAR 150)                                  │
│ ├─ is_active (BOOLEAN)                                      │
│ ├─ is_staff (BOOLEAN)                                       │
│ ├─ date_joined (DATETIME)                                   │
│ ├─ last_login (DATETIME, nullable)                          │
│ │                                                            │
│ ├─ [42 Intra Integration]                                   │
│ ├─ intra_id (INTEGER, UNIQUE, nullable)                     │
│ ├─ display_name (VARCHAR 50, UNIQUE, nullable)              │
│ ├─ avatar (ImageField, nullable)                            │
│ ├─ avatar_url (URL max 500 chars, nullable)                 │
│ │                                                            │
│ ├─ [Two-Factor Authentication]                              │
│ ├─ is_2fa_enabled (BOOLEAN, default=False)                  │
│ ├─ two_factor_secret (VARCHAR 32, nullable)                 │
│ │                                                            │
│ ├─ [Profile Completion]                                     │
│ ├─ is_profile_complete (BOOLEAN, default=False)             │
│ │                                                            │
│ ├─ [Online Status & Presence]                               │
│ ├─ last_seen (DATETIME, nullable)                           │
│ ├─ is_online (BOOLEAN, default=False)                       │
│ │                                                            │
│ └─ [Social Relationships]                                   │
│    └─ friends (ManyToMany to CustomUser)                    │
│       └─ self-referential, non-symmetrical                  │
└─────────────────────────────────────────────────────────────┘
```

#### Relationship: CustomUser.friends
- **Type**: ManyToMany (self-referential, non-symmetrical)
- **Purpose**: One-directional friend lists
- **Behavior**: User A can follow User B without User B following back

---

### Relationship Model

```
┌──────────────────────────────────────────────────────────────┐
│                    Relationship                              │
├──────────────────────────────────────────────────────────────┤
│ PK: id (Integer)                                             │
│ FK: from_user_id → CustomUser.id (CASCADE)                   │
│ FK: to_user_id → CustomUser.id (CASCADE)                     │
│ ├─ status (VARCHAR 10)                                       │
│ │   └─ choices: 'pending' | 'friends'                        │
│ └─ created_at (DATETIME, auto_now_add=True)                  │
│                                                              │
│ Unique Constraint: (from_user_id, to_user_id)               │
└──────────────────────────────────────────────────────────────┘
```

#### Status Values
- `pending` - Friend request sent, awaiting acceptance
- `friends` - Friend request accepted, bidirectional connection active

---

## 2. Room Service Database

### Room Entity (Game Session Management)

```
┌────────────────────────────────────────────────────────────┐
│                      Room                                  │
├────────────────────────────────────────────────────────────┤
│ PK: id (INT, auto-increment)                               │
│ ├─ ownerId (VARCHAR) - Host player ID                      │
│ ├─ ownerName (VARCHAR, default='Unknown Player')           │
│ ├─ guestId (VARCHAR, nullable) - Second player ID          │
│ ├─ difficulty (VARCHAR)                                    │
│ │   └─ possible: 'easy' | 'medium' | 'hard' | 'expert'    │
│ ├─ currBoard (JSON) - Current puzzle state                 │
│ ├─ solvedBoard (JSON) - Solution reference                 │
│ ├─ health (Simple Array [INT], nullable)                   │
│ │   └─ format: [owner_health, guest_health]                │
│ └─ status (VARCHAR, default='waiting')                     │
│    └─ possible: 'waiting' | 'in_progress' | 'completed'   │
└────────────────────────────────────────────────────────────┘
```

#### Data Types
- **currBoard (JSON)**: 9x9 sudoku grid with current player state
- **solvedBoard (JSON)**: Complete solution for validation
- **health (Array)**: Health points for each player (PvP mode)

#### Status Lifecycle
1. `waiting` → Room created, awaiting guest
2. `in_progress` → Both players active, game running
3. `completed` → One or both players finished

---

## 3. Combat Service Database

### Room Entity (Real-time Combat)

```
┌──────────────────────────────────────────────────────────────┐
│                   Room (Combat Mode)                         │
├──────────────────────────────────────────────────────────────┤
│ PK: id (INT, auto-increment)                                 │
│ ├─ ownerId (VARCHAR) - P1 user ID                            │
│ ├─ ownerName (VARCHAR, default='Unknown Player')             │
│ ├─ guestId (VARCHAR, nullable) - P2 user ID                  │
│ ├─ difficulty (VARCHAR)                                      │
│ ├─ currBoard (JSON) - Live puzzle state                      │
│ ├─ solvedBoard (JSON) - Solution reference                   │
│ ├─ health (Simple Array [INT], nullable)                     │
│ │   └─ synced in real-time via WebSocket                     │
│ └─ status (VARCHAR, default='waiting')                       │
│    └─ possible: 'waiting' | 'in_progress' | 'completed'     │
│       Additional: 'abandoned' (if player disconnects)        │
└──────────────────────────────────────────────────────────────┘
```

#### Real-time Features
- **WebSocket Events** (app.gateway.ts)
  - Health updates broadcasted to both players
  - Move validation in real-time
  - Connection status tracking

---

## 4. Game Service Database (PostgreSQL)

### Player Statistics Table

```
┌─────────────────────────────────────────────────────────────┐
│                   player_stats                              │
├─────────────────────────────────────────────────────────────┤
│ PK: id (SERIAL)                                             │
│ FK: user_id (INT) - Reference to user                       │
│ ├─ mode (VARCHAR 50)                                        │
│ │   └─ possible: 'easy' | 'medium' | 'hard' | 'expert'     │
│ │                | 'extreme' | 'total'                      │
│ ├─ wins (INT, default=0)                                    │
│ ├─ games_played (INT, default=0)                            │
│ ├─ losses (INT, default=0)                                  │
│ │   └─ formula: losses = games_played - wins                │
│ │                                                            │
│ Unique Constraint: (user_id, mode)                          │
└─────────────────────────────────────────────────────────────┘
```

#### Calculated Fields
- **Win Rate** = (wins / games_played) × 100%
- **Loss Rate** = (losses / games_played) × 100%

#### Update Strategy
- On conflict (user_id, mode): UPDATE instead of INSERT
- Incremental updates after each game completes

---

## 5. Play Service Database (SQLAlchemy)

### Game Statistics Table

```
┌──────────────────────────────────────────────────────────────┐
│                    GameStat                                  │
├──────────────────────────────────────────────────────────────┤
│ PK: id (INTEGER, primary key)                                │
│ ├─ user_id (INTEGER, indexed)                                │
│ ├─ difficulty (VARCHAR)                                      │
│ │   └─ possible: 'easy' | 'medium' | 'hard' | 'expert'      │
│ │                | 'extreme'                                 │
│ ├─ is_win (BOOLEAN)                                          │
│ └─ played_at (DATETIME with timezone)                        │
│    └─ default: server timestamp (UTC)                        │
│                                                              │
│ Usage: Historical record of each individual game             │
└──────────────────────────────────────────────────────────────┘
```

#### Purpose
- Detailed audit trail of all games
- Per-game performance analysis
- Historical statistics retrieval
- Difficulty-specific performance tracking

---

## Database Relationships Map

```
┌───────────────────────────────────────────────────────────────┐
│                    MICROSERVICES ARCHITECTURE                 │
└───────────────────────────────────────────────────────────────┘

USER SERVICE (Django)
    │
    ├─ CustomUser ─────────────────┐
    │  ├─ user account info        │
    │  ├─ 42 Intra integration      │
    │  ├─ 2FA settings             │
    │  └─ ManyToMany: friends       │
    │                              │
    └─ Relationship                │
       └─ friend requests status   │
                                   │
                                   │ user_id reference
                                   ▼
ROOM SERVICE (NestJS + TypeORM)    │
    │                              │
    └─ Room                        │
       ├─ ownerId ──────────────────┘
       ├─ guestId (FK to CustomUser)
       ├─ difficulty
       └─ game_state (JSON)


COMBAT SERVICE (NestJS + WebSocket)
    │
    └─ Room (real-time sync)
       ├─ ownerId ──────────────────┐
       ├─ guestId                   │
       ├─ health (synced)           │
       └─ WebSocket: live updates   │
                                   │
                                   │ user_id reference
                                   ▼
GAME SERVICE (C++ PostgreSQL)
    │
    └─ player_stats
       ├─ user_id (implicit FK)
       ├─ mode
       ├─ wins
       └─ games_played

PLAY SERVICE (FastAPI SQLAlchemy)
    │
    └─ GameStat
       ├─ user_id (indexed)
       ├─ difficulty
       └─ is_win
```

---

## Key Relationships

### 1. User → Room (One-to-Many)
- One user can **host** multiple rooms
- One user can **join** multiple rooms as guest
- **Cardinality**: CustomUser (1) → Room (Many)

### 2. User → Relationship (One-to-Many)
- One user can send multiple friend requests
- One user can receive multiple friend requests
- **Cardinality**: CustomUser (1) → Relationship (Many)

### 3. User → PlayerStats (One-to-Many)
- One user has stats per difficulty mode (5 records)
- One user has overall "total" stats (1 record)
- **Cardinality**: CustomUser (1) → player_stats (Many)

### 4. User → GameStat (One-to-Many)
- One user has one GameStat record per completed game
- **Cardinality**: CustomUser (1) → GameStat (Many)

---

## Data Flow Example: Single Game Session

```
1. USER CREATES ROOM
   CustomUser (id=1) creates Room
   └─ Room.ownerId = 1, Room.guestId = NULL, status = "waiting"

2. SECOND USER JOINS
   CustomUser (id=2) joins Room
   └─ Room.guestId = 2, Room.status = "in_progress"

3. GAME EXECUTION
   Combat Service syncs:
   ├─ room.currBoard (live updates)
   ├─ room.health (both players)
   └─ WebSocket events in real-time

4. GAME COMPLETION
   Room.status = "completed"
   
5. STATS RECORDING
   Game Service updates:
   ├─ player_stats (user_id=1, mode="hard", wins++)
   ├─ player_stats (user_id=2, mode="hard", losses++)
   
   Play Service records:
   ├─ GameStat (user_id=1, difficulty="hard", is_win=True)
   └─ GameStat (user_id=2, difficulty="hard", is_win=False)

6. LEADERBOARD DISPLAY
   Query player_stats WHERE mode="hard"
   └─ Order by wins DESC, games_played DESC
```

---

## Data Types Reference

| Type | Database | Example | Usage |
|------|----------|---------|-------|
| `VARCHAR(n)` | PostgreSQL | User IDs, names | String fields |
| `INT` / `INTEGER` | PostgreSQL | IDs, counts | Numeric fields |
| `BOOLEAN` | PostgreSQL | is_online, is_win | True/False flags |
| `DATETIME` | PostgreSQL | timestamps | Temporal data |
| `JSON` | PostgreSQL | sudoku boards | Complex structures |
| `Simple-Array` | TypeORM | [int, int] | Health arrays |
| `ImageField` | Django | File path | Avatar storage |
| `URLField` | Django | HTTP URLs | Avatar URLs |

---

## Indexing Strategy

```
┌─────────────────────────────┐
│    Indexed Columns          │
├─────────────────────────────┤
│ player_stats                │
│ ├─ user_id (for queries)    │
│ └─ (user_id, mode) UNIQUE   │
│                             │
│ GameStat                    │
│ └─ user_id (for aggregates) │
│                             │
│ Relationship                │
│ ├─ from_user_id (for sent)  │
│ ├─ to_user_id (for received)│
│ └─ (from_user, to_user)     │
│    UNIQUE                   │
└─────────────────────────────┘
```

---

## Constraints & Validations

### Uniqueness Constraints
- `CustomUser.username` - UNIQUE
- `CustomUser.intra_id` - UNIQUE (nullable)
- `CustomUser.display_name` - UNIQUE (nullable)
- `Relationship.(from_user, to_user)` - UNIQUE
- `player_stats.(user_id, mode)` - UNIQUE

### Foreign Key Constraints
- `Room.ownerId` → references user system (string/UUID)
- `Room.guestId` → references user system (string/UUID, nullable)
- `Relationship.from_user_id` → CustomUser (CASCADE)
- `Relationship.to_user_id` → CustomUser (CASCADE)

### Data Validation
- Game difficulty must match predefined list: `easy | medium | hard | expert | extreme`
- Health values must be positive integers or 0
- Win rate calculation: `wins ≤ games_played`
- Friend requests status: only `pending` or `friends`

---

## Scalability Considerations

### Partitioning Strategy (for growth)
- **GameStat table**: Can be partitioned by `played_at` (time-based)
- **player_stats table**: Can be partitioned by `mode` for faster queries
- **Relationship table**: Can be sharded by `from_user_id` for friend graph queries

### Caching Layer (Redis)
- Leaderboard top 100 (frequently accessed)
- Online user status (real-time updates)
- User friend lists (cached, invalidated on changes)
- Recent game results (10-15 minutes TTL)

---

## Migration & Versioning

**Current Schema Version**: 1.0 (March 9, 2026)

### Future Considerations
- Add `created_at` / `updated_at` timestamps to all tables
- Add game replays/move history table
- Add badge/achievement system
- Add tournament/seasonal rankings
- Consider time-series database for performance metrics

---

## Database Connection Strings

```env
# User Service
DATABASE_URL=postgresql://user:pass@localhost/user_db

# Room Service
DATABASE_URL=postgresql://user:pass@localhost/room_db

# Combat Service
DATABASE_URL=postgresql://user:pass@localhost/combat_db

# Game Service
DATABASE_URL=postgresql://user:pass@localhost/game_stats_db

# Play Service
DATABASE_URL=postgresql://user:pass@localhost/play_db
```

---

**Note**: Each microservice has its own database to maintain independence and enable independent scaling. Cross-service queries should go through APIs rather than direct database access.
