import { test, expect } from '@playwright/test';

const PORTALS = [
  { name: 'Student Portal', url: 'http://localhost:3002' },
  { name: 'Teacher Portal', url: 'http://localhost:3003' },
  { name: 'Admin Portal', url: 'http://localhost:3004' },
  { name: 'Study Portal', url: 'http://localhost:3006' },
];

test.describe('Light Theme WCAG Contrast & Readability Audit (SBC-434)', () => {
  for (const portal of PORTALS) {
    test(`verifies readable contrast in Light Mode on ${portal.name}`, async ({ page }) => {
      // Force Light Mode with fresh timestamp so it overrides any global default
      await page.addInitScript(() => {
        localStorage.setItem('sbc_theme_mode', 'light');
        localStorage.setItem('sbc_theme_mode_updated_at', String(Date.now() + 60000));
      });

      await page.goto(portal.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await expect(page.locator('button[title="Налаштування"]').first()).toBeVisible({ timeout: 30000 });
      await expect(page.locator('html')).not.toHaveClass(/\bdark\b/, { timeout: 10000 });

      // Wait for client styles/vars to settle
      await page.waitForTimeout(1000);

      // Open Settings drawer as well to audit Settings + Theme controls in Light Mode
      const settingsBtn = page.locator('button[title="Налаштування"]').first();
      if (await settingsBtn.isVisible().catch(() => false)) {
        await settingsBtn.click({ force: true });
        await page.waitForTimeout(400);
      }

      const audit = await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

        function parseColor(str: string): [number, number, number, number] | null {
          if (!str || str === 'transparent' || str === 'rgba(0, 0, 0, 0)') return null;
          ctx.clearRect(0, 0, 1, 1);
          ctx.fillStyle = 'rgba(0, 0, 0, 0)';
          ctx.fillStyle = str;
          ctx.fillRect(0, 0, 1, 1);
          const d = ctx.getImageData(0, 0, 1, 1).data;
          if (d[3] === 0) return null;
          return [d[0], d[1], d[2], d[3] / 255];
        }

        function luminance(r: number, g: number, b: number): number {
          const [rs, gs, bs] = [r, g, b].map((c) => {
            const v = c / 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
        }

        function contrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
          const l1 = luminance(rgb1[0], rgb1[1], rgb1[2]);
          const l2 = luminance(rgb2[0], rgb2[1], rgb2[2]);
          return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        }

        function blend(fg: [number, number, number, number], bg: [number, number, number]): [number, number, number] {
          const a = fg[3];
          return [
            fg[0] * a + bg[0] * (1 - a),
            fg[1] * a + bg[1] * (1 - a),
            fg[2] * a + bg[2] * (1 - a),
          ];
        }

        function getEffectiveBg(el: Element): [number, number, number] {
          const chain: Array<[number, number, number, number]> = [];
          let cur: Element | null = el;
          while (cur) {
            const bg = parseColor(getComputedStyle(cur).backgroundColor);
            if (bg && bg[3] > 0) {
              chain.unshift(bg);
              if (bg[3] >= 0.99) break;
            }
            cur = cur.parentElement;
          }
          let acc: [number, number, number] = [244, 244, 246];
          for (const layer of chain) {
            acc = blend(layer, acc);
          }
          return acc;
        }

        const elements = Array.from(document.querySelectorAll('h1, h2, h3, h4, p, span, a, button, label, th, td, li, div'));
        const violations: Array<{ tag: string; text: string; fg: string; bg: string; ratio: number; classes: string }> = [];
        let checked = 0;

        for (const el of elements) {
          const directText = Array.from(el.childNodes)
            .filter((n) => n.nodeType === Node.TEXT_NODE)
            .map((n) => n.textContent?.trim() || '')
            .join(' ')
            .trim();
          if (!directText || directText.length < 2) continue;

          const rect = el.getBoundingClientRect();
          if (rect.width < 4 || rect.height < 4) continue;

          const style = getComputedStyle(el);
          if (style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) < 0.25) continue;

          // Skip disabled controls (intentionally muted by browser/UI conventions)
          if ((el as HTMLButtonElement).disabled || el.closest('button:disabled')) continue;

          // Skip elements over CSS gradient backgrounds where backgroundColor is transparent
          let hasGradient = style.backgroundImage && style.backgroundImage !== 'none';
          let p: Element | null = el.parentElement;
          for (let i = 0; i < 3 && p && !hasGradient; i++) {
            const pBgImg = getComputedStyle(p).backgroundImage;
            if (pBgImg && pBgImg !== 'none') hasGradient = true;
            p = p.parentElement;
          }
          if (hasGradient) continue;

          const fg = parseColor(style.color);
          if (!fg) continue;
          const bg = getEffectiveBg(el);
          const fgBlended = blend(fg, bg);
          const ratio = contrastRatio(fgBlended, bg);
          checked++;

          // Minimum WCAG readability threshold (3.0:1 catches all unreadable/low-contrast text)
          if (ratio < 3.0) {
            violations.push({
              tag: el.tagName.toLowerCase(),
              text: directText.slice(0, 50),
              fg: `rgb(${Math.round(fgBlended[0])}, ${Math.round(fgBlended[1])}, ${Math.round(fgBlended[2])})`,
              bg: `rgb(${Math.round(bg[0])}, ${Math.round(bg[1])}, ${Math.round(bg[2])})`,
              ratio: Number(ratio.toFixed(2)),
              classes: (el.className || '').toString().slice(0, 120),
            });
          }
        }

        return { checked, violations };
      });

      if (audit.violations.length > 0) {
        console.log(`\n[${portal.name}] Contrast violations (${audit.violations.length}/${audit.checked}):`);
        for (const v of audit.violations.slice(0, 25)) {
          console.log(`  - <${v.tag}> "${v.text}" ratio=${v.ratio} fg=${v.fg} bg=${v.bg} | ${v.classes}`);
        }
      } else {
        console.log(`[${portal.name}] Checked ${audit.checked} text elements: 0 contrast violations!`);
      }

      expect(audit.checked).toBeGreaterThan(5);
      expect(audit.violations, `Found low-contrast elements on ${portal.name}`).toEqual([]);
    });
  }
});
