// ════════════════════════════════════════════
//  SUPABASE CLIENT INITIALIZATION
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
//  AUTHENTICATION
// ════════════════════════════════════════════

async function loginUser(email, password, isPro = false) {
  try {
    const sb = await ensureSupabaseReady();
    
    let { data: existingUser, error: checkError } = await sb
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') throw checkError;
    
    if (!existingUser) {
      const { data: newUser, error: createError } = await sb
        .from('users')
        .insert([{
          email,
          password_hash: btoa(password),
          is_pro: isPro,
          balance: isPro ? 500 : 0,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (createError) throw createError;
      existingUser = newUser;
    }
    
    if (btoa(password) !== existingUser.password_hash) {
      return { success: false, error: 'Identifiants incorrects' };
    }
    
    return { 
      success: true, 
      user: {
        id: existingUser.id,
        email: existingUser.email,
        is_pro: existingUser.is_pro,
        balance: existingUser.balance
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
