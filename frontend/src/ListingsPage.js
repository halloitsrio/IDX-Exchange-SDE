import { useEffect, useState } from "react";
import { fetchProperties } from "./api/client";
import PropertyCard from "./PropertyCard";

export default function ListingsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProperties({ limit: 20, offset: 0 })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="status">Loading properties...</p>;
  if (error) return <p className="status error">Error: {error}</p>;

  return (
    <div className="listings">
      <h1>Properties</h1>
      <p>
        Showing {data.results.length} of {data.total} properties
      </p>
      <div className="grid">
        {data.results.map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>
    </div>
  );
}