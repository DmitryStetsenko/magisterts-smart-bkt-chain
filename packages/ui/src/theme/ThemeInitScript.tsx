import React from 'react';
import { DEFAULT_THEME_TOKENS } from './defaultTokens';

const INIT_SCRIPT = `(function(){try{
var d=${JSON.stringify(DEFAULT_THEME_TOKENS)};
var m=localStorage.getItem('sbc_theme_mode');
var last=localStorage.getItem('sbc_last_resolved_theme');
var sys=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;
var r='dark';
if(m==='light'||m==='dark'){r=m;}
else if(m==='system'){r=sys?'dark':'light';}
else if(last==='light'||last==='dark'){r=last;}
var t=d;
var raw=localStorage.getItem('sbc_custom_theme_tokens');
if(raw){try{var p=JSON.parse(raw);t={dark:Object.assign({},d.dark,p.dark),light:Object.assign({},d.light,p.light)};}catch(e){}}
var c=r==='dark'?t.dark:t.light;
var el=document.documentElement;
if(r==='dark'){el.classList.add('dark');}else{el.classList.remove('dark');}
el.style.setProperty('--sbc-bg-root',c.bgRoot);
el.style.setProperty('--sbc-bg-surface',c.bgSurface);
el.style.setProperty('--sbc-bg-subtle',c.bgSubtle);
el.style.setProperty('--sbc-border-subtle',c.borderSubtle);
el.style.setProperty('--sbc-border-strong',c.borderStrong);
el.style.setProperty('--sbc-text-primary',c.textPrimary);
el.style.setProperty('--sbc-text-muted',c.textMuted);
el.style.setProperty('--sbc-text-tertiary',c.textTertiary);
el.style.setProperty('--background',c.bgRoot);
el.style.setProperty('--foreground',c.textPrimary);
el.style.setProperty('--card',c.bgSurface);
el.style.setProperty('--border',c.borderSubtle);
var s=r==='dark'
  ?{'950':c.bgRoot,'900':c.bgSurface,'800':c.borderSubtle,'700':c.borderStrong,'600':c.textTertiary,'500':c.textTertiary,'400':c.textMuted,'300':c.textPrimary,'200':'#dcdcdc','100':'#e8e8e8','50':'#ffffff'}
  :{'950':c.bgRoot,'900':c.bgSurface,'800':c.bgSubtle,'700':c.borderSubtle,'600':c.borderStrong,'500':c.textTertiary,'400':c.textMuted,'300':c.textPrimary,'200':c.textPrimary,'100':c.textPrimary,'50':c.textPrimary};
for(var k in s){el.style.setProperty('--sbc-slate-'+k,s[k]);el.style.setProperty('--color-slate-'+k,s[k]);}
}catch(e){}})();`;

/**
 * ⚡ ThemeInitScript (Zero-FOUC Blocking Inline Script)
 * Виконується синхронно в <head> ДО першого рендеру пікселів, повністю усуваючи
 * миготіння темнішого/старого фону при перезавантаженні сторінки.
 */
export function ThemeInitScript() {
  return <script dangerouslySetInnerHTML={{ __html: INIT_SCRIPT }} />;
}
