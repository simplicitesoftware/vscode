import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('simplicite-tools activated');

	let disposable = vscode.commands.registerCommand('simplicite-tools.version', () => {
		vscode.window.showInformationMessage('Simplicite tools version 0.0.1');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {
	console.log('simplicite-tools deactivated');
}
