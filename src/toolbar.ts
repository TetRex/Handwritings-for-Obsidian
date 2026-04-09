export type PencilMode = "pen" | "eraser";

export interface PencilToolState {
	color: string;
	size: number;
	mode: PencilMode;
}

export type PencilToolChangeHandler = (state: PencilToolState) => void;

export class PencilToolbar {
	private readonly containerEl: HTMLElement;
	private readonly onToolChange: PencilToolChangeHandler;
	private readonly onClear: () => void;
	private readonly onSave: () => void;

	private color = "#000000";
	private size = 4;
	private mode: PencilMode = "pen";

	private readonly root: HTMLDivElement;
	private readonly colorInput: HTMLInputElement;
	private readonly sizeInput: HTMLInputElement;
	private readonly sizeValueEl: HTMLSpanElement;
	private readonly eraserBtn: HTMLButtonElement;

	constructor(
		containerEl: HTMLElement,
		onToolChange: PencilToolChangeHandler,
		onClear: () => void,
		onSave: () => void,
	) {
		this.containerEl = containerEl;
		this.onToolChange = onToolChange;
		this.onClear = onClear;
		this.onSave = onSave;

		this.root = document.createElement("div");
		this.root.className = "pencil-toolbar";

		// Color picker
		this.colorInput = document.createElement("input");
		this.colorInput.type = "color";
		this.colorInput.value = this.color;
		this.colorInput.addEventListener("input", () => {
			this.color = this.colorInput.value;
			this.emit();
		});
		this.root.appendChild(this.colorInput);

		// Size slider + value readout
		this.sizeInput = document.createElement("input");
		this.sizeInput.type = "range";
		this.sizeInput.min = "2";
		this.sizeInput.max = "24";
		this.sizeInput.value = String(this.size);
		this.sizeInput.addEventListener("input", () => {
			this.size = Number(this.sizeInput.value);
			this.sizeValueEl.textContent = String(this.size);
			this.emit();
		});
		this.root.appendChild(this.sizeInput);

		this.sizeValueEl = document.createElement("span");
		this.sizeValueEl.className = "pencil-toolbar-size-value";
		this.sizeValueEl.textContent = String(this.size);
		this.root.appendChild(this.sizeValueEl);

		// Eraser toggle
		this.eraserBtn = document.createElement("button");
		this.eraserBtn.type = "button";
		this.eraserBtn.className = "pencil-toolbar-eraser";
		this.eraserBtn.textContent = "Eraser";
		this.eraserBtn.addEventListener("click", () => {
			this.mode = this.mode === "eraser" ? "pen" : "eraser";
			this.eraserBtn.classList.toggle("active", this.mode === "eraser");
			this.emit();
		});
		this.root.appendChild(this.eraserBtn);

		// Clear
		const clearBtn = document.createElement("button");
		clearBtn.type = "button";
		clearBtn.className = "pencil-toolbar-clear";
		clearBtn.textContent = "Clear";
		clearBtn.addEventListener("click", () => this.onClear());
		this.root.appendChild(clearBtn);

		// Save (PNG export)
		const saveBtn = document.createElement("button");
		saveBtn.type = "button";
		saveBtn.className = "pencil-toolbar-save";
		saveBtn.textContent = "Save";
		saveBtn.addEventListener("click", () => this.onSave());
		this.root.appendChild(saveBtn);

		this.containerEl.appendChild(this.root);
	}

	getState(): PencilToolState {
		return { color: this.color, size: this.size, mode: this.mode };
	}

	private emit(): void {
		this.onToolChange(this.getState());
	}
}
