import * as vscode from 'vscode';
import * as Simplicite from 'simplicite';
import { SimpliciteFS } from './SimpliciteFS';

export function activate(context: vscode.ExtensionContext) {
	const cfg: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('simplicite');
	const url: string|undefined = cfg.get('url');
	const username: string|undefined = cfg.get('username');
	const modules: string[]|undefined = cfg.get('modules');
	// TODO: temporary (single module)
	const module: string = modules ? modules[0] : 'Application';

	console.log(`Simplicite tools activated for URL ${url} and username ${username}`);

	const app: any = Simplicite.session({ url: url, username: username, password: cfg.get('password'), debug: false });
	const mdl: any = app.getBusinessObject('Module');
	const obj: any= app.getBusinessObject('ObjectInternal');

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

	const fs: SimpliciteFS = new SimpliciteFS(app);

	context.subscriptions.push(vscode.workspace.registerFileSystemProvider('simplicite', fs, { isCaseSensitive: true }));

	function refreshModules() {
		app.debug(modules);
		let mf: string = `'${module}'`; // TODO: use modules
		mdl.search({ mdl_name: `in (${mf})` }).then((ms: any) => {
			app.debug(JSON.stringify(ms));
			for (let i: number = 0; i < ms.length; i++) {
				const m: any = ms[i];
				//const uri: string = `simplicite:/${m.mdl_name}`;
				//fs.createDirectory(vscode.Uri.parse(uri));
				const uri: string = `simplicite:`;
				fs.createDirectory(vscode.Uri.parse(`${uri}/src`));
				fs.createDirectory(vscode.Uri.parse(`${uri}/src/com`));
				fs.createDirectory(vscode.Uri.parse(`${uri}/src/com/simplicite`));
				fs.createDirectory(vscode.Uri.parse(`${uri}/resources`));
				fs.createDirectory(vscode.Uri.parse(`${uri}/test`));
				fs.createDirectory(vscode.Uri.parse(`${uri}/test/src`));
				fs.createDirectory(vscode.Uri.parse(`${uri}/test/resources`));
				fs.writeFile(vscode.Uri.parse(`${uri}/README.md`), Buffer.from(m.mdl_comment || ''), { create: true, overwrite: true });
				mdl.print('Module-MavenModule', m.row_id).then((pom: string) => {
					app.debug(pom);
					fs.writeFile(vscode.Uri.parse(`${uri}/pom.xml`), Buffer.from(pom), { create: true, overwrite: true });
					refreshBusinessObjects(m.row_id, m.mdl_name, uri);
				});
			}
		});
	}

	function refreshBusinessObjects(mdlId: number, mdlName: string, mdlUri: string) {
		obj.search({ row_module_id: mdlId }, { inlineDocuments: [ 'obo_script_id' ] }).then((os: any) => {
			app.debug(JSON.stringify(os));
			let uri: string = `${mdlUri}/src/com/simplicite/objects`;
			fs.createDirectory(vscode.Uri.parse(uri));
			uri = `${uri}/${mdlName}`;
			fs.createDirectory(vscode.Uri.parse(uri));
			for (let i: number = 0; i < os.length; i++) {
				const o: any = os[i];
				app.debug(JSON.stringify(o));
				const d: any = o.obo_script_id;
				if (d) {
					let u: vscode.Uri = vscode.Uri.parse(`${uri}/${d.name}`);
					fs.writeFile(u, Buffer.from(d.content, 'base64'), { create: true, overwrite: true });
					fs.setRecord(u.path, obj.getName(), 'obo_script_id', o.row_id);
				}
			}
		});
	}

	context.subscriptions.push(vscode.commands.registerCommand('simplicite.refresh', refreshModules));

	context.subscriptions.push(vscode.commands.registerCommand('simplicite.init', () => {
		vscode.workspace.updateWorkspaceFolders(0, 0, { uri: vscode.Uri.parse('simplicite:/'), name: module });
	}));
}

export function deactivate() {
	console.log('Simplicite tools deactivated');
}
