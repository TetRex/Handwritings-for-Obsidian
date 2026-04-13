import { Plugin } from "obsidian";

export default class HandwritingPlugin extends Plugin {
	async onload(): Promise<void> {
		this.addCommand({
			id: "open-handwriting-pad",
			name: "Open Handwriting Pad",
			callback: () => this.openPad(),
		});
	}

	openPad(): void {
		// Step 1 scaffold: implementation will be added in later steps.
	}
}
