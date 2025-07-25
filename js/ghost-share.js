// js/ghost-share.js

// Ghost record format version
const GHOST_VERSION = '1.0.0';
const GHOST_STORAGE_PREFIX = 'elastoclash_ghost_';
const MAX_STORED_GHOSTS = 10;

/**
 * Represents a ghost recording including metadata
 * @typedef {Object} GhostRecording
 * @property {string} version - Format version
 * @property {string} id - Unique identifier
 * @property {string} playerName - Name of the player
 * @property {string} levelId - ID of the level
 * @property {string} difficulty - Difficulty setting
 * @property {number} score - Final score
 * @property {number} time - Completion time
 * @property {string} date - Recording date
 * @property {Array<{x: number, y: number, angle: number, t: number, state?: string}>} frames - Ghost frame data
 */

/**
 * Validates ghost data format
 * @param {GhostRecording} ghost - Ghost data to validate
 * @returns {boolean} True if valid
 */
function validateGhostData(ghost) {
    try {
        return (
            ghost &&
            ghost.version &&
            ghost.id &&
            ghost.playerName &&
            ghost.levelId &&
            ghost.difficulty &&
            Array.isArray(ghost.frames) &&
            ghost.frames.length > 0 &&
            ghost.frames.every(frame =>
                typeof frame.x === 'number' &&
                typeof frame.y === 'number' &&
                typeof frame.angle === 'number' &&
                typeof frame.t === 'number'
            )
        );
    } catch (e) {
        console.error('Ghost validation error:', e);
        return false;
    }
}

/**
 * Compress ghost data for storage/sharing
 * @param {GhostRecording} ghost - Ghost data to compress
 * @returns {string} Compressed data
 */
function compressGhost(ghost) {
    try {
        // Convert positions to deltas for better compression
        const compressed = {
            ...ghost,
            frames: ghost.frames.map((frame, i, arr) => {
                if (i === 0) return frame;
                const prev = arr[i - 1];
                return {
                    x: frame.x - prev.x,
                    y: frame.y - prev.y,
                    angle: frame.angle - prev.angle,
                    t: frame.t - prev.t,
                    state: frame.state
                };
            })
        };
        
        // Use more efficient encoding than JSON
        const serialized = JSON.stringify(compressed);
        return btoa(serialized);
    } catch (e) {
        console.error('Ghost compression error:', e);
        return null;
    }
}

/**
 * Decompress ghost data
 * @param {string} compressed - Compressed ghost data
 * @returns {GhostRecording|null} Decompressed ghost data or null if invalid
 */
function decompressGhost(compressed) {
    try {
        const decompressed = JSON.parse(atob(compressed));
        
        // Convert deltas back to absolute positions
        decompressed.frames = decompressed.frames.map((frame, i, arr) => {
            if (i === 0) return frame;
            const prev = arr[i - 1];
            return {
                x: frame.x + prev.x,
                y: frame.y + prev.y,
                angle: frame.angle + prev.angle,
                t: frame.t + prev.t,
                state: frame.state
            };
        });
        
        if (!validateGhostData(decompressed)) {
            console.warn('Decompressed ghost data failed validation.');
            return null;
        }

        if (decompressed.version !== GHOST_VERSION) {
            console.warn(`Ghost version mismatch. Expected ${GHOST_VERSION}, got ${decompressed.version}.`);
            return null;
        }
        
        return decompressed;
    } catch (e) {
        console.error('Ghost decompression error:', e);
        return null;
    }
}

/**
 * Save ghost recording locally
 * @param {string} name - Identifier for the ghost
 * @param {GhostRecording} ghostData - Ghost data to save
 * @returns {boolean} Success status
 */
export function saveGhost(name, ghostData) {
    try {
        if (!validateGhostData(ghostData)) {
            throw new Error('Invalid ghost data format');
        }
        
        // Manage storage limits
        const storedGhosts = listStoredGhosts();
        if (storedGhosts.length >= MAX_STORED_GHOSTS && !storedGhosts.includes(name)) {
            // Remove oldest ghost if at limit
            const oldest = storedGhosts[0];
            localStorage.removeItem(GHOST_STORAGE_PREFIX + oldest);
        }
        
        const compressed = compressGhost(ghostData);
        localStorage.setItem(GHOST_STORAGE_PREFIX + name, compressed);
        return true;
    } catch (e) {
        console.error('Error saving ghost:', e);
        return false;
    }
}

/**
 * Load ghost recording from local storage
 * @param {string} name - Identifier for the ghost
 * @returns {GhostRecording|null} Ghost data or null if not found/invalid
 */
export function loadGhost(name) {
    try {
        const compressed = localStorage.getItem(GHOST_STORAGE_PREFIX + name);
        if (!compressed) return null;
        
        const ghost = decompressGhost(compressed);
        if (!ghost) {
            console.warn(`Found corrupt ghost data for "${name}", removing...`);
            localStorage.removeItem(GHOST_STORAGE_PREFIX + name);
            return null;
        }
        
        return ghost;
    } catch (e) {
        console.error('Error loading ghost:', e);
        return null;
    }
}

/**
 * List all stored ghost recordings
 * @returns {string[]} Array of ghost identifiers
 */
export function listStoredGhosts() {
    return Object.keys(localStorage)
        .filter(key => key.startsWith(GHOST_STORAGE_PREFIX))
        .map(key => key.substring(GHOST_STORAGE_PREFIX.length))
        .sort((a, b) => {
            const ghostA = loadGhost(a);
            const ghostB = loadGhost(b);
            // Convert date strings to numbers for proper chronological sorting
            const dateA = ghostA?.date ? new Date(ghostA.date).getTime() : 0;
            const dateB = ghostB?.date ? new Date(ghostB.date).getTime() : 0;
            return dateA - dateB;
        });
}

/**
 * Export ghost data for sharing
 * @param {GhostRecording} ghostData - Ghost data to export
 * @returns {string} Shareable string representation
 */
export function exportGhost(ghostData) {
    try {
        if (!validateGhostData(ghostData)) {
            throw new Error('Invalid ghost data format');
        }
        return compressGhost(ghostData);
    } catch (e) {
        console.error('Error exporting ghost:', e);
        return null;
    }
}

/**
 * Import ghost data from shared string
 * @param {string} str - Shared ghost data string
 * @returns {GhostRecording|null} Ghost data or null if invalid
 */
export function importGhost(str) {
    try {
        const ghost = decompressGhost(str);
        if (!ghost) {
            throw new Error('Invalid ghost data');
        }
        return ghost;
    } catch (e) {
        console.error('Error importing ghost:', e);
        return null;
    }
}

/**
 * Generate a shareable URL for a ghost recording
 * @param {GhostRecording} ghostData - Ghost data to share
 * @returns {string} Shareable URL
 */
export function getGhostShareURL(ghostData) {
    try {
        const code = exportGhost(ghostData);
        if (!code) throw new Error('Failed to export ghost');
        
        const url = new URL(window.location.href);
        url.searchParams.set('ghost', code);
        return url.toString();
    } catch (e) {
        console.error('Error generating share URL:', e);
        return null;
    }
}

/**
 * Load ghost data from URL parameters
 * @returns {GhostRecording|null} Ghost data or null if not found/invalid
 */
export function loadGhostFromURL() {
    try {
        const params = new URLSearchParams(window.location.search);
        const ghostParam = params.get('ghost');
        return ghostParam ? importGhost(ghostParam) : null;
    } catch (e) {
        console.error('Error loading ghost from URL:', e);
        return null;
    }
}

/**
 * Compare two ghost recordings
 * @param {GhostRecording} ghost1 - First ghost
 * @param {GhostRecording} ghost2 - Second ghost
 * @returns {Object} Comparison statistics
 */
export function compareGhosts(ghost1, ghost2) {
    if (!ghost1 || !ghost2) return null;
    
    return {
        timeDiff: ghost2.time - ghost1.time,
        scoreDiff: ghost2.score - ghost1.score,
        efficiency: ghost1.frames.length / ghost2.frames.length,
        tricks: {
            ghost1: countTricks(ghost1),
            ghost2: countTricks(ghost2)
        }
    };
}

/**
 * Count tricks performed in a ghost recording
 * @param {GhostRecording} ghost - Ghost recording to analyze
 * @returns {Object} Trick statistics
 */
function countTricks(ghost) {
    const tricks = {
        flips: 0,
        airTime: 0,
        maxHeight: 0
    };
    
    let lastGrounded = true;
    let airStart = 0;
    
    ghost.frames.forEach((frame, i) => {
        // Detect flips
        if (i > 0) {
            const prevAngle = ghost.frames[i-1].angle;
            const angleDiff = Math.abs(frame.angle - prevAngle);
            if (angleDiff > Math.PI) tricks.flips++;
        }
        
        // Track air time
        if (frame.state === 'air' && lastGrounded) {
            airStart = frame.t;
            lastGrounded = false;
        } else if (frame.state !== 'air' && !lastGrounded) {
            tricks.airTime += frame.t - airStart;
            lastGrounded = true;
        }
        
        // Track max height
        tricks.maxHeight = Math.max(tricks.maxHeight, frame.y);
    });
    
    return tricks;
}
