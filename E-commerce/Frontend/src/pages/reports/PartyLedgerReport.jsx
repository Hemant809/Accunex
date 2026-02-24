import { useFinance } from "../../context/FinanceContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";

export default function PartyLedgerReport() {
  const navigate = useNavigate();
  const { sales, receipts, payments, purchases = [] } = useFinance();
  const [suppliers, setSuppliers] = useState([]);
  const [partyBalances, setPartyBalances] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (suppliers.length > 0) {
      calculatePartyBalances();
    }
  }, [suppliers, purchases, payments]);

  const fetchSuppliers = async () => {
    try {
      const { data } = await axios.get("/suppliers");
      setSuppliers(data);
    } catch (error) {
      console.error("Error loading suppliers:", error);
    }
  };

  const calculatePartyBalances = () => {
    const supplierBalances = suppliers.map(supplier => {
      const partyPurchases = purchases.filter(
        p => p.supplier?._id === supplier._id || p.supplier?.name === supplier.name
      );
      const partyPayments = payments.filter(p => p.party === supplier.name);

      // Supplier: Purchase = Credit (we owe), Payment = Debit (we paid)
      const totalCredit = partyPurchases.reduce(
        (sum, p) => sum + Math.round(Number(p.totalAmount || 0)),
        0
      );
      const totalDebit = partyPayments.reduce((sum, p) => sum + Math.round(Number(p.amount || 0)), 0);
      const balance = Math.round(totalCredit - totalDebit); // Positive = Credit balance (we owe)

      return {
        supplierId: supplier._id,
        name: supplier.name,
        balance,
        type: 'Supplier'
      };
    });

    // Get unique customers from sales
    const customerNames = [...new Set(sales.map(s => s.customerName).filter(Boolean))];
    const customerBalances = customerNames.map(customerName => {
      const customerSales = sales.filter(s => s.customerName === customerName);
      const customerReceipts = receipts.filter(r => r.customerName === customerName);

      // Customer: Sale = Debit (they owe), Receipt = Credit (they paid)
      const totalDebit = customerSales.reduce(
        (sum, s) => sum + Math.round(Number(s.totalAmount || 0)),
        0
      );
      const totalCredit = customerReceipts.reduce((sum, r) => sum + Math.round(Number(r.amount || 0)), 0);
      const balance = Math.round(totalDebit - totalCredit); // Positive = they owe (Debit balance)

      return {
        supplierId: null,
        name: customerName,
        balance,
        type: 'Customer'
      };
    });

    const allBalances = [...supplierBalances, ...customerBalances];
    setPartyBalances(allBalances);
  };

  const viewLedger = (party) => {
    navigate('/reports/party-ledger-detail', {
      state: { partyName: party.name, supplierId: party.supplierId, partyType: party.type }
    });
  };

  const filteredParties = partyBalances.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || 
                        (typeFilter === "creditor" && p.type === "Supplier") ||
                        (typeFilter === "debtor" && p.type === "Customer");
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8">

      <h1 className="text-2xl font-bold text-neutral-800">
        Party Ledger
      </h1>

      {/* Party List */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-neutral-800">
            Party Balances
          </h2>
          <div className="flex gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-neutral-300 rounded-lg px-3 py-1.5 text-sm"
            >
              <option value="all">All Parties</option>
              <option value="creditor">Creditors (Suppliers)</option>
              <option value="debtor">Debtors (Customers)</option>
            </select>
            <input
              type="text"
              placeholder="Search party..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-neutral-300 rounded-lg px-3 py-1.5 text-sm w-64"
            />
          </div>
        </div>

        {filteredParties.length === 0 ? (
          <p className="text-neutral-500 text-sm">
            No party balances found.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 text-neutral-600">
              <tr>
                <th className="text-left py-3">Party Name</th>
                <th className="text-left">Type</th>
                <th className="text-right">Balance</th>
              </tr>
            </thead>

            <tbody>
              {filteredParties.map((party, index) => (
                <tr 
                  key={index} 
                  onClick={() => viewLedger(party)}
                  className="border-b border-neutral-200 hover:bg-blue-50 cursor-pointer transition"
                >
                  <td className="py-3">{party.name}</td>
                  <td>
                    <span className={`inline-block px-2 py-1 text-xs rounded ${party.type === 'Supplier' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                      {party.type}
                    </span>
                  </td>
                  <td className="text-right font-medium">
                    {party.balance === 0 ? '₹ 0' : 
                     party.type === 'Supplier' && party.balance > 0 ? `₹ ${Math.abs(party.balance).toLocaleString()} Cr` :
                     party.type === 'Customer' && party.balance > 0 ? `₹ ${Math.abs(party.balance).toLocaleString()} Dr` :
                     party.type === 'Customer' && party.balance < 0 ? `₹ ${Math.abs(party.balance).toLocaleString()} Cr` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-neutral-100 border-t-2 border-neutral-300 font-semibold">
              <tr>
                <td colSpan="2" className="py-3 text-right">Total Receivable (Dr):</td>
                <td className="text-right">
                  ₹ {filteredParties.filter(p => p.type === 'Customer').reduce((sum, p) => sum + (p.balance > 0 ? p.balance : 0), 0).toLocaleString()}
                </td>
              </tr>
              <tr>
                <td colSpan="2" className="py-3 text-right">Total Payable (Cr):</td>
                <td className="text-right">
                  ₹ {filteredParties.filter(p => p.type === 'Supplier').reduce((sum, p) => sum + (p.balance > 0 ? p.balance : 0), 0).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

    </div>
  );
}
