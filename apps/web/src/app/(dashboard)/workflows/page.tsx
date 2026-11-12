'use client';
import toast from '@/lib/toast';
import { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type NodeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';

type Tab = 'list' | 'builder' | 'blocks';

const stepTypes = [
  { type: 'trigger', label: 'Trigger', icon: '⚡', color: '#3b82f6', desc: 'Event that starts the workflow' },
  { type: 'condition', label: 'Condition', icon: '🔀', color: '#8b5cf6', desc: 'Branch based on criteria' },
  { type: 'approval', label: 'Approval', icon: '✅', color: '#10b981', desc: 'Request approval from user/role' },
  { type: 'action', label: 'Action', icon: '⚙️', color: '#f59e0b', desc: 'Auto-execute system action' },
  { type: 'notification', label: 'Notify', icon: '🔔', color: '#ec4899', desc: 'Send email/SMS/in-app alert' },
  { type: 'delay', label: 'Wait / Delay', icon: '⏳', color: '#06b6d4', desc: 'Pause for duration or event' },
  { type: 'document', label: 'Generate Doc', icon: '📝', color: '#14b8a6', desc: 'Auto-generate letter or PDF' },
  { type: 'webhook', label: 'Webhook', icon: '🌐', color: '#6366f1', desc: 'Call external API endpoint' },
];

function StepNode({ data }: NodeProps<{ label: string; type: string }>) {
  const st = stepTypes.find((s) => s.type === data.type);
  const color = st?.color || '#64748b';
  return (
    <div
      style={{
        background: '#0f172a',
        border: `2px solid ${color}`,
        borderRadius: 12,
        padding: '10px 14px',
        minWidth: 180,
        boxShadow: `0 4px 16px ${color}33`,
        color: '#e2e8f0',
        fontSize: 12,
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: color }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18 }}>{st?.icon || '⚙️'}</span>
        <div>
          <div style={{ fontWeight: 600 }}>{data.label}</div>
          <div style={{ fontSize: 10, color, textTransform: 'uppercase', letterSpacing: 0.5 }}>{st?.label || data.type}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: color }} />
    </div>
  );
}

function WorkflowCanvas({
  workflow,
  onChange,
}: {
  workflow: any;
  onChange: (steps: any[]) => void;
}) {
  const nodeTypes = useMemo(() => ({ step: StepNode }), []);

  const initial = useMemo(() => {
    const nodes: Node[] = (workflow.steps || []).map((s: any, i: number) => ({
      id: `n-${i}`,
      type: 'step',
      position: { x: 80 + i * 240, y: 120 + (i % 2 === 0 ? 0 : 60) },
      data: { label: s.label, type: s.type },
    }));
    const edges: Edge[] = nodes.slice(0, -1).map((n, i) => ({
      id: `e-${i}`,
      source: n.id,
      target: `n-${i + 1}`,
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 2 },
    }));
    return { nodes, edges };
  }, [workflow]);

  const [nodes, setNodes] = useState<Node[]>(initial.nodes);
  const [edges, setEdges] = useState<Edge[]>(initial.edges);

  useEffect(() => {
    setNodes(initial.nodes);
    setEdges(initial.edges);
  }, [initial]);

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((n) => applyNodeChanges(changes, n)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((e) => applyEdgeChanges(changes, e)), []);
  const onConnect = useCallback((c: Connection) => setEdges((e) => addEdge({ ...c, animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } }, e)), []);

  const addBlock = (type: string) => {
    const st = stepTypes.find((s) => s.type === type);
    if (!st) return;
    const id = `n-${Date.now()}`;
    const newNode: Node = {
      id,
      type: 'step',
      position: { x: 80 + nodes.length * 240, y: 200 },
      data: { label: st.label, type },
    };
    const lastId = nodes[nodes.length - 1]?.id;
    setNodes((n) => [...n, newNode]);
    if (lastId) {
      setEdges((e) => [...e, { id: `e-${id}`, source: lastId, target: id, animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } }]);
    }
    toast(`Added ${st.label} block`, 'success');
  };

  const syncBack = () => {
    // Sort nodes left-to-right and map back to steps
    const ordered = [...nodes].sort((a, b) => a.position.x - b.position.x);
    const steps = ordered.map((n) => ({ type: n.data.type, label: n.data.label }));
    onChange(steps);
    toast('Workflow saved', 'success');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 'var(--space-4)' }}>
      <div className="stat-card" style={{ padding: 0, height: 560, overflow: 'hidden' }}>
        <div style={{ height: '100%' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={16} color="rgba(148,163,184,0.18)" />
            <Controls />
            <MiniMap pannable zoomable maskColor="rgba(15,23,42,0.6)" nodeColor={(n) => stepTypes.find((s) => s.type === (n.data as any)?.type)?.color || '#64748b'} />
          </ReactFlow>
        </div>
      </div>
      <div className="stat-card" style={{ padding: 'var(--space-4)' }}>
        <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>Add blocks:</h4>
        {stepTypes.map((s) => (
          <button
            key={s.type}
            onClick={() => addBlock(s.type)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              width: '100%',
              padding: 'var(--space-2)',
              marginBottom: 'var(--space-2)',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-secondary)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 14, width: 26, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: s.color + '15', color: s.color }}>{s.icon}</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 11, fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{s.desc}</div>
            </div>
          </button>
        ))}
        <button className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--space-3)' }} onClick={syncBack}>💾 Save Flow</button>
      </div>
    </div>
  );
}

export default function WorkflowsPage() {
  const [tab, setTab] = useState<Tab>('list');
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [builderWf, setBuilderWf] = useState<any>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/workflows');
      const d = await r.json();
      const list = (d.data || []).map((w: any) => ({
        ...w,
        icon: w.icon || '⚙️',
        lastRun: w.lastRun || '—',
        category: w.category || 'OTHER',
        steps: Array.isArray(w.steps)
          ? w.steps.map((s: any) => (typeof s === 'string' ? { type: 'action', label: s } : s))
          : [],
      }));
      setWorkflows(list);
    } catch {
      toast('Failed to load workflows', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const persistUpdate = async (id: string, patch: any) => {
    try {
      const r = await fetch('/api/workflows', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...patch }) });
      if (r.ok) await reload();
    } catch {
      toast('Save failed', 'error');
    }
  };

  const toggleStatus = async (id: string) => {
    const wf = workflows.find((w) => w.id === id);
    const newStatus = wf?.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
    setWorkflows((ws) => ws.map((w) => (w.id === id ? { ...w, status: newStatus } : w)));
    if (showDetail?.id === id) setShowDetail({ ...showDetail, status: newStatus });
    await persistUpdate(id, { status: newStatus });
    toast('Status updated', 'success');
  };

  const deleteWorkflow = async (id: string) => {
    await fetch('/api/workflows', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setWorkflows((ws) => ws.filter((w) => w.id !== id));
    setShowDetail(null);
    setDeleteConfirm(null);
    toast('Workflow deleted', 'success');
  };

  const saveEdits = async () => {
    await persistUpdate(showDetail.id, editData);
    setShowDetail({ ...showDetail, ...editData });
    setEditing(false);
    toast('Updated!', 'success');
  };

  const handleCreate = async (e: any) => {
    e.preventDefault();
    const f = e.target as HTMLFormElement;
    const name = (f.elements.namedItem('name') as HTMLInputElement).value;
    const trigger = (f.elements.namedItem('trigger') as HTMLInputElement).value;
    const category = (f.elements.namedItem('category') as HTMLSelectElement).value;
    await fetch('/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, trigger, status: 'DRAFT', steps: [{ type: 'trigger', label: trigger }], executions: 0, category, icon: '⚙️' }),
    });
    setShowCreate(false);
    await reload();
    toast('Workflow created!', 'success');
  };

  const onCanvasChange = async (steps: any[]) => {
    if (!builderWf) return;
    await persistUpdate(builderWf.id, { steps });
    setBuilderWf({ ...builderWf, steps });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Workflow Studio</h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Visual workflow builder — automate approvals, notifications, and actions</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Create Workflow</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--space-3)' }}>
        {[
          { l: 'Active', v: workflows.filter((w) => w.status === 'ACTIVE').length, c: 'var(--color-accent-400)' },
          { l: 'Draft', v: workflows.filter((w) => w.status === 'DRAFT').length, c: 'var(--color-warning-400)' },
          { l: 'Total Runs', v: workflows.reduce((s, w) => s + (w.executions || 0), 0), c: 'var(--color-primary-400)' },
          { l: 'Block Types', v: stepTypes.length, c: '#a78bfa' },
        ].map((s) => (
          <div key={s.l} className="stat-card">
            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-primary)' }}>
        {[
          { k: 'list' as Tab, l: 'All Workflows' },
          { k: 'builder' as Tab, l: 'Visual Builder' },
          { k: 'blocks' as Tab, l: 'Block Library' },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            style={{
              padding: '8px 16px',
              fontSize: 'var(--text-sm)',
              fontWeight: tab === t.k ? 600 : 400,
              color: tab === t.k ? 'var(--color-primary-400)' : 'var(--text-tertiary)',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${tab === t.k ? 'var(--color-primary-500)' : 'transparent'}`,
              cursor: 'pointer',
            }}
          >
            {t.l}
          </button>
        ))}
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-muted)' }}>Loading workflows…</div>}

      {!loading && tab === 'list' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
          {workflows.map((wf) => (
            <div
              key={wf.id}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', cursor: 'pointer' }}
              onClick={() => { setShowDetail(wf); setEditData(wf); setEditing(false); }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                <span style={{ fontSize: 20 }}>{wf.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, background: wf.status === 'ACTIVE' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: wf.status === 'ACTIVE' ? 'var(--color-accent-400)' : 'var(--color-warning-400)' }}>{wf.status}</span>
              </div>
              <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 4 }}>{wf.name}</h3>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>⚡ {wf.trigger}</div>
              <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 10, color: 'var(--text-muted)' }}>
                <span><strong>{wf.steps?.length || 0}</strong> Steps</span>
                <span><strong>{wf.executions || 0}</strong> Runs</span>
                <span>{wf.lastRun}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'builder' && (
        !builderWf ? (
          <div className="stat-card" style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 'var(--space-2)' }}>🎨</div>
            <p>Select a workflow to edit visually:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', justifyContent: 'center', marginTop: 'var(--space-3)' }}>
              {workflows.map((wf) => (
                <button key={wf.id} className="btn btn-ghost btn-sm" onClick={() => setBuilderWf(wf)}>
                  {wf.icon} {wf.name}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
              <h3 style={{ fontWeight: 600 }}>{builderWf.icon} {builderWf.name}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setBuilderWf(null)}>← Back</button>
            </div>
            <WorkflowCanvas workflow={builderWf} onChange={onCanvasChange} />
          </>
        )
      )}

      {!loading && tab === 'blocks' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
          {stepTypes.map((s) => (
            <div key={s.type} style={{ background: 'var(--bg-card)', border: `1px solid ${s.color}30`, borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: s.color + '15', color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto var(--space-3)' }}>{s.icon}</div>
              <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 4 }}>{s.label}</h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{s.desc}</p>
              <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.type}</span>
            </div>
          ))}
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-body" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
              <div style={{ fontSize: 40, marginBottom: 'var(--space-3)' }}>⚠️</div>
              <p style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>Delete &quot;{deleteConfirm.name}&quot;?</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn" style={{ background: 'var(--color-danger-500)', color: 'white' }} onClick={() => deleteWorkflow(deleteConfirm.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Workflow</h2>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>
            <form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={handleCreate}>
              <div><label className="input-label">Name *</label><input className="input-field" name="name" required placeholder="Leave Approval Flow" /></div>
              <div><label className="input-label">Trigger *</label><input className="input-field" name="trigger" required placeholder="Employee submits leave" /></div>
              <div><label className="input-label">Category</label><select className="input-field" name="category"><option>TIME</option><option>PEOPLE</option><option>FINANCE</option><option>EXIT</option><option>TRAINING</option><option>DOCUMENTS</option><option>PAYROLL</option></select></div>
              <div className="modal-footer" style={{ padding: 0, border: 'none' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetail && (
        <div className="modal-overlay" onClick={() => setShowDetail(null)}>
          <div className="modal-content" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ fontSize: 20 }}>{showDetail.icon}</span>
                <h2>{showDetail.name}</h2>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {editing ? (
                  <>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setEditData(showDetail); }}>Cancel</button>
                    <button className="btn btn-primary btn-sm" onClick={saveEdits}>Save</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>✏️</button>
                    <button className="btn btn-sm" style={{ color: 'var(--color-danger-400)' }} onClick={() => setDeleteConfirm(showDetail)}>🗑</button>
                  </>
                )}
                <button onClick={() => setShowDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
              </div>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button onClick={() => toggleStatus(showDetail.id)} className={`btn btn-sm ${showDetail.status === 'ACTIVE' ? '' : 'btn-primary'}`} style={{ flex: 1 }}>{showDetail.status === 'ACTIVE' ? '⏸ Deactivate' : '▶ Activate'}</button>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => { setBuilderWf(showDetail); setTab('builder'); setShowDetail(null); }}>🎨 Open in Visual Builder</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
                {[
                  { l: 'Name', f: 'name' },
                  { l: 'Trigger', f: 'trigger' },
                  { l: 'Category', f: 'category' },
                  { l: 'Status', f: 'status', v: showDetail.status },
                  { l: 'Executions', f: 'executions', v: showDetail.executions },
                  { l: 'Last Run', f: 'lastRun' },
                ].map((item) => (
                  <div key={item.l}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>{item.l}</div>
                    {editing ? (
                      <input className="input-field" style={{ height: 30, marginTop: 2 }} value={editData[item.f] || ''} onChange={(e) => setEditData({ ...editData, [item.f]: e.target.value })} />
                    ) : (
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: 2 }}>{(item as any).v ?? showDetail[item.f]}</div>
                    )}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Steps ({showDetail.steps?.length || 0})</div>
                {(showDetail.steps || []).map((step: any, i: number) => {
                  const st = stepTypes.find((s) => s.type === step.type);
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: '6px var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: 4 }}>
                      <span style={{ fontSize: 14, color: st?.color }}>{st?.icon || '⚙️'}</span>
                      <span style={{ fontSize: 'var(--text-sm)', flex: 1 }}>{step.label}</span>
                      <span style={{ fontSize: 9, color: st?.color, fontWeight: 600 }}>{st?.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
