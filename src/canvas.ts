import { App } from "obsidian";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const BASE_LINE_WIDTH = 2.5;
const MIN_LINE_WIDTH = 0.1;

export class PencilCanvas {
	private readonly containerEl: HTMLElement;
	private readonly sketchId: string;
	private readonly app: App;

	private readonly canvas: HTMLCanvasElement;
	private readonly ctx: CanvasRenderingContext2D;

	private drawing = false;
	private activePointerId: number | null = null;
	private lastX = 0;
	private lastY = 0;

	constructor(containerEl: HTMLElement, sketchId: string, app: App) {
		this.containerEl = containerEl;
		this.sketchId = sketchId;
		this.app = app;

		this.canvas = document.createElement("canvas");
		this.canvas.width = CANVAS_WIDTH;
		this.canvas.height = CANVAS_HEIGHT;
		this.canvas.style.touchAction = "none";
		this.canvas.style.display = "block";

		const ctx = this.canvas.getContext("2d");
		if (!ctx) {
			throw new Error("PencilCanvas: failed to acquire 2D context");
		}
		this.ctx = ctx;
		this.ctx.lineCap = "round";
		this.ctx.lineJoin = "round";
		this.ctx.strokeStyle = "#000000";

		this.containerEl.appendChild(this.canvas);

		this.canvas.addEventListener("pointerdown", this.onPointerDown);
		this.canvas.addEventListener("pointermove", this.onPointerMove);
		this.canvas.addEventListener("pointerup", this.onPointerUp);
		this.canvas.addEventListener("pointercancel", this.onPointerUp);
	}

	getSketchId(): string {
		return this.sketchId;
	}

	private isDrawingPointer(pointerType: string): boolean {
		// Pen and mouse draw; touch is reserved for scrolling.
		return pointerType === "pen" || pointerType === "mouse";
	}

	private localCoords(event: PointerEvent): { x: number; y: number } {
		const rect = this.canvas.getBoundingClientRect();
		const scaleX = this.canvas.width / rect.width;
		const scaleY = this.canvas.height / rect.height;
		return {
			x: (event.clientX - rect.left) * scaleX,
			y: (event.clientY - rect.top) * scaleY,
		};
	}

	private onPointerDown = (event: PointerEvent): void => {
		if (!this.isDrawingPointer(event.pointerType)) return;
		event.preventDefault();

		this.drawing = true;
		this.activePointerId = event.pointerId;
		this.canvas.setPointerCapture(event.pointerId);

		const { x, y } = this.localCoords(event);
		this.lastX = x;
		this.lastY = y;
	};

	private onPointerMove = (event: PointerEvent): void => {
		if (!this.drawing) return;
		if (event.pointerId !== this.activePointerId) return;
		if (!this.isDrawingPointer(event.pointerType)) return;
		event.preventDefault();

		const { x, y } = this.localCoords(event);
		const pressure = event.pressure > 0 ? event.pressure : 0.5;
		const width = Math.max(MIN_LINE_WIDTH, BASE_LINE_WIDTH * pressure);

		this.ctx.lineWidth = width;
		this.ctx.beginPath();
		this.ctx.moveTo(this.lastX, this.lastY);
		this.ctx.lineTo(x, y);
		this.ctx.stroke();

		this.lastX = x;
		this.lastY = y;
	};

	private onPointerUp = (event: PointerEvent): void => {
		if (event.pointerId !== this.activePointerId) return;
		this.drawing = false;
		this.activePointerId = null;
		if (this.canvas.hasPointerCapture(event.pointerId)) {
			this.canvas.releasePointerCapture(event.pointerId);
		}
	};
}
