console.log("BALLSIM START");

const mainScreen = document.getElementById("mainScreen");
const gameScreen = document.getElementById("gameScreen");
const logBox = document.getElementById("logBox");
const scoreBoard = document.getElementById("scoreBoard");
const statusLine = document.getElementById("statusLine");

let game = null;

document.getElementById("btnPlayGame").addEventListener("click", () => {
    mainScreen.style.display = "none";
    gameScreen.style.display = "block";
    setupGame();
    updateUI();
});

document.getElementById("btnBackToMain").addEventListener("click", () => {
    gameScreen.style.display = "none";
    mainScreen.style.display = "block";
    logBox.innerHTML = "";
});

["btnSeason", "btnTeam", "btnPlayers", "btnSettings"].forEach(id => {
    document.getElementById(id).addEventListener("click", () => {
        alert("아직 준비중인 기능입니다.");
    });
});

document.getElementById("btnNextPitch").addEventListener("click", () => {
    game.stepPitch();
    updateUI();
});

document.getElementById("btnNextBatter").addEventListener("click", () => {
    game.stepBatter();
    updateUI();
});

document.getElementById("btnNextHalfInning").addEventListener("click", () => {
    game.stepHalfInning();
    updateUI();
});

function setupGame() {
    const log = new Log();

    const originalAdd = log.add.bind(log);
    log.add = (message) => {
        originalAdd(message);

        const line = document.createElement("p");
        line.textContent = message;
        logBox.appendChild(line);

        // 박스 높이를 넘으면 가장 오래된(맨 위) 줄부터 제거
        while (logBox.scrollHeight > logBox.clientHeight && logBox.firstChild) {
            logBox.removeChild(logBox.firstChild);
        }
    };

    const awayLineup = Array.from({ length: 9 }, (_, i) => createBatter(`어웨이타자${i + 1}`));
    const awayPitcher = createPitcher("어웨이투수");
    const awayTeam = new Team("어웨이", awayLineup, awayPitcher);

    const homeLineup = Array.from({ length: 9 }, (_, i) => createBatter(`홈타자${i + 1}`));
    const homePitcher = createPitcher("홈투수");
    const homeTeam = new Team("홈", homeLineup, homePitcher);

    game = new Game(awayTeam, homeTeam, log);
}

function updateUI() {
    updateScoreboard();
    updateDiamond();
    updateCount();
}

function updateScoreboard() {
    const board = document.getElementById("inningBoard");
    let html = "<tr><th>팀</th>";
    for (let i = 1; i <= game.maxInning; i++) {
        html += `<th>${i}</th>`;
    }
    html += "<th>R</th></tr>";

    html += "<tr><td>어웨이</td>";
    for (let i = 1; i <= game.maxInning; i++) {
        html += `<td>${getInningScore(true, i)}</td>`;
    }
    html += `<td>${game.awayScore}</td></tr>`;

    html += "<tr><td>홈</td>";
    for (let i = 1; i <= game.maxInning; i++) {
        html += `<td>${getInningScore(false, i)}</td>`;
    }
    html += `<td>${game.homeScore}</td></tr>`;

    board.innerHTML = html;
}

// 이닝별 득점 기록이 아직 없으므로, 현재 이닝만 강조 표시하는 임시 버전
function getInningScore(isAway, inningNum) {
    if (inningNum === game.inning) {
        const isCurrentHalf = isAway === game.topOfInning;
        return isCurrentHalf ? (game.topOfInning ? "▶" : "▶") : "";
    }
    return "";
}

function updateDiamond() {
    setBase("base1", "label1", game.bases[0]);
    setBase("base2", "label2", game.bases[1]);
    setBase("base3", "label3", game.bases[2]);

    const batterName = game.isGameOver ? "" : game.battingTeam.currentBatter.name;
    document.getElementById("baseHome").classList.toggle("active", !game.isGameOver);
    document.getElementById("labelHome").textContent = batterName;
}

function setBase(baseId, labelId, runnerName) {
    document.getElementById(baseId).classList.toggle("active", runnerName !== null);
    document.getElementById(labelId).textContent = runnerName || "";
}

function updateCount() {
    for (let i = 1; i <= 3; i++) {
        document.getElementById(`ball${i}`).classList.toggle("active-ball", i <= game.balls);
    }
    for (let i = 1; i <= 2; i++) {
        document.getElementById(`strike${i}`).classList.toggle("active-strike", i <= game.strikes);
    }
    for (let i = 1; i <= 2; i++) {
        document.getElementById(`out${i}`).classList.toggle("active-out", i <= game.outs);
    }
}