import * as geom from "./Geom";

export class Camera {
    public center : geom.Vector;
    public pos : geom.Vector;
    public scale : number;
}

export class Color {
    public r : number;
    public g : number;
    public b : number;

    constructor(r: number, g: number, b: number) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    public toString() : string {
        return "rgb(" + this.r + "," + this.g + "," + this.b + ")";
    }
}

type hashimages = {
    [key: string]: HTMLImageElement ; // Хеш таблица с изображениями
};

export class Draw {
    public canvas: HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D;
    public cam = new Camera();
    private static images : hashimages = {}; // Хеш таблица с изображениями
    constructor(canvas: HTMLCanvasElement, size: geom.Vector) {
        this.canvas = canvas;
        canvas.width = size.x;
        canvas.height = size.y;
        this.ctx = canvas.getContext("2d");
        this.cam.scale = 1;
        this.cam.pos = size.mul(1 / 2);
        this.cam.center = size.mul(1 / 2);
    }
    public static loadImage(src: string): HTMLImageElement {
        if (this.images[src]) {
            return this.images[src]; // Извлекаем из хеш таблицы
        }
        let image = new Image();
        image.src = src;
        this.images[src] = image;
        return image;
    }
    // Преобразование координат
    private transform(pos: geom.Vector): geom.Vector { 
        let posNew = pos.clone();
        posNew = posNew.sub(this.cam.pos);
        posNew = posNew.mul(this.cam.scale);
        posNew = posNew.add(this.cam.center);
        return posNew;
    }
    // Обратное реобразование координат
    public transformBack(pos : geom.Vector) : geom.Vector {
        let posNew = pos.clone();
        posNew = posNew.sub(this.cam.center);
        posNew = posNew.mul(1 / this.cam.scale);
        posNew = posNew.add(this.cam.pos);
        return posNew;
    }
    // Изображение
    public image(image: HTMLImageElement, pos: geom.Vector, box: geom.Vector, angle = 0) {
        let posNew = this.transform(pos);
        let boxNew = box.mul(this.cam.scale * 1.01);
        posNew = posNew.sub(boxNew.mul(1 / 2));
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.drawImage(image, posNew.x, posNew.y, boxNew.x, boxNew.y);
    }
    // Заполненный прямоугольник
    public fillRect(pos: geom.Vector, box: geom.Vector, color: Color) {
        let posNew = this.transform(pos);
        let boxNew = box.mul(this.cam.scale);
        posNew = posNew.sub(boxNew.mul(1 / 2));
        this.ctx.fillStyle = color.toString(); // цвет заливки
        this.ctx.fillRect(posNew.x, posNew.y, boxNew.x, boxNew.y);
    }
    // Контур прямоугольника
    public strokeRect(pos: geom.Vector, box: geom.Vector, color: Color, lineWidth: number) { 
        let posNew = this.transform(pos);
        let boxNew = box.mul(this.cam.scale);
        posNew = posNew.sub(boxNew.mul(1 / 2)); // незаполненный прямоугольник
        this.ctx.strokeStyle = color.toString(); // цвет контура
        this.ctx.lineWidth = lineWidth * this.cam.scale; // ширина контура
        this.ctx.strokeRect(posNew.x, posNew.y, boxNew.x, boxNew.y);
    }
    // Заполненная окружность
    public fillCircle(pos: geom.Vector, radius: number, color: Color) { 
        let posNew = this.transform(pos);
        this.ctx.beginPath();
        this.ctx.arc(posNew.x, posNew.y, radius * this.cam.scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = color.toString(); // цвет заливки
        this.ctx.fill();
    }
    // Контур окружности
    public strokeCircle(pos: geom.Vector, radius: number, color: Color, lineWidth: number) { 
        let posNew = this.transform(pos);
        this.ctx.beginPath();
        this.ctx.arc(posNew.x, posNew.y, radius * this.cam.scale, 0, Math.PI * 2, false);
        this.ctx.lineWidth = lineWidth * this.cam.scale; // ширина контура
        this.ctx.strokeStyle = color.toString(); // цвет контура
        this.ctx.stroke();
    }
    // Заполненный многоугольник
    public fillPolygon(vertices: Array<geom.Vector>, color: Color) { 
        for (let i = 0; i < vertices.length; i++) {
            let posNew = this.transform(vertices[i]);
            this.ctx.lineTo(posNew.x, posNew.y);
        }
        this.ctx.fillStyle = color.toString(); // цвет заливки
        this.ctx.fill();
    }
    // Контур многоугольника
    public strokePolygon(vertices: Array<geom.Vector>, color: Color, lineWidth: number) { 
        for (let i = 0; i < vertices.length; i++) {
            let posNew = this.transform(vertices[i]);
            this.ctx.lineTo(posNew.x, posNew.y);
            this.ctx.lineWidth = lineWidth * this.cam.scale; //ширина контура
        }

        this.ctx.strokeStyle = color.toString(); // цвет контура
        this.ctx.stroke();
    }
    // Заполненный сектор
    public fillSector(pos: geom.Vector, radius: number, color: Color, startAngle: number, endAngle: number) { 
        let posNew = this.transform(pos);
        this.ctx.beginPath();
        this.ctx.arc(posNew.x, posNew.y, radius * this.cam.scale, startAngle, endAngle, false);
        this.ctx.fillStyle = color.toString(); // цвет заливки
        this.ctx.fill();
    }
    // Контур сектора
    public strokeSector(pos: geom.Vector, radius: number, color: Color, lineWidth: number, startAngle: number, endAngle: number) { 
        let posNew = this.transform(pos);
        this.ctx.beginPath();
        this.ctx.arc(posNew.x, posNew.y, radius * this.cam.scale, startAngle, endAngle, false);
        this.ctx.lineWidth = lineWidth * this.cam.scale;  // ширина контура
        this.ctx.strokeStyle = color.toString(); // цвет контура
        this.ctx.stroke();       
    }
    public clear() {
        this.ctx.clearRect(-1000, -1000, 10000, 10000);
    }
}