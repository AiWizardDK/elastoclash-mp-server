/**
 * ElastoClash Game Configuration
 * Indeholder alle vigtige konstanter og konfigurationsværdier for spillet
 */

// Database og Authentication konfiguration
/** @type {string} Supabase projekt URL */
export const SUPABASE_URL = "https://ucgyrynczmagjzwdkgha.supabase.co";

/** @type {string} Supabase anon/public nøgle */
export const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjZ3lyeW5jem1hZ2p6d2RrZ2hhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NzY2MDksImV4cCI6MjA2ODQ1MjYwOX0.pWv7L385SUs3jss2b4arfGkERZcgxbLT_AuuRq1vURg";

// Multiplayer server konfiguration
/** @type {string} WebSocket server URL for multiplayer */
export const SOCKET_SERVER_URL = "https://elastoclash-mp-server.onrender.com";

// Spil indstillinger
/** @type {Object} Standardindstillinger for fysik */
export const PHYSICS_CONFIG = {
    GRAVITY: 0.45,
    AIR_RESISTANCE: 0.99,
    GROUND_FRICTION: 0.95,
    MAX_VELOCITY: 15
};

/** @type {Object} Indstillinger for multiplayer synkronisering */
export const NETWORK_CONFIG = {
    TICK_RATE: 60,
    INTERPOLATION_DELAY: 100,
    SNAPSHOT_HISTORY: 10,
    RECONCILIATION_THRESHOLD: 0.1
};

/** @type {Object} Debug indstillinger */
export const DEBUG_CONFIG = {
    SHOW_FPS: false,
    SHOW_COLLISION_BOXES: false,
    SHOW_SERVER_INFO: false,
    LOG_LEVEL: 'info' // 'debug' | 'info' | 'warn' | 'error'
};

