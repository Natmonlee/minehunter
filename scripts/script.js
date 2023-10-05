const submitButton = document.getElementById("submit");
const columnInputField = document.getElementById("column");
const rowInputField = document.getElementById("row");
const percentageInputField = document.getElementById("percent");
const gridContainer = document.getElementById("container");

class Grid {
    constructor(rows, columns, rowHeight, columnWidth) {
        this._rows = rows;
        this._columns = columns;
        this._rowHeight = rowHeight;
        this._columnWidth = columnWidth; 
        this._totalTiles = rows * columns;   
    }
    addToContainer(container) {
        container.style.gridTemplateRows = `repeat(${this._rows}, ${this._rowHeight})`;    
        container.style.gridTemplateColumns = `repeat(${this._columns}, ${this._columnWidth})`; 

        const divIdArray = []; 
        let html = "";
        for (let divsAdded = 0 ; divsAdded <  this._totalTiles ; divsAdded++) {
            const divId = `tile${divsAdded+1}`
            const div = `<div id=${divId} class="tile"></div>`;
            divIdArray.push(divId);
            html += div;
        }

        this._gridHTML = html;
        this._divIdArray = divIdArray;
        container.innerHTML = html;
    }
}

class MinesweeperTile {
    constructor(num, mine, row, col) {
        this._name = "tile" + (num);
        this._mine = mine;
        this._adjacentMines = 0;
        this._row = row;
        this._col = col;
        // future properties - flagged? exploded? exposed/clicked?
    }
};

class MinesweeperGrid extends Grid {
    constructor(rows, columns, rowHeight, columnWidth, minePercentage) {
        super(rows, columns, rowHeight, columnWidth);
            this._minePercentage = minePercentage;
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
            for (let rowNum = 1 ; rowNum <= this._rows ; rowNum++) {
                const currentRow = [];
                for (let colNum = 1; colNum <= this._columns ; colNum++) {
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
            }
        }
        this._tileArray = tileArray;
        this._mineArray =  mineArray;
        this._nonMineArray = nonMineArray;

        for (const mine of mineArray) {
            this.amendTiles((tile) => {tile._adjacentMines += 1}, this.findAdjacentTiles(mine));
        }
        //return tileArray;
    }

    findAdjacentTiles(tile) {
        const adjacentTiles = [];

        if (this._tileArray[tile._row]) {
            adjacentTiles.push(this._tileArray[tile._row][tile._col - 1]);
        }
        if (this._tileArray[tile._row - 2]) {
            adjacentTiles.push(this._tileArray[tile._row - 2][tile._col - 1]);
        }

        if (this._tileArray[tile._row - 1][tile._col - 2]){
            adjacentTiles.push(this._tileArray[tile._row - 1][tile._col - 2]);
            if (this._tileArray[tile._row - 2]) {
                adjacentTiles.push(this._tileArray[tile._row - 2][tile._col - 2]);
            }
            if (this._tileArray[tile._row]) {
                adjacentTiles.push(this._tileArray[tile._row][tile._col - 2]);
            }

        }
        if (this._tileArray[tile._row - 1][tile._col]){
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

    amendTiles(func, tileArray) {
        for (const tile of tileArray) {
            func(tile);
        }
    }
}

const generateFromInput = () => {
    let columnInput = columnInputField.value; 
    let rowInput = rowInputField.value;
    let percentageInput = percentageInputField.value / 100;

    const minesweeperGrid = new MinesweeperGrid(rowInput, columnInput, "30px", "30px", percentageInput);
    minesweeperGrid.addToContainer(gridContainer);
    minesweeperGrid.generateTileObjects();
    minesweeperGrid.amendTiles((tile) => {document.getElementById(tile._divId).innerHTML = "X"}, minesweeperGrid._mineArray);

    for (const tile of minesweeperGrid._nonMineArray) {
        if (tile._adjacentMines) {
            minesweeperGrid.amendTiles((tile) => {document.getElementById(tile._divId).innerHTML = tile._adjacentMines}, [tile]);
        }
    }
};

submitButton.addEventListener("click", generateFromInput);

        
