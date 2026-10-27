const fs = require('node:fs');
const assert = require('node:assert/strict');
const ts = require('typescript');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const source = fs.readFileSync('components/portfolio/portfolio-experience-lists.tsx', 'utf8');
const start = source.indexOf('function ExperienceTasksDisplay(');
const end = source.indexOf('/** Shared Award-level tools/tech', start);
const code = ts.transpileModule(source.slice(start, end), {compilerOptions:{jsx:ts.JsxEmit.React, target:ts.ScriptTarget.ES2020}}).outputText;
for (const showMarkers of [true, false]) {
 const Tasks = new Function('React', 'useExperienceTaskMarkers', 'experienceContentStyles', `${code}; return ExperienceTasksDisplay;`)(React, ()=>showMarkers, {taskMeasure:'taskMeasure',unmarkedTasks:'unmarkedTasks'});
 const render = display => renderToStaticMarkup(React.createElement(Tasks,{tasks:['Première tâche','Deuxième tâche'],display,bodyColor:'#eee',mutedColor:'#aaa',isDark:true}));
 const dash = render('editorial-dash');
 const lined = render('accordion-stack');
 assert(dash.includes('pf-exp-task-dash'));
 assert(!dash.includes('pf-exp-tasks-lined'));
 assert(lined.includes('pf-exp-tasks-lined-item'));
 assert(lined.includes('border-t'));
 assert(!lined.includes('pf-exp-task-dash'));
 if (!showMarkers) { assert(dash.includes('unmarkedTasks')); assert(lined.includes('unmarkedTasks')); }
}
const sticky = source.slice(source.indexOf('function DuotoneStickyExperience('), source.indexOf('export function DuotoneExperienceList('));
assert(sticky.includes('const tasksDisplay = flags.tasksDisplay;'));
assert(!sticky.includes("flags.tasksDisplay === 'editorial-dash'"));
assert.equal((sticky.match(/tasksDisplay=\{tasksDisplay\}/g)||[]).length,3);
console.log('PASS: actual task renderer distinguishes dash/lined, with markers on/off; Sticky forwards choice across all three responsive tiers.');
