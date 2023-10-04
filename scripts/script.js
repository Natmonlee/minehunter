const submitButton = document.getElementById("submit");
const columnInputField = document.getElementById("column");
const rowInputField = document.getElementById("row");
const percentageInputField = document.getElementById("percent");
const gridContainer = document.getElementById("container");

const chooseMines = (numOfTiles, percentage) => {
    const numOfMines = Math.ceil(numOfTiles * percentage);
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

class Grid {
    constructor(rows, columns, rowHeight, columnWidth) {
        this._rows = rows;
        this._columns = columns;
        this._rowHeight = rowHeight;
        this._columnWidth = columnWidth; 
        this._totalTiles = rows * columns;   
    }

    createGrid(container) {
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

    generateMinesweeperTiles(minePercentage) {
        const tileArray = [];
        const mineArray = [];     
        const nonMineArray = [];
        const mineSet = chooseMines(this._totalTiles, minePercentage);
        
        let tileNum = 1;
        while (tileNum < this._totalTiles) {
            for (let rowNum = 1 ; rowNum <= this._rows ; rowNum++) {
                const currentRow = [];
                for (let colNum = 1; colNum <= this._columns ; colNum++) {
                    const hasMine = mineSet.has(tileNum);
                    const newTile = new Tile(tileNum, hasMine, rowNum, colNum);

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
        for (const mine of mineArray) {
            markAdjacentTiles(mine, tileArray);
        }
        this._tileArray = tileArray;
        this._mineArray =  mineArray;
        this._nonMineArray = nonMineArray;
        
        return tileArray;
    }
// integrate into tile creation
    linkDivsToTiles() {
        i = 0
        for (const row of this._tileArray) {
            for (const tile of row) {
                tile._divId = this._divIdArray[i];
                i++
            }
        }
    }
    
    
    /*
    
    {

        //dont nest, do simultaneously?
        const flatTileArray = this._tileArray.flat(); 
        for (let i = 0 ; i < this._divIdArray.length ; i++) {
            this._tileArray

            flatTileArray[i]._divId = flatTileArray[i]
        }

        for (const row of this._tileArray) {

            for (const tile of row) {
                for (let i = 0 ; i < this._divIdArray.length ; i++){
                    for (const tile of row) {
                        tile._divId = this._divIdArray[i];  
                    }
                
                } 
            }
        }
    }
    */
    addContentToTiles(contentToAdd, tileArray) {
        for (const tile of tileArray) {
            document.getElementById(tile._divId).innerHTML += contentToAdd;
        }
    }
}









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



const generateFromInput = () => {
    let columnInput = columnInputField.value; 
    let rowInput = rowInputField.value;
    let tilesTotal = columnInput * rowInput;
    let percentageInput = percentageInputField.value / 100;

    const newGrid = new Grid(rowInput, columnInput, "30px", "30px");
    newGrid.createGrid(gridContainer);
    newGrid.generateMinesweeperTiles(percentageInput);
    newGrid.linkDivsToTiles();
    newGrid.addContentToTiles("X", newGrid._mineArray);
    for (const tile of newGrid._nonMineArray) {
        if (tile._adjacentMines) {
            newGrid.addContentToTiles(tile._adjacentMines, [tile]);
        }
    }
};


submitButton.addEventListener("click", generateFromInput);
