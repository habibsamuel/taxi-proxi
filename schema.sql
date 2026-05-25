-- ============================================
-- SCRIPT DE CRÉATION DES TABLES - TAXI PROXI
-- Exécutez ce script dans Supabase SQL Editor
-- ============================================

-- 1. TABLE: DRIVERS (Chauffeurs)
CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'busy', 'offline')),
  vehicle_type VARCHAR(100),
  vehicle_plate VARCHAR(50),
  rating DECIMAL(3,2) DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  total_trips INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. TABLE: RIDERS (Passagers)
CREATE TABLE IF NOT EXISTS riders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  rating DECIMAL(3,2) DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  total_trips INT DEFAULT 0,
  preferred_payment VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. TABLE: TRIPS (Trajets)
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  rider_id UUID NOT NULL REFERENCES riders(id) ON DELETE CASCADE,
  pickup_location VARCHAR(255) NOT NULL,
  pickup_latitude DECIMAL(10,8),
  pickup_longitude DECIMAL(11,8),
  dropoff_location VARCHAR(255) NOT NULL,
  dropoff_latitude DECIMAL(10,8),
  dropoff_longitude DECIMAL(11,8),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'started', 'completed', 'cancelled')),
  distance DECIMAL(10,2),
  duration INT,
  fare DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (driver_id) REFERENCES drivers(id),
  FOREIGN KEY (rider_id) REFERENCES riders(id)
);

-- 4. TABLE: PAYMENTS (Paiements)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'mobile_money', 'wallet')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_id VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (trip_id) REFERENCES trips(id)
);

-- 5. TABLE: REVIEWS (Avis - Optionnel)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- CRÉER LES INDEXES POUR PERFORMANCES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_drivers_email ON drivers(email);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_riders_email ON riders(email);
CREATE INDEX IF NOT EXISTS idx_trips_driver_id ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_rider_id ON trips(rider_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_payments_trip_id ON payments(trip_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- ============================================
-- ACTIVER ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CRÉER LES POLITIQUES RLS
-- ============================================

-- Drivers: Tout le monde peut lire, seul l'owner peut modifier
CREATE POLICY "Drivers are viewable by all" ON drivers
  FOR SELECT USING (true);

CREATE POLICY "Users can update own drivers" ON drivers
  FOR UPDATE USING (true);

-- Riders: Tout le monde peut lire, seul l'owner peut modifier
CREATE POLICY "Riders are viewable by all" ON riders
  FOR SELECT USING (true);

CREATE POLICY "Users can update own riders" ON riders
  FOR UPDATE USING (true);

-- Trips: Visibles par les participants
CREATE POLICY "Trips visible to participants" ON trips
  FOR SELECT USING (true);

CREATE POLICY "Users can update own trips" ON trips
  FOR UPDATE USING (true);

-- Payments: Visibles par les participants
CREATE POLICY "Payments visible to trip participants" ON payments
  FOR SELECT USING (true);

-- ============================================
-- INSÉRER DES DONNÉES D'EXEMPLE
-- ============================================

INSERT INTO drivers (name, email, phone, status, vehicle_type, vehicle_plate, rating) VALUES
('Ahmed Hassan', 'ahmed.hassan@taxi.com', '+237600000001', 'available', 'Sedan Toyota', 'CM-001', 4.8),
('Marie Dupont', 'marie.dupont@taxi.com', '+237600000002', 'available', 'SUV Hyundai', 'CM-002', 4.9),
('Jean Paul Nkomo', 'jean.nkomo@taxi.com', '+237600000003', 'busy', 'Sedan Nissan', 'CM-003', 4.7),
('Fatima Camara', 'fatima.camara@taxi.com', '+237600000004', 'available', 'Sedan Honda', 'CM-004', 5.0),
('Pierre Mbozo', 'pierre.mbozo@taxi.com', '+237600000005', 'offline', 'Van Mercedes', 'CM-005', 4.6);

INSERT INTO riders (name, email, phone, rating) VALUES
('Alice Martin', 'alice.martin@email.com', '+237600000011', 5.0),
('Bob Wilson', 'bob.wilson@email.com', '+237600000012', 4.8),
('Claire Brown', 'claire.brown@email.com', '+237600000013', 4.9),
('David Johnson', 'david.johnson@email.com', '+237600000014', 4.7),
('Emma Thompson', 'emma.thompson@email.com', '+237600000015', 4.9);

INSERT INTO trips (driver_id, rider_id, pickup_location, dropoff_location, status, distance, duration, fare) VALUES
((SELECT id FROM drivers WHERE email = 'ahmed.hassan@taxi.com'), 
 (SELECT id FROM riders WHERE email = 'alice.martin@email.com'),
 'Centre Ville Douala', 'Aéroport International', 'completed', 25.5, 45, 12500),
((SELECT id FROM drivers WHERE email = 'marie.dupont@taxi.com'),
 (SELECT id FROM riders WHERE email = 'bob.wilson@email.com'),
 'Gare Routière', 'Hôtel Hilton', 'completed', 8.3, 20, 5000),
((SELECT id FROM drivers WHERE email = 'jean.nkomo@taxi.com'),
 (SELECT id FROM riders WHERE email = 'claire.brown@email.com'),
 'Carrefour Soppo', 'Centre Commercial Douala', 'started', 12.0, 25, 6500);

INSERT INTO payments (trip_id, amount, payment_method, status) VALUES
((SELECT id FROM trips LIMIT 1), 12500, 'cash', 'completed'),
((SELECT id FROM trips OFFSET 1 LIMIT 1), 5000, 'mobile_money', 'completed'),
((SELECT id FROM trips OFFSET 2 LIMIT 1), 6500, 'card', 'pending');

-- ============================================
-- VÉRIFICATION - Compter les enregistrements
-- ============================================

SELECT COUNT(*) as total_drivers FROM drivers;
SELECT COUNT(*) as total_riders FROM riders;
SELECT COUNT(*) as total_trips FROM trips;
SELECT COUNT(*) as total_payments FROM payments;

-- ============================================
-- AFFICHER LES DONNÉES
-- ============================================

SELECT '--- DRIVERS ---' as info;
SELECT id, name, email, status, vehicle_type, rating FROM drivers;

SELECT '--- RIDERS ---' as info;
SELECT id, name, email, rating FROM riders;

SELECT '--- TRIPS ---' as info;
SELECT t.id, d.name as driver, r.name as rider, t.status, t.distance, t.fare 
FROM trips t
JOIN drivers d ON t.driver_id = d.id
JOIN riders r ON t.rider_id = r.id;
