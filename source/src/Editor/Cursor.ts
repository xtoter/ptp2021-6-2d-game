import { Control } from "../Control";
import { Draw, Color } from "../Draw";
import * as geom from "../Geom";
import { Level } from "../Level";
import { CollisionType, Tile } from "../Tile";

enum Mode {
    Eraser = 0,
    Wall,
  }

// Курсор для редактора уровней. Хранит в себе позицию и
// информацию о том, как должен вести себя в случае клика
export class Cursor {
    public level : Level;
    public draw : Draw;
    public pos = new geom.Vector();
    public mode = Mode.Wall;

    constructor(level : Level = null, draw : Draw = null) {
        this.level = level;
        this.draw = draw;
    }

    private setBlock() {
        let tile = new Tile(CollisionType.Full);
        this.level.Grid[this.pos.x][this.pos.y] = tile;
    }

    public step() { 
        this.pos = this.level.gridCoordinates(this.draw.transformBack(Control.mousePos()));
        if(Control.isMouseLeftPressed())
            this.setBlock();
    }

    public display() {
        this.draw.strokeRect(
            this.pos.mul(this.level.tileSize).add(new geom.Vector(this.level.tileSize, this.level.tileSize).mul(1/2)), 
            new geom.Vector(this.level.tileSize, this.level.tileSize), 
            new Color(0, 255, 0),
            0.1
        );
    }
}