import { useNavigate } from "react-router-dom";
import { useParty } from "../context/PartyContext";

export default function Parties() {
  const { parties } = useParty();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Parties</h1>

      <div className="bg-slate-800 rounded-xl p-6">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 border-b border-slate-700">
              <th className="py-3">Name</th>
              <th>Type</th>
              <th>Balance</th>
            </tr>
          </thead>

          <tbody>
            {parties.length === 0 ? (
              <tr>
                <td colSpan="3" className="py-6 text-center text-gray-500">
                  No parties available
                </td>
              </tr>
            ) : (
              parties.map((party) => (
                <tr
                  key={party.id}
                  onClick={() => navigate(`/ledger?partyId=${party.id}`)}
                  className="border-b border-slate-700 hover:bg-slate-700/30 cursor-pointer transition"
                >
                  <td className="py-3">{party.name}</td>
                  <td className="capitalize">{party.type}</td>
                  <td
                    className={`font-semibold ${
                      party.balance > 0
                        ? "text-red-400"
                        : "text-green-400"
                    }`}
                  >
                    ₹ {party.balance.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
