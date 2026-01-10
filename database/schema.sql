-- Tours table
CREATE TABLE IF NOT EXISTS tours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  subtitle TEXT,
  image TEXT,
  price TEXT NOT NULL,
  priceCurrency TEXT NOT NULL DEFAULT 'ARS',
  minGuests INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  duration TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Features table (many-to-many with tours)
CREATE TABLE IF NOT EXISTS features (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tourId INTEGER NOT NULL,
  feature TEXT NOT NULL,
  displayOrder INTEGER DEFAULT 0,
  FOREIGN KEY (tourId) REFERENCES tours(id) ON DELETE CASCADE
);

-- Wineries table
CREATE TABLE IF NOT EXISTS wineries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tourId INTEGER NOT NULL,
  name TEXT NOT NULL,
  image TEXT,
  location TEXT,
  instagram TEXT,
  displayOrder INTEGER DEFAULT 0,
  FOREIGN KEY (tourId) REFERENCES tours(id) ON DELETE CASCADE
);

-- Menu steps table
CREATE TABLE IF NOT EXISTS menu_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tourId INTEGER NOT NULL,
  step TEXT NOT NULL,
  displayOrder INTEGER DEFAULT 0,
  FOREIGN KEY (tourId) REFERENCES tours(id) ON DELETE CASCADE
);

-- Tour details table (for images like menu)
CREATE TABLE IF NOT EXISTS tour_details (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tourId INTEGER NOT NULL UNIQUE,
  menuImage TEXT,
  FOREIGN KEY (tourId) REFERENCES tours(id) ON DELETE CASCADE
);

-- Gallery table
CREATE TABLE IF NOT EXISTS gallery (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  imagePath TEXT NOT NULL,
  alt TEXT,
  displayOrder INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users table for admin authentication
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  passwordHash TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
