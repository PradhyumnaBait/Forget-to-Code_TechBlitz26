'use client'

import { useState } from 'react'
import { FileText, IndianRupee, Plus, Printer, CheckCircle, Calculator, Smartphone, MapPin } from 'lucide-react'

interface Item {
  id: string
  name: string
  qty: number
  price: number
}

const recentBills = [
  { id: '#MED-0318-006', patient: 'Priya Singh', amt: '₹1,240', time: '10:30 AM' },
  { id: '#MED-0318-005', patient: 'Sona Rajan', amt: '₹500', time: '10:00 AM' },
  { id: '#MED-0318-004', patient: 'Rahul Mehta', amt: '₹685', time: '9:30 AM' },
]

export default function BillingPage() {
  const [items, setItems] = useState<Item[]>([
    { id: '1', name: 'Dr. Ananya Sharma — General Consultation', qty: 1, price: 500 },
    { id: '2', name: 'Paracetamol 500mg (10 tabs)', qty: 2, price: 40 },
    { id: '3', name: 'Cetirizine 10mg (10 tabs)', qty: 1, price: 25 },
    { id: '4', name: 'Vitamin D3 60k (4 caps)', qty: 1, price: 120 },
  ])
  const [discount, setDiscount] = useState(0)
  const [payMode, setPayMode] = useState<'upi' | 'cash'>('upi')
  const [received, setReceived] = useState('700')

  const subtotal = items.reduce((acc, curr) => acc + (curr.price * curr.qty), 0)
  const total = subtotal - discount
  const change = payMode === 'cash' ? Math.max(0, parseInt(received || '0') - total) : 0

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Generate Bill</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-8 h-8 rounded-full bg-accent-light text-accent flex items-center justify-center text-sm font-bold">RM</span>
              <p className="text-sm font-semibold text-text-primary">Rahul Mehta</p>
            </div>
            <div className="text-xs text-text-muted px-2 border-l border-brand-border h-4 flex items-center">ID: #MED-20260318-007</div>
            <div className="text-xs text-text-muted px-2 border-l border-brand-border h-4 flex items-center">Mar 18, 2026</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main form */}
        <div className="lg:col-span-3 space-y-5">
          {/* Bill items */}
          <div className="card shadow-sm overflow-hidden">
            <div className="bg-brand-bg px-5 py-3 border-b border-brand-border grid grid-cols-12 gap-3 text-xs font-semibold text-text-secondary uppercase">
              <div className="col-span-6">Description</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Unit Price</div>
              <div className="col-span-2 text-right">Amount</div>
            </div>
            <div className="divide-y divide-brand-border">
              {items.map(item => (
                <div key={item.id} className="grid grid-cols-12 gap-3 px-5 py-4 items-center">
                  <div className="col-span-6 text-sm font-medium text-text-primary">{item.name}</div>
                  <div className="col-span-2 text-center text-sm text-text-secondary">{item.qty}</div>
                  <div className="col-span-2 text-right text-sm text-text-secondary">₹{item.price}</div>
                  <div className="col-span-2 text-right text-sm font-semibold text-text-primary">
                    ₹{item.price * item.qty}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-brand-border bg-white">
              <button className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover transition-colors">
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>
          </div>

          {/* Checkout section */}
          <div className="grid md:grid-cols-2 gap-5">
            {/* Calculation */}
            <div className="card p-5">
              <div className="space-y-3 mb-4 pb-4 border-b border-brand-border">
                <div className="flex justify-between items-center text-sm text-text-secondary">
                  <span>Subtotal</span>
                  <span className="font-medium text-text-primary">₹{subtotal}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-text-secondary">
                  <span>Discount</span>
                  <div className="w-24 relative">
                    <IndianRupee className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="number"
                      value={discount}
                      onChange={e => setDiscount(Number(e.target.value) || 0)}
                      className="w-full pl-6 pr-2 py-1 text-sm border border-brand-border rounded text-right focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-text-primary">Grand Total</span>
                <span className="text-2xl font-black text-primary">₹{total}</span>
              </div>
            </div>

            {/* Payment & Actions */}
            <div className="card p-5">
              <p className="text-sm font-semibold text-text-primary mb-3">Payment Method</p>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setPayMode('upi')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg border flex items-center justify-center gap-2 ${
                    payMode === 'upi' ? 'bg-primary-light border-primary text-primary' : 'bg-white border-brand-border text-text-secondary'
                  }`}
                >
                  <Smartphone className="w-4 h-4" /> UPI / Card
                </button>
                <button
                  onClick={() => setPayMode('cash')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg border flex items-center justify-center gap-2 ${
                    payMode === 'cash' ? 'bg-primary-light border-primary text-primary' : 'bg-white border-brand-border text-text-secondary'
                  }`}
                >
                  <IndianRupee className="w-4 h-4" /> Cash
                </button>
              </div>

              {payMode === 'cash' && (
                <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-brand-bg rounded-lg border border-brand-border">
                  <div>
                    <label className="text-xs text-text-muted block mb-1">Received (₹)</label>
                    <input
                      type="number"
                      value={received}
                      onChange={e => setReceived(e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-brand-border rounded text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted block mb-1">Change Return</label>
                    <div className="w-full px-2 py-1 text-sm font-semibold text-danger">₹{change}</div>
                  </div>
                </div>
              )}

              <div className="space-y-2 mt-auto pt-2">
                <button className="w-full btn-primary py-2.5 flex items-center justify-center gap-2">
                  <Printer className="w-4 h-4" /> Generate Bill & Print
                </button>
                <button className="w-full py-2.5 rounded-lg border border-[#25D366] text-[#25D366] font-medium flex items-center justify-center gap-2 hover:bg-[#25D366]/5 transition-colors text-sm">
                  <CheckCircle className="w-4 h-4" /> Send Digital Bill
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-text-muted" /> Recent Bills
            </h3>
            <div className="space-y-3">
              {recentBills.map(bill => (
                <div key={bill.id} className="p-3 bg-brand-bg rounded-lg border border-brand-border hover:border-text-muted transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-semibold text-text-primary">{bill.amt}</span>
                    <span className="badge-success text-[10px] px-1.5 py-0">{bill.time}</span>
                  </div>
                  <p className="text-xs text-text-secondary">{bill.patient}</p>
                  <p className="text-[10px] text-text-muted mt-1">{bill.id}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-xs font-medium text-primary hover:text-primary-hover text-center">
              View All Invoices
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
