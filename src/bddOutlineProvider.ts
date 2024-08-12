import * as vscode from 'vscode';

const iconsMap = new Map<string, string>([
    ['f', '⭐'], // feature
    ['b', '📌'], // background
    ['s', '🎬'], // scenario
    ['g', '🔴'], // given
    ['w', '🟡'], // when
    ['t', '🟢'], // then
    ['e', '💡'], // example
]);

const getIcon = (key: string): string => {
    const defaultIcon = ''; // or any other default icon/string you prefer
    return iconsMap.get(key.toLowerCase()[0]) || defaultIcon;
};

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
        let latest_icon = getIcon('0');

        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            const text = line.text;

            const bddName = parseToken(text, 'bdd');
            if (bddName) {
                currentBDD = new vscode.DocumentSymbol(bddName, '', vscode.SymbolKind.Namespace, fullDocumentRange, line.range);
                symbols.push(currentBDD);
                currentFeature = undefined;
                currentScenario = undefined;
                continue;
            }

            const featureName = parseToken(text, 'feature');
            if (featureName && currentBDD) {
                latest_icon = getIcon('f');
                currentFeature = new vscode.DocumentSymbol(latest_icon + featureName, '', vscode.SymbolKind.Class, line.range, line.range);
                currentBDD.children.push(currentFeature);
                currentScenario = undefined;
                continue;
            }

            const backgroundName = parseToken(text, 'background');
            if (backgroundName && currentFeature) {
                latest_icon = getIcon('b');
                currentScenario = new vscode.DocumentSymbol(latest_icon + backgroundName, '', vscode.SymbolKind.Module, line.range, line.range);
                currentFeature.children.push(currentScenario);
                continue;
            }

            const scenarioName = parseToken(text, 'scenario');
            if (scenarioName && currentFeature) {
                latest_icon = getIcon('s');
                currentScenario = new vscode.DocumentSymbol(latest_icon + scenarioName, '', vscode.SymbolKind.Method, line.range, line.range);
                currentFeature.children.push(currentScenario);
                continue;
            }

            const stepMatch = text.match(/^\s*\/\/\s*@(\w+)\s*(.+)$/);
            if (stepMatch && currentScenario) {
                const [, stepType, stepDescription] = stepMatch;
                latest_icon = getIcon(stepType) != '' ? getIcon(stepType) : latest_icon;
                const stepName = `${latest_icon} ${stepDescription}`;
                currentScenario.children.push(new vscode.DocumentSymbol(stepName, '', vscode.SymbolKind.Event, line.range, line.range));
            }
        }
        return symbols;
    }
}
