-- Projects table
CREATE TABLE projects (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  total_units INT NOT NULL,
  current_units INT DEFAULT 0,
  target_date TIMESTAMP,
  status TEXT DEFAULT 'in_progress',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE courses (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  total_lectures INT NOT NULL,
  completed_lectures INT DEFAULT 0,
  url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fitness table
CREATE TABLE fitness (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  date DATE NOT NULL,
  weight DECIMAL(5,2),
  exercise_type TEXT,
  sets INT,
  reps INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Books table
CREATE TABLE books (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  author TEXT,
  status TEXT DEFAULT 'want_to_read',
  progress INT DEFAULT 0,
  total_pages INT,
  notes TEXT,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MindPick (Instagram) table
CREATE TABLE mindpick (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  post_date DATE NOT NULL,
  content TEXT NOT NULL,
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  comments INT DEFAULT 0,
  followers INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Military prep table
CREATE TABLE military_prep (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  task TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  target_date DATE,
  completed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Progress tracking table
CREATE TABLE progress (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  progress_value INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
