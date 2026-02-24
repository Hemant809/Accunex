import { useSearchParams } from "react-router-dom";
import { useParty } from "../context/PartyContext";

export default function Ledger() {
  const { parties, transactions } = useParty();
  const [searchParams] = useSearchParams();
  const partyId = Number(searchParams.get("partyId"));

  const party = parties.find((p) => p.id === partyId);
  const partyTransactions = transactions.filter(
    (t) => t.partyId === partyId
  );

  if (!party) {
    return (
      <div className="text-gray-400">
        Select a party from Parties page
      </div>
    );
  }

  let runningBalance = 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Ledger - {party.name}
      </h1>

      <div className="bg-slate-800 rounded-xl p-6">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 border-b border-slate-700">
              <th className="py-3">Date</th>
              <th>Type</th>
              <th>Debit</th>
              <th>Credit</th>
              <th>Balance</th>
            </tr>
          </thead>

          <tbody>
            {partyTransactions.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-6 text-center text-gray-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              partyTransactions.map((t) => {
                if (t.type === "debit") {
                  runningBalance += t.amount;
                } else {
                  runningBalance -= t.amount;
                }

                return (
                  <tr
                    key={t.id}
                    className="border-b border-slate-700"
                  >
                    <td className="py-3">{t.date}</td>
                    <td className="capitalize">{t.type}</td>
                    <td>
                      {t.type === "debit" ? `₹ ${t.amount}` : "-"}
                    </td>
                    <td>
                      {t.type === "credit" ? `₹ ${t.amount}` : "-"}
                    </td>
                    <td className="font-semibold">
                      ₹ {runningBalance.toFixed(2)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
