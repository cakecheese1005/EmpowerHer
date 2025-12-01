import {useQuery} from "@tanstack/react-query";
import {collection, getDocs, query, orderBy, limit} from "firebase/firestore";
import {db} from "../config/firebase";
import {Users, FileText, TrendingUp, Activity} from "lucide-react";

export default function Dashboard() {
  const {data: stats} = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [usersSnapshot, assessmentsSnapshot, recentAssessments] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "assessments")),
        getDocs(query(collection(db, "assessments"), orderBy("createdAt", "desc"), limit(5))),
      ]);

      const highRiskCount = assessmentsSnapshot.docs.filter(
        (doc) => doc.data().result?.label === "High"
      ).length;

      return {
        totalUsers: usersSnapshot.size,
        totalAssessments: assessmentsSnapshot.size,
        highRiskCount,
        recentAssessments: recentAssessments.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
      };
    },
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Users</p>
              <p className="text-3xl font-bold mt-2">{stats?.totalUsers || 0}</p>
            </div>
            <Users className="w-12 h-12 text-primary" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Assessments</p>
              <p className="text-3xl font-bold mt-2">{stats?.totalAssessments || 0}</p>
            </div>
            <FileText className="w-12 h-12 text-primary" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">High Risk Cases</p>
              <p className="text-3xl font-bold mt-2">{stats?.highRiskCount || 0}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-red-500" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Recent Assessments</h2>
        <div className="space-y-4">
          {stats?.recentAssessments?.map((assessment: any) => (
            <div key={assessment.id} className="border-b pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    Risk: {assessment.result?.label || "Unknown"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {assessment.createdAt?.toDate?.()?.toLocaleString() || "N/A"}
                  </p>
                </div>
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

