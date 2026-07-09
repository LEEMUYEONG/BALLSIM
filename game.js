function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

class Game {
    constructor(lineup, pitcher, log) {
        this.lineup = lineup;   // Player(batter) 9명
        this.pitcher = pitcher; // Player(pitcher) 1명
        this.log = log;

        this.inning = 1;
        this.maxInning = 9;

        this.outs = 0;
        this.balls = 0;
        this.strikes = 0;

        this.bases = [false, false, false]; // [1루, 2루, 3루]
        this.score = 0;

        this.batterIndex = 0;
        this.isGameOver = false;
    }

    get currentBatter() {
        return this.lineup[this.batterIndex];
    }

    resetCount() {
        this.balls = 0;
        this.strikes = 0;
    }

    // 투구 1회 진행
    throwPitch() {
        if (this.isGameOver) return;

        const pitcher = this.pitcher;
        const batter = this.currentBatter;

        // 1) 스트라이크존 판정
        const strikeZoneChance = 0.45 + (pitcher.stats.control / 100) * 0.2; // 0.45~0.65
        const inZone = Math.random() < strikeZoneChance;

        if (!inZone) {
            this.balls++;
            this.log.add(`볼 (${this.balls}B ${this.strikes}S)`);
            if (this.balls >= 4) this.walk();
            return;
        }

        // 2) 컨택 판정
        const contactChance = clamp(0.5 + (batter.stats.contact - pitcher.stats.stuff) / 200, 0.1, 0.9);
        const madeContact = Math.random() < contactChance;

        if (!madeContact) {
            this.strikes++;
            this.log.add(`헛스윙 스트라이크 (${this.balls}B ${this.strikes}S)`);
            if (this.strikes >= 3) this.strikeOut();
            return;
        }

        // 3) 파울 판정
        if (Math.random() < 0.35) {
            if (this.strikes < 2) this.strikes++;
            this.log.add(`파울 (${this.balls}B ${this.strikes}S)`);
            return;
        }

        // 4) 인플레이 타구 결과 판정
        this.resolveBattedBall();
    }

    resolveBattedBall() {
        const batter = this.currentBatter;
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

    hit(bases) {
        const batter = this.currentBatter;
        const names = ["", "1루타", "2루타", "3루타", "홈런"];
        this.log.add(`${batter.name} ${names[bases]}!`);

        if (bases === 4) {
            const runners = this.bases.filter(b => b).length;
            this.score += runners + 1;
            this.bases = [false, false, false];
            this.log.add(`${runners + 1}점 득점!`);
        } else {
            const newBases = [false, false, false];
            let runsScored = 0;

            for (let i = 2; i >= 0; i--) {
                if (this.bases[i]) {
                    const newPos = i + bases;
                    if (newPos >= 3) runsScored++;
                    else newBases[newPos] = true;
                }
            }

            const batterPos = bases - 1;
            if (batterPos >= 3) runsScored++;
            else newBases[batterPos] = true;

            this.bases = newBases;
            this.score += runsScored;
            if (runsScored > 0) this.log.add(`${runsScored}점 득점!`);
        }

        this.resetCount();
        this.nextBatter();
    }

    walk() {
        const batter = this.currentBatter;
        this.log.add(`${batter.name} 볼넷 출루`);

        const newBases = [...this.bases];
        if (newBases[0]) {
            if (newBases[1]) {
                if (newBases[2]) {
                    this.score++;
                    this.log.add(`밀어내기 득점!`);
                }
                newBases[2] = true;
            }
            newBases[1] = true;
        }
        newBases[0] = true;
        this.bases = newBases;

        this.resetCount();
        this.nextBatter();
    }

    strikeOut() {
        this.log.add(`삼진!`);
        this.out();
    }

    out() {
        this.outs++;
        this.log.add(`아웃! (${this.outs}아웃)`);
        this.resetCount();
        this.nextBatter();
        this.checkInningEnd();
    }

    nextBatter() {
        this.batterIndex = (this.batterIndex + 1) % this.lineup.length;
    }

    checkInningEnd() {
        if (this.outs >= 3) {
            this.log.add(`--- ${this.inning}회 종료 (누적 ${this.score}점) ---`);
            this.outs = 0;
            this.bases = [false, false, false];
            this.inning++;

            if (this.inning > this.maxInning) {
                this.isGameOver = true;
                this.log.add(`경기 종료! 최종 점수: ${this.score}점`);
            }
        }
    }
}