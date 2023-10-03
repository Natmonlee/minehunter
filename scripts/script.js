const submitButton = document.getElementById("submit");
const xInputField = document.getElementById("x");
const yInputField = document.getElementById("y");
const percentageInputField = document.getElementById("percent");

//put more stuff in classes

const generateGrid = (x, y) => {
    let container = document.getElementById("container");
    let containerHTML = "";
    let tilesTotal = x * y;

    container.style.gridTemplateColumns = `repeat(${x}, 30px)`;
    container.style.gridTemplateRows = `repeat(${y}, 30px)`;

    for (let tilesAdded = 0 ; tilesAdded <  tilesTotal ; tilesAdded++) {
        containerHTML += `<div id=tile${tilesAdded + 1} class="tile"></div>`;
    }

    container.innerHTML = containerHTML;   
};

const chooseMines = (numOfTiles, minePercentage) => {
    const numOfMines = Math.ceil(numOfTiles * minePercentage);
    const chosenMines = new Set();

    while (chosenMines.size < numOfMines) {
        chosenMines.add(Math.ceil(Math.random() * numOfTiles));
    }
    return chosenMines;
};

class Tile {
    constructor(num, mine, row, col) {
        this._name = "tile" + (num);
        this._mine = mine;
        this._adjacentMines = 0;
        this._row = row;
        this._col = col;
        // future properties - flagged? exploded? exposed/clicked?
    }
};

const createTileArray = (numOfTiles, mineSet, numOfRows, numOfColumns) => {
    const arrayOfTiles = [];
    const arrayOfMines = [];

    let tileNum = 1;
    while (tileNum < numOfTiles) {
        for (let rowNum = 1 ; rowNum <= numOfRows ; rowNum++) {
            currentRow = [];
            for (let colNum = 1; colNum <= numOfColumns ; colNum++) {
                const mine = mineSet.has(tileNum);
                const newTile = new Tile(tileNum, mine, rowNum, colNum);
                if (mine) {
                    arrayOfMines.push(newTile)
                }
                currentRow.push(newTile);
                tileNum += 1;
            }
            arrayOfTiles.push(currentRow);
        }
    }  

    for (const mine of arrayOfMines) {
        markAdjacentTiles(mine, arrayOfTiles);
    }

    return arrayOfTiles;
};


const markAdjacentTiles = (mine, tileArray) => {
    if (tileArray[mine._row - 1][mine._col - 2]){
        tileArray[mine._row - 1][mine._col - 2]._adjacentMines += 1;
    }
    if (tileArray[mine._row - 1][mine._col]){
        tileArray[mine._row - 1][mine._col]._adjacentMines += 1;
    }

    if (tileArray[mine._row - 2]) {
        if (tileArray[mine._row - 2][mine._col - 1]) {
            tileArray[mine._row - 2][mine._col - 1]._adjacentMines += 1;
        }
        if (tileArray[mine._row - 2][mine._col - 2]) {
            tileArray[mine._row - 2][mine._col - 2]._adjacentMines += 1;
        }
        if (tileArray[mine._row - 2][mine._col]) {
            tileArray[mine._row - 2][mine._col]._adjacentMines += 1;
        }
    }

    if (tileArray[mine._row]) {
        if (tileArray[mine._row][mine._col - 1]) {
            tileArray[mine._row][mine._col - 1]._adjacentMines += 1;
        }
        if (tileArray[mine._row][mine._col - 2]) {
            tileArray[mine._row][mine._col - 2]._adjacentMines += 1;
        }
        if (tileArray[mine._row][mine._col]) {
            tileArray[mine._row][mine._col]._adjacentMines += 1;
        }
    }
};

const addTileContent = tileArray => {
    for (const row of tileArray) {
        for (const tile of row) {
            if (tile._mine) {
                document.getElementById(tile._name).innerHTML = "X";
            }
            else {
                if (tile._adjacentMines) {
                    document.getElementById(tile._name).innerHTML = tile._adjacentMines;
                }
            }
        }
    }
}

const generateFromInput = () => {
    let xInput = xInputField.value; 
    let yInput = yInputField.value;
    let tilesTotal = xInput * yInput;
    let percentageInput = percentageInputField.value / 100;

    generateGrid(xInput, yInput);
    addTileContent(createTileArray(tilesTotal, chooseMines(tilesTotal, percentageInput), yInput, xInput));
};

submitButton.addEventListener("click", generateFromInput);


// other shapes of grid?