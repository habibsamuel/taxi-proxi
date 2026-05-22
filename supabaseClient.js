// ════════════════════════════════════════════
//  SUPABASE CLIENT INITIALIZATION (FIXED)
// ════════════════════════════════════════════

const SUPABASE_URL = 'https://uprhk9zcknjorj6-sm-eeac.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_upRhK9ZCkNbORj6-SM-EEA_CoKJif-l';

// Initialize Supabase client with proper error handling
let supabase = null;

async function initSupabase() {
  try {
    // Wait for supabase to be available
    if (!window.supabase) {
      console.error('❌ Supabase library not loaded');
      return false;
    }
    
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✓ Supabase initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Supabase initialization failed:', error);
    return false;
  }
}

// Function to ensure supabase is ready before use
async function ensureSupabaseReady() {
  if (!supabase) {
    const ready = await initSupabase();
    if (!ready) {
      throw new Error('Supabase is not available');
    }
  }
  return supabase;
}

// ════════════════════════════════════════════
//  DRIVERS TABLE FUNCTIONS
// ════════════════════════════════════════════

/**
 * Add a new driver to Supabase
 */
async function addDriver(driverData) {
  try {
    const sb = await ensureSupabaseReady();
    const { data, error } = await sb
      .from('drivers')
      .insert([driverData])
      .select();

    if (error) throw error;
    showToast('✓ Chauffeur enregistré avec succès !', 'success');
    return { success: true, data };
  } catch (error) {
    console.error('Erreur lors de l\'ajout du chauffeur:', error);
    showToast('✗ Erreur: ' + error.message, 'error');
    return { success: false, error: error.message };
  }
}

/**
 * Get all drivers from Supabase (ordered by creation date)
 */
async function getAllDrivers() {
  try {
    const sb = await ensureSupabaseReady();
    const { data, error } = await sb
      .from('drivers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Erreur lors de la récupération des chauffeurs:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Get all online drivers
 */
async function getOnlineDrivers() {
  try {
    const sb = await ensureSupabaseReady();
    const { data, error } = await sb
      .from('drivers')
      .select('*')
      .eq('status', 'online')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Erreur:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Get driver by email
 */
async function getDriverByEmail(email) {
  try {
    const sb = await ensureSupabaseReady();
    const { data, error } = await sb
      .from('drivers')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erreur:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get driver by phone
 */
async function getDriverByPhone(phone) {
  try {
    const sb = await ensureSupabaseReady();
    const { data, error } = await sb
      .from('drivers')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erreur:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update driver status (online/offline/busy)
 */
async function updateDriverStatus(driverId, status) {
  try {
    const sb = await ensureSupabaseReady();
    const { data, error } = await sb
      .from('drivers')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', driverId)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update driver location (GPS coordinates)
 */
async function updateDriverLocation(driverId, latitude, longitude) {
  try {
    const sb = await ensureSupabaseReady();
    const { data, error } = await sb
      .from('drivers')
      .update({ 
        latitude, 
        longitude, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', driverId)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la position:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update driver information
 */
async function updateDriver(driverId, updateData) {
  try {
    const sb = await ensureSupabaseReady();
    const { data, error } = await sb
      .from('drivers')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', driverId)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a driver
 */
async function deleteDriver(driverId) {
  try {
    const sb = await ensureSupabaseReady();
    const { error } = await sb
      .from('drivers')
      .delete()
      .eq('id', driverId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Subscribe to real-time driver changes
 * Usage: const subscription = subscribeToDrivers((payload) => { console.log(payload); });
 */
function subscribeToDrivers(callback) {
  if (!supabase) {
    console.error('Supabase not initialized for real-time subscription');
    return null;
  }
  
  const subscription = supabase
    .channel('drivers-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'drivers' },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✓ Real-time subscription active');
      }
    });

  return subscription;
}

/**
 * Unsubscribe from real-time changes
 */
async function unsubscribeFromDrivers(subscription) {
  if (subscription && supabase) {
    await supabase.removeChannel(subscription);
  }
}
