const fs = require('fs');

const files = ['assets/i18n.js', 'index.html', 'blog.html', 'package.json'];

function rebrand(content) {
  const ph = [];
  const P = (t) => {
    const i = ph.length;
    ph.push(t);
    return '\x00PH' + i + '\x00';
  };

  let s = content;
  const protect = [
    'ZiraI18n',
    'ZiraMotion',
    'ZiraLeads',
    'zira-lang',
    'zira:hero-typing-done',
    'zira:lang',
    'zira:lead-created',
    'ziraMascotAlt',
    'zira-landing-schedule',
    'zira-landing',
    'zira-leads-v2',
    'zira-leads',
    'zira-session',
    'ziraToast',
    'zira-toast',
    'anim-zira',
    'arch-deco--zira',
    'workflow-flow__icon-slot--zira',
    'workflow-flow__zira',
    'assets/zira-',
    'avatar-zira',
    'www.zira.ai',
    'id="zira"',
    'href="#zira"',
    'href="./#zira"',
    '      zira: {',
    'zira.desc1',
    'zira.desc2',
    'zira.imageAlt',
    'data-i18n="zira.',
  ];

  protect.forEach((tok) => {
    s = s.split(tok).join(P(tok));
  });

  const reps = [
    [/M2SCALE/g, 'Cantevo'],
    [/M2 SCALE/g, 'Cantevo'],
    [/ZIRA AI/g, 'John AI'],
    [/Zira AI/g, 'John AI'],
    [/ZIRA/g, 'John AI'],
    [/O Zira/g, 'O John'],
    [/o Zira/g, 'o John'],
    [/Zira /g, 'John '],
    [/ Zira/g, ' John'],
    [/John AI AI/g, 'John AI'],
  ];

  reps.forEach(([rx, to]) => {
    s = s.replace(rx, to);
  });

  ph.forEach((t, i) => {
    s = s.split('\x00PH' + i + '\x00').join(t);
  });

  return s;
}

files.forEach((f) => {
  const raw = fs.readFileSync(f, 'utf8');
  fs.writeFileSync(f, rebrand(raw));
  console.log('updated', f);
});
