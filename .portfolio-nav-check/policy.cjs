const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict');
const source=fs.readFileSync('components/portfolio/PublicCreatorPortfolioPage.tsx','utf8');
const ast=ts.createSourceFile('page.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const declarations=new Map();
function visit(node){if(ts.isVariableDeclaration(node)&&ts.isIdentifier(node.name)&&node.initializer)declarations.set(node.name.text,node.initializer);ts.forEachChild(node,visit);}visit(ast);
function evaluate(name,context,memo=false){const node=declarations.get(name);const expr=memo?node.arguments[0]:node;const js=ts.transpileModule('const audit = '+expr.getText(ast)+';', {compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;return vm.runInNewContext(js+'\naudit'+(memo?'()':''),{...context});}
for(const contactVisible of [false,true])for(const footerEnabled of [false,true]){
 const context={contentSectionOrder:['tools','team','contact'],sectionVisibility:{tools:true,team:true,contact:contactVisible},settings:{footer:{enabled:footerEnabled},navigation:{itemLabels:{},itemIcons:{}}},resolveNavItemLabel:key=>key,lastContentPageId:'team'};
 const items=evaluate('navItems',context,true);
 assert.equal(items.some(item=>item.id==='contact'),contactVisible||footerEnabled);
 const show=evaluate('shouldShowFooterOnPage',context);
 assert.equal(show('contact'),footerEnabled);assert.equal(show('team'),false);assert.equal(show('tools'),false);
 assert.equal(evaluate('pagesContactTarget',context),contactVisible||footerEnabled?'contact':'team');
 for(const pages of [false,true]){
  const menu=evaluate('navBarItems',{...context,navItems:items,pagesNavItems:items,isPagesMode:pages,hiddenNavItems:[],isNavigationPreview:false},true);
  assert.equal(menu.some(item=>item.id==='contact'),contactVisible||footerEnabled);
 }
}
console.log('PASS: public-page navigation policy, contact/footer on-off matrix, default/pages, footer only on Contact.');
