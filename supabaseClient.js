// ════════════════════════════════════════════
//  SUPABASE CLIENT - COMPLETE VERSION
// ════════════════════════════════════════════

const SUPABASE_URL = 'https://uprhk9zcknjorj6-sm-eeac.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_upRhK9ZCkNbORj6-SM-EEA_CoKJif-l';

let supabase = null;

async function initSupabase() {
  try {
    if (!window.supabase) {
      console.error('❌ Supabase not loaded');
      return false;
    }
    
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✓ Supabase initialized');
    return true;
  } catch (error) {
    console.error('❌ Supabase init failed:', error);
    return false;
  }
}

async function ensureSupabaseReady() {
  if (!supabase) {
    const ready = await initSupabase();
    if (!ready) {
      throw new Error('Supabase not available');
    }
  }
  return supabase;
}

// ════════════════════════════════════════════
//  AUTHENTICATION & USERS
// ════════════════════════════════════════════

async function loginUser(email, password, isPro = false) {
  try {
    const sb = await ensureSupabaseReady();
    
    // Check if user exists
    let { data: existingUser, error: checkError } = await sb
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') throw checkError;
    
    // Create new user if doesn't exist
    if (!existingUser) {
      const { data: newUser, error: createError } = await sb
        .from('users')
        .insert([{
          email,
          password_hash: btoa(password),
          is_pro: isPro,
          balance: isPro ? 500 : 0,
          is_blocked: false,
          total_trips: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (createError) throw createError;
      existingUser = newUser;
    }
    
    // Verify password
    if (btoa(password) !== existingUser.password_hash) {
      return { success: false, error: 'Identifiants incorrects' };
    }
    
    return { 
      success: true, 
      user: {
        id: existingUser.id,
        email: existingUser.email,
        is_pro: existingUser.is_pro,
        balance: existingUser.balance,
        is_blocked: existingUser.is_blocked,
        total_trips: existingUser.total_trips
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
}

// ════════════════════════════════════════════
//  DRIVERS
// ════════════════════════════════════════════

async function addDriver(driverData) {
  try {
    const sb = await ensureSupabaseReady();
    const { data, error } = await sb
      .from('drivers')
      .insert([{
        ...driverData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error adding driver:', error);
    return { success: false, error: error.message };
  }
}

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
    console.error('Error fetching drivers:', error);
    return { success: false, error: error.message, data: [] };
  }
}

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
    console.error('Error:', error);
    return { success: false, error: error.message, data: [] };
  }
}

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
    console.error('Error updating status:', error);
    return { success: false, error: error.message };
  }
}

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
    console.error('Error updating location:', error);
    return { success: false, error: error.message };
  }
}

// ════════════════════════════════════════════
//  TRANSACTIONS & PAYMENTS
// ════════════════════════════════════════════

async function addTransaction(transactionData) {
  try {
    const sb = await ensureSupabaseReady();
    const { data, error } = await sb
      .from('transactions')
      .insert([{
        ...transactionData,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) throw error;
    console.log('✓ Transaction créée:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error adding transaction:', error);
    return { success: false, error: error.message };
  }
}

async function getUserTransactions(userId) {
  try {
    const sb = await ensureSupabaseReady();
    const { data, error } = await sb
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return { success: false, error: error.message, data: [] };
  }
}

async function getLastPayment(userId) {
  try {
    const sb = await ensureSupabaseReady();
    const { data, error } = await sb
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .in('payment_type', ['monthly', 'after_trips'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Error getting last payment:', error);
    return null;
  }
}

async function updateTransactionStatus(transactionId, status) {
  try {
    const sb = await ensureSupabaseReady();
    const { data, error } = await sb
      .from('transactions')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating transaction:', error);
    return { success: false, error: error.message };
  }
}

// ════════════════════════════════════════════
//  TRIPS (COURSES)
// ════════════════════════════════════════════

async function addTrip(tripData) {
  try {
    const sb = await ensureSupabaseReady();
    const { data, error } = await sb
      .from('trips')
      .insert([{
        ...tripData,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) throw error;
    
    // Increment user total trips
    if (tripData.user_id) {
      await incrementUserTrips(tripData.user_id);
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error adding trip:', error);
    return { success: false, error: error.message };
  }
}

async function getUserTripsCount(userId) {
  try {
    const sb = await ensureSupabaseReady();
    const { data, error, count } = await sb
      .from('trips')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting trips count:', error);
    return 0;
  }
}

async function incrementUserTrips(userId) {
  try {
    const sb = await ensureSupabaseReady();
    
    // Get current count
    const { data: user, error: getError } = await sb
      .from('users')
      .select('total_trips')
      .eq('id', userId)
      .single();
    
    if (getError) throw getError;
    
    // Update
    const { data, error } = await sb
      .from('users')
      .update({ 
        total_trips: (user.total_trips || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error incrementing trips:', error);
    return { success: false, error: error.message };
  }
}

// ════════════════════════════════════════════
//  USER BLOCKING
// ════════════════════════════════════════════

async function blockUser(userId, reason) {
  try {
    const sb = await ensureSupabaseReady();
    const { data, error } = await sb
      .from('users')
      .update({ 
        is_blocked: true,
        blocked_reason: reason,
        blocked_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select();

    if (error) throw error;
    console.log('✓ User blocked:', userId);
    return { success: true, data };
  } catch (error) {
    console.error('Error blocking user:', error);
    return { success: false, error: error.message };
  }
}

async function unblockUser(userId) {
  try {
    const sb = await ensureSupabaseReady();
    const { data, error } = await sb
      .from('users')
      .update({ 
        is_blocked: false,
        blocked_reason: null,
        blocked_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select();

    if (error) throw error;
    console.log('✓ User unblocked:', userId);
    return { success: true, data };
  } catch (error) {
    console.error('Error unblocking user:', error);
    return { success: false, error: error.message };
  }
}

// ════════════════════════════════════════════
//  ADMIN FUNCTIONS
// ════════════════════════════════════════════

async function getAllUsers() {
  try {
    const sb = await ensureSupabaseReady();
    const { data, error } = await sb
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, error: error.message, data: [] };
  }
}

async function getAllTransactions() {
  try {
    const sb = await ensureSupabaseReady();
    const { data, error } = await sb
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return { success: false, error: error.message, data: [] };
  }
}

async function getAllTrips() {
  try {
    const sb = await ensureSupabaseReady();
    const { data, error } = await sb
      .from('trips')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error fetching trips:', error);
    return { success: false, error: error.message, data: [] };
  }
}

// ════════════════════════════════════════════
//  REAL-TIME SUBSCRIPTIONS
// ════════════════════════════════════════════

function subscribeToDrivers(callback) {
  if (!supabase) {
    console.error('Supabase not initialized');
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
        console.log('✓ Drivers subscription active');
      }
    });

  return subscription;
}

function subscribeToTransactions(callback) {
  if (!supabase) {
    console.error('Supabase not initialized');
    return null;
  }
  
  const subscription = supabase
    .channel('transactions-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'transactions' },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✓ Transactions subscription active');
      }
    });

  return subscription;
}

async function unsubscribeFromDrivers(subscription) {
  if (subscription && supabase) {
    await supabase.removeChannel(subscription);
  }
}

async function unsubscribeFromTransactions(subscription) {
  if (subscription && supabase) {
    await supabase.removeChannel(subscription);
  }
}
