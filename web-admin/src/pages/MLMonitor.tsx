import {useQuery} from "@tanstack/react-query";
import {collection, getDocs, query, orderBy, limit} from "firebase/firestore";
import {db} from "../config/firebase";
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from "recharts";

export default function MLMonitor() {
  const {data: metrics} = useQuery({
    queryKey: ["ml-metrics"],
    queryFn: async () => {
      const snapshot = await getDocs(
        query(collection(db, "assessments"), orderBy("createdAt", "desc"), limit(100))
      );
      const assessments = snapshot.docs.map((doc) => doc.data());

      // Calculate metrics
      const riskDistribution = {
        "No Risk": assessments.filter((a) => a.result?.label === "No Risk").length,
        "Early": assessments.filter((a) => a.result?.label === "Early").length,
        "High": assessments.filter((a) => a.result?.label === "High").length,
      };

      // Group by date for time series
      const dailyData = assessments.reduce((acc: any, assessment: any) => {
        const date = assessment.createdAt?.toDate?.()?.toLocaleDateString() || "Unknown";
        if (!acc[date]) {
          acc[date] = {date, "No Risk": 0, "Early": 0, "High": 0};
        }
        acc[date][assessment.result?.label || "No Risk"]++;
        return acc;
      }, {});

      return {
        riskDistribution,
        dailyData: Object.values(dailyData),
      };
    },
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">ML Model Monitoring</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Risk Distribution</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>No Risk</span>
              <span className="font-bold">{metrics?.riskDistribution["No Risk"] || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Early</span>
              <span className="font-bold">{metrics?.riskDistribution["Early"] || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>High</span>
              <span className="font-bold text-red-600">
                {metrics?.riskDistribution["High"] || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Predictions Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={metrics?.dailyData || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="No Risk" stroke="#10b981" />
            <Line type="monotone" dataKey="Early" stroke="#f59e0b" />
            <Line type="monotone" dataKey="High" stroke="#ef4444" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

