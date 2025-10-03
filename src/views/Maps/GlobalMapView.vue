<script setup>
import GlobalMap from '@/views/Maps/GlobalMap.vue'
</script>

<template>
  <GlobalMap />
</template>

<style scoped lang="scss">
@use '@/styles/theme.scss' as *;
.explore-layout { position:relative; width:100%; height:100dvh; overflow:hidden; }
.explore-map { position:absolute; inset:0; z-index:1; }

.map-controls { position:absolute; top:12px; left:12px; z-index:5; background:rgba(15,23,42,.82); color:#e2e8f0; border:1px solid rgba(255,255,255,.12); padding:8px 10px; border-radius:10px; backdrop-filter:blur(6px); box-shadow:0 4px 12px rgba(0,0,0,0.35); }
.map-controls .toggle { display:flex; align-items:center; gap:8px; font-size:.85rem; }
.map-controls input { accent-color:#60a5fa; }

.shape-progress { position:absolute; top:12px; left:50%; transform:translateX(-50%); min-width:260px; background:rgba(15,23,42,0.82); color:#f1f5f9; padding:10px 14px; font-size:12px; border-radius:8px; backdrop-filter: blur(4px); box-shadow:0 4px 12px rgba(0,0,0,0.35); display:flex; flex-direction:column; gap:6px; }
.shape-progress .label { font-weight:600; letter-spacing:.5px; text-align:center; }
.shape-progress .bar-wrapper { height:8px; background:#334155; border-radius:4px; overflow:hidden; }
.shape-progress .bar { height:100%; background:linear-gradient(90deg,#0ea5e9,#38bdf8); transition:width .12s ease-out; }
.shape-progress .pct { font-family:monospace; text-align:center; font-size:11px; opacity:.85; }
.shape-error { position:absolute; top:8px; left:50%; transform:translateX(-50%); background:#7f1d1d; color:#fee2e2; padding:6px 12px; font-size:12px; border-radius:4px; box-shadow:0 2px 6px rgba(0,0,0,0.35); }

.empty { text-align:center; padding:32px 0; color:#64748b; font-size:14px; }

.explore-map :deep(.leaflet-control-attribution) {
  background: rgba(15,23,42,0.55);
  color: #94a3b8;
  font-size: 10px;
  a { color: #cbd5e1; }
}

.scenario-popup { font-size:12px; line-height:1.35; }
.scenario-popup ul { margin:4px 0 0; padding:0 0 0 16px; max-width:200px; }
.scenario-popup li { margin:0 0 2px; padding:0; }
.scenario-popup li.published { color:#10b981; }
.scenario-popup li.draft { color:#94a3b8; }
</style>
<style lang="scss">
/* Global (non-scoped) styles: Leaflet injecte des div sans attribut de scope */
.scenario-dot-wrapper { pointer-events:auto; }
.scenario-dot { position:relative; display:flex; align-items:center; justify-content:center; font-weight:600; color:#fff; border-radius:50%; box-shadow:0 1px 4px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.25); font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif; transition:filter .15s ease, transform .15s ease; }
.scenario-dot.published { background:linear-gradient(135deg,#16a34a,#22c55e); }
.scenario-dot.draft { background:linear-gradient(135deg,#475569,#64748b); }
.scenario-dot::after { content:''; position:absolute; inset:0; border-radius:50%; box-shadow:0 0 0 2px rgba(255,255,255,0.15); }
.scenario-dot:hover { filter:brightness(1.15) saturate(1.05); }
.scenario-dot:active { transform:scale(.9); }
.scenario-cluster-agg-wrapper { pointer-events:auto; }
.scenario-cluster-agg { position:relative; font-weight:600; font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif; background:linear-gradient(135deg,#334155,#475569); color:#f1f5f9; text-align:center; border-radius:50%; box-shadow:0 2px 6px rgba(0,0,0,0.55), 0 0 0 2px rgba(255,255,255,0.15); font-size:13px; letter-spacing:.5px; transition:filter .15s ease, transform .15s ease; }
.scenario-cluster-agg::after { content:''; position:absolute; inset:0; border-radius:50%; box-shadow:0 0 0 3px rgba(255,255,255,0.08), 0 0 12px -2px rgba(59,130,246,0.45); }
.scenario-cluster-agg:hover { filter:brightness(1.18) saturate(1.05); }
.scenario-cluster-agg:active { transform:scale(.9); }
</style>
