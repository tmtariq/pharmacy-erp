import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import {
  Pill, Plus, Calendar, Search, Edit, Trash2, QrCode, Barcode,
  ChevronDown, ChevronRight, Image as ImageIcon, ShieldAlert,
  Tag, Truck, Box, Check, AlertCircle, Info, ExternalLink
} from 'lucide-react';
import { Button, Input, Select, Badge, StatusDot, Modal, DataTable, Skeleton, Card, useToast } from '../components/ui';

const Inventory = () => {
  const { user, activeBranchId } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('medicines');
  const [medicines, setMedicines] = useState([]);
  const [batches, setBatches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Expandable batch view per medicine
  const [expandedMedId, setExpandedMedId] = useState(null);

  // Barcode & QR Code Modal
  const [qrModalData, setQrModalData] = useState(null);

  // Image Modal
  const [imageModalUrl, setImageModalUrl] = useState(null);

  // Modals & Editing State
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [editingMedId, setEditingMedId] = useState(null);
  const [editingBatchId, setEditingBatchId] = useState(null);

  const isOwnerOrAdmin = ['Owner', 'Admin', 'SuperAdmin'].includes(user?.role);
  const canAddOrEditMedicine = ['Owner', 'Admin', 'SuperAdmin', 'Branch Manager', 'BranchManager', 'Pharmacist'].includes(user?.role);

  // Complete Medicine Form State (24 required fields!)
  const [medForm, setMedForm] = useState({
    name: '',
    genericName: '',
    brandName: '',
    manufacturer: '',
    sku: '',
    barcode: '',
    category: '',
    supplier: '',
    unit: 'Strip',
    strength: '500mg',
    dosageForm: 'Tablet',
    packSize: '10s',
    costPrice: 5.00,
    unitPrice: 10.00,
    defaultDiscount: 0,
    taxRate: 5,
    minStock: 10,
    maxStock: 500,
    rxRequired: false,
    storageInstructions: 'Store in a cool, dry place below 25°C.',
    sideNotes: '',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300'
  });

  // Batch Form State
  const [batchForm, setBatchForm] = useState({
    medicineId: '',
    batchNumber: '',
    manufacturingDate: '',
    expiryDate: '',
    costPrice: 5.00,
    sellingPrice: 10.00,
    mrp: 12.00,
    discount: 0,
    quantity: 100,
    rackNumber: 'Rack A-1',
    supplierId: ''
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      if (activeTab === 'medicines') {
        const res = await API.get('/inventory/medicines');
        setMedicines(res.data || []);
      } else if (activeTab === 'batches') {
        const res = await API.get('/inventory/batches');
        setBatches(res.data || []);
      }
      const catRes = await API.get('/inventory/categories');
      setCategories(catRes.data || []);

      const supRes = await API.get('/inventory/suppliers');
      setSuppliers(supRes.data || []);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
      toast.error('Failed to load inventory records.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, toast]);

  useEffect(() => {
    fetchData();
  }, [activeBranchId, activeTab, fetchData]);

  // Medicine Save / Edit Handler
  const handleSaveMedicine = async (e) => {
    e.preventDefault();
    try {
      if (editingMedId) {
        await API.put(`/inventory/medicines/${editingMedId}`, medForm);
        toast.success(`Updated "${medForm.name}" medicine profile`);
      } else {
        await API.post('/inventory/medicines', medForm);
        toast.success(`Created new medicine "${medForm.name}"`);
      }
      setShowAddMedModal(false);
      setEditingMedId(null);
      resetMedForm();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save medicine');
    }
  };

  const handleEditClick = (med) => {
    setEditingMedId(med._id);
    setMedForm({
      name: med.name || '',
      genericName: med.genericName || '',
      brandName: med.brandName || '',
      manufacturer: med.manufacturer || '',
      sku: med.sku || '',
      barcode: med.barcode || '',
      category: med.category?._id || med.category || '',
      supplier: med.supplier?._id || med.supplier || '',
      unit: med.unit || 'Strip',
      strength: med.strength || '',
      dosageForm: med.dosageForm || 'Tablet',
      packSize: med.packSize || '10s',
      costPrice: med.costPrice || 0,
      unitPrice: med.unitPrice || 0,
      defaultDiscount: med.defaultDiscount || 0,
      taxRate: med.taxRate || 0,
      minStock: med.minStock || 10,
      maxStock: med.maxStock || 500,
      rxRequired: med.rxRequired || false,
      storageInstructions: med.storageInstructions || 'Store below 25°C',
      sideNotes: med.sideNotes || '',
      imageUrl: med.imageUrl || ''
    });
    setShowAddMedModal(true);
  };

  const handleDeleteMedicine = async (medId, medName) => {
    const confirmed = await toast.confirm({
      title: 'Delete Medicine',
      message: `Are you sure you want to delete "${medName}" and all associated batches?`,
      confirmText: 'Delete Medicine',
      variant: 'danger'
    });
    if (!confirmed) return;

    try {
      await API.delete(`/inventory/medicines/${medId}`);
      toast.success(`Deleted medicine "${medName}"`);
      if (editingMedId) {
        setShowAddMedModal(false);
        setEditingMedId(null);
        resetMedForm();
      }
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete medicine');
    }
  };

  // Batch Save / Edit / Delete Handlers
  const handleSaveBatch = async (e) => {
    e.preventDefault();
    try {
      if (editingBatchId) {
        await API.put(`/inventory/batches/${editingBatchId}`, batchForm);
        toast.success(`Updated Batch "${batchForm.batchNumber}"`);
      } else {
        await API.post('/inventory/batches', batchForm);
        toast.success(`Added new Batch "${batchForm.batchNumber}"`);
      }
      setShowAddBatchModal(false);
      setEditingBatchId(null);
      resetBatchForm();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save batch');
    }
  };

  const handleEditBatchClick = (batch) => {
    setEditingBatchId(batch._id);
    setBatchForm({
      medicineId: batch.medicine?._id || batch.medicine || '',
      batchNumber: batch.batchNumber || '',
      manufacturingDate: batch.manufacturingDate ? new Date(batch.manufacturingDate).toISOString().slice(0, 10) : '',
      expiryDate: batch.expiryDate ? new Date(batch.expiryDate).toISOString().slice(0, 10) : '',
      costPrice: batch.costPrice || 0,
      sellingPrice: batch.sellingPrice || 0,
      mrp: batch.mrp || batch.sellingPrice || 0,
      discount: batch.discount || 0,
      quantity: batch.quantity || 0,
      rackNumber: batch.rackNumber || '',
      supplierId: batch.supplier?._id || batch.supplier || ''
    });
    setShowAddBatchModal(true);
  };

  const handleDeleteBatch = async (batchId, batchNumber) => {
    const confirmed = await toast.confirm({
      title: 'Delete Batch',
      message: `Are you sure you want to delete Batch "${batchNumber}"?`,
      confirmText: 'Delete Batch',
      variant: 'danger'
    });
    if (!confirmed) return;

    try {
      await API.delete(`/inventory/batches/${batchId}`);
      toast.success(`Deleted batch "${batchNumber}"`);
      if (editingBatchId) {
        setShowAddBatchModal(false);
        setEditingBatchId(null);
        resetBatchForm();
      }
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete batch');
    }
  };

  const resetMedForm = () => {
    setMedForm({
      name: '',
      genericName: '',
      brandName: '',
      manufacturer: '',
      sku: '',
      barcode: '',
      category: '',
      supplier: '',
      unit: 'Strip',
      strength: '500mg',
      dosageForm: 'Tablet',
      packSize: '10s',
      costPrice: 5.00,
      unitPrice: 10.00,
      defaultDiscount: 0,
      taxRate: 5,
      minStock: 10,
      maxStock: 500,
      rxRequired: false,
      storageInstructions: 'Store in a cool, dry place below 25°C.',
      sideNotes: '',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300'
    });
  };

  const resetBatchForm = () => {
    setBatchForm({
      medicineId: '',
      batchNumber: '',
      manufacturingDate: '',
      expiryDate: '',
      costPrice: 5.00,
      sellingPrice: 10.00,
      mrp: 12.00,
      discount: 0,
      quantity: 100,
      rackNumber: 'Rack A-1',
      supplierId: ''
    });
  };

  const filteredMedicines = medicines.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.genericName && m.genericName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (m.brandName && m.brandName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    m.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBatches = batches.filter(b =>
    b.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.medicine?.name && b.medicine.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (b.rackNumber && b.rackNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // DataTable columns for Medicine Catalog
  const medicineColumns = [
    {
      header: '',
      key: 'expand',
      className: 'w-10 text-center',
      render: (med) => {
        const isExpanded = expandedMedId === med._id;
        return (
          <Button
            variant="ghost"
            size="sm"
            className="p-1 text-slate-400 hover:text-blue-400"
            onClick={(e) => {
              e.stopPropagation();
              setExpandedMedId(isExpanded ? null : med._id);
            }}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        );
      }
    },
    {
      header: 'Medicine & Image',
      key: 'medicine',
      render: (med) => (
        <div className="flex items-center space-x-3">
          {med.imageUrl ? (
            <img
              src={med.imageUrl}
              alt={med.name}
              onClick={(e) => { e.stopPropagation(); setImageModalUrl(med.imageUrl); }}
              className="w-9 h-9 rounded-lg object-cover border border-slate-700 cursor-pointer hover:opacity-80 transition-all shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 shrink-0">
              <Pill className="w-5 h-5" />
            </div>
          )}

          <div>
            <div className="font-bold text-white text-sm flex items-center gap-1.5">
              {med.name}
              {med.rxRequired && (
                <Badge variant="danger" size="sm">Rx</Badge>
              )}
            </div>
            <div className="text-[11px] text-slate-400 font-normal">
              Generic: {med.genericName || 'N/A'} · {med.dosageForm} ({med.strength})
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Brand / Manufacturer',
      key: 'brand',
      render: (med) => (
        <div>
          <div className="font-semibold text-slate-200">{med.brandName || med.name}</div>
          <div className="text-[10px] text-slate-400">{med.manufacturer || 'PharmaCorp'}</div>
        </div>
      )
    },
    {
      header: 'SKU / Codes',
      key: 'sku',
      render: (med) => (
        <div>
          <div className="font-mono text-blue-400 font-semibold text-xs">{med.sku}</div>
          <div className="flex items-center gap-2 mt-1">
            <Button
              variant="outline"
              size="sm"
              leftIcon={Barcode}
              onClick={(e) => {
                e.stopPropagation();
                setQrModalData({ type: 'barcode', title: med.name, code: med.barcode || med.sku });
              }}
              className="text-[10px] py-0.5 px-1.5 text-amber-400 border-slate-700"
            >
              Barcode
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={QrCode}
              onClick={(e) => {
                e.stopPropagation();
                setQrModalData({ type: 'qr', title: med.name, code: med.qrCodeData || med.sku });
              }}
              className="text-[10px] py-0.5 px-1.5 text-emerald-400 border-slate-700"
            >
              QR Code
            </Button>
          </div>
        </div>
      )
    },
    {
      header: 'Category',
      key: 'category',
      render: (med) => (
        <Badge variant="neutral" size="sm">{med.category?.name || 'General'}</Badge>
      )
    },
    {
      header: 'Cost / Selling Price',
      key: 'price',
      render: (med) => (
        <div>
          <div className="font-bold text-emerald-400">${med.unitPrice?.toFixed(2)} / {med.unit}</div>
          <div className="text-[10px] text-slate-400">Cost: ${med.costPrice?.toFixed(2) || '0.00'}</div>
        </div>
      )
    },
    {
      header: 'Total Stock (Batches)',
      key: 'stock',
      className: 'text-center',
      render: (med) => {
        const stockVariant = med.stockQty > (med.minStock || 10) ? 'success' : med.stockQty > 0 ? 'warning' : 'danger';
        return (
          <div className="inline-flex flex-col items-center justify-center">
            <Badge variant={stockVariant} size="md" dot pulse={med.stockQty <= 0}>
              {med.stockQty || 0} {med.unit}s
            </Badge>
            <span className="text-[10px] text-slate-400 mt-1 whitespace-nowrap">
              ({med.activeBatchesCount || 0} active {med.activeBatchesCount === 1 ? 'batch' : 'batches'})
            </span>
          </div>
        );
      }
    },
    {
      header: 'Actions',
      key: 'actions',
      className: 'text-right',
      render: (med) => (
        <div className="flex items-center justify-end space-x-2">
          {isOwnerOrAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleEditClick(med);
              }}
              title="Edit Medicine"
            >
              <Edit className="w-4 h-4 text-blue-400" />
            </Button>
          )}
        </div>
      )
    }
  ];

  // Render expanded batch details sub-row
  const renderExpandedRow = (med) => {
    if (expandedMedId !== med._id) return null;
    return (
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-blue-400">
          <span>Multi-Batch Breakdown for {med.name}:</span>
          <span>Storage Instructions: {med.storageInstructions || 'Keep below 25°C'}</span>
        </div>

        {med.batches && med.batches.length > 0 ? (
          <div className="max-h-60 overflow-y-auto pr-1 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {med.batches.map((b) => (
                <div key={b._id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs space-y-2">
                  <div className="flex justify-between font-mono font-bold text-amber-400">
                    <span>Batch: {b.batchNumber}</span>
                    <span className="text-white">{b.quantity} {med.unit}s</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Exp: {new Date(b.expiryDate).toLocaleDateString()}</span>
                    <span>Rack: {b.rackNumber || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-400 font-semibold pt-1 border-t border-slate-800">
                    <span>Selling: ${b.sellingPrice?.toFixed(2)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 text-blue-400"
                      onClick={() => handleEditBatchClick(b)}
                      title="Edit Batch"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-500 italic py-2">
            No active batches registered for this medicine. Click "Add Batch Stock" to add inventory.
          </div>
        )}
      </div>
    );
  };

  // DataTable columns for All Active Batches
  const batchColumns = [
    {
      header: 'Batch Number',
      key: 'batchNumber',
      render: (batch) => <span className="font-mono font-bold text-amber-400">{batch.batchNumber}</span>
    },
    {
      header: 'Medicine',
      key: 'medicine',
      render: (batch) => <span className="font-semibold text-white">{batch.medicine?.name}</span>
    },
    {
      header: 'Expiry Date (FEFO)',
      key: 'expiryDate',
      render: (batch) => {
        const isNearExpiry = new Date(batch.expiryDate) < new Date(Date.now() + 60*24*60*60*1000);
        return (
          <span className={`font-mono ${isNearExpiry ? 'text-red-400 font-bold' : 'text-slate-300'}`}>
            {new Date(batch.expiryDate).toLocaleDateString()}
          </span>
        );
      }
    },
    {
      header: 'Mfg Date',
      key: 'mfgDate',
      render: (batch) => (
        <span className="text-slate-400 font-mono">
          {batch.manufacturingDate ? new Date(batch.manufacturingDate).toLocaleDateString() : '-'}
        </span>
      )
    },
    {
      header: 'Cost Price',
      key: 'costPrice',
      render: (batch) => `$${batch.costPrice?.toFixed(2)}`
    },
    {
      header: 'Selling Price',
      key: 'sellingPrice',
      render: (batch) => <span className="font-bold text-emerald-400">${batch.sellingPrice?.toFixed(2)}</span>
    },
    {
      header: 'Qty',
      key: 'quantity',
      render: (batch) => <span className="font-bold text-white font-mono">{batch.quantity}</span>
    },
    {
      header: 'Rack #',
      key: 'rackNumber',
      render: (batch) => <span className="text-slate-400">{batch.rackNumber || '-'}</span>
    },
    {
      header: 'Status',
      key: 'status',
      render: (batch) => (
        <Badge variant={batch.status === 'active' ? 'success' : 'neutral'} size="sm">
          {batch.status}
        </Badge>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      className: 'text-right',
      render: (batch) => (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditBatchClick(batch)}
            title="Edit Batch Values"
          >
            <Edit className="w-4 h-4 text-blue-400" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">

      {/* Top Header */}
      <Card variant="glass" className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Pill className="w-6 h-6 text-blue-400" />
            Medicine Management & FEFO Multi-Batch Control
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage pharmaceutical catalog, pricing, SKU codes, and FEFO expiry batch allocations.</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {canAddOrEditMedicine && (
            <Button
              variant="primary"
              size="md"
              leftIcon={Plus}
              onClick={() => {
                setEditingMedId(null);
                resetMedForm();
                setShowAddMedModal(true);
              }}
            >
              Add New Medicine
            </Button>
          )}
          <Button
            variant="accent"
            size="md"
            leftIcon={Plus}
            onClick={() => {
              setEditingBatchId(null);
              resetBatchForm();
              setShowAddBatchModal(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-500"
          >
            Add Batch Stock
          </Button>
        </div>
      </Card>

      {/* Tabs & Search Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('medicines')}
            className={`pb-2 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'medicines' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Pill className="w-4 h-4" /> Medicine Catalog ({medicines.length})
          </button>
          <button
            onClick={() => setActiveTab('batches')}
            className={`pb-2 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'batches' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" /> All Active Batches ({batches.length})
          </button>
        </div>

        <div className="w-full md:w-72">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Medicine, Brand, Generic, SKU, Batch..."
            leftIcon={Search}
            size="sm"
          />
        </div>
      </div>

      {/* MEDICINES CATALOG TAB */}
      {activeTab === 'medicines' && (
        <DataTable
          columns={medicineColumns}
          data={filteredMedicines}
          loading={loading}
          searchable={false}
          pagination
          pageSize={10}
          emptyMessage="No medicines found in catalog."
          renderExpandedRow={renderExpandedRow}
        />
      )}

      {/* ALL BATCHES TAB */}
      {activeTab === 'batches' && (
        <DataTable
          columns={batchColumns}
          data={filteredBatches}
          loading={loading}
          searchable={false}
          pagination
          pageSize={10}
          emptyMessage="No stock batches found."
        />
      )}

      {/* CREATE / EDIT MEDICINE MODAL */}
      <Modal
        isOpen={showAddMedModal}
        onClose={() => setShowAddMedModal(false)}
        title={editingMedId ? 'Edit Medicine Profile' : 'Create New Pharmaceutical Product'}
        size="lg"
        footer={
          <div className="flex justify-between items-center w-full">
            {editingMedId && isOwnerOrAdmin ? (
              <Button
                variant="danger"
                size="sm"
                leftIcon={Trash2}
                onClick={() => handleDeleteMedicine(editingMedId, medForm.name)}
              >
                Delete Medicine
              </Button>
            ) : <div />}

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAddMedModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" onClick={handleSaveMedicine}>
                {editingMedId ? 'Update Medicine Profile' : 'Save Medicine'}
              </Button>
            </div>
          </div>
        }
      >
        <form onSubmit={handleSaveMedicine} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Medicine Name *"
              required
              value={medForm.name}
              onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
              placeholder="Amoxicillin Trihydrate"
            />
            <Input
              label="Generic Name"
              value={medForm.genericName}
              onChange={(e) => setMedForm({ ...medForm, genericName: e.target.value })}
              placeholder="Amoxicillin"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Brand Name"
              value={medForm.brandName}
              onChange={(e) => setMedForm({ ...medForm, brandName: e.target.value })}
              placeholder="Amoxil Extra"
            />
            <Input
              label="Manufacturer"
              value={medForm.manufacturer}
              onChange={(e) => setMedForm({ ...medForm, manufacturer: e.target.value })}
              placeholder="Pfizer / Novartis / Sun Pharma"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select
              label="Category *"
              required
              value={medForm.category}
              onChange={(e) => setMedForm({ ...medForm, category: e.target.value })}
              options={[
                { value: '', label: 'Select Category' },
                ...(categories.length > 0 ? categories.map(c => ({ value: c._id || c.id || c.name, label: c.name })) : [
                  { value: 'Tablets & Oral Solid Dosage', label: 'Tablets & Oral Solid Dosage' },
                  { value: 'Capsules & Softgels', label: 'Capsules & Softgels' },
                  { value: 'Syrups, Liquids & Suspensions', label: 'Syrups, Liquids & Suspensions' },
                  { value: 'Injections, IV Solutions & Ampoules', label: 'Injections, IV Solutions & Ampoules' },
                  { value: 'Eye, Ear & Nasal Drops', label: 'Eye, Ear & Nasal Drops' },
                  { value: 'Creams, Ointments & Topical Gels', label: 'Creams, Ointments & Topical Gels' },
                  { value: 'Antibiotics & Anti-Infectives', label: 'Antibiotics & Anti-Infectives' },
                  { value: 'Cardiovascular & Anti-Hypertensive', label: 'Cardiovascular & Anti-Hypertensive' },
                  { value: 'Diabetes & Endocrine Care', label: 'Diabetes & Endocrine Care' },
                  { value: 'Pain Relief & Anti-Inflammatory', label: 'Pain Relief & Anti-Inflammatory' },
                  { value: 'Vitamins, Minerals & Health Supplements', label: 'Vitamins, Minerals & Health Supplements' },
                  { value: 'Pediatric & Baby Healthcare', label: 'Pediatric & Baby Healthcare' },
                  { value: 'Surgical Items & First Aid Dressings', label: 'Surgical Items & First Aid Dressings' },
                  { value: 'Medical Devices, Meters & Equipment', label: 'Medical Devices, Meters & Equipment' },
                  { value: 'Respiratory & Asthma Inhalers', label: 'Respiratory & Asthma Inhalers' },
                  { value: 'Personal Hygiene & Dermatology', label: 'Personal Hygiene & Dermatology' }
                ])
              ]}
            />
            <Select
              label="Preferred Supplier"
              value={medForm.supplier}
              onChange={(e) => setMedForm({ ...medForm, supplier: e.target.value })}
              options={[
                { value: '', label: 'Select Supplier' },
                ...(suppliers.length > 0 ? suppliers.map(s => ({ value: s._id || s.id || s.name, label: s.company || s.name })) : [
                  { value: 'Global Pharma Corp', label: 'Global Pharma Corp' },
                  { value: 'MedCare Wholesalers', label: 'MedCare Wholesalers' },
                  { value: 'Sun Pharma Distribution', label: 'Sun Pharma Distribution' }
                ])
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              label="SKU Code *"
              required
              value={medForm.sku}
              onChange={(e) => setMedForm({ ...medForm, sku: e.target.value.toUpperCase() })}
              placeholder="AMX-500"
            />
            <Input
              label="Barcode"
              value={medForm.barcode}
              onChange={(e) => setMedForm({ ...medForm, barcode: e.target.value })}
              placeholder="8901234567890"
            />
            <Select
              label="Unit"
              value={medForm.unit}
              onChange={(e) => setMedForm({ ...medForm, unit: e.target.value })}
              options={[
                { value: 'Strip', label: 'Strip' },
                { value: 'Box', label: 'Box' },
                { value: 'Bottle', label: 'Bottle' },
                { value: 'Vial', label: 'Vial' },
                { value: 'Tablet', label: 'Tablet' },
                { value: 'Ampoule', label: 'Ampoule' }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              label="Cost Price ($)"
              type="number"
              step="0.01"
              value={medForm.costPrice}
              onChange={(e) => setMedForm({ ...medForm, costPrice: Number(e.target.value) })}
            />
            <Input
              label="Selling Price ($)"
              type="number"
              step="0.01"
              value={medForm.unitPrice}
              onChange={(e) => setMedForm({ ...medForm, unitPrice: Number(e.target.value) })}
            />
            <Input
              label="Tax Rate (%)"
              type="number"
              value={medForm.taxRate}
              onChange={(e) => setMedForm({ ...medForm, taxRate: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Min Stock (Reorder Alert)"
              type="number"
              value={medForm.minStock}
              onChange={(e) => setMedForm({ ...medForm, minStock: Number(e.target.value) })}
            />
            <Input
              label="Max Stock Capacity"
              type="number"
              value={medForm.maxStock}
              onChange={(e) => setMedForm({ ...medForm, maxStock: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Storage Instructions"
              value={medForm.storageInstructions}
              onChange={(e) => setMedForm({ ...medForm, storageInstructions: e.target.value })}
              placeholder="Store below 25°C"
            />
            <Input
              label="Medicine Image URL"
              value={medForm.imageUrl}
              onChange={(e) => setMedForm({ ...medForm, imageUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="rxReq"
              checked={medForm.rxRequired}
              onChange={(e) => setMedForm({ ...medForm, rxRequired: e.target.checked })}
              className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-accent"
            />
            <label htmlFor="rxReq" className="text-slate-300 font-semibold cursor-pointer">
              Prescription Required (Rx)
            </label>
          </div>
        </form>
      </Modal>

      {/* CREATE / EDIT BATCH MODAL */}
      <Modal
        isOpen={showAddBatchModal}
        onClose={() => setShowAddBatchModal(false)}
        title={editingBatchId ? 'Edit Stock Batch Details' : 'Add Stock Batch (FEFO Expiry Control)'}
        size="md"
        footer={
          <div className="flex justify-between items-center w-full">
            {editingBatchId && isOwnerOrAdmin ? (
              <Button
                variant="danger"
                size="sm"
                leftIcon={Trash2}
                onClick={() => handleDeleteBatch(editingBatchId, batchForm.batchNumber)}
              >
                Delete Batch
              </Button>
            ) : <div />}

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAddBatchModal(false)}>
                Cancel
              </Button>
              <Button variant="accent" size="sm" type="submit" onClick={handleSaveBatch} className="bg-emerald-600 hover:bg-emerald-500">
                {editingBatchId ? 'Update Batch Values' : 'Save Batch Stock'}
              </Button>
            </div>
          </div>
        }
      >
        <form onSubmit={handleSaveBatch} className="space-y-3 text-xs">
          <Select
            label="Select Medicine *"
            required
            value={batchForm.medicineId}
            onChange={(e) => setBatchForm({ ...batchForm, medicineId: e.target.value })}
            options={[
              { value: '', label: 'Select Medicine' },
              ...medicines.map(m => ({ value: m._id, label: `${m.name} (${m.sku})` }))
            ]}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Batch Number *"
              required
              value={batchForm.batchNumber}
              onChange={(e) => setBatchForm({ ...batchForm, batchNumber: e.target.value.toUpperCase() })}
              placeholder="BT-AMX-99"
            />
            <Input
              label="Rack Number"
              value={batchForm.rackNumber}
              onChange={(e) => setBatchForm({ ...batchForm, rackNumber: e.target.value })}
              placeholder="Rack A-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Manufacturing Date"
              type="date"
              value={batchForm.manufacturingDate}
              onChange={(e) => setBatchForm({ ...batchForm, manufacturingDate: e.target.value })}
            />
            <Input
              label="Expiry Date (FEFO) *"
              type="date"
              required
              value={batchForm.expiryDate}
              onChange={(e) => setBatchForm({ ...batchForm, expiryDate: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Cost Price ($)"
              type="number"
              step="0.01"
              value={batchForm.costPrice}
              onChange={(e) => setBatchForm({ ...batchForm, costPrice: Number(e.target.value) })}
            />
            <Input
              label="Selling Price ($)"
              type="number"
              step="0.01"
              value={batchForm.sellingPrice}
              onChange={(e) => setBatchForm({ ...batchForm, sellingPrice: Number(e.target.value) })}
            />
            <Input
              label="Quantity *"
              type="number"
              min="0"
              value={batchForm.quantity}
              onChange={(e) => setBatchForm({ ...batchForm, quantity: Number(e.target.value) })}
            />
          </div>
        </form>
      </Modal>

      {/* BARCODE / QR CODE GENERATOR PREVIEW MODAL */}
      <Modal
        isOpen={!!qrModalData}
        onClose={() => setQrModalData(null)}
        title={qrModalData?.title || ''}
        size="sm"
        footer={
          <Button variant="secondary" size="sm" fullWidth onClick={() => setQrModalData(null)}>
            Close
          </Button>
        }
      >
        {qrModalData && (
          <div className="space-y-3 text-center">
            <p className="text-xs text-slate-400">Generated {qrModalData.type.toUpperCase()} Code</p>

            <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-slate-900 font-mono text-xs">
              {qrModalData.type === 'barcode' ? (
                <div className="space-y-1">
                  <div className="h-16 flex items-center justify-center space-x-1">
                    {[2,1,3,1,2,4,1,2,1,3,1,2,1,4,2,1,3].map((w, i) => (
                      <span key={i} className="bg-black inline-block h-14" style={{ width: `${w * 2}px` }} />
                    ))}
                  </div>
                  <div className="font-bold text-sm tracking-widest">{qrModalData.code}</div>
                </div>
              ) : (
                <div className="space-y-2 flex flex-col items-center">
                  <div className="w-32 h-32 bg-slate-950 p-2 rounded flex flex-wrap gap-1 justify-center items-center">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <span key={i} className={`w-4 h-4 rounded-xs ${i % 2 === 0 || i % 5 === 0 ? 'bg-white' : 'bg-slate-950'}`} />
                    ))}
                  </div>
                  <div className="text-[10px] text-slate-600 truncate max-w-xs">{qrModalData.code}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* MEDICINE IMAGE PREVIEW MODAL */}
      <Modal
        isOpen={!!imageModalUrl}
        onClose={() => setImageModalUrl(null)}
        title="Medicine Image Preview"
        size="sm"
        footer={
          <Button variant="secondary" size="sm" fullWidth onClick={() => setImageModalUrl(null)}>
            Close Preview
          </Button>
        }
      >
        {imageModalUrl && (
          <div className="text-center space-y-3">
            <img src={imageModalUrl} alt="Medicine Preview" className="w-full h-64 object-cover rounded-xl border border-slate-800" />
          </div>
        )}
      </Modal>

    </div>
  );
};

export default Inventory;
