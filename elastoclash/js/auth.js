// js/auth.js

/**
 * Holder reference til Supabase client instance
 * @type {import('@supabase/supabase-js').SupabaseClient|null}
 */
let supabaseInstance = null;

/**
 * Initialiserer auth modulet med en Supabase client
 * @param {import('@supabase/supabase-js').SupabaseClient} supabaseClient - Supabase client instance
 * @returns {Promise<void>}
 * @throws {Error} Hvis supabaseClient er ugyldig
 */
export async function initAuth(supabaseClient) {
    if (!supabaseClient) {
        throw new Error('Supabase client er påkrævet for at initialisere auth');
    }
    supabaseInstance = supabaseClient;
}

/**
 * Starter Google OAuth login flow
 * @returns {Promise<void>}
 * @throws {Error} Hvis auth ikke er initialiseret
 */
export async function signInWithGoogle() {
    if (!supabaseInstance) throw new Error('Auth er ikke initialiseret');
    
    const { error } = await supabaseInstance.auth.signInWithOAuth({
        provider: 'google',
    });
    if (error) {
        console.error('Login fejl:', error);
        throw new Error('Login fejl: ' + error.message);
    }
}

/**
 * Logger den nuværende bruger ud
 * @returns {Promise<void>}
 * @throws {Error} Hvis auth ikke er initialiseret
 */
export async function signOut() {
    if (!supabaseInstance) throw new Error('Auth er ikke initialiseret');
    
    const { error } = await supabaseInstance.auth.signOut();
    if (error) {
        console.error('Logout fejl:', error);
        throw new Error('Logout fejl: ' + error.message);
    }
}

/**
 * Henter den nuværende bruger
 * @returns {Promise<import('@supabase/supabase-js').User|null>}
 * @throws {Error} Hvis auth ikke er initialiseret
 */
export async function getCurrentUser() {
    if (!supabaseInstance) throw new Error('Auth er ikke initialiseret');
    
    const { data, error } = await supabaseInstance.auth.getUser();
    if (error) {
        console.error('Fejl ved hentning af bruger:', error);
        return null;
    }
    return data.user;
}

/**
 * Tilføjer en listener for ændringer i auth status
 * @param {(event: string, session: import('@supabase/supabase-js').Session|null) => void} callback 
 * @throws {Error} Hvis auth ikke er initialiseret eller callback ikke er en funktion
 */
export function onAuthChange(callback) {
    if (!supabaseInstance) throw new Error('Auth er ikke initialiseret');
    if (typeof callback !== 'function') throw new Error('Callback skal være en funktion');
    
    return supabaseInstance.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
}

/**
 * Sikrer at brugeren er logget ind før en handling udføres
 * @returns {Promise<import('@supabase/supabase-js').User>}
 * @throws {Error} Hvis auth ikke er initialiseret eller login fejler
 */
export async function requireAuth() {
    if (!supabaseInstance) throw new Error('Auth er ikke initialiseret');
    
    const user = await getCurrentUser();
    if (!user) {
        await signInWithGoogle();
        const newUser = await getCurrentUser();
        if (!newUser) {
            throw new Error('Kunne ikke logge ind');
        }
        return newUser;
    }
    return user;
}
