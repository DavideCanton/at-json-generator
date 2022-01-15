import * as ts from 'typescript';

export class DecoratorGenerator
{
    generateDecoratorForProperty(property: ts.PropertyDeclaration): string
    {
        const { type, } = property;
        if (!type) return "";

        const ttype = this.cleanUnionType(type);
        if (!ttype) return "";

        if (this.isBasicProperty(ttype))
            return "@JsonProperty()";
        if (this.isArrayType(ttype))
        {
            const at = ttype as ts.ArrayTypeNode;
            const element = at.elementType;
            if (this.isBasicProperty(element))
                return "@JsonArray()";
            else if(this.isReferenceType(element))
            {
                const name = this.getReferenceName(element);
                return "@JsonArrayOfComplexProperty(" + name + ")";
            }
        }
        if (this.isReferenceType(ttype))
        {
            const name = this.getReferenceName(ttype);
            return "@JsonComplexProperty(" + name + ")";
        }

        return "";
    }

    isReferenceType(ttype: ts.TypeNode)
    {
        return ttype.kind === ts.SyntaxKind.TypeReference;
    }

    getReferenceName(element: ts.TypeNode)
    {
        const refEl = element as ts.TypeReferenceNode;
        const tn = refEl.typeName as ts.Identifier;
        const name = tn.escapedText;
        return name;
    }

    cleanUnionType(type: ts.TypeNode): ts.TypeNode | null
    {
        if (type.kind !== ts.SyntaxKind.UnionType)
            return type;

        const ut = type as ts.UnionTypeNode;
        const types = ut.types.filter(t =>
        {
            if (t.kind !== ts.SyntaxKind.LiteralType) return true;

            const lt = t as ts.LiteralTypeNode;
            return lt.literal.kind !== ts.SyntaxKind.NullKeyword && lt.literal.kind !== ts.SyntaxKind.UndefinedKeyword;
        });

        if (types.length > 1) return null;

        return types[0];
    }

    isArrayType(type: ts.TypeNode): boolean
    {
        return type.kind === ts.SyntaxKind.ArrayType;
    }

    isBasicProperty(type: ts.TypeNode): boolean
    {
        switch (type.kind)
        {
            case ts.SyntaxKind.StringKeyword:
            case ts.SyntaxKind.NumberKeyword:
            case ts.SyntaxKind.BooleanKeyword:
            case ts.SyntaxKind.EnumKeyword:
                return true;
            default:
                return false;
        }
    }
}