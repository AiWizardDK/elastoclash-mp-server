// js/pause-ui.js

export class PauseMenu {
    constructor() {
        this.pauseUi = null;
        this.isPaused = false;
        this.onResumeCallback = () => {};
        this.onResetCallback = () => {};
        this.onQuitCallback = () => {};

        this.#createUI();
        this.#setupEventListeners();
    }

    #createUI() {
        this.pauseUi = document.getElementById('pause-ui');
        if (!this.pauseUi) {
            this.pauseUi = document.createElement('div');
            this.pauseUi.id = 'pause-ui';
            document.body.appendChild(this.pauseUi);
        }
        this.pauseUi.innerHTML = `
            <h2>⏸️ Pause</h2>
            <button id="pause-resume">Fortsæt</button>
            <button id="pause-reset">Genstart</button>
            <button id="pause-quit">Afslut</button>
        `;
        this.pauseUi.classList.add('pause-menu-hidden'); // Initially hidden
    }

    #setupEventListeners() {
        document.getElementById('pause-resume').onclick = () => {
            this.hidePauseMenu();
            this.onResumeCallback();
        };
        document.getElementById('pause-reset').onclick = () => {
            this.hidePauseMenu();
            this.onResetCallback();
        };
        document.getElementById('pause-quit').onclick = () => {
            this.hidePauseMenu();
            this.onQuitCallback();
        };
    }

    /**
     * Viser pausemenuen og sætter callbacks.
     * @param {object} callbacks - Objekt med resume, reset, quit funktioner.
     * @param {Function} callbacks.resume - Funktion der kaldes ved fortsæt.
     * @param {Function} callbacks.reset - Funktion der kaldes ved genstart.
     * @param {Function} callbacks.quit - Funktion der kaldes ved afslut.
     */
    showPauseMenu({ resume, reset, quit }) {
        this.isPaused = true;
        this.onResumeCallback = resume || (() => {});
        this.onResetCallback = reset || (() => {});
        this.onQuitCallback = quit || (() => {});
        this.pauseUi.classList.remove('pause-menu-hidden');
        this.pauseUi.classList.add('pause-menu-active');
    }

    /**
     * Skjuler pausemenuen.
     */
    hidePauseMenu() {
        this.isPaused = false;
        this.pauseUi.classList.remove('pause-menu-active');
        this.pauseUi.classList.add('pause-menu-hidden');
    }

    /**
     * Tjekker om spillet er pauset.
     * @returns {boolean} True hvis pauset, ellers false.
     */
    getPaused() {
        return this.isPaused;
    }
}
