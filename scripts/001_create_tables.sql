-- Create volunteers table
CREATE TABLE IF NOT EXISTS volunteers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  skills TEXT[] DEFAULT '{}',
  availability TEXT DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'offline')),
  clearance_level INTEGER DEFAULT 1,
  missions_completed INTEGER DEFAULT 0,
  joined_at TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  current_mission TEXT,
  coordinates JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create missions table
CREATE TABLE IF NOT EXISTS missions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  location TEXT,
  coordinates JSONB,
  assigned_volunteers TEXT[] DEFAULT '{}',
  source_reports TEXT[] DEFAULT '{}',
  start_date TEXT,
  end_date TEXT,
  objectives TEXT[] DEFAULT '{}',
  resources_needed TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  location TEXT,
  coordinates JSONB,
  urgency_score INTEGER DEFAULT 5,
  people_affected INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  submitted_by TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create logistics_tasks table
CREATE TABLE IF NOT EXISTS logistics_tasks (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'en_route', 'delivered')),
  priority TEXT DEFAULT 'medium',
  team TEXT,
  eta TEXT,
  origin TEXT,
  destination TEXT,
  items JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE volunteers;
ALTER PUBLICATION supabase_realtime ADD TABLE missions;
ALTER PUBLICATION supabase_realtime ADD TABLE reports;
ALTER PUBLICATION supabase_realtime ADD TABLE logistics_tasks;
