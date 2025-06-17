let currentDraggedElement = null;
let solutionBoard = null;

function generateChessboard() {
    const chessboard = document.getElementById('chessboard');
    const size = parseInt(document.getElementById('boardSize').value);
    chessboard.innerHTML = ''; // Clear previous board
    chessboard.style.gridTemplateColumns = `repeat(${size}, 60px)`;

    const board = createBoard(size);
    placeRandomQueens(board);

    // Create chessboard squares
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const square = document.createElement('div');
            square.className = (i + j) % 2 === 0 ? 'white' : 'black';
            square.dataset.row = i;
            square.dataset.col = j;
            square.ondrop = (e) => drop(e, i, j);
            square.ondragover = (e) => e.preventDefault();
            chessboard.appendChild(square);
        }
    }

    // Add queens to the board from the initial random arrangement
    addQueensToBoard(board);
}

function createBoard(size) {
    return Array.from({ length: size }, () => Array(size).fill(''));
}

function placeRandomQueens(board) {
    const size = board.length;
    const queens = Array.from({ length: size }, (_, i) => i); // [0, 1, 2, ..., size-1]
    shuffleArray(queens); // Randomly shuffle the array to get a random arrangement

    for (let col = 0; col < size; col++) {
        board[queens[col]][col] = 'Q'; // Place queen at a random row in each column
    }

    // Generate a solution for comparison later
    solutionBoard = solveNQueens(size);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function addQueensToBoard(board) {
    const size = board.length;

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (board[i][j] === 'Q') {
                const queen = document.createElement('div');
                queen.textContent = '♕';
                queen.className = 'queen';
                queen.draggable = true;
                queen.dataset.row = i;
                queen.dataset.col = j;

                const square = document.querySelector(`.black[data-row="${i}"][data-col="${j}"], .white[data-row="${i}"][data-col="${j}"]`);
                if (square) {
                    square.appendChild(queen);
                    addDragEvents(queen);
                }
            }
        }
    }
}

function addDragEvents(queen) {
    queen.addEventListener('dragstart', (e) => {
        currentDraggedElement = e.target;
        e.target.classList.add('dragging');
    });

    queen.addEventListener('dragend', () => {
        currentDraggedElement.classList.remove('dragging');
        updateBoardStatus();
    });
}

function drop(e, newRow, newCol) {
    e.preventDefault();
    const targetSquare = e.target.closest('.black, .white');
    if (!targetSquare || targetSquare.querySelector('.queen')) return; // Ensure the target square is not occupied

    if (currentDraggedElement) {
        const oldRow = parseInt(currentDraggedElement.dataset.row);
        const oldCol = parseInt(currentDraggedElement.dataset.col);

        // Remove the queen from the old position
        const oldSquare = document.querySelector(`.black[data-row="${oldRow}"][data-col="${oldCol}"], .white[data-row="${oldRow}"][data-col="${oldCol}"]`);
        if (oldSquare) oldSquare.innerHTML = '';

        // Move the queen to the new position
        targetSquare.appendChild(currentDraggedElement);
        currentDraggedElement.dataset.row = newRow;
        currentDraggedElement.dataset.col = newCol;

        // Update the board status
        updateBoardStatus();
    }
}

function updateBoardStatus() {
    const boardSize = parseInt(document.getElementById('boardSize').value);
    const board = Array.from({ length: boardSize }, () => Array(boardSize).fill(''));

    const queens = document.querySelectorAll('.queen');
    queens.forEach(queen => {
        const row = parseInt(queen.dataset.row);
        const col = parseInt(queen.dataset.col);
        board[row][col] = 'Q';
    });

    checkWin(board);
}

function checkWin(board) {
    const size = board.length;

    function isSafe(board, row, col) {
        // Check row and column
        for (let i = 0; i < size; i++) {
            if (i !== col && board[row][i] === 'Q') return false;
            if (i !== row && board[i][col] === 'Q') return false;
        }

        // Check diagonals
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (i !== row && j !== col && Math.abs(row - i) === Math.abs(col - j) && board[i][j] === 'Q') {
                    return false;
                }
            }
        }

        return true;
    }

    let valid = true;

    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (board[row][col] === 'Q' && !isSafe(board, row, col)) {
                valid = false;
                break;
            }
        }
        if (!valid) break;
    }

    if (valid) {
        document.getElementById('message').textContent = 'Congratulations! You have solved the N-Queens problem!';
        showConfetti(); // Show confetti animation
    } else {
        document.getElementById('message').textContent = 'The arrangement is incorrect. Queens are attacking each other!';
    }
}

function submitSolution() {
    const boardSize = parseInt(document.getElementById('boardSize').value);
    const userBoard = Array.from({ length: boardSize }, () => Array(boardSize).fill(''));

    const queens = document.querySelectorAll('.queen');
    queens.forEach(queen => {
        const row = parseInt(queen.dataset.row);
        const col = parseInt(queen.dataset.col);
        userBoard[row][col] = 'Q';
    });

    // Compare the user board with the solution board
    let isCorrect = true;
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (userBoard[row][col] !== solutionBoard[row][col]) {
                isCorrect = false;
                break;
            }
        }
        if (!isCorrect) break;
    }

    if (isCorrect) {
        document.getElementById('message').textContent = 'Congratulations! You have solved the N-Queens problem!';
        showConfetti(); // Show confetti animation
    } else {
        document.getElementById('message').textContent = 'The arrangement is incorrect. Queens are attacking each other!';
    }
}

// Solve N-Queens algorithm
function solveNQueens(n) {
    const board = Array.from({ length: n }, () => Array(n).fill(''));
    const solutions = [];

    function isSafe(board, row, col) {
        for (let i = 0; i < col; i++)
            if (board[row][i] === 'Q') return false;

        for (let i = row, j = col; i >= 0 && j >= 0; i--, j--)
            if (board[i][j] === 'Q') return false;

        for (let i = row, j = col; i < n && j >= 0; i++, j--)
            if (board[i][j] === 'Q') return false;

        return true;
    }

    function solve(col = 0) {
        if (col >= n) {
            const solution = board.map(row => [...row]);
            solutions.push(solution);
            return true;
        }

        for (let i = 0; i < n; i++) {
            if (isSafe(board, i, col)) {
                board[i][col] = 'Q';
                solve(col + 1);
                board[i][col] = '';
            }
        }

        return false;
    }

    solve();
    return solutions[0]; // Return the first solution
}

function showConfetti() {
    const confettiContainer = document.createElement('div');
    confettiContainer.style.position = 'absolute';
    confettiContainer.style.top = '0';
    confettiContainer.style.left = '0';
    confettiContainer.style.width = '100%';
    confettiContainer.style.height = '100%';
    confettiContainer.style.overflow = 'hidden';
    document.body.appendChild(confettiContainer);

    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.backgroundColor = getRandomColor();
        confetti.style.top = `${Math.random() * 100}%`;
        confetti.style.left = `${Math.random() * 100}%`;
        confettiContainer.appendChild(confetti);

        // Remove confetti after animation
        setTimeout(() => confetti.remove(), 1000);
    }

    // Remove confetti container after animation
    setTimeout(() => confettiContainer.remove(), 1000);
}

function getRandomColor() {
    const colors = ['#ff0', '#f0f', '#0ff', '#ff00ff', '#00ff00', '#00ffff', '#ff0000', '#0000ff'];
    return colors[Math.floor(Math.random() * colors.length)];
}
