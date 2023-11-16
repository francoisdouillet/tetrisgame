document.addEventListener("DOMContentLoaded", () => {
  const board = document.getElementById("tetris-board");

  for (let i = 0; i < 200; i++) {
    const cell = document.createElement("div");
    board.appendChild(cell);
  }
  spawnTetromino();
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



// Fonction de rotation
function rotate(tetromino) {
  // Créer une copie profonde du tétrimino
  let copy = JSON.parse(JSON.stringify(tetromino));

  // Inverser chaque rangée pour obtenir une rotation dans le sens horaire
  for (let i = 0; i < copy.length; i++) {
      copy[i].reverse();
  }

  // Échanger les rangées et les colonnes
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

//  random tetromino 
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
              if (cells[currentPosition + y * 10 + x].classList.contains('locked')) {
                console.log('Tetromino GAME OVER !!!!!!');
                return;
              }            
                cells[currentPosition + y * 10 + x].classList.add('tetromino')
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
    score += calculateScore(linesCleared);
    const scoreElement = document.getElementById('score')
    scoreElement.textContent = score;
    
    console.log(calculateScore(linesCleared));
  }
}

function calculateScore(lines) {
  switch (lines) {
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


function GameOver() {
 
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
function checkCollisionAfterMove(direction) {
  const shift = direction === 'left' ? -1 : 1; // -1 for left, 1 for right
  const cells = document.querySelectorAll('#tetris-board div');

  return currentTetromino.some((row, y) => {
    return row.some((cell, x) => {
      if (cell === 1) {
        let nextPos = currentPosition + x + y * 10 + shift; // Calculate next position based on direction
        // Check if next position is within board boundaries
        if (nextPos >= 0 && nextPos < cells.length) {
          // Check for collision with locked tetromino
          if (cells[nextPos].classList.contains('locked')) {
            return true;
          }
        }
      }
      return false;
    });
  });
}

function moveLeft() {
  undrawTetromino();

  // Check if the tetromino is at the left edge or if there's a collision on the left
  const isAtLeftEdge = currentTetromino.some(row => 
    row.some((cell, x) => cell === 1 && (currentPosition + x) % 10 === 0)
  );

  if (!isAtLeftEdge && !checkCollisionAfterMove('left')) {
    currentPosition -= 1; // Move left by one position
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
  if (checkCollision()) {
    
    lockTetromino();
    clearLines()
    spawnTetromino();
} else {
      moveDown();  // Continue de déplacer le tétrimino vers le bas
  }
}

setInterval(gameLoop, 200); // Pour ajuster le temps

