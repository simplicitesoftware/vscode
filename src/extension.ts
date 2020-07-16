import * as vscode from 'vscode';
import * as Simplicite from 'simplicite';

export function activate(context: vscode.ExtensionContext) {
	console.log('Simplicite tools activated');

	let app = Simplicite.session({ url: 'https://demo.dev.simplicite.io', username: 'website', password: 'simplicite' });

	let disposable = vscode.commands.registerCommand('simplicite.info', () => {
		app.getAppInfo().then((info: any) => {
			vscode.window.showInformationMessage(info.title + ' ' + info.platformversion);
		});
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {
	console.log('Simplicite tools deactivated');
}
