import { MarkdownView, Plugin } from "obsidian";
import { PencilCanvas } from "./canvas";
import { PencilToolbar } from "./toolbar";

function generateSketchId(): string {
	const alphabet =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let id = "";
	for (let i = 0; i < 8; i++) {
		id += alphabet[Math.floor(Math.random() * alphabet.length)];
	}
	return id;
}

function parsePencilBlock(source: string): Record<string, string> {
	const result: Record<string, string> = {};
	for (const rawLine of source.split("\n")) {
		const line = rawLine.trim();
		if (!line || line.startsWith("#")) continue;
		const colonIdx = line.indexOf(":");
		if (colonIdx === -1) continue;
		const key = line.slice(0, colonIdx).trim();
		const value = line.slice(colonIdx + 1).trim();
		if (key) result[key] = value;
	}
	return result;
}

export default class PencilNotesPlugin extends Plugin {
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

				if (existed) return;

				const view =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				const editor = view?.editor;
				if (!editor) return;

				const section = ctx.getSectionInfo(el);
				if (!section) return;

				const endLineText = editor.getLine(section.lineEnd);
				editor.replaceRange(`\n\n![[${path}]]`, {
					line: section.lineEnd,
					ch: endLineText.length,
				});
			};

			new PencilToolbar(
				toolbarContainer,
				() => {},
				() => {},
				handleSave,
			);
		});
	}

	onunload() {}
}
