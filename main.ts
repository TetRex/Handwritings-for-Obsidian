import { Plugin } from "obsidian";

type Point = {
	x: number;
	y: number;
};

export default class HandwritingPlugin extends Plugin {
	private strokes: Point[][] = [];
	private currentStroke: Point[] | null = null;

	async onload(): Promise<void> {
		this.addCommand({
			id: "open-handwriting-pad",
			name: "Open Handwriting Pad",
			callback: () => this.openPad(),
		});
	}

	openPad(): void {
		this.strokes = [];
		this.currentStroke = null;

		const existing = document.getElementById("handwriting-pad-window");
		if (existing) {
			existing.remove();
		}

		const container = document.createElement("div");
		container.id = "handwriting-pad-window";
		container.style.position = "fixed";
		container.style.width = "400px";
		container.style.height = "300px";
		container.style.top = "20px";
		container.style.right = "20px";
		container.style.zIndex = "9999";
		container.style.background = "#ffffff";
		container.style.border = "1px solid #ccc";
		container.style.borderRadius = "8px";
		container.style.boxShadow = "0 6px 24px rgba(0, 0, 0, 0.2)";
		container.style.display = "flex";
		container.style.flexDirection = "column";
		container.style.overflow = "hidden";

		const header = document.createElement("div");
		header.textContent = "Handwriting Pad";
		header.style.padding = "10px 12px";
		header.style.fontWeight = "600";
		header.style.borderBottom = "1px solid #e0e0e0";
		header.style.background = "#f7f7f7";

		const canvas = document.createElement("canvas");
		canvas.width = 400;
		canvas.height = 220;
		canvas.style.width = "100%";
		canvas.style.flex = "1";
		canvas.style.display = "block";
		canvas.style.background = "#fff";
		canvas.style.cursor = "crosshair";

		const toolbar = document.createElement("div");
		toolbar.style.display = "flex";
		toolbar.style.gap = "8px";
		toolbar.style.padding = "10px";
		toolbar.style.borderTop = "1px solid #e0e0e0";
		toolbar.style.background = "#fafafa";

		const saveButton = document.createElement("button");
		saveButton.textContent = "Save";
		const clearButton = document.createElement("button");
		clearButton.textContent = "Clear";
		const undoButton = document.createElement("button");
		undoButton.textContent = "Undo";

		const context = canvas.getContext("2d");
		if (!context) {
			return;
		}

		context.lineWidth = 2;
		context.lineCap = "round";
		context.lineJoin = "round";
		context.strokeStyle = "#111111";

		const getPoint = (event: PointerEvent): Point => {
			const rect = canvas.getBoundingClientRect();
			return {
				x: event.clientX - rect.left,
				y: event.clientY - rect.top,
			};
		};

		const drawSegment = (from: Point, to: Point): void => {
			context.beginPath();
			context.moveTo(from.x, from.y);
			context.lineTo(to.x, to.y);
			context.stroke();
		};

		const handlePointerDown = (event: PointerEvent): void => {
			canvas.setPointerCapture(event.pointerId);
			const point = getPoint(event);
			this.currentStroke = [point];
			this.strokes.push(this.currentStroke);
		};

		const handlePointerMove = (event: PointerEvent): void => {
			if (!this.currentStroke) {
				return;
			}

			const point = getPoint(event);
			const lastPoint = this.currentStroke[this.currentStroke.length - 1];
			this.currentStroke.push(point);
			drawSegment(lastPoint, point);
		};

		const handlePointerUp = (event: PointerEvent): void => {
			if (canvas.hasPointerCapture(event.pointerId)) {
				canvas.releasePointerCapture(event.pointerId);
			}
			this.currentStroke = null;
		};

		canvas.addEventListener("pointerdown", handlePointerDown);
		canvas.addEventListener("pointermove", handlePointerMove);
		canvas.addEventListener("pointerup", handlePointerUp);
		canvas.addEventListener("pointercancel", handlePointerUp);

		toolbar.append(saveButton, clearButton, undoButton);
		container.append(header, canvas, toolbar);
		document.body.appendChild(container);
	}
}
