# 🚀 Configuration de la Base de Données - Taxi Proxi

## 📋 Étapes de Setup

### **Étape 1: Créer les tables via Supabase Dashboard**

1. Allez sur **https://supabase.com/dashboard**
2. Sélectionnez votre projet **taxi-proxi**
3. Allez dans **SQL Editor**
4. Créez une nouvelle requête
5. Copiez le contenu du fichier `schema.sql`
6. Cliquez sur **Run** ou appuyez sur `Ctrl+Enter`

### **Étape 2: Vérifier les tables créées**

Après l'exécution du script, vérifiez:
- Allez dans **Database** → **Tables**
- Vous devez voir 5 tables:
  - ✅ `drivers` (Chauffeurs)
  - ✅ `riders` (Passagers)
  - ✅ `trips` (Trajets)
  - ✅ `payments` (Paiements)
  - ✅ `reviews` (Avis)

### **Étape 3: Vérifier les données d'exemple**

Exécutez cette requête pour voir les données:
```sql
SELECT COUNT(*) as total_drivers FROM drivers;
SELECT COUNT(*) as total_riders FROM riders;
SELECT COUNT(*) as total_trips FROM trips;
SELECT COUNT(*) as total_payments FROM payments;
```

Vous devez obtenir:
- 5 chauffeurs
- 5 passagers
- 3 trajets
- 3 paiements

### **Étape 4: Tester la connexion**

1. Ouvrez le fichier **test-connection.html** dans votre navigateur
2. Cliquez sur l'onglet **🔍 Tests**
3. Cliquez sur **▶ Lancer test complet**
4. Tous les tests doivent être ✅ verts

---

## 📊 Structure des Tables

### **DRIVERS (Chauffeurs)**
```
id              → UUID (Clé primaire)
name            → Nom du chauffeur
email           → Email unique
phone           → Numéro de téléphone
status          → available/busy/offline
vehicle_type    → Type du véhicule
vehicle_plate   → Plaque d'immatriculation
rating          → Évaluation (0-5)
total_trips     → Nombre total de trajets
created_at      → Date de création
updated_at      → Date de mise à jour
```

### **RIDERS (Passagers)**
```
id              → UUID
name            → Nom du passager
email           → Email unique
phone           → Téléphone
rating          → Évaluation (0-5)
total_trips     → Nombre de trajets
preferred_payment → Mode de paiement préféré
created_at      → Date de création
updated_at      → Date de mise à jour
```

### **TRIPS (Trajets)**
```
id              → UUID
driver_id       → Référence au chauffeur
rider_id        → Référence au passager
pickup_location → Lieu de départ
pickup_latitude/longitude → Coordonnées GPS départ
dropoff_location → Lieu d'arrivée
dropoff_latitude/longitude → Coordonnées GPS arrivée
status          → pending/accepted/started/completed/cancelled
distance        → Distance en km
duration        → Durée en minutes
fare            → Tarif en FCFA
created_at      → Date
updated_at      → Dernière mise à jour
```

### **PAYMENTS (Paiements)**
```
id              → UUID
trip_id         → Référence au trajet
amount          → Montant payé
payment_method  → cash/card/mobile_money/wallet
status          → pending/completed/failed/refunded
transaction_id  → ID transaction externe
notes           → Remarques
created_at      → Date
updated_at      → Mise à jour
```

### **REVIEWS (Avis)**
```
id              → UUID
trip_id         → Référence au trajet
reviewer_id     → ID du critiqueur
rating          → Note (1-5)
comment         → Commentaire
created_at      → Date
```

---

## 🔐 Sécurité (RLS)

Toutes les tables ont **Row Level Security (RLS)** activé:
- ✅ Tout le monde peut lire (SELECT)
- ⚠️ Modification limitée aux propriétaires
- 🔒 Les clés étrangères protègent l'intégrité

---

## 📝 Données d'Exemple

Le script insère automatiquement:

**5 Chauffeurs:**
- Ahmed Hassan (⭐ 4.8)
- Marie Dupont (⭐ 4.9)
- Jean Paul Nkomo (⭐ 4.7)
- Fatima Camara (⭐ 5.0)
- Pierre Mbozo (⭐ 4.6)

**5 Passagers:**
- Alice Martin
- Bob Wilson
- Claire Brown
- David Johnson
- Emma Thompson

**3 Trajets d'Exemple:**
- Douala → Aéroport (25.5 km, 12,500 FCFA)
- Gare → Hôtel (8.3 km, 5,000 FCFA)
- Carrefour → Centre Commercial (12 km, 6,500 FCFA)

---

## 🛠️ Commandes SQL Utiles

### Ajouter un nouveau chauffeur:
```sql
INSERT INTO drivers (name, email, phone, status, vehicle_type)
VALUES ('Nom', 'email@taxi.com', '+237XXXXXXXXX', 'available', 'Sedan');
```

### Ajouter un nouveau passager:
```sql
INSERT INTO riders (name, email, phone)
VALUES ('Nom', 'email@gmail.com', '+237XXXXXXXXX');
```

### Voir tous les trajets avec détails:
```sql
SELECT 
  t.id, 
  d.name as driver, 
  r.name as rider, 
  t.pickup_location,
  t.dropoff_location,
  t.status, 
  t.fare
FROM trips t
JOIN drivers d ON t.driver_id = d.id
JOIN riders r ON t.rider_id = r.id;
```

### Voir les paiements en attente:
```sql
SELECT p.*, t.fare, d.name as driver
FROM payments p
JOIN trips t ON p.trip_id = t.id
JOIN drivers d ON t.driver_id = d.id
WHERE p.status = 'pending';
```

---

## ⚠️ Problèmes Courants

### ❌ Erreur: "Permission denied"
- **Cause**: RLS trop restrictive
- **Solution**: Allez dans **Authentication** → **Policies** et vérifiez les règles

### ❌ Erreur: "Table does not exist"
- **Cause**: Vous n'avez pas exécuté le script SQL
- **Solution**: Copiez `schema.sql` dans SQL Editor et exécutez-le

### ❌ Erreur: "Foreign key violation"
- **Cause**: Vous essayez de référencer un ID inexistant
- **Solution**: Assurez-vous que le driver_id et rider_id existent

---

## 🚀 Prochaines Étapes

1. ✅ Créer les tables (schema.sql)
2. ✅ Tester la connexion (test-connection.html)
3. ⏭️ Intégrer l'API dans votre application
4. ⏭️ Configurer l'authentification Supabase
5. ⏭️ Mettre en place les webhooks

---

**Besoin d'aide?** Consultez la [documentation Supabase](https://supabase.com/docs)
