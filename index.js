const geneLibrary = {
  normal: [
    { gene: 'Leatherback', state: 'Normal' },
    { gene: 'Dunner', state: 'Normal' },
    { gene: 'Zero', state: 'Normal' },
  ],
  visual: [
    { gene: 'Translucent', state: 'Visual' },
    { gene: 'Bearded', state: 'Visual' },
  ],
  het: [
    { gene: 'Citrus', state: 'Het' },
    { gene: 'Red', state: 'Het' },
    { gene: 'Gold', state: 'Het' },
    { gene: 'Blood', state: 'Het' },
    { gene: 'Hypo', state: 'Het' },
  ],
  super: [
    { gene: 'Silkback', state: 'Super (Silkback)' },
  ]
};

let parentGenes = {
  sire: {},
  dam: {},
  sgf: {},
  sgm: {},
  dgf: {},
  dgm: {}
};

let lastResults = [];

function getGenesByCategory(parent) {
  const sels = document.querySelectorAll(`.gene-selector[data-parent="${parent}"]`);
  let genes = {};
  sels.forEach(sel => {
    Object.keys(geneLibrary).forEach(cat => {
      const btns = sel.querySelectorAll(`[data-category="${cat}"]`);
      btns.forEach(btn => {
        if (btn.classList.contains('active')) {
          const geneObj = geneLibrary[cat].find(g => g.gene === btn.textContent.split(' ')[0]);
          if (geneObj) genes[geneObj.gene] = geneObj;
        }
      });
    });
  });
  return genes;
}

function drawGeneSelector(parent, elementId) {
  const container = document.getElementById(elementId);
  if (!container) return;
  container.innerHTML = '';

  Object.keys(geneLibrary).forEach(category => {
    const label = document.createElement('div');
    label.style.cssText = 'font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-dim);margin-bottom:6px;margin-top:12px';
    label.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    container.appendChild(label);

    const btnCont = document.createElement('div');
    btnCont.className = 'gene-selector';
    btnCont.setAttribute('data-parent', parent);

    geneLibrary[category].forEach(g => {
      const btn = document.createElement('button');
      btn.textContent = `${g.gene} (${g.state})`;
      btn.className = 'gene-btn';
      btn.setAttribute('data-category', category);
      btn.onclick = (e) => {
        e.preventDefault();
        btn.classList.toggle('active');
        updateSelectedGenes(parent);
      };
      btnCont.appendChild(btn);
    });

    container.appendChild(btnCont);
  });
}

function updateSelectedGenes(parent) {
  parentGenes[parent] = getGenesByCategory(parent);
}

function simulate() {
  const sireName = document.getElementById('sire-name').value || 'Sire';
  const damName = document.getElementById('dam-name').value || 'Dam';
  const sireGenes = Object.values(parentGenes.sire);
  const damGenes = Object.values(parentGenes.dam);

  if (sireGenes.length === 0 || damGenes.length === 0) {
    alert('Please select genes for both parents.');
    return;
  }

  const phenotypes = {};
  sireGenes.forEach(sg => {
    damGenes.forEach(dg => {
      const pheKey = `${sg.gene}/${dg.gene}`;
      const visual = ['Visual', 'Visual (Leatherback)', 'Super (Silkback)'].includes(sg.state) || ['Visual', 'Visual (Leatherback)', 'Super (Silkback)'].includes(dg.state);
      const super_ = sg.state === 'Super (Silkback)' && dg.state === 'Super (Silkback)';
      const het = sg.state === 'Het' || dg.state === 'Het';
      const poss = (sg.state.includes('Poss') || dg.state.includes('Poss'));

      let pheType = 'Normal';
      let state = 'Normal';
      if (super_) {
        pheType = 'Super Silkback';
        state = 'Super (Silkback)';
      } else if (visual) {
        pheType = sg.gene + '/' + dg.gene;
        state = 'Visual';
      } else if (het) {
        pheType = sg.gene + '/' + dg.gene;
        state = 'Het';
      } else if (poss) {
        pheType = sg.gene + '/' + dg.gene;
        state = 'Poss Het';
      }

      if (!phenotypes[pheType]) {
        phenotypes[pheType] = { count: 0, state: state, hasVisual: visual, hasSuper: super_, hasHet: het, genotype: pheKey };
      }
      phenotypes[pheType].count += 1;
    });
  });

  lastResults = Object.entries(phenotypes).map(([phenotype, data]) => ({
    phenotype: phenotype,
    genotype: data.genotype,
    prob: data.count / (sireGenes.length * damGenes.length),
    hasVisual: data.hasVisual,
    hasSuper: data.hasSuper,
    hasHet: data.hasHet
  })).sort((a, b) => b.prob - a.prob);

  displayResults();
}

function displayResults() {
  const sireName = document.getElementById('sire-name').value || 'Sire';
  const damName = document.getElementById('dam-name').value || 'Dam';
  const resultsContainer = document.getElementById('results-container');

  if (lastResults.length === 0) {
    resultsContainer.innerHTML = '<div class="empty-state"><p>No results to display</p></div>';
    return;
  }

  let html = `<div class="results-section">
    <div class="results-title">Clutch Results — ${sireName} × ${damName}</div>
    <table class="results-table">
      <thead>
        <tr>
          <th>Phenotype / Genotype</th>
          <th>Probability</th>
        </tr>
      </thead>
      <tbody>`;

  lastResults.forEach((r, i) => {
    const pct = (r.prob * 100).toFixed(1);
    const barW = Math.round(r.prob * 200);
    let tags = '';
    if (r.hasSuper) tags += `<span style="display:inline-block;padding:2px 6px;border-radius:2px;font-size:9px;background:var(--accent-glow);border:1px solid rgba(230,126,34,0.3);color:var(--accent);margin-right:4px">Super</span>`;
    else if (r.hasVisual) tags += `<span style="display:inline-block;padding:2px 6px;border-radius:2px;font-size:9px;background:var(--accent-glow);border:1px solid rgba(230,126,34,0.3);color:var(--accent);margin-right:4px">Visual</span>`;
    if (r.hasHet) tags += `<span style="display:inline-block;padding:2px 6px;border-radius:2px;font-size:9px;background:rgba(100,158,92,0.15);border:1px solid rgba(100,158,92,0.4);color:#7fbe71;margin-right:4px">Het</span>`;

    html += `<tr>
      <td class="phenotype-cell">
        <div>${tags}<span>${r.phenotype}</span></div>
        <div class="genotype-cell">${r.genotype}</div>
      </td>
      <td class="probability-cell">
        <div class="prob-bar">
          <div class="prob-fill" style="width:${barW}px"></div>
        </div>
        <span>${pct}%</span>
      </td>
    </tr>`;
  });

  html += `</tbody></table></div>`;
  resultsContainer.innerHTML = html;
}

function exportToPNG() {
  const sireName = document.getElementById('sire-name').value || 'Sire';
  const damName = document.getElementById('dam-name').value || 'Dam';
  const sireGenes = Object.values(parentGenes.sire);
  const damGenes = Object.values(parentGenes.dam);
  const gpInfo = {};
  ['sgf','sgm','dgf','dgm'].forEach(k => {
    const genes = Object.values(parentGenes[k]);
    const name = document.getElementById(`${k}-name`)?.value?.trim() || '';
    if (genes.length > 0 || name) gpInfo[k] = { name, genes };
  });
  const gpTitles = { sgf:"Sire's Father", sgm:"Sire's Mother", dgf:"Dam's Father", dgm:"Dam's Mother" };
  const gpIsMale = { sgf:true, sgm:false, dgf:true, dgm:false };
  function stateTag(state) {
    const map = {
      'Visual': { bg:'rgba(212,168,67,0.18)', border:'rgba(212,168,67,0.5)', color:'#d4a843' },
      'Visual (Leatherback)': { bg:'rgba(212,168,67,0.18)', border:'rgba(212,168,67,0.5)', color:'#d4a843' },
      'Super (Silkback)': { bg:'rgba(196,92,58,0.18)', border:'rgba(196,92,58,0.5)', color:'#e8866a' },
      'Het': { bg:'rgba(100,158,92,0.15)', border:'rgba(100,158,92,0.45)', color:'#7fbe71' },
    };
    const style = map[state] || (state.includes('Poss')
      ? { bg:'rgba(100,130,200,0.15)', border:'rgba(100,130,200,0.45)', color:'#7a9ee0' }
      : { bg:'rgba(74,68,56,0.35)', border:'#2e2a22', color:'#8a7f6e' });
    return `<span style="display:inline-block;padding:2px 8px;border-radius:3px;font-size:10px;letter-spacing:0.04em;background:${style.bg};border:1px solid ${style.border};color:${style.color};white-space:nowrap">${state}</span>`;
  }
  function panelHTML(title, isMale, name, genes) {
    const sexColor = isMale ? '#7aabee' : '#ee7aaa';
    const sexBg = isMale ? 'rgba(100,150,220,0.15)' : 'rgba(220,100,130,0.15)';
    const sexBorder = isMale ? 'rgba(100,150,220,0.35)' : 'rgba(220,100,130,0.35)';
    const sym = isMale ? '♂' : '♀';
    let genesHTML = '';
    if (genes.length === 0) {
      genesHTML = `<div style="color:#4a4438;font-size:11px;padding:8px 0">No genes</div>`;
    } else {
      genesHTML = genes.map(g => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid #1e1c18">
          <span style="font-size:11px;color:#e8e0d0">${g.gene}</span>
          ${stateTag(g.state)}
        </div>`).join('');
    }
    return `
      <div style="background:#1a1814;border:1px solid #2e2a22;border-radius:6px;overflow:hidden;flex:1;min-width:0">
        <div style="background:#242018;border-bottom:1px solid #2e2a22;padding:10px 16px;display:flex;align-items:center;gap:10px">
          <div style="width:22px;height:22px;border-radius:50%;background:${sexBg};border:1px solid ${sexBorder};display:flex;align-items:center;justify-content:center;color:${sexColor};font-size:13px;font-weight:700;flex-shrink:0">${sym}</div>
          <span style="font-family:'Syne',sans-serif;font-weight:700;font-size:13px;letter-spacing:0.05em;text-transform:uppercase;color:#e8e0d0">${title}</span>
          ${name ? `<span style="margin-left:auto;color:${sexColor};font-size:11px">${name}</span>` : ''}
        </div>
        <div style="padding:14px 16px">
          <div style="font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#4a4438;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #2e2a22">Genetic Profile</div>
          ${genesHTML}
        </div>
      </div>`;
  }
  let gpSections = '';
  [['sgf','sgm'],['dgf','dgm']].forEach(([lk,rk]) => {
    if (!gpInfo[lk] && !gpInfo[rk]) return;
    const left = gpInfo[lk] ? panelHTML(gpTitles[lk], gpIsMale[lk], gpInfo[lk].name, gpInfo[lk].genes) : `<div style="flex:1"></div>`;
    const right = gpInfo[rk] ? panelHTML(gpTitles[rk], gpIsMale[rk], gpInfo[rk].name, gpInfo[rk].genes) : `<div style="flex:1"></div>`;
    gpSections += `
      <div style="margin-bottom:6px">
        <div style="font-size:10px;letter-spacing:0.15em;color:#4a4438;text-transform:uppercase;margin-bottom:10px;padding-bottom:5px;border-bottom:1px solid #2e2a22">Grandparents</div>
        <div style="display:flex;gap:16px">${left}${right}</div>
      </div>`;
  });
  let resultsHTML = '';
  if (lastResults.length > 0) {
    const rows = lastResults.map((r, i) => {
      const pct = (r.prob * 100).toFixed(1);
      const barW = Math.round(r.prob * 200);
      let tags = '';
      if (r.hasSuper) tags += `<span style="display:inline-block;padding:1px 6px;border-radius:2px;font-size:9px;background:rgba(196,92,58,0.18);border:1px solid rgba(196,92,58,0.45);color:#e8866a;margin-right:4px">Super</span>`;
      else if (r.hasVisual) tags += `<span style="display:inline-block;padding:1px 6px;border-radius:2px;font-size:9px;background:rgba(212,168,67,0.18);border:1px solid rgba(212,168,67,0.45);color:#d4a843;margin-right:4px">Visual</span>`;
      if (r.hasHet) tags += `<span style="display:inline-block;padding:1px 6px;border-radius:2px;font-size:9px;background:rgba(100,158,92,0.15);border:1px solid rgba(100,158,92,0.4);color:#7fbe71;margin-right:4px">Het</span>`;
      return `
        <tr style="background:${i%2===0?'#1a1814':'#161410'}">
          <td style="padding:10px 14px;border-bottom:1px solid #2e2a22;vertical-align:middle">
            <div>${tags}<span style="font-family:'Syne',sans-serif;font-weight:600;font-size:12px;color:#e8e0d0">${r.phenotype}</span></div>
            <div style="font-size:10px;color:#8a7f6e;font-style:italic;margin-top:3px">${r.genotype}</div>
          </td>
          <td style="padding:10px 14px;border-bottom:1px solid #2e2a22;vertical-align:middle;width:220px">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="flex:1;height:5px;background:#2e2a22;border-radius:3px;overflow:hidden">
                <div style="height:100%;width:${barW}px;max-width:100%;background:linear-gradient(90deg,#c47c2a,#d4a843);border-radius:3px"></div>
              </div>
              <span style="font-size:12px;color:#d4a843;font-weight:500;min-width:40px;text-align:right">${pct}%</span>
            </div>
          </td>
        </tr>`;
    }).join('');
    resultsHTML = `
      <div style="margin-top:24px">
        <div style="font-size:10px;letter-spacing:0.15em;color:#4a4438;text-transform:uppercase;margin-bottom:10px;padding-bottom:5px;border-bottom:1px solid #2e2a22">Clutch Results — ${sireName} × ${damName}</div>
        <table style="width:100%;border-collapse:collapse;border:1px solid #2e2a22;border-radius:6px;overflow:hidden">
          <thead>
            <tr style="background:#242018">
              <th style="padding:8px 14px;text-align:left;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#8a7f6e;font-weight:400;border-bottom:1px solid #2e2a22">Phenotype / Genotype</th>
              <th style="padding:8px 14px;text-align:left;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#8a7f6e;font-weight:400;border-bottom:1px solid #2e2a22;width:220px">Probability</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }
  const html = `
    <div id="png-export-root" style="
      width:880px;
      background:#0f0e0c;
      color:#e8e0d0;
      font-family:'DM Mono',monospace;
      font-size:13px;
      padding:36px 40px 40px;
      position:relative;
    ">
      <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#d4a843 25%,#d4a843 75%,transparent)"></div>
      <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:20px">
        <div>
          <div style="font-family:'Syne',sans-serif;font-size:26px;font-weight:800;line-height:1">
            Linage <span style="color:#d4a843">Tool</span>
          </div>
          <div style="font-size:10px;color:#8a7f6e;letter-spacing:0.14em;text-transform:uppercase;margin-top:6px">Scrappy's Exotic Yard · Bearded Dragon Phenotype & Probability Engine</div>
        </div>
        <div style="font-size:10px;color:#4a4438;letter-spacing:0.1em">${new Date().toLocaleDateString()}</div>
      </div>
      <div style="border-top:1px solid #2e2a22;padding-top:20px;margin-bottom:20px">
        <div style="text-align:center;margin-bottom:16px">
          <div style="font-family:'Syne',sans-serif;font-size:20px;font-weight:700;color:#d4a843;letter-spacing:-0.01em">${sireName} × ${damName}</div>
          <div style="font-size:10px;color:#8a7f6e;margin-top:6px">
            ♂ ${sireGenes.map(g=>`${g.state} ${g.gene}`).join(' · ') || '—'}
          </div>
          <div style="font-size:10px;color:#8a7f6e;margin-top:2px">
            ♀ ${damGenes.map(g=>`${g.state} ${g.gene}`).join(' · ') || '—'}
          </div>
        </div>
        ${gpSections}
        <div style="margin-top:${gpSections ? '16px' : '0'}">
          <div style="font-size:10px;letter-spacing:0.15em;color:#4a4438;text-transform:uppercase;margin-bottom:10px;padding-bottom:5px;border-bottom:1px solid #2e2a22">Parents</div>
          <div style="display:flex;gap:16px">
            ${panelHTML('Sire', true, sireName, sireGenes)}
            ${panelHTML('Dam', false, damName, damGenes)}
          </div>
        </div>
        ${resultsHTML}
      </div>
    </div>`;
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1';
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  const exportBtn = document.getElementById('btn-export-png');
  exportBtn.textContent = 'Generating…';
  exportBtn.disabled = true;
  setTimeout(() => {
    const target = wrapper.querySelector('#png-export-root');
    html2canvas(target, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#0f0e0c',
      logging: false,
      width: 880,
    }).then(canvas => {
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${sireName}_x_${damName}_clutch.png`;
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(wrapper);
        exportBtn.textContent = '⬇ Export PNG';
        exportBtn.disabled = false;
      }, 'image/png');
    }).catch(err => {
      console.error('Export failed:', err);
      document.body.removeChild(wrapper);
      exportBtn.textContent = '⬇ Export PNG';
      exportBtn.disabled = false;
    });
  }, 300);
}

document.addEventListener('DOMContentLoaded', function() {
  drawGeneSelector('sire', 'sire-genes');
  drawGeneSelector('dam', 'dam-genes');
  drawGeneSelector('sgf', 'sgf-genes');
  drawGeneSelector('sgm', 'sgm-genes');
  drawGeneSelector('dgf', 'dgf-genes');
  drawGeneSelector('dgm', 'dgm-genes');
});
