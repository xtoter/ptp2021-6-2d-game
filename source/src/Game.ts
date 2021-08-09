import * as geom from "./Geom";
import {Body} from "./Entities/EntityAttributes/Body";
import {Entity} from "./Entities/Entity";
import { Person } from "./Entities/Person";
import {Control, Keys} from "./Control";
import {Draw, Color} from "./Draw";
import { Tile, CollisionType } from "./Tile";
import { Mimic } from "./Mimic";
import { Level } from "./Level";

function replacer(key, value) {
    if(value instanceof Map) {
      return {
          dataType: 'Map',
          value: Array.from(value.entries()), // or with spread: value: [...value]
        };
    }
    if (value instanceof HTMLImageElement) {
      let name = value.src;
      let nameSplit = name.split("/");
      let lastSplit = nameSplit[nameSplit.length - 1];
  
      return {
        dataType: 'HTMLImageElement',
        value: lastSplit
      };
    }
    if (value instanceof geom.Vector) {
      return {
        dataType: 'Vector',
        x: value.x,
        y: value.y
      };
    }
    return value;
  }
  
function reviver(key, value) {
    if(typeof value === 'object' && value !== null) {
      if (value.dataType === 'Map') {
        return new Map(value.value);
      }
      if (value.dataType === 'HTMLImageElement') {
        return Draw.loadImage("./textures/" + value.value);
      }
      if (value.dataType === 'Vector') {
        return JSON.stringify(new geom.Vector(value.x, value.y));
      }
    }
    return value;
}

export class Game {
    public static levels : Map<any, any>;

    public draw : Draw;
    private bodies : Body [] = [];
    public entities : Entity [] = [];
    public currentLevelName = "map";
    public currentLevel = new Level();
    public playerID = 0;
    public mimic : Mimic;

    private static async readTextFile(path) {
        const response = await fetch(path)
        const text = await response.text()
        return text;
    }

    public static async loadMap(path : string, name : string) {
        let result = await this.readTextFile(path)
        .then(result => {
            console.log(result);
            
            let prototype = JSON.parse(result, reviver);
            let level = new Level();
            level.createFromPrototype(prototype);
            this.levels[name] = level;
        });
    }

    constructor(draw : Draw) {
        console.log("im here!!");
        
        Control.init();
        this.draw = draw;
        this.currentLevel.Grid = [];

        this.mimic = new Mimic(this);
    }
    

    public make_body(coordinates : geom.Vector, radius : number) : Body {
        let body = new Body(coordinates, radius);
        body.game = this;
        return this.bodies[this.bodies.length] = body;
    }

    public make_person(body : Body) {
        return this.entities[this.entities.length] = new Person(this, body,"fine");//последнее - маркер состояния
    }

    public step() {
      // Ксотыль
      if (Game.levels[this.currentLevelName])
        this.currentLevel =  Game.levels[this.currentLevelName];

      this.mimic.step();

      // Processing entities
      this.entities.forEach(entity => entity.animation.step());
      this.entities.forEach(entity => entity.step());
    }

    // Checks if pos is in wall
    public check_wall(pos : geom.Vector) : number {
        let posRound = new geom.Vector(
            Math.floor(pos.x / this.currentLevel.tileSize), 
            Math.floor(pos.y / this.currentLevel.tileSize)
        );

        // If out of bounds
        if (posRound.x < 0 || posRound.y < 0 || 
            posRound.x >= this.currentLevel.Grid.length || 
            posRound.y >= this.currentLevel.Grid[0].length)
            return 0;

        let collisionType = this.currentLevel.Grid[posRound.x][posRound.y].colision;    
        // Coordinates in particular grid cell
        let posIn = pos.sub(posRound.mul(this.currentLevel.tileSize)).mul(1 / this.currentLevel.tileSize);
        // Different collision types
        if (collisionType == CollisionType.Full ||
            collisionType == CollisionType.CornerUR && posIn.y < posIn.x ||
            collisionType == CollisionType.CornerDL && posIn.y > posIn.x ||
            collisionType == CollisionType.CornerDR && posIn.y > 1 - posIn.x ||
            collisionType == CollisionType.CornerUL && posIn.y < 1 - posIn.x
            )
            return collisionType;
        return CollisionType.Empty;
    }

    public display() {
        this.draw.cam.pos = new geom.Vector(0, 0);
        this.draw.cam.scale = 100;
        // Tiles
        this.currentLevel.display(this.draw);

        // People
        for (let i = 0; i < this.entities.length; i++) {
            this.draw.image(this.entities[i].animation.current_state, this.entities[i].body.center, new geom.Vector(1, 1));
        }
    }
}