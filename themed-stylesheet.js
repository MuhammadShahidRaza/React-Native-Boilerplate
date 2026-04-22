// Root-level Babel plugin for Metro compatibility
module.exports = function themedStylesheetPlugin({ types: t }) {
  function containsIdentifier(node, name) {
    let found = false;
    const visit = n => {
      if (!n || found) return;
      if (Array.isArray(n)) { n.forEach(visit); return; }
      if (typeof n !== 'object') return;
      if (t.isIdentifier(n, { name })) { found = true; return; }
      for (const key of Object.keys(n)) {
        if (key === 'loc' || key === 'start' || key === 'end') continue;
        visit(n[key]);
      }
    };
    visit(node);
    return found;
  }
  function isStyleSheetCreateCall(path) {
    const callee = path.node.callee;
    return (
      t.isMemberExpression(callee) &&
      t.isIdentifier(callee.object, { name: 'StyleSheet' }) &&
      t.isIdentifier(callee.property, { name: 'create' })
    );
  }
  function isWithinCreateThemedStyleSheet(path) {
    return Boolean(
      path.findParent(
        p => p.isCallExpression() && t.isIdentifier(p.node.callee, { name: 'createThemedStyleSheet' }),
      ),
    );
  }
  return {
    name: 'themed-stylesheet',
    visitor: {
      Program: {
        enter(programPath, state) {
          state.__needsImport = false;
          state.__hasImport = false;
          for (const node of programPath.node.body) {
            if (!t.isImportDeclaration(node)) continue;
            if (node.source.value !== 'utils/themedStyleSheet') continue;
            for (const spec of node.specifiers) {
              if (t.isImportSpecifier(spec) && spec.imported.name === 'createThemedStyleSheet') {
                state.__hasImport = true;
                break;
              }
            }
          }
        },
        exit(programPath, state) {
          if (!state.__needsImport || state.__hasImport) return;
          const importDecl = t.importDeclaration(
            [t.importSpecifier(t.identifier('createThemedStyleSheet'), t.identifier('createThemedStyleSheet'))],
            t.stringLiteral('utils/themedStyleSheet'),
          );
          const body = programPath.node.body;
          let lastImportIndex = -1;
          for (let i = 0; i < body.length; i++) {
            if (t.isImportDeclaration(body[i])) lastImportIndex = i;
          }
          body.splice(lastImportIndex + 1, 0, importDecl);
        },
      },
      CallExpression(path, state) {
        if (!isStyleSheetCreateCall(path)) return;
        if (isWithinCreateThemedStyleSheet(path)) return;
        const arg0 = path.node.arguments[0];
        if (!arg0) return;
        if (!containsIdentifier(arg0, 'COLORS')) return;
        state.__needsImport = true;
        const originalCall = path.node;
        const wrapped = t.callExpression(t.identifier('createThemedStyleSheet'), [
          t.arrowFunctionExpression([], originalCall),
        ]);
        path.replaceWith(wrapped);
      },
    },
  };
}
