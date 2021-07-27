import {Tile} from "./Tile";
import {CollisionType} from "./Tile";
import {PathGenerator} from "./PathGenerator";
import { Vector } from "./Geom";

function replacer(key, value) {
    if(value instanceof Map) {
      return {
        dataType: 'Map',
        value: Array.from(value.entries()), // or with spread: value: [...value]
      };
    } else {
        return value;
    }
}

function reviver(key, value) {
    if(typeof value === 'object' && value !== null) {
      if (value.dataType === 'Map') {
        return new Map(value.value);
      }
    }
    return value;
}

export class MimicMapJSON {
    Grid? : Tile[][];
    CollisionMesh? : boolean[][];
    PathMatrix? : Map<any, any>;
}

let grid : Tile [][] = [];
let sizeX = 10;
let sizeY = 10;
for (let x = 0; x < sizeX; x++) {
    grid[x] = [];
    for (let y = 0; y < sizeY; y++) {
        grid[x][y] = new Tile();
    }
}

grid[1][1] = new Tile(CollisionType.CornerDR);
grid[2][2] = new Tile(CollisionType.CornerUL);
grid[1][2] = new Tile(CollisionType.CornerDL);
grid[2][1] = new Tile(CollisionType.CornerUR);

let newMap : MimicMapJSON;
newMap = {Grid: grid, CollisionMesh: [], PathMatrix: new Map()};

console.log(grid);

console.log(newMap.Grid);
PathGenerator.generateMatrix(newMap);

console.log(newMap.CollisionMesh);
console.log(newMap.PathMatrix);

const blob = new Blob([JSON.stringify(newMap, replacer)], {
    type: 'application/json'
});

console.log(Array.from(newMap.PathMatrix.keys()));

const url = window.URL.createObjectURL(blob);
window.open(url);