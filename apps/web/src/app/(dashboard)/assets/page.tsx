'use client';
import toast from '@/lib/toast';

import { useState, useEffect } from 'react';
import styles from './assets.module.css';
import { BarChart, DonutChart } from '@/components/ui/Charts';

// ──────────────── RICH MOCK DATA ────────────────
const mockAssets = [
  {
    id: 'AST-001', name: 'MacBook Pro 16" M3 Max', category: 'Laptop', subcategory: 'Apple',
    brand: 'Apple', model: 'A2991', serial: 'C02X9ABCDEF', assetTag: 'BV-LAP-001',
    purchaseDate: '2025-03-15', purchasePrice: 249900, vendor: 'Apple Store India',
    invoiceNo: 'INV-2025-0341', warrantyExpiry: '2028-03-15',
    status: 'ASSIGNED', condition: 'Excellent',
    assignedTo: { name: 'Rohit Mehta', code: 'EMP-0007', dept: 'Engineering' },
    assignedDate: '2025-06-15', location: 'Brainvare HQ — Kochi, Floor 2, Desk 14',
    specs: { processor: 'Apple M3 Max', ram: '36 GB', storage: '1 TB SSD', display: '16.2" Liquid Retina XDR' },
    depreciation: { method: 'Straight-Line', life: 5, salvage: 25000, currentValue: 204917 },
    maintenanceLog: [
      { date: '2026-01-10', type: 'Software Update', description: 'macOS Sequoia 16.2 update', cost: 0, by: 'IT Admin' },
      { date: '2025-09-20', type: 'Repair', description: 'Keyboard replacement (under warranty)', cost: 0, by: 'Apple Service Center' },
    ],
    history: [
      { date: '2025-06-15', action: 'Assigned', details: 'Assigned to Rohit Mehta (Engineering)', by: 'IT Admin' },
      { date: '2025-04-01', action: 'Received', details: 'Added to inventory from Apple Store India', by: 'Procurement' },
      { date: '2025-03-15', action: 'Purchased', details: 'PO-2025-087, ₹2,49,900', by: 'Finance' },
    ],
    documents: [
      { name: 'Purchase Invoice', type: 'PDF', size: '245 KB', date: '2025-03-15' },
      { name: 'Warranty Card', type: 'PDF', size: '120 KB', date: '2025-03-15' },
      { name: 'Asset Handover Form', type: 'PDF', size: '180 KB', date: '2025-06-15' },
    ],
    notes: 'Executive device. Handle with priority for any maintenance.',
    insurancePolicy: 'INS-2025-LAP-001',
    lastAuditDate: '2026-03-01',
  },
  {
    id: 'AST-002', name: 'Dell UltraSharp 27" 4K Monitor', category: 'Monitor', subcategory: 'Dell',
    brand: 'Dell', model: 'U2723QE', serial: 'DL7891234AB', assetTag: 'BV-MON-001',
    purchaseDate: '2025-05-10', purchasePrice: 42000, vendor: 'Dell India',
    invoiceNo: 'INV-2025-0422', warrantyExpiry: '2028-05-10',
    status: 'ASSIGNED', condition: 'Good',
    assignedTo: { name: 'Priya Patel', code: 'EMP-0002', dept: 'HR' },
    assignedDate: '2025-07-01', location: 'Brainvare HQ — Kochi, Floor 1, Desk 3',
    specs: { resolution: '3840x2160', panelType: 'IPS Black', ports: 'USB-C, HDMI 2.0, DP 1.4', size: '27 inches' },
    depreciation: { method: 'Straight-Line', life: 5, salvage: 5000, currentValue: 34600 },
    maintenanceLog: [],
    history: [
      { date: '2025-07-01', action: 'Assigned', details: 'Assigned to Priya Patel (HR)', by: 'IT Admin' },
      { date: '2025-05-15', action: 'Received', details: 'Added to inventory', by: 'Procurement' },
    ],
    documents: [{ name: 'Purchase Invoice', type: 'PDF', size: '198 KB', date: '2025-05-10' }],
    notes: '', insurancePolicy: '', lastAuditDate: '2026-03-01',
  },
  {
    id: 'AST-003', name: 'iPhone 15 Pro 256GB', category: 'Mobile', subcategory: 'Apple',
    brand: 'Apple', model: 'A3104', serial: 'IP15P987654XY', assetTag: 'BV-MOB-001',
    purchaseDate: '2025-07-20', purchasePrice: 134900, vendor: 'Apple Authorized Reseller',
    invoiceNo: 'INV-2025-0589', warrantyExpiry: '2026-07-20',
    status: 'ASSIGNED', condition: 'Good',
    assignedTo: { name: 'Amit Kumar', code: 'EMP-0003', dept: 'Engineering' },
    assignedDate: '2025-08-10', location: 'Mobile — Amit Kumar',
    specs: { chip: 'A17 Pro', storage: '256 GB', display: '6.1" Super Retina XDR', camera: '48MP Triple' },
    depreciation: { method: 'Straight-Line', life: 3, salvage: 15000, currentValue: 94867 },
    maintenanceLog: [],
    history: [
      { date: '2025-08-10', action: 'Assigned', details: 'Assigned to Amit Kumar', by: 'IT Admin' },
      { date: '2025-07-25', action: 'Received', details: 'Added to inventory', by: 'Procurement' },
    ],
    documents: [{ name: 'Purchase Invoice', type: 'PDF', size: '210 KB', date: '2025-07-20' }],
    notes: 'Company phone for on-call rotation.', insurancePolicy: 'INS-2025-MOB-001', lastAuditDate: '2026-03-01',
  },
  {
    id: 'AST-004', name: 'Herman Miller Aeron Chair', category: 'Furniture', subcategory: 'Seating',
    brand: 'Herman Miller', model: 'AER1C23DWALPVPRSNADVPBBDVP23101', serial: 'HM-AER-2024-001', assetTag: 'BV-FUR-001',
    purchaseDate: '2025-01-08', purchasePrice: 95000, vendor: 'WorkSpaces India',
    invoiceNo: 'INV-2025-0012', warrantyExpiry: '2037-01-08',
    status: 'IN_STOCK', condition: 'New',
    assignedTo: null, assignedDate: null, location: 'Warehouse — Rack B3',
    specs: { size: 'B (Medium)', material: 'Graphite 8Z Pellicle', arms: 'Fully Adjustable', lumbar: 'PostureFit SL' },
    depreciation: { method: 'Straight-Line', life: 12, salvage: 10000, currentValue: 86042 },
    maintenanceLog: [],
    history: [
      { date: '2025-01-12', action: 'Received', details: 'Added to inventory', by: 'Procurement' },
    ],
    documents: [{ name: 'Purchase Invoice', type: 'PDF', size: '340 KB', date: '2025-01-08' }],
    notes: 'Reserved for new hire.', insurancePolicy: '', lastAuditDate: '2026-03-01',
  },
  {
    id: 'AST-005', name: 'ThinkPad X1 Carbon Gen 11', category: 'Laptop', subcategory: 'Lenovo',
    brand: 'Lenovo', model: '21HM004UUS', serial: 'LNV11X34567AB', assetTag: 'BV-LAP-005',
    purchaseDate: '2025-06-01', purchasePrice: 155000, vendor: 'Lenovo India',
    invoiceNo: 'INV-2025-0501', warrantyExpiry: '2028-06-01',
    status: 'ASSIGNED', condition: 'Good',
    assignedTo: { name: 'Kavya Nair', code: 'EMP-0008', dept: 'Engineering' },
    assignedDate: '2025-09-20', location: 'Brainvare HQ — Kochi, Floor 2, Desk 22',
    specs: { processor: 'Intel Core i7-1365U', ram: '16 GB LPDDR5', storage: '512 GB SSD', display: '14" 2.8K OLED' },
    depreciation: { method: 'Straight-Line', life: 4, salvage: 20000, currentValue: 121250 },
    maintenanceLog: [
      { date: '2026-02-15', type: 'Software Update', description: 'BIOS update v1.50', cost: 0, by: 'IT Admin' },
    ],
    history: [
      { date: '2025-09-20', action: 'Assigned', details: 'Assigned to Kavya Nair', by: 'IT Admin' },
      { date: '2025-06-05', action: 'Received', details: 'Added to inventory', by: 'Procurement' },
    ],
    documents: [{ name: 'Purchase Invoice', type: 'PDF', size: '220 KB', date: '2025-06-01' }],
    notes: '', insurancePolicy: '', lastAuditDate: '2026-03-01',
  },
  {
    id: 'AST-006', name: 'Logitech MX Master 3S Mouse', category: 'Peripheral', subcategory: 'Input Device',
    brand: 'Logitech', model: '910-006556', serial: 'LG-MX3S-001', assetTag: 'BV-PER-001',
    purchaseDate: '2025-08-01', purchasePrice: 8995, vendor: 'Amazon Business',
    invoiceNo: 'INV-2025-0612', warrantyExpiry: '2027-08-01',
    status: 'IN_STOCK', condition: 'New',
    assignedTo: null, assignedDate: null, location: 'Warehouse — Rack A1',
    specs: { sensor: 'DarkField 8000 DPI', connectivity: 'Bluetooth, USB-C', battery: '70 days' },
    depreciation: { method: 'Straight-Line', life: 3, salvage: 500, currentValue: 6163 },
    maintenanceLog: [],
    history: [{ date: '2025-08-05', action: 'Received', details: 'Added to inventory', by: 'Procurement' }],
    documents: [], notes: '', insurancePolicy: '', lastAuditDate: '2026-03-01',
  },
  {
    id: 'AST-007', name: 'MacBook Air M2', category: 'Laptop', subcategory: 'Apple',
    brand: 'Apple', model: 'A2681', serial: 'C02Y1XYZABC12', assetTag: 'BV-LAP-007',
    purchaseDate: '2024-11-15', purchasePrice: 114900, vendor: 'Apple Store India',
    invoiceNo: 'INV-2024-1122', warrantyExpiry: '2025-11-15',
    status: 'UNDER_REPAIR', condition: 'Damaged',
    assignedTo: null, assignedDate: null, location: 'Apple Service Center, Kochi',
    specs: { processor: 'Apple M2', ram: '8 GB', storage: '256 GB SSD', display: '13.6" Liquid Retina' },
    depreciation: { method: 'Straight-Line', life: 4, salvage: 15000, currentValue: 78662 },
    maintenanceLog: [
      { date: '2026-04-10', type: 'Repair', description: 'Screen replacement — accidental damage (out of warranty)', cost: 18500, by: 'Apple Service Center' },
      { date: '2025-12-01', type: 'Software Update', description: 'macOS Sequoia clean install', cost: 0, by: 'IT Admin' },
    ],
    history: [
      { date: '2026-04-10', action: 'Sent for Repair', details: 'Screen damage — sent to service center', by: 'IT Admin' },
      { date: '2026-04-08', action: 'Returned', details: 'Returned by Megha Joshi (screen cracked)', by: 'IT Admin' },
      { date: '2025-01-15', action: 'Assigned', details: 'Assigned to Megha Joshi', by: 'IT Admin' },
      { date: '2024-11-20', action: 'Received', details: 'Added to inventory', by: 'Procurement' },
    ],
    documents: [
      { name: 'Purchase Invoice', type: 'PDF', size: '201 KB', date: '2024-11-15' },
      { name: 'Damage Report', type: 'PDF', size: '1.2 MB', date: '2026-04-08' },
      { name: 'Repair Estimate', type: 'PDF', size: '95 KB', date: '2026-04-10' },
    ],
    notes: 'Warranty expired. Repair cost approved by Finance.', insurancePolicy: '', lastAuditDate: '2026-03-01',
  },
  {
    id: 'AST-008', name: 'Samsung Galaxy Tab S9 FE', category: 'Tablet', subcategory: 'Samsung',
    brand: 'Samsung', model: 'SM-X510', serial: 'SM-TAB-S9-01FE', assetTag: 'BV-TAB-001',
    purchaseDate: '2025-12-20', purchasePrice: 44999, vendor: 'Samsung India',
    invoiceNo: 'INV-2025-1298', warrantyExpiry: '2026-12-20',
    status: 'ASSIGNED', condition: 'Good',
    assignedTo: { name: 'Arjun Desai', code: 'EMP-0009', dept: 'Sales' },
    assignedDate: '2026-01-10', location: 'Field — Arjun Desai',
    specs: { display: '10.9" TFT LCD', processor: 'Exynos 1380', storage: '128 GB', spen: 'Included' },
    depreciation: { method: 'Straight-Line', life: 3, salvage: 5000, currentValue: 40554 },
    maintenanceLog: [],
    history: [
      { date: '2026-01-10', action: 'Assigned', details: 'Assigned to Arjun Desai (Sales)', by: 'IT Admin' },
      { date: '2025-12-22', action: 'Received', details: 'Added to inventory', by: 'Procurement' },
    ],
    documents: [{ name: 'Purchase Invoice', type: 'PDF', size: '178 KB', date: '2025-12-20' }],
    notes: 'Used for field sales demos.', insurancePolicy: '', lastAuditDate: '2026-03-01',
  },
];

type Asset = any;

const categories = ['All', 'Laptop', 'Monitor', 'Mobile', 'Tablet', 'Furniture', 'Peripheral'];
const statusConfig: Record<string, { label: string; bg: string; color: string; icon: string }> = {
  ASSIGNED: { label: 'Assigned', bg: 'rgba(59,130,246,0.12)', color: 'var(--color-primary-400)', icon: '🔵' },
  IN_STOCK: { label: 'In Stock', bg: 'rgba(16,185,129,0.12)', color: 'var(--color-accent-400)', icon: '🟢' },
  UNDER_REPAIR: { label: 'Under Repair', bg: 'rgba(245,158,11,0.12)', color: 'var(--color-warning-400)', icon: '🟡' },
  RETIRED: { label: 'Retired', bg: 'var(--bg-tertiary)', color: 'var(--text-muted)', icon: '⚫' },
};
const conditionColors: Record<string, string> = { Excellent: 'var(--color-accent-400)', Good: 'var(--color-primary-400)', Fair: 'var(--color-warning-400)', Damaged: 'var(--color-danger-400)', New: '#a78bfa' };

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [catFilter, setCatFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [detailTab, setDetailTab] = useState<'overview' | 'specs' | 'history' | 'maintenance' | 'documents'>('overview');

  useEffect(() => {
    fetch('/api/assets').then(r => r.json()).then(d => { if (d.data?.length) setAssets(d.data.map((a: any) => ({ ...a, serial: a.serialNo || a.serial || '', assignedTo: a.assignedTo ? { name: `${a.assignedTo.firstName} ${a.assignedTo.lastName}`, code: a.assignedTo.employeeCode, dept: '' } : null, purchasePrice: a.value || 0, depreciation: { currentValue: a.value || 0 }, maintenanceLog: [], history: [], documents: [], specs: {} }))); }).catch(() => {});
  }, []);

  const filtered = assets.filter(a => {
    if (catFilter !== 'All' && a.category !== catFilter) return false;
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    if (search && !`${a.name} ${a.serial || ''} ${a.assetTag || ''} ${a.assignedTo?.name || ''}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalValue = assets.reduce((s, a) => s + (a.purchasePrice || a.value || 0), 0);
  const currentValue = assets.reduce((s, a) => s + (a.depreciation?.currentValue || a.value || 0), 0);
  const totalMaintCost = assets.reduce((s, a) => s + (a.maintenanceLog || []).reduce((ms: number, m: any) => ms + (m.cost || 0), 0), 0);

  const catBreakdown = categories.filter(c => c !== 'All').map(cat => ({
    label: cat,
    value: assets.filter(a => a.category === cat).length,
    color: { Laptop: 'var(--color-primary-500)', Monitor: 'var(--color-accent-500)', Mobile: 'var(--color-warning-500)', Tablet: '#8b5cf6', Furniture: 'var(--color-info-500)', Peripheral: 'var(--color-danger-400)' }[cat] || 'var(--text-muted)',
  })).filter(c => c.value > 0);

  const formatCurrency = (v: number) => '₹' + v.toLocaleString('en-IN');

  return (
    <div className={styles.page}>
      {/* ═══════ LIST VIEW ═══════ */}
      {!selectedAsset ? (
        <>
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>Asset Management</h1>
              <p className={styles.pageSubtitle}>Track, assign, and manage all company assets</p>
            </div>
            <div className={styles.headerActions}>
              <button className={styles.outlineBtn} onClick={() => toast("Action completed", "success")}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export
              </button>
              <button className={styles.addBtn} onClick={() => toast("Asset form ready", "info")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Asset
              </button>
            </div>
          </div>

          {/* Analytics Dashboard */}
          <div className={styles.analyticsGrid}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiIcon} style={{ background: 'rgba(59,130,246,0.1)' }}>📦</div>
              <div className={styles.kpiContent}>
                <span className={styles.kpiLabel}>Total Assets</span>
                <span className={styles.kpiValue}>{assets.length}</span>
                <span className={styles.kpiSub}>{assets.filter(a => a.status === 'ASSIGNED').length} assigned · {assets.filter(a => a.status === 'AVAILABLE' || a.status === 'IN_STOCK').length} available</span>
              </div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiIcon} style={{ background: 'rgba(16,185,129,0.1)' }}>💰</div>
              <div className={styles.kpiContent}>
                <span className={styles.kpiLabel}>Purchase Value</span>
                <span className={styles.kpiValue}>{formatCurrency(totalValue)}</span>
                <span className={styles.kpiSub}>Current: {formatCurrency(currentValue)}</span>
              </div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiIcon} style={{ background: 'rgba(245,158,11,0.1)' }}>🔧</div>
              <div className={styles.kpiContent}>
                <span className={styles.kpiLabel}>Maintenance Cost</span>
                <span className={styles.kpiValue}>{formatCurrency(totalMaintCost)}</span>
                <span className={styles.kpiSub}>This year</span>
              </div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiIcon} style={{ background: 'rgba(239,68,68,0.1)' }}>⚠️</div>
              <div className={styles.kpiContent}>
                <span className={styles.kpiLabel}>Warranty Expiring</span>
                <span className={styles.kpiValue}>{assets.filter(a => { if (!a.warrantyExpiry && !a.warrantyEnd) return false; const exp = new Date(a.warrantyExpiry || a.warrantyEnd); const now = new Date(); const diff = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24); return diff > 0 && diff < 90; }).length}</span>
                <span className={styles.kpiSub}>Within 90 days</span>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className={styles.chartsRow}>
            <div className={styles.chartCard}>
              <h3>Asset Distribution</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
                <DonutChart data={catBreakdown} size={120} thickness={16} centerValue={assets.length} centerLabel="Total" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {catBreakdown.map(d => (
                    <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-xs)' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-secondary)', minWidth: 70 }}>{d.label}</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{d.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.chartCard}>
              <h3>Monthly Procurement</h3>
              <BarChart data={[
                { label: 'Nov', value: 1, color: 'var(--color-primary-400)' },
                { label: 'Dec', value: 1, color: 'var(--color-primary-400)' },
                { label: 'Jan', value: 1, color: 'var(--color-primary-400)' },
                { label: 'Feb', value: 0, color: 'var(--color-primary-400)' },
                { label: 'Mar', value: 2, color: 'var(--color-accent-400)' },
                { label: 'Apr', value: 0, color: 'var(--color-accent-400)' },
              ]} height={90} />
            </div>
          </div>

          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input placeholder="Search by name, serial, tag, or assignee..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className={styles.filterGroup}>
              <div className={styles.catTabs}>
                {categories.map(c => <button key={c} className={styles.catTab} data-active={catFilter === c} onClick={() => setCatFilter(c)}>{c}</button>)}
              </div>
              <select className={styles.select} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="ALL">All Status</option>
                {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
              </select>
              <div className={styles.viewToggle}>
                <button data-active={viewMode === 'grid'} onClick={() => setViewMode('grid')} title="Grid view">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                </button>
                <button data-active={viewMode === 'table'} onClick={() => setViewMode('table')} title="Table view">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                </button>
              </div>
            </div>
          </div>

          <div className={styles.resultCount}>{filtered.length} of {assets.length} assets</div>

          {/* Grid View */}
          {viewMode === 'grid' ? (
            <div className={styles.assetGrid}>
              {filtered.map((asset, i) => {
                const ss = statusConfig[asset.status];
                const warrantyDays = Math.ceil((new Date(asset.warrantyExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={asset.id} className={styles.assetCard} style={{ animationDelay: `${i * 40}ms` }} onClick={() => { setSelectedAsset(asset); setDetailTab('overview'); }}>
                    <div className={styles.assetTop}>
                      <div>
                        <span className={styles.assetTag}>{asset.assetTag}</span>
                        <span className={styles.assetCat}>{asset.category}</span>
                      </div>
                      <span className={styles.assetStatus} style={{ background: ss.bg, color: ss.color }}>{ss.label}</span>
                    </div>
                    <h3 className={styles.assetName}>{asset.name}</h3>
                    <div className={styles.assetMeta}>
                      <span>🏷 {asset.brand} · {asset.model}</span>
                      <span>📎 {asset.serial}</span>
                    </div>
                    {asset.assignedTo ? (
                      <div className={styles.assignedTo}>
                        <div className={styles.assignAvatar}>{asset.assignedTo.name.split(' ').map((n: string) => n[0]).join('')}</div>
                        <div>
                          <span className={styles.assignName}>{asset.assignedTo.name}</span>
                          <span className={styles.assignDept}>{asset.assignedTo.dept} · Since {new Date(asset.assignedDate!).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.unassigned}>📍 {asset.location}</div>
                    )}
                    <div className={styles.assetFooter}>
                      <div>
                        <span className={styles.assetPrice}>{formatCurrency(asset.depreciation.currentValue)}</span>
                        <span className={styles.assetOriginal}>{formatCurrency(asset.purchasePrice)}</span>
                      </div>
                      <div className={styles.footerRight}>
                        <span className={styles.conditionBadge} style={{ color: conditionColors[asset.condition] }}>{asset.condition}</span>
                        {warrantyDays > 0 && warrantyDays < 90 && <span className={styles.warrantyWarn}>⚠️ {warrantyDays}d</span>}
                        {warrantyDays <= 0 && <span className={styles.warrantyExpired}>Expired</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Asset</th><th>Tag</th><th>Category</th><th>Assigned To</th><th>Status</th><th>Condition</th><th>Current Value</th><th>Warranty</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(asset => {
                    const ss = statusConfig[asset.status];
                    const warrantyDays = Math.ceil((new Date(asset.warrantyExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    return (
                      <tr key={asset.id} className={styles.tableRow} onClick={() => { setSelectedAsset(asset); setDetailTab('overview'); }}>
                        <td>
                          <div className={styles.tableAssetName}><strong>{asset.name}</strong><span>{asset.brand} · {asset.serial}</span></div>
                        </td>
                        <td><span className={styles.assetTag}>{asset.assetTag}</span></td>
                        <td>{asset.category}</td>
                        <td>{asset.assignedTo?.name || <span className={styles.textMuted}>Unassigned</span>}</td>
                        <td><span className={styles.assetStatus} style={{ background: ss.bg, color: ss.color }}>{ss.label}</span></td>
                        <td><span style={{ color: conditionColors[asset.condition] }}>{asset.condition}</span></td>
                        <td>{formatCurrency(asset.depreciation.currentValue)}</td>
                        <td>{warrantyDays > 0 ? <span style={{ color: warrantyDays < 90 ? 'var(--color-warning-400)' : 'var(--text-secondary)' }}>{warrantyDays}d left</span> : <span className={styles.warrantyExpired}>Expired</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        /* ═══════ DRILL-DOWN DETAIL VIEW ═══════ */
        <div className={styles.detailView}>
          <button className={styles.backBtn} onClick={() => setSelectedAsset(null)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            Back to Assets
          </button>

          {/* Asset Header */}
          <div className={styles.detailHeader}>
            <div className={styles.detailHeaderLeft}>
              <div className={styles.detailIcon}>📦</div>
              <div>
                <h1 className={styles.detailTitle}>{selectedAsset.name}</h1>
                <div className={styles.detailTagRow}>
                  <span className={styles.assetTag}>{selectedAsset.assetTag}</span>
                  <span className={styles.assetTag}>{selectedAsset.id}</span>
                  <span className={styles.assetStatus} style={{ background: statusConfig[selectedAsset.status].bg, color: statusConfig[selectedAsset.status].color }}>{statusConfig[selectedAsset.status].label}</span>
                  <span className={styles.conditionBadge} style={{ color: conditionColors[selectedAsset.condition] }}>{selectedAsset.condition}</span>
                </div>
              </div>
            </div>
            <div className={styles.detailActions}>
              <button className={styles.outlineBtn} onClick={() => toast("Action completed", "success")}>✏️ Edit</button>
              <button className={styles.outlineBtn} onClick={() => toast("Action completed", "success")}>🔄 Transfer</button>
              {selectedAsset.status === 'ASSIGNED' && <button className={styles.outlineBtn} style={{ color: 'var(--color-danger-400)' }} onClick={() => toast("Action completed", "success")}>↩️ Check In</button>}
              {selectedAsset.status === 'IN_STOCK' && <button className={styles.addBtn} onClick={() => toast("Asset form ready", "info")}>📤 Assign</button>}
            </div>
          </div>

          {/* Detail Tabs */}
          <div className={styles.detailTabs}>
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'specs', label: 'Specifications' },
              { key: 'history', label: `History (${selectedAsset.history.length})` },
              { key: 'maintenance', label: `Maintenance (${selectedAsset.maintenanceLog.length})` },
              { key: 'documents', label: `Documents (${selectedAsset.documents.length})` },
            ].map(t => (
              <button key={t.key} className={styles.detailTab} data-active={detailTab === t.key} onClick={() => setDetailTab(t.key as any)}>{t.label}</button>
            ))}
          </div>

          {/* ── Overview Tab ── */}
          {detailTab === 'overview' && (
            <div className={styles.overviewGrid}>
              <div className={styles.infoSection}>
                <h3>Asset Information</h3>
                <div className={styles.infoGrid}>
                  <div><label>Brand</label><span>{selectedAsset.brand}</span></div>
                  <div><label>Model</label><span>{selectedAsset.model}</span></div>
                  <div><label>Serial Number</label><span className={styles.mono}>{selectedAsset.serial}</span></div>
                  <div><label>Asset Tag</label><span className={styles.mono}>{selectedAsset.assetTag}</span></div>
                  <div><label>Category</label><span>{selectedAsset.category} / {selectedAsset.subcategory}</span></div>
                  <div><label>Location</label><span>{selectedAsset.location}</span></div>
                </div>
              </div>

              <div className={styles.infoSection}>
                <h3>Purchase & Warranty</h3>
                <div className={styles.infoGrid}>
                  <div><label>Purchase Date</label><span>{new Date(selectedAsset.purchaseDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
                  <div><label>Purchase Price</label><span className={styles.highlight}>{formatCurrency(selectedAsset.purchasePrice)}</span></div>
                  <div><label>Vendor</label><span>{selectedAsset.vendor}</span></div>
                  <div><label>Invoice No.</label><span className={styles.mono}>{selectedAsset.invoiceNo}</span></div>
                  <div><label>Warranty Expiry</label><span style={{ color: new Date(selectedAsset.warrantyExpiry) < new Date() ? 'var(--color-danger-400)' : 'var(--color-accent-400)' }}>{new Date(selectedAsset.warrantyExpiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
                  {selectedAsset.insurancePolicy && <div><label>Insurance</label><span className={styles.mono}>{selectedAsset.insurancePolicy}</span></div>}
                </div>
              </div>

              <div className={styles.infoSection}>
                <h3>Depreciation</h3>
                <div className={styles.infoGrid}>
                  <div><label>Method</label><span>{selectedAsset.depreciation.method}</span></div>
                  <div><label>Useful Life</label><span>{selectedAsset.depreciation.life} years</span></div>
                  <div><label>Salvage Value</label><span>{formatCurrency(selectedAsset.depreciation.salvage)}</span></div>
                  <div><label>Current Book Value</label><span className={styles.highlight}>{formatCurrency(selectedAsset.depreciation.currentValue)}</span></div>
                </div>
                <div className={styles.depreciationBar}>
                  <div className={styles.depTrack}>
                    <div className={styles.depFill} style={{ width: `${((selectedAsset.purchasePrice - selectedAsset.depreciation.currentValue) / (selectedAsset.purchasePrice - selectedAsset.depreciation.salvage)) * 100}%` }} />
                  </div>
                  <div className={styles.depLabels}>
                    <span>{formatCurrency(selectedAsset.purchasePrice)}</span>
                    <span style={{ color: 'var(--color-primary-400)', fontWeight: 700 }}>{formatCurrency(selectedAsset.depreciation.currentValue)}</span>
                    <span>{formatCurrency(selectedAsset.depreciation.salvage)}</span>
                  </div>
                </div>
              </div>

              {selectedAsset.assignedTo && (
                <div className={styles.infoSection}>
                  <h3>Current Assignment</h3>
                  <div className={styles.assignmentCard}>
                    <div className={styles.assignAvatar} style={{ width: 48, height: 48, fontSize: 16 }}>
                      {selectedAsset.assignedTo.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <span className={styles.assignName} style={{ fontSize: 'var(--text-md)' }}>{selectedAsset.assignedTo.name}</span>
                      <span className={styles.assignDept}>{selectedAsset.assignedTo.code} · {selectedAsset.assignedTo.dept}</span>
                      <span className={styles.assignDept}>Assigned: {new Date(selectedAsset.assignedDate!).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedAsset.notes && (
                <div className={styles.infoSection}>
                  <h3>Notes</h3>
                  <p className={styles.notesText}>{selectedAsset.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* ── Specifications Tab ── */}
          {detailTab === 'specs' && (
            <div className={styles.specsGrid}>
              {Object.entries(selectedAsset.specs || {}).map(([key, value]) => (
                <div key={key} className={styles.specItem}>
                  <label>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (s: string) => s.toUpperCase())}</label>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── History Tab ── */}
          {detailTab === 'history' && (
            <div className={styles.timeline}>
              {(selectedAsset.history || []).map((entry: any, i: number) => (
                <div key={i} className={styles.timelineItem} style={{ animationDelay: `${i * 60}ms` }}>
                  <div className={styles.timelineDot} data-action={entry.action.toLowerCase().replace(/ /g, '-')} />
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineHeader}>
                      <strong>{entry.action}</strong>
                      <span className={styles.timelineDate}>{new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <p>{entry.details}</p>
                    <span className={styles.timelineBy}>by {entry.by}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Maintenance Tab ── */}
          {detailTab === 'maintenance' && (
            <div>
              <div className={styles.sectionHeader}>
                <span>Maintenance & Repair Log</span>
                <button className={styles.outlineBtn} onClick={() => toast("Action completed", "success")}>+ Add Entry</button>
              </div>
              {selectedAsset.maintenanceLog.length > 0 ? (
                <div className={styles.maintList}>
                  {(selectedAsset.maintenanceLog || []).map((m: any, i: number) => (
                    <div key={i} className={styles.maintCard} style={{ animationDelay: `${i * 50}ms` }}>
                      <div className={styles.maintHeader}>
                        <span className={styles.maintType} data-type={m.type.toLowerCase()}>{m.type}</span>
                        <span>{new Date(m.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <p>{m.description}</p>
                      <div className={styles.maintFooter}>
                        <span>By: {m.by}</span>
                        {m.cost > 0 && <span className={styles.maintCost}>{formatCurrency(m.cost)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}><span style={{ fontSize: 40 }}>🔧</span><h3>No maintenance records</h3><p>All good! No repair or maintenance history.</p></div>
              )}
            </div>
          )}

          {/* ── Documents Tab ── */}
          {detailTab === 'documents' && (
            <div>
              <div className={styles.sectionHeader}>
                <span>Attached Documents</span>
                <button className={styles.outlineBtn} onClick={() => toast("Action completed", "success")}>+ Upload</button>
              </div>
              {selectedAsset.documents.length > 0 ? (
                <div className={styles.docList}>
                  {(selectedAsset.documents || []).map((doc: any, i: number) => (
                    <div key={i} className={styles.docItem} style={{ animationDelay: `${i * 50}ms` }}>
                      <div className={styles.docIcon}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                      <div className={styles.docInfo}>
                        <span className={styles.docName}>{doc.name}</span>
                        <span className={styles.docMeta}>{doc.type} · {doc.size} · {new Date(doc.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <button className={styles.docDownload} onClick={() => toast("Action completed", "success")}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}><span style={{ fontSize: 40 }}>📁</span><h3>No documents</h3><p>Upload invoices, warranty cards, or other related files.</p></div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
