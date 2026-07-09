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
        logBox.scrollTop = logBox.scrollHeight;
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
    const half = game.topOfInning ? "초" : "말";
    scoreBoard.textContent = `${game.inning}회 ${half} | 어웨이 ${game.awayScore} : ${game.homeScore} 홈`;

    const baseText = `1루${game.bases[0] ? "●" : "-"} 2루${game.bases[1] ? "●" : "-"} 3루${game.bases[2] ? "●" : "-"}`;
    statusLine.textContent = `${game.balls}B ${game.strikes}S | ${game.outs}아웃 | ${baseText}`;

    if (game.isGameOver) {
        statusLine.textContent += " | 경기 종료";
    }
}