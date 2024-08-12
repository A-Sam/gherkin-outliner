// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { BDDOutlineProvider } from './bddOutlineProvider';

function applyDecorations(editor: vscode.TextEditor) {
	const text = editor.document.getText();
	const regex = /\/\/ @(given|when|then|scenario|feature|bdd)/g;
	const ranges = [];
	let match;
	while ((match = regex.exec(text))) {
		const startPos = editor.document.positionAt(match.index);
		const endPos = editor.document.positionAt(match.index + match[0].length);
		ranges.push(new vscode.Range(startPos, endPos));
	}
	const decoration = vscode.window.createTextEditorDecorationType({
		color: new vscode.ThemeColor('bdd.keyword')
	});
	editor.setDecorations(decoration, ranges);
}


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const provider = new BDDOutlineProvider();
	const selector = { language: 'cpp', scheme: 'file' };
	context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider(selector, provider));

	// TODO not applied yet due to token parsing issue
	// // Apply on active editor change
	// vscode.window.onDidChangeActiveTextEditor(editor => {
	// 	if (editor && editor.document.languageId === 'cpp') {
	// 		applyDecorations(editor);
	// 	}
	// });

	// // Apply on document change
	// vscode.workspace.onDidChangeTextDocument(event => {
	// 	if (event.document.languageId === 'cpp') {
	// 		const editor = vscode.window.activeTextEditor;
	// 		if (editor && editor.document === event.document) {
	// 			applyDecorations(editor);
	// 		}
	// 	}
	// });


	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('gherkin-outliner.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from gherkin-outliner!');
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
