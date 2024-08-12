import * as vscode from 'vscode';

const elementMap = new Map<string, string>([
  ['f', '⭐'], // feature
  ['b', '📌'], // background
  ['s', '🎬'], // scenario
  ['g', '🔴'], // given
  ['w', '🟡'], // when
  ['t', '🟢'], // then
  ['e', '💡'], // example
]);

// Example usage:
console.log(elementMap.get('f')); // Output: 🌟
console.log(elementMap.get('s')); // Output: 🎬


export class BDDOutlineProvider implements vscode.DocumentSymbolProvider {
    public provideDocumentSymbols(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.DocumentSymbol[]> {
        const symbols: vscode.DocumentSymbol[] = [];
        const fullDocumentRange = new vscode.Range(0, 0, document.lineCount - 1, Number.MAX_SAFE_INTEGER);

        function parseToken(line: string, token: string): string | null {
            const regex = new RegExp(`^\\s*\\/\\/\\s*@${token}\\s*(.+?)\\s*$`);
            const match = line.match(regex);
            return match ? match[1].trim() : null;
        }


        let currentBDD: vscode.DocumentSymbol | undefined;
        let currentFeature: vscode.DocumentSymbol | undefined;
        let currentScenario: vscode.DocumentSymbol | undefined;

        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            const text = line.text;

            const bddName = parseToken(text, 'bdd');
            if (bddName) {
                currentBDD = new vscode.DocumentSymbol(bddName, '', vscode.SymbolKind.Package, fullDocumentRange, line.range);
                symbols.push(currentBDD);
                currentFeature = undefined;
                currentScenario = undefined;
                continue;
            }

            const featureName = parseToken(text, 'feature');
            if (featureName && currentBDD) {
                currentFeature = new vscode.DocumentSymbol("🚀 " + featureName, '', vscode.SymbolKind.Class, line.range, line.range);
                currentBDD.children.push(currentFeature);
                currentScenario = undefined;
                continue;
            }

            const backgroundName = parseToken(text, 'background');
            if (backgroundName && currentFeature) {
                currentScenario = new vscode.DocumentSymbol("📌 " + backgroundName, '', vscode.SymbolKind.Enum, line.range, line.range);
                currentFeature.children.push(currentScenario);
                continue;
            }

            const scenarioName = parseToken(text, 'scenario');
            if (scenarioName && currentFeature) {
                currentScenario = new vscode.DocumentSymbol("🎬 " + scenarioName, '', vscode.SymbolKind.Method, line.range, line.range);
                currentFeature.children.push(currentScenario);
                continue;
            }

            const stepMatch = text.match(/^\s*\/\/\s*@(\w+)\s*(.+)$/);
            if (stepMatch && currentScenario) {
                const [, stepType, stepDescription] = stepMatch;
                const stepName = `([${stepType.toUpperCase()[0]}]) ${stepDescription}`;
                currentScenario.children.push(new vscode.DocumentSymbol(stepName, '', vscode.SymbolKind.Field, line.range, line.range));
            }
        }
        return symbols;
    }
}
