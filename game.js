function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

class Team {
    constructor(name, lineup, pitcher) {
        this.name = name;
        this.lineup = lineup;
        this.pitcher = pitcher;
        this.batterIndex = 0;
    }

    get currentBatter() {
        return this.lineup[this.batterIndex];
    }

    nextBatter() {
        this.batterIndex = (this.batterIndex + 1) % this.lineup.length;
    }
}

class Game {
    constructor(awayTeam, homeTeam, log) {
        this.away = awayTeam;
        this.home = homeTeam;
        this.log = log;

        this.inning = 1;
        this.maxInning = 9;
        this.topOfInning = true; // true = 초(어웨이 공격), false = 말(홈 공격)

        this.outs = 0;
        this.balls = 0;
        this.strikes = 0;
        this.bases = [null, null, null];

        this.awayScore = 0;
        this.homeScore = 0;

        this.isGameOver = false;
        this.atBatOver = false;
        this.halfInningOver = false;
    }

    get battingTeam() {
        return this.topOfInning ? this.away : this.home;
    }

    get pitchingTeam() {
        return this.topOfInning ? this.home : this.away;
    }

    resetCount() {
        this.balls = 0;
        this.strikes = 0;
    }

    throwPitch() {
        if (this.isGameOver || this.halfInningOver) return;

        this.atBatOver = false;

        const pitcher = this.pitchingTeam.pitcher;
        const batter = this.battingTeam.currentBatter;

        const strikeZoneChance = 0.45 + (pitcher.stats.control / 100) * 0.2;
        const inZone = Math.random() < strikeZoneChance;

        if (!inZone) {
            this.balls++;
            this.log.add(`볼 (${this.balls}B ${this.strikes}S)`);
            if (this.balls >= 4) this.walk();
            return;
        }

        const contactChance = clamp(0.5 + (batter.stats.contact - pitcher.stats.stuff) / 200, 0.1, 0.9);
        const madeContact = Math.random() < contactChance;

        if (!madeContact) {
            this.strikes++;
            this.log.add(`헛스윙 스트라이크 (${this.balls}B ${this.strikes}S)`);
            if (this.strikes >= 3) this.strikeOut();
            return;
        }

        if (Math.random() < 0.35) {
            if (this.strikes < 2) this.strikes++;
            this.log.add(`파울 (${this.balls}B ${this.strikes}S)`);
            return;
        }

        this.resolveBattedBall();
    }

    resolveBattedBall() {
        const batter = this.battingTeam.currentBatter;
        const power = batter.stats.power;
        const rand = Math.random() * 100;

        const outThreshold = 65 - power * 0.15;
        const singleThreshold = outThreshold + 20;
        const doubleThreshold = singleThreshold + (8 + power * 0.05);
        const tripleThreshold = doubleThreshold + 2;

        if (rand < outThreshold) {
            this.log.add(`${batter.name} 타구 아웃`);
            this.out();
        } else if (rand < singleThreshold) {
            this.hit(1);
        } else if (rand < doubleThreshold) {
            this.hit(2);
        } else if (rand < tripleThreshold) {
            this.hit(3);
        } else {
            this.hit(4);
        }
    }

    addScore(runs) {
        if (this.topOfInning) this.awayScore += runs;
        else this.homeScore += runs;
    }

    // constructor 안
     // 기존 [false, false, false] 대신

// hit()
    hit(bases) {
        const batter = this.battingTeam.currentBatter;
        const names = ["", "1루타", "2루타", "3루타", "홈런"];
        this.log.add(`${batter.name} ${names[bases]}!`);

        if (bases === 4) {
            const runners = this.bases.filter(b => b !== null).length;
            this.addScore(runners + 1);
            this.bases = [null, null, null];
            this.log.add(`${runners + 1}점 득점!`);
        } else {
            const newBases = [null, null, null];
            let runsScored = 0;

            for (let i = 2; i >= 0; i--) {
                if (this.bases[i] !== null) {
                    const newPos = i + bases;
                    if (newPos >= 3) runsScored++;
                    else newBases[newPos] = this.bases[i];
                }
            }
            const batterPos = bases - 1;
            if (batterPos >= 3) runsScored++;
            else newBases[batterPos] = batter.name;

            this.bases = newBases;
            if (runsScored > 0) {
                this.addScore(runsScored);
                this.log.add(`${runsScored}점 득점!`);
            }
        }
        this.endAtBat();
    }
    // walk()
    walk() {
        const batter = this.battingTeam.currentBatter;
        this.log.add(`${batter.name} 볼넷 출루`);

        const newBases = [...this.bases];
        if (newBases[0] !== null) {
            if (newBases[1] !== null) {
                if (newBases[2] !== null) {
                    this.addScore(1);
                    this.log.add(`밀어내기 득점!`);
                }
                newBases[2] = newBases[1];
            }
            newBases[1] = newBases[0];
        }
        newBases[0] = batter.name;
        this.bases = newBases;

        this.endAtBat();
    }

    strikeOut() {
        this.log.add(`삼진!`);
        this.out();
    }

    out() {
        this.outs++;
        this.log.add(`아웃! (${this.outs}아웃)`);
        this.endAtBat();

        if (this.outs >= 3) {
            this.endHalfInning();
        }
    }

    endAtBat() {
        this.resetCount();
        this.battingTeam.nextBatter();
        this.atBatOver = true;
    }

    endHalfInning() {
        const half = this.topOfInning ? "초" : "말";
        this.log.add(`--- ${this.inning}회 ${half} 종료 (어웨이 ${this.awayScore} : 홈 ${this.homeScore}) ---`);

        this.outs = 0;
        this.bases = [null, null, null];
        this.halfInningOver = true;

        if (!this.topOfInning) {
            this.inning++;
            if (this.inning > this.maxInning) {
                this.isGameOver = true;
                this.log.add(`경기 종료! 최종 스코어 어웨이 ${this.awayScore} : 홈 ${this.homeScore}`);
            }
        }
    }

    proceedToNextHalf() {
        if (this.isGameOver) return;
        this.topOfInning = !this.topOfInning;
        this.halfInningOver = false;
        this.log.add(`--- ${this.inning}회 ${this.topOfInning ? "초" : "말"} 시작 ---`);
    }

    // ===== 버튼에서 호출할 단위별 진행 함수 =====

    stepPitch() {
        if (this.isGameOver) return;
        if (this.halfInningOver) {
            this.proceedToNextHalf();
            return;
        }
        this.throwPitch();
    }

    stepBatter() {
        if (this.isGameOver) return;
        if (this.halfInningOver) {
            this.proceedToNextHalf();
            return;
        }
        this.atBatOver = false;
        while (!this.atBatOver && !this.halfInningOver && !this.isGameOver) {
            this.throwPitch();
        }
    }

    stepHalfInning() {
        if (this.isGameOver) return;
        if (this.halfInningOver) {
            this.proceedToNextHalf();
            return;
        }
        while (!this.halfInningOver && !this.isGameOver) {
            this.throwPitch();
        }
    }
}