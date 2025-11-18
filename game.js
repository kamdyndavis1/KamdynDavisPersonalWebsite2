const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Music elements (optional; may not exist if page not fully loaded when script runs)
const gameMusic = document.getElementById('gameMusic');
const gameMusicToggle = document.getElementById('gameMusicToggle');
let musicEnabled = false;

if (gameMusicToggle) {
    gameMusicToggle.addEventListener('click', function() {
        // Toggle playback state
        if (!gameMusic) return;
        if (gameMusic.paused) {
            gameMusic.play().catch(()=>{});
            musicEnabled = true;
            gameMusicToggle.textContent = 'Pause Music';
        } else {
            gameMusic.pause();
            musicEnabled = false;
            gameMusicToggle.textContent = 'Play Music';
        }
    });
}

// Bird properties
const bird = {
    x: 50,
    y: 150,
    width: 30,
    height: 30,
    gravity: 0.2,
    lift: -4,
    velocity: 0,

    draw: function() {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    },

    update: function() {
        this.velocity += this.gravity;
        this.y += this.velocity;

        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.velocity = 0;
        }
        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }
    },

    flap: function() {
        this.velocity = this.lift;
    }
};

// Pipe properties
const pipeWidth = 50;
const pipeGap = 120;
const pipes = [];
const pipeSpeed = 2;

function createPipe() {
    const pipeHeight = Math.floor(Math.random() * (canvas.height - pipeGap - 100)) + 50;
    pipes.push({
        x: canvas.width,
        y: 0,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    });
    pipes.push({
        x: canvas.width,
        y: pipeHeight + pipeGap,
        width: pipeWidth,
        height: canvas.height - pipeHeight - pipeGap,
        passed: false
    });
}

function drawPipes() {
    for (let i = 0; i < pipes.length; i++) {
        let p = pipes[i];
        ctx.fillStyle = 'green';
        ctx.fillRect(p.x, p.y, p.width, p.height);
    }
}

function updatePipes() {
    for (let i = 0; i < pipes.length; i++) {
        let p = pipes[i];
        p.x -= pipeSpeed;

        // Remove pipes that are off-screen
        if (p.x + p.width < 0) {
            pipes.splice(i, 1);
            i--;
        }
    }

    // Generate new pipes
    if (pipes.length === 0 || pipes[pipes.length - 2].x < canvas.width - 200) {
        createPipe();
    }
}

function checkCollision() {
    for (let i = 0; i < pipes.length; i++) {
        let p = pipes[i];

        if (
            bird.x < p.x + p.width &&
            bird.x + bird.width > p.x &&
            bird.y < p.y + p.height &&
            bird.y + bird.height > p.y
        ) {
            return true; // Collision detected
        }
    }
    return false;
}

let score = 0;
let gameState = 'start'; // 'start', 'playing', 'gameOver'

function resetGame() {
    bird.y = 150;
    bird.velocity = 0;
    pipes.length = 0;
    score = 0;
    gameState = 'start';
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 20);
}

// Event listener for jumping
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        if (gameState === 'start') {
            gameState = 'playing';
            // Start music when game begins if user enabled it previously
            if (gameMusic && musicEnabled) {
                gameMusic.currentTime = 0;
                gameMusic.play().catch(()=>{});
            }
            gameLoop();
        } else if (gameState === 'playing') {
            bird.flap();
        } else if (gameState === 'gameOver') {
            resetGame();
            // Pause music on reset/game over
            if (gameMusic) {
                gameMusic.pause();
            }
        }
    }
});

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bird.update();
    bird.draw();
    
    if (gameState === 'playing') {
        updatePipes();
        drawPipes();
        
        // Check for collisions
        if (checkCollision()) {
            gameState = 'gameOver';
            // pause music on game over
            if (gameMusic) {
                gameMusic.pause();
            }
        }
        
        // Update score
        for (let i = 0; i < pipes.length; i++) {
            let p = pipes[i];
            if (p.x + p.width < bird.x && !p.passed && p.y === 0) {
                score++;
                p.passed = true;
                break;
            }
        }
        
        requestAnimationFrame(gameLoop);
    }
    
    drawScore();
    
    // Draw game state messages
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    if (gameState === 'start') {
        ctx.fillText('Press Space to Start', canvas.width / 2 - 140, canvas.height / 2);
    } else if (gameState === 'gameOver') {
        ctx.fillText('Game Over!', canvas.width / 2 - 80, canvas.height / 2 - 30);
        ctx.fillText('Score: ' + score, canvas.width / 2 - 60, canvas.height / 2 + 10);
        ctx.fillText('Press Space to Restart', canvas.width / 2 - 140, canvas.height / 2 + 50);
    }
}

// Initial setup
resetGame();
gameLoop();
