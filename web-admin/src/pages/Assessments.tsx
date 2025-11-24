import {useQuery} from "@tanstack/react-query";
import {collection, getDocs, query, orderBy} from "firebase/firestore";
import {db} from "../config/firebase";

export default function Assessments() {
  const {data: assessments, isLoading} = useQuery({
    queryKey: ["assessments"],
    queryFn: async () => {
      const snapshot = await getDocs(
        query(collection(db, "assessments"), orderBy("createdAt", "desc"))
      );
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    },
  });

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Assessments</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Risk Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Probability
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {assessments?.map((assessment: any) => (
              <tr key={assessment.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {assessment.id.substring(0, 8)}...
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      assessment.result?.label === "High"
                        ? "bg-red-100 text-red-800"
                        : assessment.result?.label === "Early"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {assessment.result?.label || "No Risk"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {((assessment.result?.probabilities?.High || 0) * 100).toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {assessment.createdAt?.toDate?.()?.toLocaleString() || "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

