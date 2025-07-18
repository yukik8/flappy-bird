// HTML要素の取得
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

// ゲーム状態
let gameRunning = false;
let score = 0;

// 鳥オブジェクト
const bird = {
    x: 50,
    y: 300,
    width: 30,
    height: 30,
    velocity: 0
};

// パイプ配列
let pipes = [];

// ゲーム初期化
function init() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    scoreElement.textContent = score;
    gameRunning = true;
    startScreen.classList.add('hidden');
    gameOverElement.classList.add('hidden');
    gameLoop();
}

// 鳥をジャンプさせる
function jump() {
    if (gameRunning) {
        bird.velocity = -10;
    }
}

// ゲームループ
function gameLoop() {
    if (!gameRunning) return;

    // 画面をクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 鳥の更新
    bird.velocity += 0.6; // 重力
    bird.y += bird.velocity;

    // 画面外チェック
    if (bird.y < 0 || bird.y + bird.height > canvas.height) {
        gameOver();
        return;
    }

    // パイプ生成
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
        const gap = 500;
        const topHeight = Math.random() * (canvas.height - gap - 100) + 50;
        pipes.push({
            x: canvas.width,
            topHeight: topHeight,
            bottomY: topHeight + gap,
            passed: false
        });
    }

    // パイプ更新
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= 10;

        // 画面外のパイプを削除
        if (pipes[i].x + 60 < 0) {
            pipes.splice(i, 1);
            continue;
        }

        // スコア更新
        if (!pipes[i].passed && pipes[i].x + 60 < bird.x) {
            pipes[i].passed = true;
            score++;
            scoreElement.textContent = score;
        }

        // 当たり判定
        if (bird.x < pipes[i].x + 60 && bird.x + bird.width > pipes[i].x) {
            if (bird.y < pipes[i].topHeight || bird.y + bird.height > pipes[i].bottomY) {
                gameOver();
                return;
            }
        }
    }

    // 描画
    drawBird();
    drawPipes();

    requestAnimationFrame(gameLoop);
}

// 鳥を描画
function drawBird() {
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);

    // 目
    ctx.fillStyle = 'black';
    ctx.fillRect(bird.x + 10, bird.y + 8, 5, 5);
}

// パイプを描画
function drawPipes() {
    ctx.fillStyle = '#228B22';
    pipes.forEach(pipe => {
        // 上のパイプ
        ctx.fillRect(pipe.x, 0, 60, pipe.topHeight);
        // 下のパイプ
        ctx.fillRect(pipe.x, pipe.bottomY, 60, canvas.height - pipe.bottomY);
    });
}

// ゲームオーバー
function gameOver() {
    gameRunning = false;
    finalScoreElement.textContent = score;
    fetch("http://localhost:8000/submit_score/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "Yuki", score: score })
    }).then(() => {
        fetchLeaderboard();
    });
    gameOverElement.classList.remove('hidden');
}

// リーダーボードを表示
function fetchLeaderboard() {
    fetch("http://localhost:8000/leaderboard")
        .then(res => res.json())
        .then(data => {
            const leaderboardElement = document.getElementById("leaderboard");
            leaderboardElement.innerHTML = ''; // いったん空にする
            data.forEach((entry, index) => {
                const li = document.createElement("li");
                li.textContent = `${index + 1}. ${entry.username} - ${entry.score}`;
                leaderboardElement.appendChild(li);
            });
        });
}

// イベントリスナー
startBtn.addEventListener('click', init);
restartBtn.addEventListener('click', init);

// マウス操作
canvas.addEventListener('click', () => {
    if (!gameRunning && !startScreen.classList.contains('hidden')) {
        init();
    } else {
        jump();
    }
});