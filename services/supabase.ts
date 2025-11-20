import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// SUPABASE CONFIGURATION
// ------------------------------------------------------------------
// 1. Go to https://database.new to create a project
// 2. Get your keys from Project Settings > API
// 3. Paste them below to activate the Backend
// ------------------------------------------------------------------

const SUPABASE_URL: string = 'https://epnyaixionfzhdemmvsf.supabase.co';
const SUPABASE_KEY: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwbnlhaXhpb25memhkZW1tdnNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1MTM3MDEsImV4cCI6MjA3OTA4OTcwMX0.eWQkrraMdkard1VcYUVITRQ8NI8pgm7ItwJjS1af3rk';

// ------------------------------------------------------------------

let supabase: SupabaseClient | null = null;

const isConfigured = SUPABASE_URL !== 'YOUR_SUPABASE_URL' && !SUPABASE_URL.includes('YOUR_');

if (isConfigured) {
    try {
        supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log("Supabase client initialized.");
    } catch (e) {
        console.error("Failed to initialize Supabase client", e);
    }
} else {
    console.log("Supabase keys missing or default. App running in LocalStorage mode.");
}

export { supabase };

/**
 * A Hybrid Sync Hook helper.
 * 
 * This logic allows the app to seamlessly switch between LocalStorage (Prototype)
 * and Supabase (Production) based on whether keys are present.
 * 
 * It uses a JSONB column strategy to allow you to dump complex JS objects
 * into Supabase without needing complex relational table migrations for now.
 */
export const syncState = async <T>(
    tableName: string,
    localStorageKey: string,
    currentState: T,
    setFunction: (data: T) => void,
    isInitialLoad: boolean
): Promise<void> => {

    // Mode 1: LocalStorage (Fallback)
    if (!supabase) {
        // Save to LS
        try {
            const serialized = JSON.stringify(currentState);
            const stored = localStorage.getItem(localStorageKey);
            if (stored !== serialized) {
                localStorage.setItem(localStorageKey, serialized);
            }
        } catch (error) {
            console.warn(`LocalStorage quota exceeded for ${localStorageKey}`);
        }
        return;
    }

    // Mode 2: Supabase (Cloud)
    // Strategy: We use a table with columns: id (text), data (jsonb)
    // We store the entire state array/object in the 'data' column of a row with id = 'global_state'
    // This is a "Singleton" pattern for state, easiest for migration.
    
    if (isInitialLoad) {
        // FETCH
        const { data, error } = await supabase
            .from(tableName)
            .select('data')
            .eq('id', 'global_state')
            .single();

        if (error) {
            // PGRST116 is 'Row not found' - this is normal on first run
            if (error.code === 'PGRST116') {
                console.log(`Initializing ${tableName} in Supabase...`);
                // For new tables, we just insert the default state
                // However, we need to handle NULL values (like currentUser = null)
                // Supabase JSONB columns have NOT NULL constraint usually.
                // We wrap null in a special object if needed, or just ensure data is not null.
                const payload = currentState === null ? { _is_null: true } : currentState;

                await supabase
                    .from(tableName)
                    .upsert({ id: 'global_state', data: payload });
            } else if (error.code === '42P01') {
                 // 42P01 is 'Undefined Table' - SQL hasn't been run
                 console.error(`Error fetching ${tableName}: Table does not exist. Please run the SQL schema in database_schema.sql`);
            } else if (error.code === '42703') {
                 // 42703 is 'Undefined Column' - Table exists but is wrong format
                 console.error(`SCHEMA MISMATCH on table '${tableName}': The table exists but is missing the 'data' column. Please run the database_schema.sql script to RESET your tables.`);
            } else {
                // Log full error object for debugging
                console.error(`Error fetching ${tableName}:`, JSON.stringify(error, null, 2));
            }
        }

        if (data && data.data) {
            console.log(`Loaded ${tableName} from Supabase`);
            // Unwrap null if it was stored as placeholder
            if (data.data && typeof data.data === 'object' && data.data._is_null) {
                 setFunction(null as T);
            } else {
                 setFunction(data.data);
            }
        } 
    } else {
        // SAVE (Debounced in App.tsx, but here is the raw call)
        // We prefer UPSERT
        const payload = currentState === null ? { _is_null: true } : currentState;

        const { error } = await supabase
            .from(tableName)
            .upsert({ id: 'global_state', data: payload });
            
        if (error) {
             if (error.code === 'PGRST204' || error.code === '42703') {
                 console.error(`SCHEMA ERROR on table '${tableName}': The database schema is incorrect. Run the SQL from database_schema.sql to fix it.`);
             } else if (error.code === '23502') {
                 console.error(`NULL CONSTRAINT ERROR on table '${tableName}': The database refused a null value. This is handled by the wrapper logic but something went wrong.`, payload);
             } else {
                 console.error(`Error saving ${tableName}:`, JSON.stringify(error, null, 2));
             }
        }
    }
};


// ------------------------------------------------------------------
// AUTHENTICATION HELPERS
// ------------------------------------------------------------------

export const signUp = async (email: string, password: string, name: string) => {
    if (!supabase) return { error: { message: "Backend not connected" }, data: null };
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name,
            }
        }
    });
    return { data, error };
}

export const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: { message: "Backend not connected" }, data: null };
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    return { data, error };
}

export const signOut = async () => {
    if (!supabase) return { error: { message: "Backend not connected" } };
    const { error } = await supabase.auth.signOut();
    return { error };
}
