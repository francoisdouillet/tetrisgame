document.addEventListener("DOMContentLoaded", () => {
  const board = document.getElementById("tetris-board");

  for (let i = 0; i < 200; i++) {
    const cell = document.createElement("div");
    board.appendChild(cell);
  }
  spawnTetromino();
});

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

// Rotation function
function rotate(tetromino) {
  // Create a deep copy of the tetromino
  let copy = JSON.parse(JSON.stringify(tetromino));

  // Reverse each row to get a clockwise rotation 
  for (let i = 0; i < copy.length; i++) {
      copy[i].reverse();
  }

  // Swap rows and columns
  for (let i = 0; i < copy.length; i++) {
      for (let j = 0; j < i; j++) {
          [copy[i][j], copy[j][i]] = [copy[j][i], copy[i][j]];
      }
  }

  return copy;
}

function rotateTetromino() {
  const originalPosition = currentPosition;
  const rotatedTetromino = rotate(currentTetromino);
  undrawTetromino();
  currentTetromino = rotatedTetromino;

  const isAtLeftEdge = currentTetromino.some(row => row.some((cell, x) => cell === 1 && (currentPosition + x) % 10 === 0));
  const isAtRightEdge = currentTetromino.some(row => row.some((cell, x) => cell === 1 && (currentPosition + x) % 10 === 9));

  if (isAtLeftEdge || isAtRightEdge || checkCollision()) {
      currentTetromino = rotate(rotate(rotate(currentTetromino))); // Rotate back to the original orientation
      currentPosition = originalPosition;
  }

  drawTetromino();
}



// Test rotation
console.log("Original I Tetromino:", I_Tetromino);
console.log("Rotated I Tetromino:", rotate(I_Tetromino));

console.log("Original Z Tetromino:", Z_Tetromino);
console.log("Rotated Z Tetromino:", rotate(Z_Tetromino));

// Get random tetromino 
function getRandomTetromino() {
  const randomIndex = Math.floor(Math.random() * tetrominoes.length);
  return tetrominoes[randomIndex];
}



let currentTetromino;
let currentRotation = 0; // This will track the current rotation state of the Tetromino
let currentPosition = 4; // Adjust this to position the Tetromino at the top center

function drawTetromino() {
  const cells = document.querySelectorAll('#tetris-board div');

    currentTetromino.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value === 1) {
                cells[currentPosition + y * 10 + x].classList.add('tetromino');
            }
        });
    });
}

function spawnTetromino() {
    currentTetromino = getRandomTetromino();
    currentRotation = 0; // Reset rotation state for new Tetromino
    currentPosition = 4; // Adjust this value to position the new Tetromino at the top center

    // Draw the new Tetromino on the grid
    drawTetromino();
}

function undrawTetromino() {
  const cells = document.querySelectorAll('#tetris-board div');
  currentTetromino.forEach((row, y) => {
      row.forEach((value, x) => {
          if (value === 1) {
              cells[currentPosition + y * 10 + x].classList.remove('tetromino');
          }
      });
  });
}

function moveDown() {
  undrawTetromino(); // Remove the Tetromino from its current position
  currentPosition += 10; // Move down one row in a 10x20 grid
  drawTetromino(); // Draw the Tetromino in the new position
  if (checkCollision()) {
    console.log('test');
      lockTetromino();
      clearLines()
      spawnTetromino();
  }
}

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

function lockTetromino() {
  const cells = document.querySelectorAll('#tetris-board div');
  currentTetromino.forEach((row, y) => {
      row.forEach((value, x) => {
          if (value === 1) {
              cells[currentPosition + x + y * 10].classList.add('locked');
          }
      });
  });
}

function clearLines() {
  let linesCleared = 0;
  const cells = Array.from(document.querySelectorAll('#tetris-board div'));
  for (let i = 0; i < 20; i++) {
    const rowStart = i * 10;
    const row = cells.slice(rowStart, rowStart + 10);

    if (row.every(cell => cell.classList.contains('locked'))) {
      linesCleared++;
      row.forEach(cell => cell.remove()); // Remove cells from DOM
      const newCells = Array.from({ length: 10 }, () => {
        const newCell = document.createElement('div');
        board.prepend(newCell);
        return newCell;
      });
      cells.unshift(...newCells); // Add new cells to the `cells` collection
    }
  }

  // After clearing lines, shift all upper rows down
  if (linesCleared > 0) {
    shiftDownCells(cells, linesCleared);
  }

  if (linesCleared > 0) {
    // Update score or game speed
  }
}

// Shifts the cells above the cleared line down
function shiftDownCells(cells, linesCleared) {
  // Start from the first row above the cleared line and move each cell down
  for (let i = (linesCleared * 10) - 1; i >= 0; i--) {
    if (cells[i].classList.contains('locked')) {
      cells[i].classList.remove('locked');
      cells[i + (10 * linesCleared)].classList.add('locked');
    }
  }
}

function checkGameOver() {
  // Check if there's space for a new Tetromino to spawn
  // Return true if the game is over, false otherwise
}

// CLAVIER
document.addEventListener('keydown', event => {
  if (event.key === "ArrowLeft") {
      moveLeft();
  } else if (event.key === "ArrowRight") {
      moveRight();
  }
  if (event.key === "ArrowLeft") {
    moveLeft();
} else if (event.key === "ArrowRight") {
    moveRight();
} else if (event.key.toLowerCase() === 'r') {
    rotateTetromino();
}

});

function moveLeft() {
  undrawTetromino();

  // Vérifier si le tétrimino est au bord gauche
  const isAtLeftEdge = currentTetromino.some(row => 
      row.some((cell, x) => cell === 1 && (currentPosition + x) % 10 === 0)
  );

  if (!isAtLeftEdge) currentPosition -= 1;

  // Vérifier la collision après le déplacement
  if (checkCollisionAfterMove()) {
      currentPosition += 1;
  }

  drawTetromino();
}

function moveRight() {
  undrawTetromino();

  // Vérifier si le tétrimino est au bord droit
  const isAtRightEdge = currentTetromino.some(row => 
      row.some((cell, x) => cell === 1 && (currentPosition + x) % 10 === 9)
  );

  if (!isAtRightEdge) currentPosition += 1;

  // Vérifier la collision après le déplacement
  if (checkCollisionAfterMove()) {
      currentPosition -= 1;
  }

  drawTetromino();
}
function gameLoop() {  

  // Vérifier d'abord si le mouvement vers le bas est possible
  console.log(checkCollision())
  if (checkCollision()) {
    console.log('Condition checkCollisionGameLoop');
      lockTetromino();  // Verrouille le tétrimino en position
      clearLines()
      // Nettoie les lignes complètes après le verrouillage
      if (checkGameOver()) {
          // Stoppe le jeu si la condition de fin de jeu est remplie
      } else {
          spawnTetromino(); // Fait apparaître un nouveau tétrimino
      }
  } else {
      moveDown();  // Continue de déplacer le tétrimino vers le bas
  }
}

setInterval(gameLoop, 200); // Adjust timing as needed

