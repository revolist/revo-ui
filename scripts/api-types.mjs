import ts from 'typescript';

/** A shared graph retains recursive and generic contracts without depth truncation. */
export function createTypeGraph(checker, describe, isLibraryDeclaration) {
  const ids = new Map();
  const entries = new Map();
  const pending = [];
  const format = (type, node, expand = false) =>
    checker.typeToString(
      type,
      node,
      ts.TypeFormatFlags.NoTruncation |
        ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope |
        (expand ? ts.TypeFormatFlags.InTypeAlias : 0),
    );
  const publicMember = (property) => {
    const node = property.valueDeclaration ?? property.declarations?.[0];
    return (
      !property.name.startsWith('#') &&
      !(
        node &&
        ts.getCombinedModifierFlags(node) &
          (ts.ModifierFlags.Private |
            ts.ModifierFlags.Protected |
            ts.ModifierFlags.Static)
      )
    );
  };
  const documentedDeclaration = (node) =>
    isLibraryDeclaration(node) ||
    (node.getSourceFile().fileName.includes('/node_modules/') &&
      !/\/typescript\/lib\//.test(node.getSourceFile().fileName));
  const ensure = (type, node) => {
    const text = format(type, node);
    const expanded = format(type, node, true);
    const simple =
      ts.TypeFlags.StringLike |
      ts.TypeFlags.NumberLike |
      ts.TypeFlags.BooleanLike |
      ts.TypeFlags.BigIntLike |
      ts.TypeFlags.ESSymbolLike |
      ts.TypeFlags.Null |
      ts.TypeFlags.Undefined |
      ts.TypeFlags.Void |
      ts.TypeFlags.Never |
      ts.TypeFlags.Any |
      ts.TypeFlags.Unknown;
    if (type.flags & simple && text === expanded) return undefined;
    const named = (
      text.replace(/"[^"]*"|'[^']*'/g, '').match(/\b[A-Za-z_$]\w*\b/g) ?? []
    ).some(
      (word) =>
        ![
          'string',
          'number',
          'boolean',
          'bigint',
          'symbol',
          'true',
          'false',
          'null',
          'undefined',
          'void',
          'never',
          'any',
          'unknown',
        ].includes(word),
    );
    if (
      type.isUnion() &&
      !named &&
      type.types.every((part) => part.flags & simple)
    )
      return undefined;
    if (ids.has(type)) return ids.get(type);
    const id = `type-${ids.size}`;
    ids.set(type, id);
    entries.set(id, {
      id,
      name: text,
      definition: expanded,
      description: '',
      properties: [],
      variants: [],
      calls: [],
      indexes: [],
    });
    pending.push({ id, type, node });
    return id;
  };
  const link = (type, node) => {
    const typeId = ensure(type, node);
    return { type: format(type, node), ...(typeId ? { typeId } : {}) };
  };
  const member = (property) => {
    const node = property.valueDeclaration ?? property.declarations?.[0];
    const detail = describe(property);
    const ref = link(checker.getTypeOfSymbolAtLocation(property, node), node);
    return { ...detail, ...(ref.typeId ? { typeId: ref.typeId } : {}) };
  };
  const flush = () => {
    for (let i = 0; i < pending.length; i++) {
      const { id, type, node } = pending[i];
      const entry = entries.get(id);
      const symbol = type.aliasSymbol ?? type.getSymbol();
      entry.description = symbol
        ? ts.displayPartsToString(symbol.getDocumentationComment(checker))
        : '';
      if (type.isUnion()) {
        entry.variants = type.types.map((part) => link(part, node));
        entry.definition = type.types
          .map((part) => format(part, node, true))
          .join(' | ');
        continue;
      }
      if (checker.isArrayType(type) || checker.isTupleType(type)) {
        const element = checker.getIndexTypeOfType(type, ts.IndexKind.Number);
        if (element) entry.element = link(element, node);
        if (checker.isTupleType(type))
          entry.variants = checker
            .getTypeArguments(type)
            .map((part) => link(part, node));
        continue;
      }
      const properties = checker.getPropertiesOfType(type).filter(publicMember);
      entry.properties = properties
        .filter(
          (property) =>
            !property.declarations?.length ||
            property.declarations.some(documentedDeclaration),
        )
        .map(member);
      for (const call of type.getCallSignatures()) {
        entry.calls.push({
          parameters: call.parameters.map((parameter) => {
            const declaration =
              parameter.valueDeclaration ?? parameter.declarations?.[0] ?? node;
            const value = checker.getTypeOfSymbolAtLocation(
              parameter,
              declaration,
            );
            return { ...describe(parameter), ...link(value, declaration) };
          }),
          returns: link(checker.getReturnTypeOfSignature(call), node),
        });
      }
      // Browser/framework instances remain external references; never traverse DOM internals.
      const own =
        symbol?.declarations?.some(documentedDeclaration) ||
        entry.properties.length ||
        ['Record', 'Partial', 'Pick', 'Omit', 'Readonly', 'Required'].includes(
          type.aliasSymbol?.name,
        );
      if (own)
        for (const index of checker.getIndexInfosOfType(type))
          entry.indexes.push({
            key: format(index.keyType, node),
            ...link(index.type, node),
          });
      if (
        !entry.properties.length &&
        !entry.calls.length &&
        !entry.indexes.length
      ) {
        entry.external =
          !!symbol?.declarations?.length &&
          !symbol.declarations.some(documentedDeclaration);
        if (type.flags & ts.TypeFlags.TypeParameter) {
          entry.description ||=
            'Generic type parameter supplied by the data, value or item type used with this component.';
          const constraint = checker.getBaseConstraintOfType(type);
          if (constraint) entry.constraint = link(constraint, node);
        }
      }
    }
    pending.length = 0;
  };
  const collect = (members) => {
    flush();
    const found = new Map();
    const visit = (id) => {
      if (!id || found.has(id)) return;
      const entry = entries.get(id);
      found.set(id, entry);
      const scan = (value) => {
        if (!value || typeof value !== 'object') return;
        if (value.typeId) visit(value.typeId);
        for (const [key, child] of Object.entries(value))
          if (key !== 'typeId') scan(child);
      };
      scan(entry);
    };
    for (const member of members) visit(member.typeId);
    return [...found.values()];
  };
  return { member, collect };
}
