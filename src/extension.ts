import * as vscode from 'vscode';
import { Controller } from './controller';

export function activate(context: vscode.ExtensionContext)
{
    const controller = new Controller();

    context.subscriptions.push(...[
        vscode.commands.registerCommand('at-json-generator.decorate-property', () =>
        {
            return controller.onDecorateProperty();
        })
    ]);
}

export function deactivate() { }
