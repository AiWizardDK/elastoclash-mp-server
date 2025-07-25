// js/leaderboard-ui.js

import { fetchLeaderboard } from './leaderboard.js';

export async function showLeaderboard() {
  let panel = document.getElementById("leaderboard-panel");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "leaderboard-panel";
    document.body.appendChild(panel);
  }

  panel.innerHTML = `<h2>🏆 Leaderboard</h2><div id="leaderboard-content">Henter...</div>`;
  panel.classList.add("active");

  let scores = [];
  try {
    scores = await fetchLeaderboard(10);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    document.getElementById("leaderboard-content").innerHTML = `<p>Kunne ikke hente leaderboard. Prøv igen senere.</p>`;
    return;
  }

  let html = `
    <table class="leaderboard-table">
      <tr><th>#</th><th>Navn</th><th>Sejr-tid (sek)</th></tr>
  `;
  if (scores.length === 0) {
    html += `<tr><td colspan="3">Ingen scores fundet.</td></tr>`;
  } else {
    scores.forEach((s, i) => {
      html += `<tr>
        <td>${i + 1}</td>
        <td>${s.name || "Ukendt"}</td>
        <td>${(s.time / 1000).toFixed(2)}</td>
      </tr>`;
    });
  }
  html += `</table>`;

  document.getElementById("leaderboard-content").innerHTML = html;

  // Klik uden for for at lukke panelet
  panel.onclick = (e) => {
    if (e.target === panel) {
      panel.classList.remove("active");
    }
  };
}

export function hideLeaderboard() {
  const panel = document.getElementById("leaderboard-panel");
  if (panel) {
    panel.classList.remove("active");
  }
}
