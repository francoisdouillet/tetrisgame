let gameBoard;
document.addEventListener("DOMContentLoaded", () => {
  gameBoard = new GameBoard("tetris-board");
  gameBoard.spawnTetromino();
  gameLoopInterval = setInterval(gameLoop, 1000); // Start the game loop
});
let score = 0
// Formes Tetris
const I_Tetromino = [
  [0, 0, 0, 0],
  [1, 1, 1, 1],
  [0, 0, 0, 0],
  [0, 0, 0, 0]
];

const J_Tetromino = [
  [1, 0, 0],
  [1, 1, 1],
  [0, 0, 0]
];

const L_Tetromino = [
  [0, 0, 1],
  [1, 1, 1],
  [0, 0, 0]
];

const O_Tetromino = [
  [1, 1],
  [1, 1]
];

const S_Tetromino = [
  [0, 1, 1],
  [1, 1, 0],
  [0, 0, 0]
];

const T_Tetromino = [
  [0, 1, 0],
  [1, 1, 1],
  [0, 0, 0]
];

const Z_Tetromino = [
  [1, 1, 0],
  [0, 1, 1],
  [0, 0, 0]
];

const tetrominoes = [I_Tetromino, J_Tetromino, L_Tetromino, O_Tetromino, S_Tetromino, T_Tetromino, Z_Tetromino];

class GameBoard {
  constructor(boardId) {
    this.board = document.getElementById(boardId);
    this.cells = [];
    this.currentTetromino = null;
    this.score = 0;
    this.initBoard();
  }
  
  get firstLine() {
    return this.cells.slice(0,10)
  }

  initBoard() {
    for (let i = 0; i < 200; i++) {
      const cell = document.createElement("div");
      this.board.appendChild(cell);
      this.cells.push(cell);
    }
  }

  gameOver() {
    const modal = document.getElementById('gameOverModal');
    const restartButton = document.getElementById('restartButton');
  
    // Display the modal
    modal.style.display = 'block';
    document.removeEventListener('keydown', handleKeydown)
    clearInterval(gameLoopInterval)
    // Handle restart button click
    restartButton.addEventListener('click', () => {
      // Close the modal
      modal.style.display = 'none';
  
      // Reset the game state (you may need to implement a resetGame function)
      gameBoard.resetGame(); // Implement a resetGame method in your GameBoard class
    });
  }
  

  spawnTetromino() {
    this.currentTetromino = new Tetromino(getRandomTetromino(), this);
    this.currentTetromino.draw();
    if(this.checkCollision()) {
      this.gameOver()
    }
  }


  checkCollision() {
    const cells = this.cells;
    const shape = this.currentTetromino.shape;
    const position = this.currentTetromino.currentPosition;
  
    return shape.some((row, y) => {
      return row.some((cell, x) => {
        if (cell === 1) {
          let nextPos = (position.y + y + 1) * 10 + position.x + x;
          if (nextPos >= 200 || cells[nextPos].classList.contains('locked')) {
            return true;
          }
        }
        return false;
      });
    });
  }
  checkCollisionAfterMove(tetromino, direction) {
    const shift = direction === 'left' ? -1 : 1;
    const shape = tetromino.shape;
    const position = tetromino.currentPosition;

    return shape.some((row, y) => {
        return row.some((cell, x) => {
            if (cell === 1) {
                let nextPosX = position.x + x + shift;
                let nextPosY = position.y + y;
                let nextPos = nextPosY * 10 + nextPosX;

                // Check if the next position is outside the game board boundaries
                if (nextPosX < 0 || nextPosX > 9 || nextPosY >= 20 || 
                    this.cells[nextPos].classList.contains('locked')) {
                    return true;
                }
            }
            return false;
        });
    });
}
  checkCollisionAfterRotate(tetromino) {
    const shape = tetromino.shape;
    const position = tetromino.currentPosition;

    return shape.some((row, y) => {
        return row.some((cell, x) => {
            if (cell === 1) {
                let nextPos = (position.y + y) * 10 + position.x + x;
                if (nextPos < 0 || nextPos >= 200 || 
                    nextPos % 10 === 0 || nextPos % 10 === 9 ||
                    this.cells[nextPos].classList.contains('locked')) {
                    return true;
                }
            }
            return false;
        });
    });
}

  lockTetromino() {
    // Updated to use the correct position and shape of the current Tetromino
    const cells = this.cells;
    const shape = this.currentTetromino.shape;
    const position = this.currentTetromino.currentPosition;
    shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value === 1) {
          let cellIndex = (position.y + y) * 10 + position.x + x;
          if (cells[cellIndex]) {
              cells[cellIndex].classList.add('locked', 'tetromino');
          }
        }
      });
    });
  }

  calculateScore(linesCleared) {
    // Logic to update the score
    switch (linesCleared) {
      case 1:
        return 100; // Single line
      case 2:
        return 300; // Double line
      case 3:
        return 500; // Triple line
      case 4:
        return 800; // Tetris
      default:
        return 0;
    }
  }

  clearLines() {
    // Logic to clear completed lines
    let linesCleared = 0;
    const cells = Array.from(document.querySelectorAll('#tetris-board div'));
    
    for (let i = 0; i < 20; i++) {
      const rowStart = i * 10;
      const row = cells.slice(rowStart, rowStart + 10);
  
      if (row.every(cell => cell.classList.contains('locked'))) {
        linesCleared++;
        // Clear the full line
        row.forEach(cell => cell.classList.remove('locked', 'tetromino'));
  
        // Move down all the rows above the cleared line
        for (let j = i; j >= 0; j--) {
          const currentRowStart = j * 10;
          const aboveRowStart = (j - 1) * 10;
  
          cells.slice(aboveRowStart, aboveRowStart + 10).forEach((cell, index) => {
            if (cell.classList.contains('locked')) {
              cells[currentRowStart + index].classList.add('locked', 'tetromino');
              cell.classList.remove('locked', 'tetromino');
            }
          });
        }
  
        // Adjust index to recheck the same row in the next iteration (since all rows above have shifted down)
        i--;
      }
    }
  
    // Handle score update or other game logic if lines are cleared
    if (linesCleared > 0) {
     
      // Update score or game speed, if needed
      score += this.calculateScore(linesCleared);
      const scoreElement = document.getElementById('score')
      scoreElement.textContent = score;
      
    }
  }

  checkGameOver() {
    // Check if the game is over (for example, if the first row is occupied)
    console.log(this.firstLine)
    return this.cells.slice(0, 10).some(cell => cell.classList.contains('locked'));
  }
  


  resetGame() {
    // Clear the board
    this.cells.forEach((cell) => {
      cell.classList.remove('locked', 'tetromino');
    });

    // Reset other properties
    this.currentTetromino = null;
    this.score = 0;
    this.updateScoreDisplay(); // Implement this method to update the score display
    // Any other properties that need to be reset

    // Restart the game loop
    clearInterval(gameLoopInterval);
    this.spawnTetromino()
    document.addEventListener('keydown', handleKeydown)
    gameLoopInterval = setInterval(gameLoop, 1000);
  }

  updateScoreDisplay() {
    // Implement this method to update the score display on the HTML page
    const scoreElement = document.getElementById('score');
    scoreElement.textContent = this.score;
  }

}

class Tetromino {
  constructor(shape, gameBoard) {
    this.shape = shape;
    this.gameBoard = gameBoard;
    this.currentPosition = { x: 4, y: 0 };
    this.currentRotation = 0;
  }
  draw() {
    const cells = this.gameBoard.cells;
    this.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value === 1) {
          const cellIndex = (this.currentPosition.y + y) * 10 + this.currentPosition.x + x;
          if (cells[cellIndex]) { // Check if cell exists
            cells[cellIndex].classList.add('tetromino');
          }
        }
      });
    });
  }
  undraw() {
    // Corrected logic to undraw the Tetromino
    const cells = this.gameBoard.cells;
    this.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value === 1) {
          const cellIndex = (this.currentPosition.y + y) * 10 + this.currentPosition.x + x;
          if (cells[cellIndex]) { // Check if cell exists before trying to remove class
            cells[cellIndex].classList.remove('tetromino');
          }
        }
      });
    });
  }
  moveDown() {
    this.undraw(); // First, remove the current drawing
    this.currentPosition.y++; // Update y position
    // if(this.gameBoard.checkGameOver()){
    //   // console.log('test')
    // }
    if (this.gameBoard.checkCollision()) {
        this.currentPosition.y; // Revert the move if there's a collision
        this.gameBoard.lockTetromino(); // Lock the Tetromino in place
        this.gameBoard.clearLines(); // Clear any completed lines
        this.gameBoard.spawnTetromino(); // Spawn a new Tetromino
    } else {
        this.draw(); // Redraw at the new position
    }
}
moveLeft() {
  this.undraw();
  const newPosition = { ...this.currentPosition, x: this.currentPosition.x - 1 };
  if (!this.gameBoard.checkCollisionAfterMove(this, 'left')) {
    this.currentPosition.x--;
}
  this.draw();
}

moveRight() {
  this.undraw();
  const newPosition = { ...this.currentPosition, x: this.currentPosition.x + 1 };
  if (!this.gameBoard.checkCollisionAfterMove(this, 'right')) {
    this.currentPosition.x++;
}
  this.draw();
}

rotate() {
  const originalPosition = this.currentPosition.x;
  let offset = 1;
  this.undraw();
  this.shape = this.rotateShape(this.shape);

  // Check for collision and adjust if necessary
  while (this.gameBoard.checkCollisionAfterRotate(this)) {
      this.currentPosition.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > this.shape[0].length) {
          this.rotateShape(this.shape, true); // Revert if we can't find a valid rotation position
          this.currentPosition.x = originalPosition;
          return;
      }
  }

  this.draw();
}

rotateShape(matrix, reverse = false) {
  // Transpose + reverse = rotate 90 degrees
  const rotatedShape = matrix[0].map((val, index) =>
      matrix.map(row => reverse ? row[index] : row[row.length - 1 - index])
  );
  return rotatedShape;
}

  // Other methods as needed (e.g., moveLeft, moveRight)
}

//  random tetromino 
function getRandomTetromino() {
  const randomIndex = Math.floor(Math.random() * tetrominoes.length);
  return tetrominoes[randomIndex];
}

let currentTetromino;
let currentRotation = 0; // This will track the current rotation state of the Tetromino
let currentPosition = 4; // Adjust this to position the Tetromino at the top center



function checkCollision() {
  const cells = document.querySelectorAll('#tetris-board div');

  return currentTetromino.some((row, y) => {
    return row.some((cell, x) => {
      if (cell === 1) {
        let nextPos = currentPosition + x + (y + 1) * 10; // Position dans la prochaine rangée
        // Vérifier si la position suivante est en dehors de la grille (bas du jeu)
        if (nextPos >= cells.length) {
          return true;
        }
        // Vérifier si la cellule suivante est déjà prise par un tétrimino verrouillé
        if (cells[nextPos].classList.contains('locked')) {
          return true;
        }
      }
      return false;
    });
  });
}


// CLAVIER
function handleKeydown(event) {
  if (!gameBoard.currentTetromino) return;

  switch (event.key) {
      case "ArrowLeft":
          gameBoard.currentTetromino.moveLeft();
          break;
      case "ArrowRight":
          gameBoard.currentTetromino.moveRight();
          break;
      case "ArrowDown":
          gameBoard.currentTetromino.moveDown();
          break;
      case "r":
      case "R":
          gameBoard.currentTetromino.rotate();
          break;
      // Add other controls as needed
  }
}

document.addEventListener('keydown', handleKeydown)


function gameLoop() {  
    gameBoard.currentTetromino.moveDown();
}

let gameLoopInterval; // Declare the variable to store the interval ID