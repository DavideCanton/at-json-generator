import * as ts from 'typescript';
import * as vscode from 'vscode';
import { DecoratorGenerator } from './decorator-generator';
import { SourceCache } from "./source-cache";

export class Controller
{
    private cache = new SourceCache();
    private decoratorGenerator = new DecoratorGenerator();

    onDecorateProperty()
    {
        const editor = vscode.window.activeTextEditor;
        if (!editor)
        {
            return;
        }

        const file = this.getAndCacheFile();
        if (!file)
        {
            return;
        }

        const offset = editor.document.offsetAt(editor.selection.active);

        let foundProperty: ts.PropertyDeclaration | null = null;
        function getProperty(node: ts.Node)
        {
            if (node.kind === ts.SyntaxKind.PropertyDeclaration)
            {
                if (node.pos <= offset && offset <= node.end)
                {
                    foundProperty = node as ts.PropertyDeclaration;
                }
            }
            if (!foundProperty)
            {
                node.forEachChild(getProperty);
            }
        }

        getProperty(file);

        if (foundProperty)
        {
            const d = this.decoratorGenerator.generateDecoratorForProperty(foundProperty);
            console.log(d);
        }
        else
        {
            vscode.window.showInformationMessage("No property found at this position");
        }
    }

    private getAndCacheFile(): ts.SourceFile | null
    {
        const editor = vscode.window.activeTextEditor!;
        const docPath = editor.document.uri.fsPath;

        let file = this.cache.getFile(docPath);

        if (!file)
        {
            const filePath = vscode.window.activeTextEditor?.document.uri.fsPath;
            if (filePath)
            {
                const program = ts.createProgram([filePath], {});
                const source = program.getSourceFile(filePath)!;
                this.cache.registerFile(docPath, source);
                file = source;
            }
        }

        return file;
    }
}
