const board = document.getElementById("board");
const numbers = document.getElementById("numbers");
const message = document.getElementById("message");
const timerDisplay = document.getElementById("timer");
const mistakesDisplay = document.getElementById("mistakes");
const difficulty = document.getElementById("difficulty");

let solution = [];
let puzzle = [];
let values = [];
let notes = [];
let cells = [];
let selected = -1;
let pencilMode = false;
let mistakes = 0;
let seconds = 0;
let gameOver = false;
let timerInterval;

function shuffledNumbers() {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9]
        .sort(() => Math.random() - 0.5);
}

function isValid(grid, row, col, number) {
    for (let i = 0; i < 9; i++) {
        if (grid[row * 9 + i] === number) return false;
        if (grid[i * 9 + col] === number) return false;
    }

    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;

    for (let r = startRow; r < startRow + 3; r++) {
        for (let c = startCol; c < startCol + 3; c++) {
            if (grid[r * 9 + c] === number) return false;
        }
    }

    return true;
}

function generateSolution(grid) {
    const index = grid.indexOf(0);

    if (index === -1) return true;

    const row = Math.floor(index / 9);
    const col = index % 9;

    for (const number of shuffledNumbers()) {
        if (isValid(grid, row, col, number)) {
            grid[index] = number;

            if (generateSolution(grid)) return true;

            grid[index] = 0;
        }
    }

    return false;
}

function generatePuzzle() {
    solution = Array(81).fill(0);
    generateSolution(solution);

    puzzle = [...solution];

    const difficultyLevels = {
        easy: 35,
        medium: 45,
        hard: 52
    };

    const holes = difficultyLevels[difficulty.value];
    const positions = shuffledNumbers()
        .flatMap(() => Array.from({ length: 9 }, (_, i) => i))
        .slice(0, 0);

    const shuffledPositions = Array.from({ length: 81 },
        (_, i) => i
    ).sort(() => Math.random() - 0.5);

    shuffledPositions.slice(0, holes).forEach(index => {
        puzzle[index] = 0;
    });

    values = [...puzzle];
    notes = Array.from({ length: 81 }, () => new Set());
}

function renderBoard() {
    board.innerHTML = "";
    cells = [];

    values.forEach((value, index) => {
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "cell";
        cell.dataset.index = index;
        cell.setAttribute("aria-label", `Row ${Math.floor(index / 9) + 1}, column ${index % 9 + 1}`);

        if (puzzle[index] !== 0) {
            cell.classList.add("fixed");
        }

        cell.addEventListener("click", () => {
            if (gameOver) return;
            selected = index;
            renderBoard();
        });

        cells.push(cell);
        board.appendChild(cell);
    });

    updateBoard();
}

function updateBoard() {
    const selectedValue = selected >= 0 ? values[selected] : 0;

    cells.forEach((cell, index) => {
        cell.className = "cell";

        const row = Math.floor(index / 9);
        const col = index % 9;

        if (puzzle[index] !== 0) {
            cell.classList.add("fixed");
        }

        if (selected >= 0) {
            const selectedRow = Math.floor(selected / 9);
            const selectedCol = selected % 9;

            if (
                row === selectedRow ||
                col === selectedCol ||
                (
                    Math.floor(row / 3) === Math.floor(selectedRow / 3) &&
                    Math.floor(col / 3) === Math.floor(selectedCol / 3)
                )
            ) {
                cell.classList.add("related");
            }

            if (index === selected) {
                cell.classList.add("selected");
            }

            if (selectedValue && values[index] === selectedValue) {
                cell.classList.add("same-number");
            }
        }

        cell.innerHTML = "";

        if (values[index]) {
            cell.textContent = values[index];

            if (puzzle[index] === 0 && values[index] !== solution[index]) {
                cell.classList.add("error");
            }
        } else if (notes[index].size > 0) {
            cell.classList.add("notes-cell");

            const noteGrid = document.createElement("div");
            noteGrid.className = "notes";

            for (let n = 1; n <= 9; n++) {
                const span = document.createElement("span");
                span.textContent = notes[index].has(n) ? n : "";
                noteGrid.appendChild(span);
            }

            cell.appendChild(noteGrid);
        }

        cell.setAttribute(
            "aria-label",
            `Row ${row + 1}, column ${col + 1}, ${values[index] || "empty"}`
        );
    });

    updateNumberPad();
}

function updateNumberPad() {
    numbers.innerHTML = "";

    for (let number = 1; number <= 9; number++) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = number;

        const count = values.filter(value => value === number).length;
        button.disabled = count >= 9 || gameOver;

        button.addEventListener("click", () => enterNumber(number));

        numbers.appendChild(button);
    }
}

function enterNumber(number) {
    if (gameOver || selected < 0 || puzzle[selected] !== 0) {
        message.textContent = "Select an empty cell first.";
        return;
    }

    if (pencilMode) {
        if (values[selected] !== 0) return;

        if (notes[selected].has(number)) {
            notes[selected].delete(number);
        } else {
            notes[selected].add(number);
        }

        message.textContent = "Pencil notes updated.";
        updateBoard();
        return;
    }

    values[selected] = number;
    notes[selected].clear();

    if (number !== solution[selected]) {
        mistakes++;
        message.textContent = "Incorrect number. Try again!";
        message.style.color = "#dc2626";
    } else {
        message.textContent = "Correct!";
        message.style.color = "#15803d";
    }

    mistakesDisplay.textContent = `${mistakes} / 3`;
    updateBoard();

    if (values.every((value, index) => value === solution[index])) {
        finishGame("Congratulations! You solved Sudoku!");
        return;
    }

    if (mistakes >= 3) {
        finishGame("Game over! Start a new game to try again.");
    }
}

function eraseCell() {
    if (gameOver || selected < 0 || puzzle[selected] !== 0) return;

    values[selected] = 0;
    notes[selected].clear();
    message.textContent = "Cell cleared.";
    updateBoard();
}

function resetBoard() {
    values = [...puzzle];
    notes = Array.from({ length: 81 }, () => new Set());
    selected = -1;
    pencilMode = false;
    mistakes = 0;
    seconds = 0;
    gameOver = false;

    document.getElementById("pencil").textContent = "Pencil: Off";
    document.getElementById("pencil").classList.remove("active");

    mistakesDisplay.textContent = "0 / 3";
    timerDisplay.textContent = "00:00";
    message.textContent = "Board reset. Good luck!";
    message.style.color = "#64748b";

    startTimer();
    renderBoard();
}

function giveHint() {
    if (gameOver) return;

    if (selected < 0 || puzzle[selected] !== 0) {
        message.textContent = "Select an empty cell for a hint.";
        return;
    }

    values[selected] = solution[selected];
    notes[selected].clear();

    message.textContent = "Hint added!";
    message.style.color = "#15803d";

    updateBoard();

    if (values.every((value, index) => value === solution[index])) {
        finishGame("Congratulations! You solved Sudoku!");
    }
}

function checkBoard() {
    if (gameOver) return;

    let empty = values.includes(0);
    let incorrect = values.some(
        (value, index) => value !== 0 && value !== solution[index]
    );

    updateBoard();

    if (incorrect) {
        message.textContent = "Some numbers are incorrect.";
        message.style.color = "#dc2626";
    } else if (empty) {
        message.textContent = "All filled numbers are correct so far!";
        message.style.color = "#15803d";
    } else {
        finishGame("Congratulations! You solved Sudoku!");
    }
}

function finishGame(text) {
    gameOver = true;
    clearInterval(timerInterval);
    message.textContent = text;
    message.style.color = "#15803d";
    updateBoard();
}

function startTimer() {
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        if (gameOver) return;

        seconds++;

        const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
        const secs = String(seconds % 60).padStart(2, "0");

        timerDisplay.textContent = `${minutes}:${secs}`;
    }, 1000);
}

function newGame() {
    mistakes = 0;
    seconds = 0;
    selected = -1;
    pencilMode = false;
    gameOver = false;

    generatePuzzle();

    mistakesDisplay.textContent = "0 / 3";
    timerDisplay.textContent = "00:00";
    message.textContent = "New puzzle ready!";
    message.style.color = "#64748b";

    document.getElementById("pencil").textContent = "Pencil: Off";
    document.getElementById("pencil").classList.remove("active");

    renderBoard();
    startTimer();
}

document.getElementById("newGame").addEventListener("click", newGame);

document.getElementById("reset").addEventListener("click", resetBoard);

document.getElementById("erase").addEventListener("click", eraseCell);

document.getElementById("hint").addEventListener("click", giveHint);

document.getElementById("check").addEventListener("click", checkBoard);

document.getElementById("pencil").addEventListener("click", event => {
    if (gameOver) return;

    pencilMode = !pencilMode;
    event.currentTarget.textContent = pencilMode ? "Pencil: On" : "Pencil: Off";
    event.currentTarget.classList.toggle("active", pencilMode);
});

difficulty.addEventListener("change", newGame);

document.addEventListener("keydown", event => {
    if (gameOver || selected < 0) return;

    const row = Math.floor(selected / 9);
    const col = selected % 9;

    if (event.key >= "1" && event.key <= "9") {
        enterNumber(Number(event.key));
    } else if (event.key === "Backspace" || event.key === "Delete") {
        eraseCell();
    } else {
        let next = selected;

        if (event.key === "ArrowUp") next = Math.max(0, selected - 9);
        if (event.key === "ArrowDown") next = Math.min(80, selected + 9);
        if (event.key === "ArrowLeft" && col > 0) next = selected - 1;
        if (event.key === "ArrowRight" && col < 8) next = selected + 1;

        if (next !== selected) {
            event.preventDefault();
            selected = next;
            renderBoard();
        }
    }
});

newGame();