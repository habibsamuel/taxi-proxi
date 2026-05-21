-- ════════════════════════════════════════════
--  CREATE DRIVERS TABLE FOR TAXI PROXI
-- ════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  vehicle_plate TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'busy')),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  rating DECIMAL(3, 2) DEFAULT 4.5,
  total_trips INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ════════════════════════════════════════════
--  CREATE INDEXES FOR BETTER PERFORMANCE
-- ════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_email ON drivers(email);
CREATE INDEX IF NOT EXISTS idx_drivers_phone ON drivers(phone);
CREATE INDEX IF NOT EXISTS idx_drivers_created_at ON drivers(created_at DESC);

-- ════════════════════════════════════════════
--  INSERT SAMPLE DATA (OPTIONAL)
-- ════════════════════════════════════════════

INSERT INTO drivers (name, email, phone, vehicle_plate, vehicle_type, status, rating)
VALUES
  ('Jean-Paul M.', 'jean.paul@taxiproxi.cm', '694000001', 'CM-001-ABC', 'Sedan', 'online', 4.5),
  ('Alvine K.', 'alvine.k@taxiproxi.cm', '694000002', 'CM-002-XYZ', 'SUV', 'online', 5.0),
  ('Patrick N.', 'patrick.n@taxiproxi.cm', '694000003', 'CM-003-DEF', 'Minibus', 'offline', 4.0)
ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════
--  ENABLE ROW LEVEL SECURITY (OPTIONAL)
-- ════════════════════════════════════════════

ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;

-- Allow public select
CREATE POLICY "Allow public read" ON drivers
  FOR SELECT USING (true);

-- Allow drivers to update their own data
CREATE POLICY "Allow drivers to update own data" ON drivers
  FOR UPDATE USING (auth.uid() = id);
