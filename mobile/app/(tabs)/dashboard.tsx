import {useEffect, useState} from "react";
import {View, Text, ScrollView, StyleSheet, TouchableOpacity} from "react-native";
import {useRouter} from "expo-router";
import {useAuth} from "@/contexts/AuthContext";
import {collection, query, where, orderBy, limit, getDocs} from "firebase/firestore";
import {db} from "@/config/firebase";

export default function DashboardScreen() {
  const {user} = useAuth();
  const router = useRouter();
  const [lastAssessment, setLastAssessment] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadLastAssessment();
    }
  }, [user]);

  const loadLastAssessment = async () => {
    try {
      const q = query(
        collection(db, "assessments"),
        where("userId", "==", user?.uid),
        orderBy("createdAt", "desc"),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setLastAssessment({
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data(),
        });
      }
    } catch (error) {
      console.error("Error loading assessment:", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      {lastAssessment ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Last Assessment</Text>
          <Text style={styles.riskLabel}>
            {lastAssessment.result?.label || "No Risk"}
          </Text>
          <Text style={styles.riskProbability}>
            {((lastAssessment.result?.probabilities?.High || 0) * 100).toFixed(0)}% Risk
          </Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Get Started</Text>
          <Text style={styles.cardText}>
            Complete your first assessment to see your PCOS risk level.
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/(tabs)/assessment")}
      >
        <Text style={styles.buttonText}>Run Assessment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F0F2F5",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#1a1a1a",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#1a1a1a",
  },
  cardText: {
    fontSize: 16,
    color: "#666",
  },
  riskLabel: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#9466FF",
    marginBottom: 8,
  },
  riskProbability: {
    fontSize: 18,
    color: "#666",
  },
  button: {
    backgroundColor: "#9466FF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

