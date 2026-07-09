console.log("BALLSIM START");

const mainScreen = document.getElementById("mainScreen");
const gameScreen = document.getElementById("gameScreen");
const logBox = document.getElementById("logBox");
const scoreBoard = document.getElementById("scoreBoard");

document.getElementById("btnPlayGame").addEventListener("click", () => {
    mainScreen.style.display = "none";
    gameScreen.style.display = "block";
    startGame();
});

document.getElementById("btnBackToMain").addEventListener("click", () => {
    gameScreen.style.display = "none";
    mainScreen.style.display = "block";
    logBox.innerHTML = "";
});

// 나머지 버튼은 아직 미구현
["btnSeason", "btnTeam", "btnPlayers", "btnSettings"].forEach(id => {
    document.getElementById(id).addEventListener("click", () => {
        alert("아직 준비중인 기능입니다.");
    });
});

function startGame() {
    const log = new Log();

    // 로그 추가될 때마다 화면에도 출력
    const originalAdd = log.add.bind(log);
    log.add = (message) => {
        originalAdd(message);
        const line = document.createElement("p");
        line.textContent = message;
        logBox.appendChild(line);
        logBox.scrollTop = logBox.scrollHeight;
    };

    const lineup = Array.from({ length: 9 }, (_, i) => createBatter(`타자${i + 1}`));
    const pitcher = createPitcher("상대투수");
    const game = new Game(lineup, pitcher, log);

    scoreBoard.textContent = "경기 시작!";

    while (!game.isGameOver) {
        game.throwPitch();
    }

    scoreBoard.textContent = `최종 스코어: ${game.score}점`;
}