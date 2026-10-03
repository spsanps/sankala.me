/* Plates — an empty month: a clean sheet, pencil registration marks and the month name.
   Nothing is drawn because nothing is documented. */
(function () {
  'use strict';
  const { paper, rng, canvas } = window.PK;

  function pencilLine(x, ctx, ax, ay, bx, by, r, w) {
    // a pencil line is a run of tiny graphite flecks, darker where the lead bites
    const len = Math.hypot(bx - ax, by - ay), n = Math.ceil(len / 0.7);
    for (let i = 0; i <= n; i++) {
      const t = i / n, px = ax + (bx - ax) * t + (r() - 0.5) * 0.5 * w, py = ay + (by - ay) * t + (r() - 0.5) * 0.5 * w;
      ctx.fillStyle = `rgba(70,68,72,${0.18 + r() * 0.35})`;
      ctx.fillRect(px, py, w * (0.6 + r() * 0.6), w * (0.6 + r() * 0.6));
    }
  }

  window.PLATE_BLANK = function (mo, future) {
    return {
      fps: 1,
      build(w, h, o) {
        const s = Math.min(w, h * 0.8) / 600;
        const c = canvas(w, h), x = c.getContext('2d');
        x.drawImage(paper(w, h, { base: future ? '#f3f1ec' : '#efebe2', seed: mo.id.length * 13 + parseInt(mo.id.slice(5), 10), scale: s * 1.4, fibres: 0.5, flecks: 0.3 }), 0, 0);
        const r = rng(parseInt(mo.id.replace('-', ''), 10));
        const m = 34 * s, L = 16 * s, lw = 1.1 * s;
        const marks = [[m, m], [w - m, m], [m, h - m], [w - m, h - m]];
        marks.forEach(([cx, cy]) => {
          pencilLine(x, x, cx - L, cy, cx + L, cy, r, lw);
          pencilLine(x, x, cx, cy - L, cx, cy + L, r, lw);
          x.strokeStyle = 'rgba(70,68,72,0.35)'; x.lineWidth = lw * 0.8;
          x.beginPath(); x.arc(cx, cy, L * 0.45, 0, Math.PI * 2); x.stroke();
        });
        x.fillStyle = 'rgba(70,68,72,0.55)';
        x.font = `${Math.round(15 * s)}px "DM Sans", sans-serif`;
        x.fillText(mo.name.toLowerCase(), m + L * 0.2, h - m - L * 1.2);
        return { c, w, h };
      },
      draw(ctx, st) { ctx.drawImage(st.c, 0, 0); },
    };
  };
})();
