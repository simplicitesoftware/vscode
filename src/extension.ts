import * as vscode from 'vscode';
import * as Simplicite from 'simplicite';
import { SimpliciteFS } from './SimpliciteFS';

export function activate(context: vscode.ExtensionContext) {
	let cfg = vscode.workspace.getConfiguration('simplicite');
	let url = cfg.get("url");
	let username = cfg.get("username");
	console.log(`Simplicite tools activated for URL ${url} and username ${username}`);

	let app = Simplicite.session({ url: url, username: username, password: cfg.get("password"), debug: true });
	const mdl = app.getBusinessObject('Module');

	context.subscriptions.push(vscode.commands.registerCommand('simplicite.appinfo', () => {
		app.getAppInfo().then((info: any) => {
			app.debug(JSON.stringify(info));
			vscode.window.showInformationMessage(`${info.title} ${info.platformversion} (${url})`);
		});
	}));

	context.subscriptions.push(vscode.commands.registerCommand('simplicite.sysinfo', () => {
		app.getSysInfo().then((info: any) => {
			app.debug(JSON.stringify(info));
			vscode.window.showInformationMessage(`Object cache: ${info.cacheobject} / ${info.cacheobjectmax}. Process cache: ${info.cacheprocess} / ${info.cacheprocessmax}, Grant cache: ${info.cachegrant} / ${info.cachegrantmax}`);
		});
	}));

	const fs = new SimpliciteFS();

	context.subscriptions.push(vscode.workspace.registerFileSystemProvider('simplicite', fs, { isCaseSensitive: true }));

	context.subscriptions.push(vscode.commands.registerCommand('simplicite.initWorkspace', () => {
		app.getAppInfo().then((info: any) => {
			app.debug(JSON.stringify(info));
			vscode.workspace.updateWorkspaceFolders(0, 0, { uri: vscode.Uri.parse('simplicite:/'), name: info.title });
		});
	}));

	context.subscriptions.push(vscode.commands.registerCommand('simplicite.refresh', () => {
		mdl.search({ mdl_name: 'not in (\'System\', \'Interface\')' }).then((modules: any) => {
			app.debug(JSON.stringify(modules));
			for (let i = 0; i < modules.length; i++) {
				const module = modules[i];
				const moduleURI = `simplicite:/${module.mdl_name}/`;
				fs.createDirectory(vscode.Uri.parse(moduleURI));
				fs.writeFile(vscode.Uri.parse(`${moduleURI}/README.md`), Buffer.from(module.mdl_comment || ''), { create: true, overwrite: true });
			}
		});
	}));
}

export function deactivate() {
	console.log('Simplicite tools deactivated');
}
