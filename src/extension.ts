import * as vscode from 'vscode';
import * as Simplicite from 'simplicite';

export function activate(context: vscode.ExtensionContext) {
	let cfg = vscode.workspace.getConfiguration('simplicite');
	let url = cfg.get("url");
	let username = cfg.get("username");
	console.log(`Simplicite tools activated for URL ${url} and username ${username}`);

	let app = Simplicite.session({ url: url, username: username, password: cfg.get("password") });

	let disposable = vscode.commands.registerCommand('simplicite.info', () => {
		app.getAppInfo().then((info: any) => {
			vscode.window.showInformationMessage(`${info.title} ${info.platformversion} (${url})`);
		});
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {
	console.log('Simplicite tools deactivated');
}
