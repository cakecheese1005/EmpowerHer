import {useQuery} from "@tanstack/react-query";
import {collection, getDocs} from "firebase/firestore";
import {db} from "../config/firebase";

export default function Articles() {
  const {data: articles, isLoading} = useQuery({
    queryKey: ["articles"],
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, "articles"));
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Articles</h1>
        <button className="bg-primary text-white px-4 py-2 rounded-lg">
          + New Article
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles?.map((article: any) => (
          <div key={article.id} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-2">{article.title || "Untitled"}</h3>
            <p className="text-gray-500 text-sm mb-4">
              {article.content?.substring(0, 100)}...
            </p>
            <div className="flex justify-between items-center">
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  article.published
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {article.published ? "Published" : "Draft"}
              </span>
              <button className="text-primary text-sm">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

