import React from 'react';
import { useApp } from '../../context/AppContext';
import { BUSINESS_INFO } from '../../data/mockData';
import { 
  Printer, 
  X, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Mail, 
  Download, 
  ShieldCheck,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const InvoiceModal: React.FC = () => {
  const { activeInvoice, setActiveInvoice } = useApp();

  if (!activeInvoice) return null;

  const handlePrint = () => {
    window.print();
  };

  // Determine if it's an Order, a RideRequest, a CateringBooking, a TailoringRequest, or CakeOrder
  const isOrder = 'items' in activeInvoice;
  const isRide = 'pickupLocation' in activeInvoice;
  const isCatering = 'eventType' in activeInvoice;
  const isTailoring = 'garmentType' in activeInvoice;
  const isCake = 'cakeType' in activeInvoice;

  const invoiceNumber = 
    (activeInvoice as any).orderNumber || 
    (activeInvoice as any).id || 
    `FDC-INV-${Date.now().toString().slice(-6)}`;

  const customerName = (activeInvoice as any).customerName || (activeInvoice as any).recipientName || 'Valued Customer';
  const customerPhone = (activeInvoice as any).customerPhone || (activeInvoice as any).recipientPhone || 'N/A';
  const totalAmount = 
    (activeInvoice as any).total || 
    (activeInvoice as any).totalFare || 
    (activeInvoice as any).totalQuote || 
    (activeInvoice as any).estimatedCost || 
    (activeInvoice as any).estimatedPrice || 
    0;

  const paymentStatus = (activeInvoice as any).paymentStatus || 'PAID';
  const paymentMethod = (activeInvoice as any).paymentMethod || 'ONLINE_PAYSTACK';
  const createdAt = (activeInvoice as any).createdAt || new Date().toISOString();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-2xl w-full my-8 overflow-hidden"
        >
          {/* Modal Actions Bar (hidden on print) */}
          <div className="bg-stone-900 text-white p-4 flex items-center justify-between border-b border-stone-800">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-xs">Official Platform Tax Invoice & Receipt</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>

              <button
                onClick={() => setActiveInvoice(null)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Invoice Document Body */}
          <div id="printable-invoice" className="p-8 space-y-6 text-stone-900 bg-white">
            {/* Business Header with Clear Phone 09162723865 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-black text-sm">
                    FDC
                  </div>
                  <h2 className="text-xl font-black tracking-tight text-stone-950 font-display">
                    {BUSINESS_INFO.name}
                  </h2>
                </div>
                <p className="text-xs font-semibold text-amber-700 mt-1">
                  Multi-Service Commerce, Fashion, Bakery, Catering & Logistics Hub
                </p>
                <div className="text-xs text-stone-500 space-y-0.5 mt-2">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>{BUSINESS_INFO.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-stone-800">
                    <Phone className="w-3.5 h-3.5 text-amber-600" />
                    <span>Official Contact Phone: {BUSINESS_INFO.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                    <span>{BUSINESS_INFO.email}</span>
                  </div>
                </div>
              </div>

              {/* Invoice Meta */}
              <div className="text-left sm:text-right space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-stone-400">Invoice / Receipt</div>
                <div className="text-sm font-black font-mono text-stone-900">{invoiceNumber}</div>
                <div className="text-xs text-stone-500">Date: {new Date(createdAt).toLocaleDateString()}</div>
                <div className="pt-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    paymentStatus === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {paymentStatus === 'PAID' ? '✓ PAYMENT COMPLETED' : 'PAYMENT PENDING (CoD)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs">
              <div>
                <span className="text-stone-400 block font-semibold mb-0.5">Billed To / Customer:</span>
                <div className="font-bold text-sm text-stone-900">{customerName}</div>
                <div className="text-stone-600 font-medium">{customerPhone}</div>
                {(activeInvoice as any).customerAddress && (
                  <div className="text-stone-500 mt-1">{(activeInvoice as any).customerAddress}</div>
                )}
              </div>

              <div>
                <span className="text-stone-400 block font-semibold mb-0.5">Payment Method & Reference:</span>
                <div className="font-bold text-stone-900">{paymentMethod.replace(/_/g, ' ')}</div>
                <div className="text-stone-500 mt-0.5">Location: Okene Hub, Kogi State</div>
              </div>
            </div>

            {/* Itemized Table Breakdown */}
            <div className="border border-stone-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                  <tr>
                    <th className="p-3">Description / Service Item</th>
                    <th className="p-3 text-center">Division</th>
                    <th className="p-3 text-center">Qty / Details</th>
                    <th className="p-3 text-right">Amount (NGN)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {isOrder && (activeInvoice as any).items.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="p-3 font-semibold text-stone-900">
                        {item.name}
                        {item.selectedSize && <span className="text-stone-400 block text-[10px]">Size: {item.selectedSize}</span>}
                      </td>
                      <td className="p-3 text-center text-stone-500 font-medium">{item.division}</td>
                      <td className="p-3 text-center font-bold">{item.quantity}</td>
                      <td className="p-3 text-right font-bold">₦{(item.price * item.quantity).toLocaleString()}</td>
                    </tr>
                  ))}

                  {isRide && (
                    <tr>
                      <td className="p-3 font-semibold text-stone-900">
                        Intra-City Kogi Ride ({(activeInvoice as any).vehicleType})
                        <span className="text-stone-500 block text-[11px]">
                          Pickup: {(activeInvoice as any).pickupLocation?.name} → Destination: {(activeInvoice as any).destinationLocation?.name}
                        </span>
                      </td>
                      <td className="p-3 text-center text-blue-700 font-bold">TRANSPORT</td>
                      <td className="p-3 text-center">{(activeInvoice as any).distanceKm} km</td>
                      <td className="p-3 text-right font-bold">₦{totalAmount.toLocaleString()}</td>
                    </tr>
                  )}

                  {isCatering && (
                    <tr>
                      <td className="p-3 font-semibold text-stone-900">
                        Catering Reservation: {(activeInvoice as any).eventType}
                        <span className="text-stone-500 block text-[11px]">
                          Venue: {(activeInvoice as any).eventLocation} • Date: {(activeInvoice as any).eventDate}
                        </span>
                      </td>
                      <td className="p-3 text-center text-rose-700 font-bold">CATERING</td>
                      <td className="p-3 text-center">{(activeInvoice as any).expectedGuests} Guests</td>
                      <td className="p-3 text-right font-bold">₦{totalAmount.toLocaleString()}</td>
                    </tr>
                  )}

                  {isTailoring && (
                    <tr>
                      <td className="p-3 font-semibold text-stone-900">
                        Bespoke Tailoring: {(activeInvoice as any).garmentType}
                        <span className="text-stone-500 block text-[11px]">
                          Fabric: {(activeInvoice as any).fabricPreference} • Color: {(activeInvoice as any).colorTheme}
                        </span>
                      </td>
                      <td className="p-3 text-center text-amber-700 font-bold">FASHION</td>
                      <td className="p-3 text-center">1 Custom Outfit</td>
                      <td className="p-3 text-right font-bold">₦{totalAmount.toLocaleString()}</td>
                    </tr>
                  )}

                  {isCake && (
                    <tr>
                      <td className="p-3 font-semibold text-stone-900">
                        Custom Cake: {(activeInvoice as any).cakeType} ({(activeInvoice as any).cakeSize})
                        <span className="text-stone-500 block text-[11px]">
                          Flavor: {(activeInvoice as any).flavor} • Inscription: &quot;{(activeInvoice as any).inscription}&quot;
                        </span>
                      </td>
                      <td className="p-3 text-center text-orange-700 font-bold">BAKERY</td>
                      <td className="p-3 text-center">1 Cake Design</td>
                      <td className="p-3 text-right font-bold">₦{totalAmount.toLocaleString()}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Total Calculation Card */}
            <div className="flex justify-end">
              <div className="w-full sm:w-64 space-y-1.5 text-xs">
                {(activeInvoice as any).subtotal && (
                  <div className="flex justify-between text-stone-500">
                    <span>Subtotal:</span>
                    <span>₦{(activeInvoice as any).subtotal.toLocaleString()}</span>
                  </div>
                )}
                {(activeInvoice as any).deliveryFee && (
                  <div className="flex justify-between text-stone-500">
                    <span>Delivery Fee:</span>
                    <span>₦{(activeInvoice as any).deliveryFee.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-stone-950 pt-2 border-t border-stone-200">
                  <span>Grand Total:</span>
                  <span className="text-amber-700">₦{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="pt-6 border-t border-stone-200 text-[11px] text-stone-400 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div>
                <strong>FLOURISH DESTINY COLLECTION</strong> • Customer Inquiries Hotline: <strong className="text-stone-700">{BUSINESS_INFO.phone}</strong>
              </div>
              <div className="text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Authentic Verified Transaction
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
