import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import {
  ShoppingCart, Search, Barcode, Trash2, Plus, Minus, CheckCircle,
  Printer, User, Phone, Stethoscope, FileText, QrCode, Building2,
  DollarSign, CreditCard, Landmark, Smartphone, ShieldCheck, Award,
  Sparkles, X
} from 'lucide-react';
import { Button, Input, Select, Badge, StatusDot, Modal, Card, useToast } from '../components/ui';

const POSBilling = () => {
  const { user, activeBranchId, branches } = useAuth();
  const toast = useToast();
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const cartContainerRef = useRef(null);

  // Mobile Tab State ('catalog' | 'cart')
  const [mobileTab, setMobileTab] = useState('catalog');

  // Customer & Prescription Info
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [prescriptionNumber, setPrescriptionNumber] = useState('');
  const [prescriptionUrl] = useState('');

  // Discount, Tax & Loyalty Points
  const [discountAmount, setDiscountAmount] = useState(0);
  const [redeemLoyalty] = useState(false);

  // Payment Method: 'cash', 'card', 'bank_transfer', 'jazzcash', 'easypaisa', 'credit_account'
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // Checkout State & Thermal Invoice Print Modal
  const [loading, setLoading] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);

  const activeBranch = branches.find(b => b._id === activeBranchId) || user?.branch;

  // Auto-scroll cart list to bottom whenever a medicine is added frequently
  useEffect(() => {
    if (cartContainerRef.current) {
      cartContainerRef.current.scrollTo({
        top: cartContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [cart.length]);

  const fetchMedicines = useCallback(async () => {
    try {
      const res = await API.get('/inventory/medicines');
      setMedicines(res.data || []);
    } catch (err) {
      console.error('Failed to load inventory for POS:', err);
      toast.error('Failed to load medicine inventory.');
    }
  }, [toast]);

  useEffect(() => {
    fetchMedicines();
  }, [activeBranchId, fetchMedicines]);

  const addToCart = (med) => {
    if (med.stockQty <= 0) {
      toast.warning(`"${med.name}" is currently out of stock.`);
      return;
    }

    const existingIndex = cart.findIndex((item) => item.medicineId === med._id);
    if (existingIndex > -1) {
      const updatedCart = [...cart];
      if (updatedCart[existingIndex].quantity + 1 > med.stockQty) {
        toast.warning(`Cannot exceed available stock of ${med.stockQty} ${med.unit}s.`);
        return;
      }
      updatedCart[existingIndex].quantity += 1;
      setCart(updatedCart);
      toast.info(`Updated quantity for ${med.name}`);
    } else {
      setCart([
        ...cart,
        {
          medicineId: med._id,
          name: med.name,
          sku: med.sku,
          unitPrice: med.unitPrice,
          taxRate: med.taxRate || 0,
          unit: med.unit || 'Strip',
          stockQty: med.stockQty,
          quantity: 1
        }
      ]);
      toast.success(`Added ${med.name} to cart`);
    }
  };

  const updateQuantity = (index, delta) => {
    const updated = [...cart];
    const newQty = updated[index].quantity + delta;

    if (newQty <= 0) {
      const removedItem = updated[index].name;
      updated.splice(index, 1);
      setCart(updated);
      toast.info(`Removed ${removedItem} from cart`);
    } else if (newQty > updated[index].stockQty) {
      toast.warning(`Cannot exceed available stock of ${updated[index].stockQty}.`);
    } else {
      updated[index].quantity = newQty;
      setCart(updated);
    }
  };

  const calculateSubtotal = () => cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  const calculateTax = () => {
    return cart.reduce((acc, item) => {
      const lineSubtotal = item.unitPrice * item.quantity;
      return acc + lineSubtotal * (item.taxRate / 100);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const tax = calculateTax();
  const grandTotal = Math.max(0, subtotal + tax - discountAmount);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.warning('Cart is empty. Select medicines to proceed.');
      return;
    }
    setLoading(true);

    try {
      const payload = {
        patientName,
        customerPhone: patientPhone,
        patientPhone,
        doctorName,
        prescriptionNumber,
        prescriptionDocumentUrl: prescriptionUrl,
        items: cart,
        discountAmount,
        taxAmount: tax,
        paymentMethod,
        redeemLoyaltyPoints: redeemLoyalty
      };

      const res = await API.post('/pos/sales', payload);
      setCompletedSale(res.data.sale);
      setCart([]);
      setDiscountAmount(0);
      setPaymentMethod('cash');
      toast.success('Sale transaction completed successfully!');
      fetchMedicines(); // Refresh stock counts
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transaction checkout failed.');
    } finally {
      setLoading(false);
    }
  };

  const filteredMedicines = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.genericName && m.genericName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      m.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.barcode && m.barcode.includes(searchTerm))
  );

  return (
    <div className="flex flex-col space-y-3 h-full min-h-0 flex-1 overflow-hidden">
      
      {/* Mobile / Tablet View Switcher Tabs */}
      <div className="flex lg:hidden bg-slate-900 p-1.5 rounded-xl border border-slate-800 gap-2 shrink-0">
        <Button
          variant={mobileTab === 'catalog' ? 'primary' : 'ghost'}
          size="sm"
          fullWidth
          leftIcon={Search}
          onClick={() => setMobileTab('catalog')}
        >
          Catalog ({filteredMedicines.length})
        </Button>
        <Button
          variant={mobileTab === 'cart' ? 'primary' : 'ghost'}
          size="sm"
          fullWidth
          leftIcon={ShoppingCart}
          onClick={() => setMobileTab('cart')}
        >
          Cart ({cart.length}) · ${grandTotal.toFixed(2)}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT: MEDICINE CATALOG & BARCODE SCANNER (7 cols) */}
        <div className={`lg:col-span-7 flex flex-col space-y-3 h-full min-h-0 overflow-hidden ${mobileTab === 'catalog' ? 'flex' : 'hidden lg:flex'}`}>
          {/* Search & Barcode Input */}
          <div className="shrink-0">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Medicine Name, Generic, SKU, or Scan Barcode..."
              leftIcon={Search}
              size="md"
            />
          </div>

          {/* Product Cards Grid */}
          <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-3 min-h-0">
            {filteredMedicines.map((med) => {
              const isOutOfStock = med.stockQty <= 0;
              return (
                <Card
                  key={med._id}
                  variant="glass"
                  hoverGlow={!isOutOfStock}
                  onClick={() => addToCart(med)}
                  className={`p-3.5 transition-all cursor-pointer flex flex-col justify-between ${
                    isOutOfStock
                      ? 'opacity-60 cursor-not-allowed border-slate-800/60 dark:border-slate-800/60 light:border-slate-300'
                      : 'hover:border-blue-500/50 hover:scale-[1.01]'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-white dark:text-white light:text-slate-900 text-sm tracking-tight">{med.name}</h3>
                      {med.rxRequired && (
                        <Badge variant="danger" size="sm">Rx</Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 mt-0.5">{med.brandName || med.genericName}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-500 light:text-slate-500 font-mono mt-1">SKU: {med.sku} · {med.dosageForm}</p>
                  </div>

                  <div className="mt-2.5 flex justify-between items-center pt-2 border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200">
                    <span className="text-base font-extrabold text-emerald-400 dark:text-emerald-400 light:text-emerald-600">${med.unitPrice?.toFixed(2)}</span>
                    <Badge variant={isOutOfStock ? 'danger' : 'success'} size="sm" dot pulse={isOutOfStock}>
                      {isOutOfStock ? 'Out of stock' : `${med.stockQty} in stock`}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* RIGHT: BILLING CART & PAYMENTS (5 cols) */}
        <div className={`lg:col-span-5 ${mobileTab === 'cart' ? 'flex' : 'hidden lg:flex'}`}>
          <Card variant="glass" className="w-full p-4 shadow-xl flex flex-col justify-between h-full max-h-full overflow-hidden border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200">
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex justify-between items-center border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 pb-2.5 shrink-0">
                <h2 className="text-base font-bold text-white dark:text-white light:text-slate-900 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-400" /> Billing Cart ({cart.length})
                </h2>
                {cart.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 light:text-red-600 light:hover:text-red-700 text-xs py-1"
                    onClick={() => {
                      setCart([]);
                      setPaymentMethod('cash');
                      toast.info('Cart cleared');
                    }}
                  >
                    Clear Cart
                  </Button>
                )}
              </div>

              {/* Patient Details & Prescription Upload */}
              <div className="space-y-1.5 bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-100/80 p-2.5 rounded-xl border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 text-xs shrink-0 mt-2">
                <div className="grid grid-cols-2 gap-1.5">
                  <Input
                    size="sm"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Patient Name"
                  />
                  <Input
                    size="sm"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="Patient Phone"
                  />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <Input
                    size="sm"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="Doctor Name"
                  />
                  <Input
                    size="sm"
                    value={prescriptionNumber}
                    onChange={(e) => setPrescriptionNumber(e.target.value)}
                    placeholder="Rx Number"
                  />
                </div>
              </div>

              {/* DYNAMIC CART ITEMS CONTAINER - SCROLLBAR APPEARS AFTER 3 MEDICINES (MAX HEIGHT 145PX) */}
              <div
                ref={cartContainerRef}
                className="flex-1 min-h-[90px] max-h-[145px] overflow-y-auto pr-1.5 space-y-1.5 my-2 pos-cart-scrollbar"
              >
                {cart.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs italic flex flex-col items-center justify-center h-full space-y-1">
                    <ShoppingCart className="w-7 h-7 text-slate-500 mb-1" />
                    <span className="font-semibold text-slate-400 dark:text-slate-400 light:text-slate-600">Cart is empty</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-500 light:text-slate-500">Select medicines from the catalog to start billing.</span>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div key={idx} className="bg-slate-800/40 dark:bg-slate-800/40 light:bg-slate-100 p-2 rounded-xl flex items-center justify-between border border-slate-700/50 dark:border-slate-700/50 light:border-slate-300 text-xs hover:border-slate-600 transition-colors">
                      <div className="max-w-[170px]">
                        <div className="font-bold text-white dark:text-white light:text-slate-900 truncate">{item.name}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-400 light:text-slate-600">${item.unitPrice?.toFixed(2)} / {item.unit}</div>
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-6 h-6 p-0 justify-center"
                          onClick={() => updateQuantity(idx, -1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="font-bold text-white dark:text-white light:text-slate-900 font-mono min-w-[18px] text-center text-xs">{item.quantity}</span>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-6 h-6 p-0 justify-center"
                          onClick={() => updateQuantity(idx, 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 text-red-400 hover:text-red-300 light:text-red-600 ml-0.5"
                          onClick={() => updateQuantity(idx, -item.quantity)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Financial Summary & Payment Methods — shown once medicine is added */}
            {cart.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 space-y-2 shrink-0 mt-auto">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400 dark:text-slate-400 light:text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono text-white dark:text-white light:text-slate-900 font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 dark:text-slate-400 light:text-slate-600">
                    <span>Tax (GST/VAT):</span>
                    <span className="font-mono text-white dark:text-white light:text-slate-900 font-semibold">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 dark:text-slate-400 light:text-slate-600 items-center gap-2">
                    <span>Discount ($):</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value)))}
                      className="w-20 bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-700/80 dark:border-slate-700/80 light:border-slate-300 rounded-lg px-2 py-0.5 text-right text-white dark:text-white light:text-slate-900 font-mono text-xs focus:ring-2 focus:ring-accent outline-none"
                    />
                  </div>
                  <div className="flex justify-between font-extrabold text-sm sm:text-base text-white dark:text-white light:text-slate-900 pt-1.5 border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200">
                    <span>Grand Total:</span>
                    <span className="text-emerald-400 dark:text-emerald-400 light:text-emerald-600">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Method Selector Grid */}
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-500 light:text-slate-500 uppercase tracking-wide mb-1.5">
                    Payment Method
                  </p>
                  <div className="grid grid-cols-3 gap-1 text-[10px] font-bold">
                    <Button
                      variant={paymentMethod === 'cash' ? 'primary' : 'outline'}
                      size="sm"
                      leftIcon={DollarSign}
                      onClick={() => setPaymentMethod('cash')}
                      className="py-1 px-1.5 text-[10px]"
                    >
                      Cash
                    </Button>
                    <Button
                      variant={paymentMethod === 'card' ? 'primary' : 'outline'}
                      size="sm"
                      leftIcon={CreditCard}
                      onClick={() => setPaymentMethod('card')}
                      className="py-1 px-1.5 text-[10px]"
                    >
                      Card
                    </Button>
                    <Button
                      variant={paymentMethod === 'bank_transfer' ? 'primary' : 'outline'}
                      size="sm"
                      leftIcon={Landmark}
                      onClick={() => setPaymentMethod('bank_transfer')}
                      className="py-1 px-1.5 text-[10px]"
                    >
                      Bank
                    </Button>
                    <Button
                      variant={paymentMethod === 'jazzcash' ? 'primary' : 'outline'}
                      size="sm"
                      leftIcon={Smartphone}
                      onClick={() => setPaymentMethod('jazzcash')}
                      className="py-1 px-1.5 text-[10px]"
                    >
                      JazzCash
                    </Button>
                    <Button
                      variant={paymentMethod === 'easypaisa' ? 'primary' : 'outline'}
                      size="sm"
                      leftIcon={Smartphone}
                      onClick={() => setPaymentMethod('easypaisa')}
                      className="py-1 px-1.5 text-[10px]"
                    >
                      EasyPaisa
                    </Button>
                    <Button
                      variant={paymentMethod === 'credit_account' ? 'primary' : 'outline'}
                      size="sm"
                      leftIcon={User}
                      onClick={() => setPaymentMethod('credit_account')}
                      className="py-1 px-1.5 text-[10px]"
                    >
                      Credit
                    </Button>
                  </div>
                </div>

                <Button
                  variant="accent"
                  size="md"
                  fullWidth
                  isLoading={loading}
                  disabled={loading}
                  onClick={handleCheckout}
                  className="bg-orange-500 hover:bg-orange-400 dark:bg-orange-500 light:bg-orange-500 light:hover:bg-orange-600 text-white font-bold py-2 shadow-md shadow-orange-500/20 text-xs sm:text-sm cursor-pointer"
                >
                  Complete Sale (${grandTotal.toFixed(2)})
                </Button>
              </div>
            )}
          </Card>
        </div>

      </div>

      {/* THERMAL RECEIPT PRINT MODAL */}
      <Modal
        isOpen={!!completedSale}
        onClose={() => setCompletedSale(null)}
        title="Thermal Sales Invoice"
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setCompletedSale(null)}>
              Close
            </Button>
            <Button variant="primary" size="sm" leftIcon={Printer} onClick={() => window.print()}>
              Print Receipt
            </Button>
          </>
        }
      >
        {completedSale && (
          <div className="bg-white text-slate-900 p-4 rounded-xl space-y-4 font-mono text-xs shadow-inner">
            {/* Header / Store Info */}
            <div className="text-center space-y-1 border-b border-dashed border-slate-400 pb-3">
              <h2 className="font-extrabold text-base uppercase tracking-tight">{user?.pharmacy?.name}</h2>
              <div>{activeBranch?.name} · {activeBranch?.address}</div>
              <div>License #: {user?.pharmacy?.licenseNumber} · Tax ID: {user?.pharmacy?.taxId}</div>
              <div>Phone: {user?.pharmacy?.phone}</div>
            </div>

            {/* Invoice Meta */}
            <div className="space-y-1 text-[11px] border-b border-dashed border-slate-400 pb-3">
              <div className="flex justify-between font-bold">
                <span>Invoice #:</span>
                <span>{completedSale.invoiceNumber}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Date:</span>
                <span>{new Date(completedSale.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Patient:</span>
                <span>{completedSale.patientName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment:</span>
                <span className="uppercase font-bold">{completedSale.paymentMethod}</span>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-1.5 border-b border-dashed border-slate-400 pb-3">
              {completedSale.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[11px]">
                  <span>{item.quantity}x {item.medicineName} (BT: {item.batchNumber})</span>
                  <span className="font-bold">${item.total?.toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Financial Totals */}
            <div className="space-y-1 font-bold text-xs pt-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${completedSale.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>${completedSale.taxAmount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>-${completedSale.discountAmount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold border-t border-slate-900 pt-1">
                <span>GRAND TOTAL:</span>
                <span>${completedSale.grandTotal?.toFixed(2)}</span>
              </div>
            </div>

            {/* QR Verification Payload */}
            <div className="pt-3 border-t border-dashed border-slate-400 text-center space-y-2 flex flex-col items-center">
              <div className="w-24 h-24 bg-slate-950 p-1 rounded flex flex-wrap gap-1 items-center justify-center">
                {Array.from({ length: 25 }).map((_, i) => (
                  <span key={i} className={`w-3.5 h-3.5 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-950'}`} />
                ))}
              </div>
              <div className="text-[9px] text-slate-500">Scan to Verify Invoice Authenticity</div>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default POSBilling;
