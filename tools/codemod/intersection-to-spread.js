/**
 * Setup:
 *   yarn global add jscodeshift
 *
 * Sample usage:
 *   jscodeshift -t tools/codemod/intersection-to-spread.js src/actionTypes.js
 *
 * NOTE doesn't quite work right -- turns `type Foo` to `type type Foo`.
 * This seems to be a bug triggered by handing jscodeshift's `replaceWith`
 * a result from its `objectTypeAnnotation`.  Easy to work around in
 * post-processing, at least... but it doesn't give a ton of confidence
 * in jscodeshift as a solid piece of infrastructure.
 *
 * For future codemods, consider using `recast` directly (the underlying
 * engine employed by jscodeshift), or finding some other helpful wrapper
 * around it.  Quick braindump of ideas and/or browser tabs:
 *  * An ESLint rule with a fixer?
 *  * Could keep the jscodeshift CLI, and just skip its parse/replace/unparse
 *    methods; that'd look like `recast.parse(fileInfo.source)`, then
 *    `recast.visit` and mutate the relevant nodes, then `recast.print`.
 *    See `recast` docs, or example users of it like:
 *      https://github.com/abuiles/ember-watson/blob/master/lib/formulas/resource-router-mapping.js
 *  * Scan through https://libraries.io/npm/recast/dependents
 *
 * Other handy tips:
 *  * See https://astexplorer.net/ and choose parser `flow` (in the bit of
 *    UI that initially says `acorn`.)  Super handy for finding the AST
 *    names for the constructs you want to find/modify.
 *  * For bringing in fancier analyses from an external tool like Flow, see
 *    the technique used here -- it ends up being super simple, thankfully:
 *      https://github.com/flowtype/flow-codemod/tree/master/transforms/strict-type-args
 */

export const parser = 'flow';

export default function (fileInfo, { jscodeshift: j, report }) {
  const root = j(fileInfo.source);
  root.find(j.IntersectionTypeAnnotation).forEach(anno => {
    const { types } = anno.value;
    const endType = types[types.length - 1];
    if (endType.type !== 'ObjectTypeAnnotation') {
      report(`ixn with non-object at ${JSON.stringify(anno.value.range)}`);
      return;
    }
    const leftTypes = types.slice(0, types.length - 1);
    const newType = j.objectTypeAnnotation([
      ...leftTypes.map(type => j.objectTypeSpreadProperty(type)),
      ...endType.properties,
    ]);
    j(anno).replaceWith(newType);
  });
  return root.toSource();
}
