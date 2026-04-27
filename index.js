// =============================================
//  SCRAPPY'S EXOTIC YARD — Breeding Tool JS
// =============================================

const GENES = {
  Hypomelanistic: {
    category: 'recessive',
    states: ['Visual','Het','66% Poss Het','50% Poss Het','Normal','Unknown'],
    short: 'Hypo'
  },
  Translucent: {
    category: 'recessive',
    states: ['Visual','Het','66% Poss Het','50% Poss Het','Normal','Unknown'],
    short: 'Trans'
  },
  Witblits: {
    category: 'recessive',
    states: ['Visual','Het','66% Poss Het','50% Poss Het','Normal','Unknown'],
    short: 'Witblits'
  },
  Zero: {
    category: 'recessive',
    states: ['Visual','Het','66% Poss Het','50% Poss Het','Normal','Unknown'],
    short: 'Zero'
  },
  'Genetic Stripe': {
    category: 'recessive',
    states: ['Visual','Het','66% Poss Het','50% Poss Het','Normal','Unknown'],
    short: 'Stripe'
  },
  Leatherback: {
    category: 'incdominant',
    states: ['Normal','Visual (Leatherback)','Super (Silkback)'],
    short: 'LB'
  },
  Dunner: {
    category: 'dominant',
    states: ['Visual','Normal'],
    short: 'Dunner'
  },
  Tiger: {
    category: 'dominant',
    states: ['Visual','Normal'],
    short: 'Tiger'
  },
  'German Giant': {
    category: 'lineage',
    states: ['Visual','Normal'],
    short: 'GG'
  },
  'Red Expression': {
    category: 'nonmendelian',
    states: ['None', 'Low (Pastel)', 'High (Deep Red)'],
    short: 'Red'
  },
  'Citrus Expression': {
    category: 'nonmendelian',
    states: ['None', 'Low (Yellow)', 'High (Neon Citrus)'],
    short: 'Citrus'
  },
  'Blue/Silver Bar': {
    category: 'nonmendelian',
    states: ['None', 'Visual'],
    short: 'Blue'
  },
  Axanthic: {
    category: 'recessive',
    states: ['Visual','Het','66% Poss Het','50% Poss Het','Normal','Unknown'],
    short: 'Axanthic'
  },
};

let geneCounters = { sgf: 0, sgm: 0, dgf: 0, dgm: 0, sire: 0, dam: 0 };
const parentGenes = { sgf: {}, sgm: {}, dgf: {}, dgm: {}, sire: {}, dam: {} };

function getUsedGenes(parent) {
  return Object.values(parentGenes[parent]).map(g => g.gene);
}

function addGene(parent, prefillGene, prefillState) {
  const list = document.getElementById(`${parent}-genes`);
  const empty = document.getElementById(`${parent}-empty`);
  const used = getUsedGenes(parent);
  const available = Object.keys(GENES).filter(g => !used.includes(g));
  if (available.length === 0) return;
  const geneToAdd = prefillGene && available.includes(prefillGene) ? prefillGene : available[0];
  const id = ++geneCounters[parent];
  const rowId = `${parent}-gene-${id}`;
  const row = document.createElement('div');
  row.className = 'gene-row';
  row.id = rowId;
  const sel = document.createElement('select');
  refreshGeneSelect(sel, parent, geneToAdd);
  sel.onchange = () => {
    const usedNow = getUsedGenes(parent);
    const oldGene = parentGenes[parent][id]?.gene;
    const newGene = sel.value;
    if (usedNow.includes(newGene) && newGene !== oldGene) {
      sel.value = oldGene;
      return;
    }
    renderStates(row, sel.value, parent, id);
    refreshAllGeneSelects(parent);
  };
  row.appendChild(sel);
  const stateCol = document.createElement('div');
  stateCol.style.cssText = 'display:flex;flex-direction:column;gap:6px;';
  const stateWrap = document.createElement('div');
  stateWrap.className = 'state-radios';
  stateWrap.id = `${rowId}-states`;
  stateCol.appendChild(stateWrap);
  const pctRow = document.createElement('div');
  pctRow.id = `${rowId}-pctrow`;
  pctRow.style.cssText = 'display:none;align-items:center;gap:6px;';
  const pctInput = document.createElement('input');
  pctInput.type = 'number';
  pctInput.id = `${rowId}-pct`;
  pctInput.min = 0; pctInput.max = 100; pctInput.step = 1;
  pctInput.style.cssText = 'width:64px;background:var(--bg);border:1px solid var(--border);border-radius:4px;padding:4px 7px;color:var(--accent);font-family:var(--font-body);font-size:12px;outline:none;';
  const pctLabel = document.createElement('span');
  pctLabel.textContent = '% poss het';
  pctLabel.style.cssText = 'font-size:10px;color:var(--text-dim);';
  pctRow.appendChild(pctInput);
  pctRow.appendChild(pctLabel);
  stateCol.appendChild(pctRow);
  pctInput.addEventListener('input', () => {
    const val = parseFloat(pctInput.value);
    syncRadioFromPct(rowId, parent, id, val, sel.value);
  });
  row.appendChild(stateCol);
  const provenLabel = document.createElement('label');
  provenLabel.className = 'proven-check';
  const provenCb = document.createElement('input');
  provenCb.type = 'checkbox';
  provenCb.id = `${rowId}-proven`;
  provenLabel.appendChild(provenCb);
  provenLabel.appendChild(document.createTextNode('Proven'));
  row.appendChild(provenLabel);
  const removeBtn = document.createElement('button');
  removeBtn.className = 'btn-remove';
  removeBtn.textContent = '×';
  removeBtn.onclick = () => {
    delete parentGenes[parent][id];
    row.remove();
    if (!list.children.length) empty.style.display = 'block';
    refreshAllGeneSelects(parent);
    updateCalculateBtn();
  };
  row.appendChild(removeBtn);
  list.appendChild(row);
  empty.style.display = 'none';
  renderStates(row, geneToAdd, parent, id, prefillState);
  parentGenes[parent][id] = { gene: geneToAdd, state: prefillState || getDefaultState(geneToAdd) };
  refreshAllGeneSelects(parent);
  updateCalculateBtn();
}

function refreshGeneSelect(sel, parent, currentGene) {
  const used = getUsedGenes(parent);
  sel.innerHTML = Object.keys(GENES).map(g => {
    const disabled = used.includes(g) && g !== currentGene;
    return `<option value="${g}" ${g === currentGene ? 'selected' : ''} ${disabled ? 'disabled style="color:#4a4438"' : ''}>${g}${disabled ? ' ✓' : ''}</option>`;
  }).join('');
}

function refreshAllGeneSelects(parent) {
  const list = document.getElementById(`${parent}-genes`);
  if (!list) return;
  list.querySelectorAll('select').forEach(sel => {
    const rowId = sel.closest('.gene-row')?.id;
    if (!rowId) return;
    const parts = rowId.split('-gene-');
    const id = parseInt(parts[1]);
    const currentGene = parentGenes[parent][id]?.gene;
    if (currentGene) refreshGeneSelect(sel, parent, currentGene);
  });
}

function getDefaultState(geneName) {
  return GENES[geneName].states[0];
}

function syncRadioFromPct(rowId, parent, id, val, geneName) {
  if (isNaN(val)) return;
  val = Math.max(0, Math.min(100, val));
  let newState;
  if (val === 100) {
    newState = 'Het';
  } else if (val >= 80) {
    newState = '66% Poss Het';
  } else if (val >= 25) {
    newState = '50% Poss Het';
  } else if (val === 0) {
    newState = 'Normal';
  } else {
    newState = '50% Poss Het';
  }
  const wrap = document.getElementById(`${rowId}-states`);
  if (!wrap) return;
  wrap.querySelectorAll('input[type="radio"]').forEach(r => {
    if (r.value === newState) {
      r.checked = true;
      parentGenes[parent][id] = { gene: geneName, state: newState };
    }
  });
  const pctInput = document.getElementById(`${rowId}-pct`);
  if (pctInput) {
    pctInput.style.borderColor = val === 100 ? 'var(--accent)' : 'var(--border)';
  }
}

function syncPctFromRadio(rowId, state) {
  const pctInput = document.getElementById(`${rowId}-pct`);
  if (!pctInput) return;
  const map = { 'Visual': '', 'Het': '100', '66% Poss Het': '66', '50% Poss Het': '50', 'Normal': '0', 'Unknown': '' };
  pctInput.value = map[state] ?? '';
}

function renderStates(row, geneName, parent, id, prefillState) {
  const rowId = `${parent}-gene-${id}`;
  const wrap = document.getElementById(`${rowId}-states`);
  if (!wrap) return;
  wrap.innerHTML = '';
  const gene = GENES[geneName];
  const states = gene.states;
  const defaultState = prefillState || states[0];
  const isPossHetGene = gene.category === 'recessive';
  const pctRow = document.getElementById(`${rowId}-pctrow`);
  states.forEach((s, i) => {
    const rid = `${rowId}-s${i}`;
    const inp = document.createElement('input');
    inp.type = 'radio';
    inp.name = `${rowId}-state`;
    inp.value = s;
    inp.id = rid;
    inp.checked = s === defaultState;
    inp.onchange = () => {
      parentGenes[parent][id] = { gene: geneName, state: s };
      syncPctFromRadio(rowId, s);
    };
    const lbl = document.createElement('label');
    lbl.htmlFor = rid;
    lbl.textContent = s;
    wrap.appendChild(inp);
    wrap.appendChild(lbl);
  });
  if (pctRow) {
    pctRow.style.display = isPossHetGene ? 'flex' : 'none';
    syncPctFromRadio(rowId, defaultState);
  }
  parentGenes[parent][id] = { gene: geneName, state: defaultState };
}

function stateToProb(state, proven) {
  if (proven) {
    if (state.includes('Poss') || state === '66% Poss Het' || state === '50% Poss Het') {
      return { visual: 0, het: 1, normal: 0 };
    }
  }
  switch(state) {
    case 'Visual': return { visual: 1, het: 0, normal: 0 };
    case 'Het': return { visual: 0, het: 1, normal: 0 };
    case '66% Poss Het': return { visual: 0, het: 0.66, normal: 0.34 };
    case '50% Poss Het': return { visual: 0, het: 0.5, normal: 0.5 };
    case 'Normal': return { visual: 0, het: 0, normal: 1 };
    case 'Unknown': return { visual: 0, het: 0, normal: 1 };
    default: return { visual: 0, het: 0, normal: 1 };
  }
}

function crossRecessive(sireProb, damProb) {
  const sireAlleles = getRecAlleles(sireProb);
  const damAlleles  = getRecAlleles(damProb);
  let results = {};
  for (const [sa, sp] of sireAlleles) {
    for (const [da, dp] of damAlleles) {
      const combo = getRecCombo(sa, da);
      results[combo] = (results[combo] || 0) + sp * dp;
    }
  }
  return results;
}

function getRecAlleles(prob) {
  let alleles = [];
  if (prob.visual === 1) { alleles.push(['V', 0.5], ['V', 0.5]); }
  else if (prob.het === 1) { alleles.push(['V', 0.5], ['n', 0.5]); }
  else if (prob.het > 0) {
    const hetChance = prob.het;
    const normChance = 1 - hetChance;
    alleles.push(['V', hetChance * 0.5], ['n', hetChance * 0.5 + normChance]);
  } else {
    alleles.push(['n', 0.5], ['n', 0.5]);
  }
  return alleles;
}

function getRecCombo(a1, a2) {
  if (a1 === 'V' && a2 === 'V') return 'visual';
  if ((a1 === 'V' && a2 === 'n') || (a1 === 'n' && a2 === 'V')) return 'het';
  return 'normal';
}

function crossIncDominant(sireState, damState) {
  const sireAlleles = getLBAlleles(sireState);
  const damAlleles  = getLBAlleles(damState);
  let results = {};
  for (const [sa, sp] of sireAlleles) {
    for (const [da, dp] of damAlleles) {
      const combo = getLBCombo(sa, da);
      results[combo] = (results[combo] || 0) + sp * dp;
    }
  }
  return results;
}

function getLBAlleles(state) {
  if (state === 'Visual (Leatherback)') return [['lb', 0.5], ['n', 0.5]];
  if (state === 'Super (Silkback)') return [['lb', 0.5], ['lb', 0.5]];
  return [['n', 0.5], ['n', 0.5]];
}

function getLBCombo(a1, a2) {
  if (a1 === 'lb' && a2 === 'lb') return 'super';
  if ((a1 === 'lb' && a2 === 'n') || (a1 === 'n' && a2 === 'lb')) return 'visual';
  return 'normal';
}

function crossDominant(sireState, damState) {
  if (sireState === 'Visual' && damState === 'Visual') {
    return { visual: 0.75, normal: 0.25 };
  } else if (sireState === 'Visual' || damState === 'Visual') {
    return { visual: 0.5, normal: 0.5 };
  }
  return { visual: 0, normal: 1 };
}

function inheritGeneFromParents(gpfGene, gpmGene, geneName) {
  const gene = GENES[geneName];
  if (gene.category === 'recessive') {
    const gpfProb = stateToProb(gpfGene, false);
    const gpmProb = stateToProb(gpmGene, false);
    const result = crossRecessive(gpfProb, gpmProb);
    return { visual: result.visual || 0, het: result.het || 0, normal: result.normal || 0 };
  } else if (gene.category === 'incdominant') {
    const result = crossIncDominant(gpfGene, gpmGene);
    return { visual: result.visual || 0, super: result.super || 0, normal: result.normal || 0 };
  } else if (gene.category === 'dominant') {
    return crossDominant(gpfGene, gpmGene);
  } else if (gene.category === 'nonmendelian' || gene.category === 'lineage') {
    if (gpfGene !== 'Normal' || gpmGene !== 'Normal') {
      return { visual: 0.5, normal: 0.5 };
    }
    return { visual: 0, normal: 1 };
  }
  return { visual: 0, normal: 1 };
}

function updateCalculateBtn() {
  const sireHasGenes = Object.keys(parentGenes.sire).length > 0;
  const damHasGenes = Object.keys(parentGenes.dam).length > 0;
  const btn = document.getElementById('btn-calculate');
  const hint = document.getElementById('calc-hint');
  const exportBtn = document.getElementById('btn-export-png');
  const ready = sireHasGenes && damHasGenes;
  btn.disabled = !ready;
  const anyData = sireHasGenes || damHasGenes ||
    Object.keys(parentGenes.sgf).length > 0 || Object.keys(parentGenes.sgm).length > 0 ||
    Object.keys(parentGenes.dgf).length > 0 || Object.keys(parentGenes.dgm).length > 0;
  exportBtn.style.display = anyData ? '' : 'none';
  if (!sireHasGenes && !damHasGenes) {
    hint.textContent = 'Add at least one gene to Sire and Dam to calculate';
  } else if (!sireHasGenes) {
    hint.textContent = 'Add at least one gene to Sire to calculate';
  } else if (!damHasGenes) {
    hint.textContent = 'Add at least one gene to Dam to calculate';
  } else {
    hint.textContent = '';
  }
}

function clearAll() {
  ['sire','dam','sgf','sgm','dgf','dgm'].forEach(parent => {
    parentGenes[parent] = {};
    geneCounters[parent] = 0;
    const list = document.getElementById(`${parent}-genes`);
    const empty = document.getElementById(`${parent}-empty`);
    if (list) list.innerHTML = '';
    if (empty) empty.style.display = 'block';
  });
  ['sire-name','dam-name','sgf-name','sgm-name','dgf-name','dgm-name'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  ['sgf','sgm','dgf','dgm'].forEach(key => {
    const wrap = document.getElementById(`${key}-wrap`);
    const btn = document.getElementById(`toggle-${key}`);
    if (wrap) wrap.classList.remove('visible');
    if (btn) btn.classList.remove('active');
  });
  const section = document.getElementById('results-section');
  if (section) section.classList.remove('visible');
  updateCalculateBtn();
}

function saveData() {
  const data = { names: {}, genes: {} };
  ['sire','dam','sgf','sgm','dgf','dgm'].forEach(parent => {
    const nameEl = document.getElementById(`${parent}-name`);
    data.names[parent] = nameEl ? nameEl.value : '';
    data.genes[parent] = Object.values(parentGenes[parent]).map(g => ({ gene: g.gene, state: g.state }));
  });
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const sireName = data.names.sire || 'Sire';
  const damName = data.names.dam || 'Dam';
  a.download = `${sireName}_x_${damName}_lineage.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function toggleGrandparent(key) {
  const wrap = document.getElementById(`${key}-wrap`);
  const btn = document.getElementById(`toggle-${key}`);
  if (!wrap || !btn) return;
  const isVisible = wrap.classList.contains('visible');
  wrap.classList.toggle('visible', !isVisible);
  btn.classList.toggle('active', !isVisible);
}

function calculate() {
  const warnings = [];
  const infos = [];
  const allGeneResults = [];
  const sireGenes = Object.values(parentGenes.sire);
  const damGenes = Object.values(parentGenes.dam);
  const sgfGenes = Object.values(parentGenes.sgf);
  const sgmGenes = Object.values(parentGenes.sgm);
  const dgfGenes = Object.values(parentGenes.dgf);
  const dgmGenes = Object.values(parentGenes.dgm);
  const allGeneNames = [...new Set([
    ...sireGenes.map(g => g.gene),
    ...damGenes.map(g => g.gene),
    ...sgfGenes.map(g => g.gene),
    ...sgmGenes.map(g => g.gene),
    ...dgfGenes.map(g => g.gene),
    ...dgmGenes.map(g => g.gene)
  ])];
  if (allGeneNames.length === 0) return;
  [...sireGenes, ...damGenes].forEach(g => {
    if (g.state === 'Unknown') {
      warnings.push(`⚠ ${g.gene}: one parent has Unknown state — treated as Normal. Genetic potential may be hidden.`);
    }
  });
  for (const geneName of allGeneNames) {
    const gene = GENES[geneName];
    const sireEntry = sireGenes.find(g => g.gene === geneName);
    const damEntry = damGenes.find(g => g.gene === geneName);
    const sgfEntry = sgfGenes.find(g => g.gene === geneName);
    const sgmEntry = sgmGenes.find(g => g.gene === geneName);
    const dgfEntry = dgfGenes.find(g => g.gene === geneName);
    const dgmEntry = dgmGenes.find(g => g.gene === geneName);
    const sgfState = sgfEntry?.state || 'Normal';
    const sgmState = sgmEntry?.state || 'Normal';
    const dgfState = dgfEntry?.state || 'Normal';
    const dgmState = dgmEntry?.state || 'Normal';
    let sireState = sireEntry?.state;
    let damState = damEntry?.state;
    if (!sireState) {
      const inherited = inheritGeneFromParents(sgfState, sgmState, geneName);
      const gene_cat = gene.category;
      if (gene_cat === 'recessive') {
        if (inherited.visual > 0.5) sireState = 'Visual';
        else if (inherited.het > 0.5) sireState = 'Het';
        else if (inherited.het > 0.3) sireState = '66% Poss Het';
        else if (inherited.het > 0) sireState = '50% Poss Het';
        else sireState = 'Normal';
      } else if (gene_cat === 'incdominant') {
        if (inherited.super > 0.3) sireState = 'Super (Silkback)';
        else if (inherited.visual > 0.3) sireState = 'Visual (Leatherback)';
        else sireState = 'Normal';
      } else if (gene_cat === 'dominant') {
        if (inherited.visual > 0.3) sireState = 'Visual';
        else sireState = 'Normal';
      } else {
        if (inherited.visual > 0.3) sireState = 'Visual';
        else sireState = 'Normal';
      }
    }
    if (!damState) {
      const inherited = inheritGeneFromParents(dgfState, dgmState, geneName);
      const gene_cat = gene.category;
      if (gene_cat === 'recessive') {
        if (inherited.visual > 0.5) damState = 'Visual';
        else if (inherited.het > 0.5) damState = 'Het';
        else if (inherited.het > 0.3) damState = '66% Poss Het';
        else if (inherited.het > 0) damState = '50% Poss Het';
        else damState = 'Normal';
      } else if (gene_cat === 'incdominant') {
        if (inherited.super > 0.3) damState = 'Super (Silkback)';
        else if (inherited.visual > 0.3) damState = 'Visual (Leatherback)';
        else damState = 'Normal';
      } else if (gene_cat === 'dominant') {
        if (inherited.visual > 0.3) damState = 'Visual';
        else damState = 'Normal';
      } else {
        if (inherited.visual > 0.3) damState = 'Visual';
        else damState = 'Normal';
      }
    }
    const sireProven = document.getElementById(`sire-gene-${Object.keys(parentGenes.sire).find(k => parentGenes.sire[k].gene === geneName)}-proven`)?.checked || false;
    const damProven = document.getElementById(`dam-gene-${Object.keys(parentGenes.dam).find(k => parentGenes.dam[k].gene === geneName)}-proven`)?.checked || false;
    let outcomes = {};
    if (gene.category === 'recessive') {
      const sP = stateToProb(sireState, sireProven);
      const dP = stateToProb(damState, damProven);
      outcomes = crossRecessive(sP, dP);
    } else if (gene.category === 'incdominant') {
      outcomes = crossIncDominant(sireState, damState);
    } else if (gene.category === 'dominant') {
      outcomes = crossDominant(sireState, damState);
    } else if (gene.category === 'nonmendelian') {
      if (sireState === 'High Expression' && damState === 'High Expression') outcomes = { 'High Expression': 1 };
      else if (sireState === 'None' && damState === 'None') outcomes = { 'None': 1 };
      else if (sireState === 'High Expression' || damState === 'High Expression') outcomes = { 'High Expression': 0.5, 'Low Expression': 0.5 };
      else outcomes = { 'Low Expression': 0.5, 'None': 0.5 };
    } else if (gene.category === 'lineage') {
      if (sireState === 'Visual' || damState === 'Visual') outcomes = { visual: 0.5, normal: 0.5 };
      else outcomes = { normal: 1 };
    }
    const total = Object.values(outcomes).reduce((a, b) => a + b, 0);
    if (total > 0) {
      for (const k in outcomes) outcomes[k] = outcomes[k] / total;
    }
    allGeneResults.push({ geneName, outcomes });
  }
  const combined = combineGeneResults(allGeneResults);
  const merged = {};
  for (const { combo, prob } of combined) {
    const fmt = formatPhenotype(combo);
    const key = fmt.phenotype;
    if (merged[key]) {
      merged[key].prob += prob;
    } else {
      merged[key] = { ...fmt, prob };
    }
  }
  const sorted = Object.values(merged).sort((a, b) => b.prob - a.prob);
  renderResults(sorted, warnings, infos);
}

function combineGeneResults(allGeneResults) {
  let combined = [{}];
  let combinedProbs = [1.0];
  for (const { geneName, outcomes } of allGeneResults) {
    const newCombined = [];
    const newProbs = [];
    for (let i = 0; i < combined.length; i++) {
      for (const [state, prob] of Object.entries(outcomes)) {
        if (prob <= 0) continue;
        const newEntry = { ...combined[i], [geneName]: state };
        newCombined.push(newEntry);
        newProbs.push(combinedProbs[i] * prob);
      }
    }
    combined = newCombined;
    combinedProbs = newProbs;
  }
  return combined.map((combo, i) => ({ combo, prob: combinedProbs[i] }));
}

function formatPhenotype(combo) {
  let visuals = [], hets = [], possHets = [], supers = [];
  const genotypeparts = [];
  for (const [gene, state] of Object.entries(combo)) {
    const g = GENES[gene];
    if (!g) continue;
    if (g.category === 'recessive') {
      if (state === 'visual') { visuals.push(gene); genotypeparts.push(`hom ${g.short}`); }
      else if (state === 'het') { hets.push(gene); genotypeparts.push(`het ${g.short}`); }
      else if (state === '66poss') { possHets.push(gene); genotypeparts.push(`66% poss het ${g.short}`); }
      else { genotypeparts.push(`nrm ${g.short}`); }
    } else if (g.category === 'incdominant') {
      if (state === 'super') { supers.push(gene); genotypeparts.push(`${g.short}/Silkback`); }
      else if (state === 'visual') { visuals.push(`Leatherback`); genotypeparts.push(`het ${g.short}`); }
      else { genotypeparts.push(`nrm ${g.short}`); }
    } else if (g.category === 'dominant') {
      if (state === 'visual') { visuals.push(gene); genotypeparts.push(`${g.short} dominant`); }
      else { genotypeparts.push(`nrm ${g.short}`); }
    } else if (g.category === 'nonmendelian') {
      if (state !== 'None') { visuals.push(`${state} ${gene}`); genotypeparts.push(state); }
    } else if (g.category === 'lineage') {
      if (state === 'visual') { visuals.push(gene); genotypeparts.push(`${g.short} lineage`); }
    }
  }
  const zeroVisual = combo['Zero'] === 'visual';
  const witblitsVisual = combo['Witblits'] === 'visual';
  const isWero = zeroVisual && witblitsVisual;
  let phenotype = '';
  const parts = [];
  if (supers.length) parts.push(...supers.map(s => `Super ${s}`));
  if (isWero) {
    parts.push('Wero');
    visuals = visuals.filter(v => v !== 'Zero' && v !== 'Witblits');
  }
  if (visuals.length) parts.push(...visuals);
  if (hets.length) parts.push(...hets.map(h => `Het ${h}`));
  if (possHets.length) parts.push(...possHets.map(h => `66% Poss Het ${h}`));
  if (!parts.length) parts.push('Normal / Wildtype');
  phenotype = parts.join(', ');
  return {
    phenotype,
    genotype: genotypeparts.join(' / ') || 'nrm',
    hasSuper: supers.length > 0,
    hasVisual: visuals.length > 0 || isWero,
    hasHet: hets.length > 0,
    isWero: isWero
  };
}

function renderResults(results, warnings, infos) {
  lastResults = results;
  const section = document.getElementById('results-section');
  const body = document.getElementById('results-body');
  const warnContainer = document.getElementById('warnings-container');
  const infoContainer = document.getElementById('info-container');
  const meta = document.getElementById('results-meta');
  warnContainer.innerHTML = '';
  infoContainer.innerHTML = '';
  warnings.forEach(w => {
    const box = document.createElement('div');
    box.className = 'warning-box';
    box.innerHTML = `<span class="warning-icon">⚠</span><span>${w}</span>`;
    warnContainer.appendChild(box);
  });
  infos.forEach(info => {
    const box = document.createElement('div');
    box.className = 'info-box';
    box.textContent = info;
    infoContainer.appendChild(box);
  });
  const sireName = document.getElementById('sire-name').value || 'Sire';
  const damName = document.getElementById('dam-name').value || 'Dam';
  meta.textContent = `${sireName} × ${damName} — ${results.length} phenotype combination${results.length !== 1 ? 's' : ''}`;
  body.innerHTML = '';
  results.forEach(r => {
    const pct = (r.prob * 100).toFixed(1);
    const tr = document.createElement('tr');
    const tdPheno = document.createElement('td');
    let tagHtml = '';
    if (r.isWero) tagHtml += `<span class="tag tag-super">Wero</span> `;
    else if (r.hasSuper) tagHtml += `<span class="tag tag-super">Super</span> `;
    if (r.hasVisual && !r.hasSuper && !r.isWero) tagHtml += `<span class="tag tag-visual">Visual</span> `;
    if (r.hasHet) tagHtml += `<span class="tag tag-het">Het</span> `;
    tdPheno.innerHTML = `<div class="phenotype-name">${tagHtml}${r.phenotype}</div>`;
    tr.appendChild(tdPheno);
    const tdGeno = document.createElement('td');
    tdGeno.innerHTML = `<div class="genotype-code">${r.genotype}</div>`;
    tr.appendChild(tdGeno);
    const tdProb = document.createElement('td');
    tdProb.className = 'prob-bar-cell';
    tdProb.innerHTML = `
      <div class="prob-bar-wrap">
        <div class="prob-bar"><div class="prob-bar-fill" style="width:${Math.min(pct,100)}%"></div></div>
        <div class="prob-pct">${pct}%</div>
      </div>`;
    tr.appendChild(tdProb);
    body.appendChild(tr);
  });
  section.classList.add('visible');
  document.getElementById('btn-export-png').style.display = '';
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

let lastResults = [];

function loadData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      clearAll();
      ['sire','dam','sgf','sgm','dgf','dgm'].forEach(parent => {
        const nameEl = document.getElementById(`${parent}-name`);
        if (nameEl && data.names && data.names[parent]) nameEl.value = data.names[parent];
        if (data.genes && data.genes[parent] && data.genes[parent].length > 0) {
          if (['sgf','sgm','dgf','dgm'].includes(parent)) {
            const wrap = document.getElementById(`${parent}-wrap`);
            const btn = document.getElementById(`toggle-${parent}`);
            if (wrap && !wrap.classList.contains('visible')) {
              wrap.classList.add('visible');
              if (btn) btn.classList.add('active');
            }
          }
          data.genes[parent].forEach(g => {
            if (GENES[g.gene]) addGene(parent, g.gene, g.state);
          });
        }
      });
    } catch(err) { console.error('Failed to load:', err); }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function exportPNG() {
  const sireHasGenes = Object.keys(parentGenes.sire).length > 0;
  const damHasGenes = Object.keys(parentGenes.dam).length > 0;
  if (sireHasGenes && damHasGenes && lastResults.length === 0) {
    calculate();
  }
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
      'Visual': { bg:'rgba(211,84,0,0.18)', border:'rgba(211,84,0,0.5)', color:'#D35400' },
      'Visual (Leatherback)': { bg:'rgba(211,84,0,0.18)', border:'rgba(211,84,0,0.5)', color:'#D35400' },
      'Super (Silkback)': { bg:'rgba(192,57,43,0.18)', border:'rgba(192,57,43,0.5)', color:'#e87060' },
      'Het': { bg:'rgba(33,145,80,0.15)', border:'rgba(33,145,80,0.45)', color:'#219150' },
    };
    const style = map[state] || (state.includes('Poss')
      ? { bg:'rgba(41,128,185,0.15)', border:'rgba(41,128,185,0.45)', color:'#2980B9' }
      : { bg:'rgba(33,47,61,0.35)', border:'#2e3d4f', color:'#607d8b' });
    return `<span style="display:inline-block;padding:2px 8px;border-radius:3px;font-size:10px;letter-spacing:0.04em;background:${style.bg};border:1px solid ${style.border};color:${style.color};white-space:nowrap">${state}</span>`;
  }

  function panelHTML(title, isMale, name, genes) {
    const sexColor = isMale ? '#2980B9' : '#D35400';
    const sexBg = isMale ? 'rgba(41,128,185,0.15)' : 'rgba(211,84,0,0.12)';
    const sexBorder = isMale ? 'rgba(41,128,185,0.35)' : 'rgba(211,84,0,0.3)';
    const sym = isMale ? '♂' : '♀';
    let genesHTML = '';
    if (genes.length === 0) {
      genesHTML = `<div style="color:#607d8b;font-size:11px;padding:8px 0">No genes</div>`;
    } else {
      genesHTML = genes.map(g => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid #2e3d4f">
          <span style="font-size:11px;color:#F9F9F9">${g.gene}</span>
          ${stateTag(g.state)}
        </div>`).join('');
    }
    return `
      <div style="background:#212F3D;border:1px solid #2e3d4f;border-radius:6px;overflow:hidden;flex:1;min-width:0">
        <div style="background:#1a2530;border-bottom:1px solid #2e3d4f;padding:10px 16px;display:flex;align-items:center;gap:10px">
          <div style="width:22px;height:22px;border-radius:50%;background:${sexBg};border:1px solid ${sexBorder};display:flex;align-items:center;justify-content:center;color:${sexColor};font-size:13px;font-weight:700;flex-shrink:0">${sym}</div>
          <span style="font-family:'Montserrat',sans-serif;font-weight:700;font-size:13px;letter-spacing:0.05em;text-transform:uppercase;color:#F9F9F9">${title}</span>
          ${name ? `<span style="margin-left:auto;color:${sexColor};font-size:11px">${name}</span>` : ''}
        </div>
        <div style="padding:14px 16px">
          <div style="font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#607d8b;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #2e3d4f">Genetic Profile</div>
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
        <div style="font-size:10px;letter-spacing:0.15em;color:#607d8b;text-transform:uppercase;margin-bottom:10px;padding-bottom:5px;border-bottom:1px solid #2e3d4f">Grandparents</div>
        <div style="display:flex;gap:16px">${left}${right}</div>
      </div>`;
  });

  let resultsHTML = '';
  if (lastResults.length > 0) {
    const rows = lastResults.map((r, i) => {
      const pct = (r.prob * 100).toFixed(1);
      const barW = Math.round(r.prob * 200);
      let tags = '';
      if (r.hasSuper) tags += `<span style="display:inline-block;padding:1px 6px;border-radius:2px;font-size:9px;background:rgba(192,57,43,0.18);border:1px solid rgba(192,57,43,0.45);color:#e87060;margin-right:4px">Super</span>`;
      else if (r.hasVisual) tags += `<span style="display:inline-block;padding:1px 6px;border-radius:2px;font-size:9px;background:rgba(211,84,0,0.18);border:1px solid rgba(211,84,0,0.45);color:#D35400;margin-right:4px">Visual</span>`;
      if (r.hasHet) tags += `<span style="display:inline-block;padding:1px 6px;border-radius:2px;font-size:9px;background:rgba(33,145,80,0.15);border:1px solid rgba(33,145,80,0.4);color:#219150;margin-right:4px">Het</span>`;
      return `
        <tr style="background:${i%2===0?'#212F3D':'#1C2833'}">
          <td style="padding:10px 14px;border-bottom:1px solid #2e3d4f;vertical-align:middle">
            <div>${tags}<span style="font-family:'Montserrat',sans-serif;font-weight:600;font-size:12px;color:#F9F9F9">${r.phenotype}</span></div>
            <div style="font-size:10px;color:#607d8b;font-style:italic;margin-top:3px">${r.genotype}</div>
          </td>
          <td style="padding:10px 14px;border-bottom:1px solid #2e3d4f;vertical-align:middle;width:220px">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="flex:1;height:5px;background:#2e3d4f;border-radius:3px;overflow:hidden">
                <div style="height:100%;width:${barW}px;max-width:100%;background:linear-gradient(90deg,#A04000,#D35400);border-radius:3px"></div>
              </div>
              <span style="font-size:12px;color:#D35400;font-weight:500;min-width:40px;text-align:right">${pct}%</span>
            </div>
          </td>
        </tr>`;
    }).join('');
    resultsHTML = `
      <div style="margin-top:24px">
        <div style="font-size:10px;letter-spacing:0.15em;color:#607d8b;text-transform:uppercase;margin-bottom:10px;padding-bottom:5px;border-bottom:1px solid #2e3d4f">Clutch Results — ${sireName} × ${damName}</div>
        <table style="width:100%;border-collapse:collapse;border:1px solid #2e3d4f;border-radius:6px;overflow:hidden">
          <thead>
            <tr style="background:#1a2530">
              <th style="padding:8px 14px;text-align:left;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#607d8b;font-weight:400;border-bottom:1px solid #2e3d4f">Phenotype / Genotype</th>
              <th style="padding:8px 14px;text-align:left;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#607d8b;font-weight:400;border-bottom:1px solid #2e3d4f;width:220px">Probability</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  const html = `
    <div id="png-export-root" style="
      width:880px;
      background:#1C2833;
      color:#F9F9F9;
      font-family:'Open Sans',sans-serif;
      font-size:13px;
      padding:36px 40px 40px;
      position:relative;
    ">
      <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#D35400 25%,#D35400 75%,transparent)"></div>
      <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:20px">
        <div>
          <div style="font-family:'Montserrat',sans-serif;font-size:26px;font-weight:800;line-height:1">
            Linage <span style="color:#D35400">Tool</span>
          </div>
          <div style="font-size:10px;color:#607d8b;letter-spacing:0.14em;text-transform:uppercase;margin-top:6px">Scrappy's Exotic Yard · Bearded Dragon Phenotype & Probability Engine</div>
        </div>
        <div style="font-size:10px;color:#2e3d4f;letter-spacing:0.1em">${new Date().toLocaleDateString()}</div>
      </div>
      <div style="border-top:1px solid #2e3d4f;padding-top:20px;margin-bottom:20px">
        <div style="text-align:center;margin-bottom:16px">
          <div style="font-family:'Montserrat',sans-serif;font-size:20px;font-weight:700;color:#D35400;letter-spacing:-0.01em">${sireName} × ${damName}</div>
          <div style="font-size:10px;color:#607d8b;margin-top:6px">
            ♂ ${sireGenes.map(g=>`${g.state} ${g.gene}`).join(' · ') || '—'}
          </div>
          <div style="font-size:10px;color:#607d8b;margin-top:2px">
            ♀ ${damGenes.map(g=>`${g.state} ${g.gene}`).join(' · ') || '—'}
          </div>
        </div>
        ${gpSections}
        <div style="margin-top:${gpSections ? '16px' : '0'}">
          <div style="font-size:10px;letter-spacing:0.15em;color:#607d8b;text-transform:uppercase;margin-bottom:10px;padding-bottom:5px;border-bottom:1px solid #2e3d4f">Parents</div>
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
      backgroundColor: '#1C2833',
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

function toggleColorScheme() {
  const body = document.body;
  const toggle = document.getElementById('color-toggle');
  body.classList.toggle('dark-mode');
  toggle.classList.toggle('active');
  localStorage.setItem('darkMode', body.classList.contains('dark-mode'));
}

document.addEventListener('DOMContentLoaded', function() {
  // Dark mode is ON by default — only disable if explicitly set to false
  const storedPref = localStorage.getItem('darkMode');
  if (storedPref === null || storedPref === 'true') {
    document.body.classList.add('dark-mode');
    document.getElementById('color-toggle').classList.add('active');
  }
});
