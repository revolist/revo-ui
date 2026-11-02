import ts from 'typescript';
import { createTypeGraph } from './api-types.mjs';
import { supplementalDescription } from './api-descriptions.mjs';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** Build documentation from the same component contracts consumed by framework adapters. */
export function componentApi(library, gallery, watchSource = () => {}) {
  const catalog = resolve(library, 'packages/ui/src/component-catalog.ts');
  const select = resolve(library, 'packages/ui/src/select.tsx');
  const program = ts.createProgram([catalog, select], {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    jsxImportSource: 'preact',
    skipLibCheck: true,
    strict: true,
    allowSyntheticDefaultImports: true,
  });
  const checker = program.getTypeChecker();
  for (const source of program.getSourceFiles())
    if (source.fileName.startsWith(resolve(library, 'packages')))
      watchSource(source.fileName);
  watchSource(resolve(gallery, 'docs/component-groups.json'));
  const groups = JSON.parse(
    readFileSync(resolve(gallery, 'docs/component-groups.json'), 'utf8'),
  );
  const libraryDeclaration = (declaration) =>
    /\/packages\/(?:ui|dates|chart-utils)\/src\//.test(
      declaration.getSourceFile().fileName,
    );
  const format = (type, node) =>
    checker.typeToString(
      type,
      node,
      ts.TypeFormatFlags.NoTruncation |
        ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope,
    );
  const describe = (property) => {
    const node = property.valueDeclaration ?? property.declarations?.[0];
    return {
      name: property.name,
      type:
        node?.type &&
        libraryDeclaration(node) &&
        format(checker.getTypeOfSymbolAtLocation(property, node), node).length >
          300
          ? node.type.getText().replace(/\s+/g, ' ')
          : format(checker.getTypeOfSymbolAtLocation(property, node), node),
      required:
        !(property.flags & ts.SymbolFlags.Optional) &&
        !(
          node &&
          ts.isParameter(node) &&
          (node.questionToken || node.initializer || node.dotDotDotToken)
        ),
      description:
        ts.displayPartsToString(property.getDocumentationComment(checker)) ||
        supplementalDescription(property.name, node),
      inherited: !property.declarations?.some(libraryDeclaration),
    };
  };
  const graph = createTypeGraph(checker, describe, libraryDeclaration);
  const source = program.getSourceFile(catalog);
  let initializer;
  for (const statement of source.statements)
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations)
        if (declaration.name.getText(source) === 'uiComponents')
          initializer = declaration.initializer;
    }
  while (
    ts.isAsExpression(initializer) ||
    ts.isSatisfiesExpression(initializer)
  )
    initializer = initializer.expression;
  const entries = initializer.properties.map((property) => ({
    name: property.name.getText(source),
    node: property.initializer,
  }));
  entries.push({
    name: 'Select',
    node: program
      .getSourceFile(select)
      .statements.find(
        (statement) =>
          ts.isFunctionDeclaration(statement) &&
          statement.name?.text === 'Select',
      ),
  });
  return entries.map(({ name, node }) => {
    const signature = checker.getTypeAtLocation(node).getCallSignatures()[0];
    if (!signature) throw new Error(`Missing component signature: ${name}`);
    const props = signature.parameters[0]
      ? checker.getTypeOfSymbolAtLocation(signature.parameters[0], node)
      : undefined;
    const properties = props
      ? [
          ...new Map(
            (props.isUnion() ? props.types : [props])
              .flatMap((type) => checker.getPropertiesOfType(type))
              .map((property) => [property.name, property]),
          ).values(),
        ]
      : [];
    const members = properties.map(graph.member);
    const methods = new Map();
    // Controllers/handles are only documented when reachable through a public prop or callback.
    const visit = (type, via) => {
      for (const part of type.isUnion() ? type.types : [type]) {
        const declaration = part
          .getSymbol()
          ?.declarations?.find(
            (item) => ts.isClassDeclaration(item) && libraryDeclaration(item),
          );
        if (!declaration) continue;
        for (const member of checker.getPropertiesOfType(part)) {
          const location = member.valueDeclaration ?? member.declarations?.[0];
          if (
            !location ||
            !libraryDeclaration(location) ||
            member.name.startsWith('#')
          )
            continue;
          if (
            ts.getCombinedModifierFlags(location) &
            (ts.ModifierFlags.Private |
              ts.ModifierFlags.Protected |
              ts.ModifierFlags.Static)
          )
            continue;
          const memberType = checker.getTypeOfSymbolAtLocation(
            member,
            location,
          );
          if (!memberType.getCallSignatures().length) continue;
          const qualified = `${part.getSymbol().name}.${member.name}`;
          methods.set(qualified, {
            ...graph.member(member),
            name: qualified,
            via,
          });
        }
      }
    };
    for (const property of properties) {
      const location = property.valueDeclaration ?? property.declarations?.[0];
      const type = checker.getTypeOfSymbolAtLocation(property, location);
      visit(type, property.name);
      for (const call of checker.getNonNullableType(type).getCallSignatures())
        for (const parameter of call.parameters)
          visit(
            checker.getTypeOfSymbolAtLocation(parameter, location),
            `${property.name} callback`,
          );
    }
    const families = groups
      .filter(([, , , names]) => names.split(' ').includes(name))
      .map(([title]) => title);
    if (name === 'Select') families.push('Selects, chips and resources');
    if (name === 'IconToolbar') families.push('Menus and toolbars');
    if (name === 'HtmlEditor') families.push('HTML Editor');
    // Result subcomponents belong alongside the AI assistant composition.
    if (!families.length && name.startsWith('Ai'))
      families.push('AI assistant');
    if (!families.length)
      throw new Error(`Missing gallery API family: ${name}`);
    return {
      name,
      families,
      props: members.filter((item) => !/^on[A-Z]/.test(item.name)),
      events: members.filter((item) => /^on[A-Z]/.test(item.name)),
      methods: [...methods.values()],
      types: graph.collect([...members, ...methods.values()]),
    };
  });
}

/** Share inherited DOM declarations rather than repeating them for every control. */
export function apiModule(api) {
  const members = [];
  const ids = new Map();
  const intern = (member) => {
    const key = JSON.stringify(member);
    if (!ids.has(key)) {
      ids.set(key, members.length);
      members.push(member);
    }
    return ids.get(key);
  };
  const types = new Map(
    api.flatMap((component) => component.types.map((type) => [type.id, type])),
  );
  const components = api.map((component) => ({
    ...component,
    types: component.types.map((type) => type.id),
    props: component.props.map(intern),
    events: component.events.map(intern),
    methods: component.methods.map(intern),
  }));
  return `const types = ${JSON.stringify(Object.fromEntries(types))}; const members = ${JSON.stringify(members)}; export default ${JSON.stringify(components)}.map(component => ({...component, types: component.types.map(id => types[id]), props: component.props.map(id => members[id]), events: component.events.map(id => members[id]), methods: component.methods.map(id => members[id])}));`;
}
