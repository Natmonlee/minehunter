const columnInputField = document.getElementById("column");
const rowInputField = document.getElementById("row");
const percentageInputField = document.getElementById("percent");
const gridContainer = document.getElementById("gridContainer");
const resultDiv = document.getElementById("result");

gridContainer.addEventListener("contextmenu", e => e.preventDefault());

class Grid {
    constructor(container, rows, columns, rowHeight, columnWidth) {
        this._container = container;
        this._rows = rows;
        this._columns = columns;
        this._rowHeight = rowHeight;
        this._columnWidth = columnWidth;
        this._totalTiles = rows * columns;
    }

    generate() {
        this._container.style.gridTemplateRows = `repeat(${this._rows}, ${this._rowHeight})`;
        this._container.style.gridTemplateColumns = `repeat(${this._columns}, ${this._columnWidth})`;

        const divIdArray = [];
        let html = "";
        for (let divsAdded = 0; divsAdded < this._totalTiles; divsAdded++) {
            const divId = `tile${divsAdded + 1}`
            const div = `<div id=${divId} class="tile clickable"></div>`;
            divIdArray.push(divId);
            html += div;
        }
        this._gridHTML = html;
        this._divIdArray = divIdArray;
        this._container.innerHTML = html;
    }
}

class MinesweeperTile {
    constructor(num, mine, row, col) {
        this._name = "tile" + (num);
        this._mine = mine;
        this._adjacentMines = 0;
        this._row = row;
        this._col = col;
    }

    explode() {
        document.getElementById(this._divId).innerHTML = '<img src="./images/explosion.png"/>';
        document.getElementById(this._divId).classList.add("exploded");
    }
};

class MinesweeperGrid extends Grid {
    constructor(container, rows, columns, rowHeight, columnWidth, minePercentage) {
        super(container, rows, columns, rowHeight, columnWidth);
        this._minePercentage = minePercentage;
        this._revealedTiles = 0;
    }

    generate() {
        super.generate();
        this.generateTileObjects();
        this.addClickEvents();
    }

    chooseMines() {
        const numOfMines = Math.ceil(this._totalTiles * this._minePercentage);
        const chosenMineNums = new Set();

        while (chosenMineNums.size < numOfMines) {
            chosenMineNums.add(Math.ceil(Math.random() * this._totalTiles));
        }
        this._chosenMineNums = chosenMineNums;
    };

    generateTileObjects() {
        const tileArray = [];
        const mineArray = [];
        const nonMineArray = [];
        this.chooseMines();
        let tileNum = 1;
        while (tileNum < this._totalTiles) {
            for (let rowNum = 1; rowNum <= this._rows; rowNum++) {
                const currentRow = [];
                for (let colNum = 1; colNum <= this._columns; colNum++) {
                    const hasMine = this._chosenMineNums.has(tileNum);
                    const newTile = new MinesweeperTile(tileNum, hasMine, rowNum, colNum);
                    newTile._divId = this._divIdArray[tileNum - 1];
                    if (hasMine) {
                        mineArray.push(newTile);
                    }
                    else {
                        nonMineArray.push(newTile);
                    }
                    currentRow.push(newTile);
                    tileNum += 1;
                }
                tileArray.push(currentRow);
                this._tileArray = tileArray;
                this._mineArray = mineArray;
                this._nonMineArray = nonMineArray;
            }
        }
        mineArray.forEach((mine) => this.findAdjacentTiles(mine).forEach((tile) => tile._adjacentMines += 1));
    }

    findAdjacentTiles(tile) {
        const adjacentTiles = [];
        if (this._tileArray[tile._row]) {
            adjacentTiles.push(this._tileArray[tile._row][tile._col - 1]);
        }
        if (this._tileArray[tile._row - 2]) {
            adjacentTiles.push(this._tileArray[tile._row - 2][tile._col - 1]);
        }
        if (this._tileArray[tile._row - 1][tile._col - 2]) {
            adjacentTiles.push(this._tileArray[tile._row - 1][tile._col - 2]);
            if (this._tileArray[tile._row - 2]) {
                adjacentTiles.push(this._tileArray[tile._row - 2][tile._col - 2]);
            }
            if (this._tileArray[tile._row]) {
                adjacentTiles.push(this._tileArray[tile._row][tile._col - 2]);
            }
        }
        if (this._tileArray[tile._row - 1][tile._col]) {
            adjacentTiles.push(this._tileArray[tile._row - 1][tile._col]);
            if (this._tileArray[tile._row - 2]) {
                adjacentTiles.push(this._tileArray[tile._row - 2][tile._col]);
            }
            if (this._tileArray[tile._row]) {
                adjacentTiles.push(this._tileArray[tile._row][tile._col]);
            }
        }
        return adjacentTiles;
    }

    addClickEvents() {
        for (const row of this._tileArray) {
            for (const tile of row) {
                let clickEvent;
                if (tile._mine) {
                    clickEvent = this.explodeAll.bind(this);
                }
                else if (tile._adjacentMines) {
                    clickEvent = () => {
                        document.getElementById(tile._divId).innerHTML = tile._adjacentMines;
                        document.getElementById(tile._divId).style.backgroundImage = "url(./images/dirt.jpg)";
                        tile._revealed = true;
                        document.getElementById(tile._divId).classList.remove("clickable");
                        this._revealedTiles += 1;
                        document.getElementById(tile._divId).removeEventListener("click", clickEvent);
                        this.checkIfCompleted();
                    }
                }
                else {
                    clickEvent = () => {
                        tile._revealed = true;
                        this._revealedTiles += 1;
                        document.getElementById(tile._divId).removeEventListener("click", clickEvent);
                        this.exposeEmptyAdjacents(tile)
                    };
                }
                document.getElementById(tile._divId).addEventListener("click", clickEvent);
                document.getElementById(tile._divId).addEventListener("contextmenu", () => {
                    if (!tile._revealed) {
                        document.getElementById(tile._divId).innerHTML = '<img src="./images/flag.png"/>';
                        document.getElementById(tile._divId).style.pointerEvents = "auto";
                    }
                })
            }
        }
    }

    explodeAll() {
        this._mineArray.forEach((mine) => { mine.explode() });
        resultDiv.innerHTML = "You lose!<br><button id='button' class='clickableButton'>Try Again?</button>";
        document.getElementById('button').addEventListener("click", replay);
        gridContainer.style.pointerEvents = "none";
    }

    exposeEmptyAdjacents(tile) {
        document.getElementById(tile._divId).style.backgroundImage = "url(./images/dirt.jpg)";
        document.getElementById(tile._divId).innerHTML = "";
        this.findAdjacentTiles(tile).forEach(adjacentTile => {
            if (!adjacentTile._adjacentMines && !adjacentTile._mine && !adjacentTile._revealed) {
                document.getElementById(adjacentTile._divId).style.backgroundImage = "url(./images/dirt.jpg)";
                adjacentTile._revealed = true;
                document.getElementById(adjacentTile._divId).classList.remove("clickable");
                this._revealedTiles += 1;
                document.getElementById(adjacentTile._divId).innerHTML = "";
                this.exposeEmptyAdjacents(adjacentTile);
            }
            else if (adjacentTile._adjacentMines && !adjacentTile._mine && !adjacentTile._revealed) {
                document.getElementById(adjacentTile._divId).style.backgroundImage = "url(./images/dirt.jpg)";
                adjacentTile._revealed = true;
                document.getElementById(adjacentTile._divId).classList.remove("clickable");
                this._revealedTiles += 1;
                document.getElementById(adjacentTile._divId).innerHTML = adjacentTile._adjacentMines;
            }
        })
        this.checkIfCompleted();
    }

    checkIfCompleted() {
        console.log(this._revealedTiles, this._nonMineArray.length);
        if (this._revealedTiles >= this._nonMineArray.length) {
            console.log("you win!")
            resultDiv.innerHTML = "You win!<br><button class='clickableButton' id='button'>Play Again?</button>";
            document.getElementById('button').addEventListener("click", replay);
            gridContainer.style.pointerEvents = "none";
        }
    }
}

let previousGameParameters = {};

const generateFromInput = (e) => {
    outerCustomSection.classList.add("hidden");
    document.body.classList.toggle("disableScroll");
    e.preventDefault();
    gridContainer.style.pointerEvents = "auto";
    resultDiv.innerHTML = "";
    const columnInput = columnInputField.value;
    const rowInput = rowInputField.value;
    const percentageInput = percentageInputField.value / 100;

    const minesweeperGrid = new MinesweeperGrid(gridContainer, rowInput, columnInput, "30px", "30px", percentageInput);

    previousGameParameters.gridContainer = gridContainer;
    previousGameParameters.rowInput = rowInput;
    previousGameParameters.columnInput = columnInput;
    previousGameParameters.rowHeight = "30px";
    previousGameParameters.columnWidth = "30px";
    previousGameParameters.percentageInput = percentageInput;

    gridContainer.classList.remove("hidden");
    minesweeperGrid.generate();
};

const generateDefault = (event) => {
    resultDiv.innerHTML = "";
    gridContainer.style.pointerEvents = "auto";
    let rowInput;
    let columnInput;
    switch (event.target.id) {
        case "smallButton":
            rowInput = 8;
            columnInput = 8;
            break;
        case "mediumButton":
            rowInput = 16;
            columnInput = 16;
            break;
        case "largeButton":
            rowInput = 20;
            columnInput = 24;
            break;
        default:
            break;
    }

    const minesweeperGrid = new MinesweeperGrid(gridContainer, rowInput, columnInput, "30px", "30px", 0.14);

    previousGameParameters.gridContainer = gridContainer;
    previousGameParameters.rowInput = rowInput;
    previousGameParameters.columnInput = columnInput;
    previousGameParameters.rowHeight = "30px";
    previousGameParameters.columnWidth = "30px";
    previousGameParameters.percentageInput = 0.14;

    gridContainer.classList.remove("hidden");
    minesweeperGrid.generate();
}

const replay = () => {
    resultDiv.innerHTML = "";
    gridContainer.style.pointerEvents = "auto";

    const minesweeperGrid = new MinesweeperGrid(
        previousGameParameters.gridContainer, previousGameParameters.rowInput, previousGameParameters.columnInput, previousGameParameters.rowHeight, previousGameParameters.columnWidth, previousGameParameters.percentageInput
    );

    minesweeperGrid.generate();
}

const showModal = () => {
    outerCustomSection.classList.toggle("hidden");
    document.getElementById('close').addEventListener("click", showModal);
    document.body.classList.toggle("disableScroll");
}

document.getElementById("innerCustomSection").addEventListener("submit", generateFromInput);
document.getElementById("smallButton").addEventListener("click", generateDefault);
document.getElementById("mediumButton").addEventListener("click", generateDefault);
document.getElementById("largeButton").addEventListener("click", generateDefault);
customButton.addEventListener("click", showModal);

