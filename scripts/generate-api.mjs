import ts from 'typescript';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const gallery = fileURLToPath(new URL('../', import.meta.url));
const library = resolve(process.argv[2] ?? gallery);
const catalogPath = resolve(library, 'package/component-catalog.ts');
const selectPath = resolve(library, 'package/select.tsx');
const program = ts.createProgram([catalogPath, selectPath], {
  target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler, jsx: ts.JsxEmit.ReactJSX,
  jsxImportSource: 'preact', skipLibCheck: true, strict: true, allowSyntheticDefaultImports: true,
});
const checker = program.getTypeChecker();
const groups = JSON.parse(readFileSync(resolve(gallery, 'docs/component-groups.json'), 'utf8'));
const routes = new Map(groups.flatMap(([title, route, description, names]) => names.split(' ').map(name => [name, {title, route, description}])));
routes.set('Select', {title:'Selects, chips and resources', route:'selects-chips-and-resources', description:'JSX option descriptors for the shared dropdown.'});
const source = program.getSourceFile(catalogPath);
let initializer;
for (const statement of source.statements) if (ts.isVariableStatement(statement)) {
  for (const declaration of statement.declarationList.declarations) if (declaration.name.getText(source) === 'uiComponents') initializer = declaration.initializer;
}
while (ts.isAsExpression(initializer) || ts.isSatisfiesExpression(initializer)) initializer = initializer.expression;
const entries = initializer.properties.map(property => ({ name: property.name.getText(source), node: property.initializer }));
const select = program.getSourceFile(selectPath).statements.find(statement => ts.isFunctionDeclaration(statement) && statement.name?.text === 'Select');
entries.push({name:'Select', node:select});
const escape = text => text.replaceAll('|','\\|').replaceAll('\n',' ').replaceAll('`','&#96;');
const output = resolve(gallery, 'docs/api'); mkdirSync(output, {recursive:true});
let count = 0;
for (const {name,node} of entries) {
  const type = checker.getTypeAtLocation(node);
  const signature = type.getCallSignatures()[0];
  if (!signature) throw new Error(`Missing props signature: ${name}`);
  const props = signature.parameters[0] ? checker.getTypeOfSymbolAtLocation(signature.parameters[0], node) : undefined;
  const allProperties = props ? checker.getPropertiesOfType(props) : [];
  const own = allProperties.filter(property => property.declarations?.some(declaration => /\/packages\/(?:ui|dates)\/src\//.test(declaration.getSourceFile().fileName)));
  const group = routes.get(name); if (!group) throw new Error(`Missing group: ${name}`);
  let text = `# ${name}\n\n${group.description}\n\n[Live examples and formatted usage](https://ui.rv-grid.com/components/${group.route}/) · [Component index](../../README.md#complete-component-reference)\n\n`;
  const directEntries = { LookupField: 'dropdown/lookup-field', NumberDraft: 'number-input', MaskedDraft: 'masked-input', DurationField: 'duration', DurationDraft: 'duration', HtmlEditor: 'rich-text', TemporalPicker: 'date-time', TemporalDraft: 'date-time', DateTimeField: 'date-time', AssigneePicker: 'assignee', AssigneeField: 'assignee', AssigneePickerLayout: 'assignee' };
  if (name !== 'Select') text += `Preact: \`import { ${name} } from '@revolist/ui/${directEntries[name] ?? 'preact'}'\`\n\n`;
  if (name === 'Select') text += 'Direct Preact entry: `@revolist/ui/select`. For other framework adapters use `Dropdown`, `Combobox`, or `MultiSelect`.\n\n';
  else text += `React: \`import { ${name} } from '@revolist/ui/react'\`\n\nVue: \`import { ${name} } from '@revolist/ui/vue'\`\n\nAngular/Svelte: pass \`component="${name}"\` to the framework's \`UiComponent\` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.\n\n`;
  text += '## Props\n\nThe table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.\n\n| Prop | Type | Required | Description |\n| --- | --- | --- | --- |\n';
  for (const property of own) {
    const declaration = property.valueDeclaration ?? property.declarations[0];
    const valueType = checker.typeToString(checker.getTypeOfSymbolAtLocation(property, declaration), declaration, ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope);
    const description = ts.displayPartsToString(property.getDocumentationComment(checker));
    text += `| \`${escape(property.name)}\` | \`${escape(valueType)}\` | ${property.flags & ts.SymbolFlags.Optional ? 'No' : 'Yes'} | ${escape(description)} |\n`;
  }
  if (!own.length) text += '| — | No component-specific props listed | — | See the linked examples and package declarations. |\n';
  text += '\n## Composition\n\nKeep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.\n\nThis reference is generated from the local `package` library source. Rebuild it with `node scripts/generate-api.mjs`.\n';
  writeFileSync(resolve(output, `${name}.md`),text);count++;
}
console.log(`Generated ${count} component API references from TypeScript declarations.`);
