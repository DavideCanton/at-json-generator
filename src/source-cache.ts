import * as ts from 'typescript';

export class SourceCache
{
    private map = new Map<string, ts.SourceFile>();

    registerFile(path: string, file: ts.SourceFile)
    {
        this.map.set(path, file);
    }

    getFile(path: string): ts.SourceFile | null
    {
        return this.map.get(path) ?? null;
    }
}