import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import {
  componentNestedSlots,
  componentRenderSlots,
} from './component-metadata';
import { contentProps } from './react-adapter';
import { withFrameworkContent } from './framework-mount';
import { h } from 'preact';
import { uiComponents } from './component-catalog';
import {
  restoreNestedCallbackArguments,
  withNestedFrameworkContent,
} from './nested-framework-content';

describe('framework content catalog', () => {
  it('preserves inherited and non-enumerable option properties when applying slots', () => {
    class Option {
      constructor() {
        Object.defineProperty(this, 'identifier', {
          value: 'a',
          enumerable: false,
        });
      }
      get value() {
        return (this as any).identifier;
      }
      get label() {
        return 'Alpha';
      }
    }
    const option = new Option();
    let selected: unknown;
    const input = {
      options: [option],
      onChange: (_value: unknown, item: unknown) => {
        selected = item;
      },
    };
    const transformed = withNestedFrameworkContent('ChoiceChips', input, {
      slots: { optionLabel: 'slot' },
      render: () => 'custom',
    });
    const mapped = transformed.props.options[0];
    expect(mapped.value).toBe('a');
    expect(mapped.label).toBe('custom');
    expect(mapped).toBeInstanceOf(Option);
    restoreNestedCallbackArguments(
      transformed.props,
      transformed.originals,
    ).onChange(mapped.value, mapped);
    expect(selected).toBe(option);
    expect(option.label).toBe('Alpha');
  });
  it('applies every declared nested slot without mutating its data', () => {
    for (const component of Object.keys(uiComponents)) {
      for (const [slot, descriptor] of Object.entries(
        componentNestedSlots(component),
      )) {
        const originalLeaf = descriptor.args ? () => 'fallback' : 'fallback';
        const make = (depth: number): any => {
          if (depth === descriptor.path.length) return originalLeaf;
          const key = descriptor.path[depth];
          return key === '*' ? [make(depth + 1)] : { [key]: make(depth + 1) };
        };
        const props = make(0);
        const snapshot = JSON.stringify(props);
        const captured: Record<string, unknown>[] = [];
        const transformed = withNestedFrameworkContent(component, props, {
          slots: { [slot]: 'supplied' },
          render: (_value, scope) => {
            captured.push(scope);
            return 'rendered';
          },
        }).props;
        let leaf = transformed;
        for (const key of descriptor.path)
          leaf = key === '*' ? leaf[0] : leaf[key];
        if (descriptor.args) {
          expect(leaf('first', 'second'), `${component}.${slot}`).toBe(
            'rendered',
          );
          expect(captured[0]).toEqual(
            Object.fromEntries(
              descriptor.args.map((arg, i) => [
                arg,
                i === 0 ? 'first' : 'second',
              ]),
            ),
          );
        } else {
          expect(leaf, `${component}.${slot}`).toBe('rendered');
          expect(captured).toHaveLength(1);
          if (descriptor.item)
            expect(captured[0]).toMatchObject({
              [descriptor.item]: expect.any(Object),
              index: 0,
            });
        }
        expect(JSON.stringify(props)).toBe(snapshot);
        expect(
          withNestedFrameworkContent(component, props, {
            slots: {},
            render: () => 'unused',
          }).props,
        ).toBe(props);
      }
    }
  });

  it('keeps callback item identity and nested tree scopes', () => {
    const child = { id: 'child', title: 'Child', status: 'done' };
    const step = {
      id: 'root',
      title: 'Root',
      status: 'done',
      children: [child],
    };
    const scopes: Record<string, unknown>[] = [];
    const props = { steps: [step], onSelect: (item: unknown) => item };
    const result = withNestedFrameworkContent('Trace', props, {
      slots: { stepTitle: 'slot' },
      render: (_slot, scope) => {
        scopes.push(scope);
        return 'title';
      },
    });
    expect(scopes).toEqual([
      { step, index: 0, path: [0] },
      { step: child, index: 0, path: [0, 0] },
    ]);
    expect(
      restoreNestedCallbackArguments(result.props, result.originals).onSelect(
        result.props.steps[0],
      ),
    ).toBe(step);
    expect(step.title).toBe('Root');
  });

  it('does not create optional disabled actions or a missing chart', () => {
    const action = { deleteAction: false };
    const footer = withNestedFrameworkContent('DialogActionFooter', action, {
      slots: { deleteLabel: 'slot', cancelLabel: 'slot' },
      render: () => 'label',
    }).props;
    expect(footer.deleteAction).toBe(false);
    expect(footer.cancel.label).toBe('label');
    const props = { chart: null };
    expect(
      withNestedFrameworkContent('BrushRange', props, {
        slots: { chartTooltip: 'slot' },
        render: () => 'tooltip',
      }).props,
    ).toBe(props);
  });
  it('bridges a nested icon without replacing the visual options', () => {
    const visual = { accent: 'red', detailLead: 'Detail' };
    const node = h('span');
    const result = withFrameworkContent(
      'MetricTile',
      { visual },
      { visualIcon: 'slot' },
      () => node,
    );
    expect(result.visual).toEqual({ ...visual, icon: node });
    expect(visual).toEqual({ accent: 'red', detailLead: 'Detail' });
  });
  it('removes the element factory from scoped assignee values', () => {
    const contexts: Record<string, unknown>[] = [];
    const props = withFrameworkContent(
      'AssigneeField',
      {},
      { value: 'slot' },
      (_slot, scope) => {
        contexts.push(scope!);
        return h('span');
      },
    );
    const option = { id: 'a' };
    props.renderValue(h, option, 50);
    expect(contexts).toEqual([{ option, units: 50 }]);
  });
  it('covers public content props and node-rendering callbacks', () => {
    const config = ts.readConfigFile('tsconfig.json', ts.sys.readFile);
    const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, '.');
    const program = ts.createProgram(parsed.fileNames, parsed.options);
    const checker = program.getTypeChecker();
    const source = program.getSourceFile('package/component-catalog.ts')!;
    const statement = source.statements.find(
      (node): node is ts.VariableStatement =>
        ts.isVariableStatement(node) &&
        node.declarationList.declarations.some(
          (declaration) => declaration.name.getText() === 'uiComponents',
        ),
    )!;
    const declaration = statement.declarationList.declarations[0];
    const catalog = checker.getTypeAtLocation(declaration.name);
    const missing: string[] = [];
    const nestedMissing = new Set<string>();
    const catalogComponents = checker.getPropertiesOfType(catalog);
    const catalogNames = new Set(
      catalogComponents.map((component) => component.name),
    );
    for (const name of ['react', 'vue']) {
      const frameworkSource = program.getSourceFile(`package/${name}.ts`)!;
      const exports = checker.getExportsOfModule(
        checker.getSymbolAtLocation(frameworkSource)!,
      );
      const extra = exports
        .filter(
          (symbol) =>
            symbol.valueDeclaration &&
            ts.isVariableDeclaration(symbol.valueDeclaration) &&
            /^[A-Z]/.test(symbol.name) &&
            !catalogNames.has(symbol.name),
        )
        .map((symbol) => symbol.name)
        .sort();
      expect(extra, `${name} components outside the catalog`).toEqual([]);
      const exportedNames = new Set(
        exports
          .filter((symbol) => !!symbol.valueDeclaration)
          .map((symbol) => symbol.name),
      );
      expect(
        [...catalogNames].filter((component) => !exportedNames.has(component)),
        `${name} missing catalog components`,
      ).toEqual([]);
    }
    for (const component of catalogComponents) {
      const type = checker.getTypeOfSymbolAtLocation(component, declaration);
      const signature = checker.getSignaturesOfType(
        type,
        ts.SignatureKind.Call,
      )[0];
      expect(
        signature?.parameters[0],
        `${component.name} public props`,
      ).toBeDefined();
      if (!signature?.parameters[0]) continue;
      const props = checker.getTypeOfSymbolAtLocation(
        signature.parameters[0],
        declaration,
      );
      const mapped = new Set(
        Object.values(componentRenderSlots(component.name)).map(
          (slot) => slot.prop,
        ),
      );
      const nestedPaths = new Set(
        Object.values(componentNestedSlots(component.name)).map((slot) =>
          slot.path.join('.'),
        ),
      );
      const visit = (type: ts.Type, path: string[], visited: Set<number>) => {
        if (path.length > 9) return;
        if (type.isUnionOrIntersection()) {
          for (const part of type.types) visit(part, path, visited);
          return;
        }
        if (
          type.flags &
          (ts.TypeFlags.Any |
            ts.TypeFlags.Unknown |
            ts.TypeFlags.Never |
            ts.TypeFlags.StringLike |
            ts.TypeFlags.NumberLike |
            ts.TypeFlags.BooleanLike |
            ts.TypeFlags.Null |
            ts.TypeFlags.Undefined |
            ts.TypeFlags.TypeParameter)
        )
          return;
        if (checker.isArrayType(type) || checker.isTupleType(type)) {
          for (const item of checker.getTypeArguments(type as ts.TypeReference))
            visit(item, [...path, '*'], visited);
          return;
        }
        if (checker.getSignaturesOfType(type, ts.SignatureKind.Call).length)
          return;
        const id = (type as ts.Type & { id: number }).id;
        if (visited.has(id)) return;
        const nextVisited = new Set(visited).add(id);
        for (const prop of checker.getPropertiesOfType(type)) {
          if (
            prop.name.startsWith('__') ||
            prop.name === 'ref' ||
            prop.name === 'key'
          )
            continue;
          const decl = prop.valueDeclaration ?? prop.declarations?.[0];
          if (!decl) continue;
          const file = decl.getSourceFile().fileName;
          if (
            !(file.includes('/package/') || file.startsWith('package/')) ||
            file.includes('/node_modules/')
          )
            continue;
          const propType = checker.getTypeOfSymbolAtLocation(prop, decl);
          const typeNode =
            'type' in decl ? (decl as ts.PropertyDeclaration).type : undefined;
          const written = typeNode?.getText() ?? '';
          const printed = checker.typeToString(
            propType,
            decl,
            ts.TypeFormatFlags.NoTruncation,
          );
          const choiceLabel =
            file.endsWith('/choice-chips/index.tsx') &&
            prop.name === 'label' &&
            written === 'any';
          const content =
            (!typeNode || !ts.isTypeLiteralNode(typeNode)) &&
            (/\b(ComponentChildren|ComponentChild|VNode|JSX\.Element|ElementContent|DropdownRenderable|SegmentedSwitchRenderable)\b/.test(
              written,
            ) ||
              /\b(ComponentChildren|ComponentChild|VNode)\b/.test(printed));
          const next = [...path, prop.name];
          if (content || choiceLabel) {
            if (next.length > 1 && !nestedPaths.has(next.join('.')))
              nestedMissing.add(`${component.name}.${next.join('.')}`);
          } else visit(propType, next, nextVisited);
        }
      };
      visit(props, [], new Set());
      for (const prop of checker.getPropertiesOfType(props)) {
        const propType = checker.getTypeOfSymbolAtLocation(prop, declaration);
        const printed = checker.typeToString(propType);
        if (
          prop.name.startsWith('render') &&
          checker.getSignaturesOfType(
            checker.getNonNullableType(propType),
            ts.SignatureKind.Call,
          ).length
        ) {
          if (
            !(
              component.name === 'AiChatEmptyState' &&
              prop.name === 'renderContent'
            ) &&
            !(
              component.name === 'CollapsibleSection' &&
              prop.name === 'renderRoot'
            ) &&
            !mapped.has(prop.name)
          )
            missing.push(`${component.name}.${prop.name}`);
        } else if (
          (printed.includes('ComponentChildren') ||
            printed.includes('VNode')) &&
          !contentProps.includes(prop.name as (typeof contentProps)[number])
        ) {
          missing.push(`${component.name}.${prop.name}`);
        }
      }
    }
    expect(missing).toEqual([]);
    expect([...nestedMissing]).toEqual([]);
    expect(componentNestedSlots('Trace').stepTitle.recursiveChildren).toBe(
      'children',
    );
  }, 30000);
});
