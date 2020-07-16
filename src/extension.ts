import * as vscode from 'vscode';
import * as Simplicite from 'simplicite';

export function activate(context: vscode.ExtensionContext) {
	let cfg = vscode.workspace.getConfiguration('simplicite');
	let url = cfg.get("url");
	let username = cfg.get("username");
	console.log(`Simplicite tools activated for URL ${url} and username ${username}`);

	let app = Simplicite.session({ url: url, username: username, password: cfg.get("password") });

	context.subscriptions.push(vscode.commands.registerCommand('simplicite.appinfo', () => {
		app.getAppInfo().then((info: any) => {
			console.log(JSON.stringify(info));
			vscode.window.showInformationMessage(`${info.title} ${info.platformversion} (${url})`);
		});
	}));

	context.subscriptions.push(vscode.commands.registerCommand('simplicite.sysinfo', () => {
		app.getSysInfo().then((info: any) => {
			console.log(JSON.stringify(info));
			vscode.window.showInformationMessage(`Object cache: ${info.cacheobject} / ${info.cacheobjectmax}. Process cache: ${info.cacheprocess} / ${info.cacheprocessmax}, Grant cache: ${info.cachegrant} / ${info.cachegrantmax}`);
		});
	}));
}

export function deactivate() {
	console.log('Simplicite tools deactivated');
}
