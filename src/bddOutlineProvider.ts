import * as vscode from 'vscode';

export class BDDOutlineProvider implements vscode.DocumentSymbolProvider {
    public provideDocumentSymbols(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.DocumentSymbol[]> {
        const symbols: vscode.DocumentSymbol[] = [];
        const fullDocumentRange = new vscode.Range(0, 0, document.lineCount - 1, Number.MAX_SAFE_INTEGER);
        let currentBDD: vscode.DocumentSymbol | undefined;
        let currentFeature: vscode.DocumentSymbol | undefined;
        let currentScenario: vscode.DocumentSymbol | undefined;

        const kScenarioCount = '// @scenario '.length;
        const kFeatureCount = '// @feature '.length;
        const kGivenCount ='// @given '.length;
        const kWhenCount ='// @when '.length;
        const kThenCount ='// @then '.length;
        const kAndCount ='// @and '.length;
        const kLinePrefix ='// '.length;

        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            const text = line.text.trim();

            if (text.startsWith('// @bdd')) {
                currentBDD = new vscode.DocumentSymbol(text.substring(kLinePrefix).trim(), '', vscode.SymbolKind.Package, fullDocumentRange, line.range);
                symbols.push(currentBDD);
            } else if (text.startsWith('// @feature ')) {
                if (currentBDD) {
                    currentFeature = new vscode.DocumentSymbol(text.substring(kLinePrefix).trim(), '', vscode.SymbolKind.Class, line.range, line.range);
                    currentBDD.children.push(currentFeature);
                }
            } else if (text.startsWith('// @scenario ')) {
                if (currentFeature) {
                    currentScenario = new vscode.DocumentSymbol(text.substring(kLinePrefix).trim(), '', vscode.SymbolKind.Method, line.range, line.range);
                    currentFeature.children.push(currentScenario);
                }
            } else if (text.startsWith('// @given ') || text.startsWith('// @when ') || text.startsWith('// @then ')) {
                if (currentScenario) {
                    currentScenario.children.push(new vscode.DocumentSymbol(text.substring(kLinePrefix).trim(), '', vscode.SymbolKind.Field, line.range, line.range));
                }
            }
        }

        return symbols;
    }
}
