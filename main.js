var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => PencilNotesPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");

// src/canvas.ts
var CANVAS_WIDTH = 800;
var CANVAS_HEIGHT = 400;
var BASE_LINE_WIDTH = 2.5;
var MIN_LINE_WIDTH = 0.1;
var PencilCanvas = class {
  constructor(containerEl, sketchId, app) {
    this.drawing = false;
    this.activePointerId = null;
    this.lastX = 0;
    this.lastY = 0;
    this.onPointerDown = (event) => {
      if (!this.isDrawingPointer(event.pointerType))
        return;
      event.preventDefault();
      this.drawing = true;
      this.activePointerId = event.pointerId;
      this.canvas.setPointerCapture(event.pointerId);
      const { x, y } = this.localCoords(event);
      this.lastX = x;
      this.lastY = y;
    };
    this.onPointerMove = (event) => {
      if (!this.drawing)
        return;
      if (event.pointerId !== this.activePointerId)
        return;
      if (!this.isDrawingPointer(event.pointerType))
        return;
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
    this.onPointerUp = (event) => {
      if (event.pointerId !== this.activePointerId)
        return;
      this.drawing = false;
      this.activePointerId = null;
      if (this.canvas.hasPointerCapture(event.pointerId)) {
        this.canvas.releasePointerCapture(event.pointerId);
      }
    };
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
  getSketchId() {
    return this.sketchId;
  }
  isDrawingPointer(pointerType) {
    return pointerType === "pen" || pointerType === "mouse";
  }
  localCoords(event) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  }
  async savePng(vaultPath) {
    const dataUrl = this.canvas.toDataURL("image/png");
    const prefix = "data:image/png;base64,";
    const base64 = dataUrl.startsWith(prefix) ? dataUrl.slice(prefix.length) : dataUrl;
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    await this.app.vault.adapter.writeBinary(vaultPath, bytes.buffer);
    return vaultPath;
  }
};

// src/toolbar.ts
var PencilToolbar = class {
  constructor(containerEl, onToolChange, onClear, onSave) {
    this.color = "#000000";
    this.size = 4;
    this.mode = "pen";
    this.containerEl = containerEl;
    this.onToolChange = onToolChange;
    this.onClear = onClear;
    this.onSave = onSave;
    this.root = document.createElement("div");
    this.root.className = "pencil-toolbar";
    this.colorInput = document.createElement("input");
    this.colorInput.type = "color";
    this.colorInput.value = this.color;
    this.colorInput.addEventListener("input", () => {
      this.color = this.colorInput.value;
      this.emit();
    });
    this.root.appendChild(this.colorInput);
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
    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "pencil-toolbar-clear";
    clearBtn.textContent = "Clear";
    clearBtn.addEventListener("click", () => this.onClear());
    this.root.appendChild(clearBtn);
    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "pencil-toolbar-save";
    saveBtn.textContent = "Save";
    saveBtn.addEventListener("click", () => this.onSave());
    this.root.appendChild(saveBtn);
    this.containerEl.appendChild(this.root);
  }
  getState() {
    return { color: this.color, size: this.size, mode: this.mode };
  }
  emit() {
    this.onToolChange(this.getState());
  }
};

// src/main.ts
function generateSketchId() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 8; i++) {
    id += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return id;
}
function parsePencilBlock(source) {
  const result = {};
  for (const rawLine of source.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#"))
      continue;
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1)
      continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    if (key)
      result[key] = value;
  }
  return result;
}
var PencilNotesPlugin = class extends import_obsidian.Plugin {
  async onload() {
    this.registerMarkdownCodeBlockProcessor("pencil", (source, el, ctx) => {
      const data = parsePencilBlock(source);
      const sketchId = data["sketch-id"] || generateSketchId();
      const wrapper = el.createDiv({ cls: "pencil-canvas-wrapper" });
      const toolbarContainer = wrapper.createDiv();
      const canvasContainer = wrapper.createDiv();
      const canvas = new PencilCanvas(canvasContainer, sketchId, this.app);
      const handleSave = async () => {
        const path = `Attachments/pencil-${sketchId}.png`;
        const existed = await this.app.vault.adapter.exists(path);
        await canvas.savePng(path);
        if (existed)
          return;
        const view = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
        const editor = view == null ? void 0 : view.editor;
        if (!editor)
          return;
        const section = ctx.getSectionInfo(el);
        if (!section)
          return;
        const endLineText = editor.getLine(section.lineEnd);
        editor.replaceRange(`

![[${path}]]`, {
          line: section.lineEnd,
          ch: endLineText.length
        });
      };
      new PencilToolbar(
        toolbarContainer,
        () => {
        },
        () => {
        },
        handleSave
      );
    });
  }
  onunload() {
  }
};
