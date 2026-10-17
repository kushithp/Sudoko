const puzzle = [
    5, 3, 0, 0, 7, 0, 0, 0, 0,
    6, 0, 0, 1, 9, 5, 0, 0, 0,
    0, 9, 8, 0, 0, 0, 0, 6, 0,
    8, 0, 0, 0, 6, 0, 0, 0, 3,
    4, 0, 0, 8, 0, 3, 0, 0, 1,
    7, 0, 0, 0, 2, 0, 0, 0, 6,
    0, 6, 0, 0, 0, 0, 2, 8, 0,
    0, 0, 0, 4, 1, 9, 0, 0, 5,
    0, 0, 0, 0, 8, 0, 0, 7, 9
];

const solution = [
    5, 3, 4, 6, 7, 8, 9, 1, 2,
    6, 7, 2, 1, 9, 5, 3, 4, 8,
    1, 9, 8, 3, 4, 2, 5, 6, 7,
    8, 5, 9, 7, 6, 1, 4, 2, 3,
    4, 2, 6, 8, 5, 3, 7, 9, 1,
    7, 1, 3, 9, 2, 4, 8, 5, 6,
    9, 6, 1, 5, 3, 7, 2, 8, 4,
    2, 8, 7, 4, 1, 9, 6, 3, 5,
    3, 4, 5, 2, 8, 6, 1, 7, 9
];

const board = document.getElementById("board");
const numbers = document.getElementById("numbers");
const message = document.getElementById("message");

let cells = [];
let selectedCell = null;

function createGame() {
    board.innerHTML = "";
    numbers.innerHTML = "";
    message.textContent = "";
    cells = [];
    selectedCell = null;

    puzzle.forEach((value, index) => {
        const cell = document.createElement("input");

        cell.className = "cell";
        cell.type = "text";
        cell.inputMode = "numeric";
        cell.maxLength = 1;

        if (value !== 0) {
            cell.value = value;
            cell.readOnly = true;
            cell.classList.add("fixed");
        }

        cell.addEventListener("focus", () => {
            selectedCell = cell;
        });

        cell.addEventListener("input", () => {
            cell.value = cell.value.replace(/[^1-9]/g, "").slice(0, 1);
            cell.style.background = "";
            message.textContent = "";
        });

        cell.addEventListener("click", () => {
            selectedCell = cell;
        });

        cells.push(cell);
        board.appendChild(cell);
    });

    for (let number = 1; number <= 9; number++) {
        const button = document.createElement("button");
        button.textContent = number;
        button.type = "button";

        button.addEventListener("click", () => {
            if (!selectedCell || selectedCell.readOnly) {
                selectedCell = cells.find(cell => !cell.readOnly && !cell.value);
            }

            if (selectedCell) {
                selectedCell.value = number;
                selectedCell.style.background = "";
                selectedCell.focus();
                message.textContent = "";
            }
        });

        numbers.appendChild(button);
    }
}

document.getElementById("check").addEventListener("click", () => {
    let complete = true;
    let correct = true;

    cells.forEach((cell, index) => {
        if (!cell.value) {
            complete = false;
            correct = false;
            cell.style.background = "#fef3c7";
        } else if (Number(cell.value) !== solution[index]) {
            correct = false;
            cell.style.background = "#fee2e2";
        } else {
            cell.style.background = cell.readOnly ? "#e2e8f0" : "#dcfce7";
        }
    });

    if (complete && correct) {
        message.textContent = "Congratulations! Sudoku solved!";
        message.style.color = "#15803d";
    } else if (!correct && complete) {
        message.textContent = "Some numbers are incorrect. Try again!";
        message.style.color = "#dc2626";
    } else {
        message.textContent = "Keep going! Fill in the empty cells and correct mistakes.";
        message.style.color = "#b45309";
    }
});

document.getElementById("newGame").addEventListener("click", createGame);

createGame();