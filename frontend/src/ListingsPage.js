import { useEffect, useState } from "react";
import { fetchProperties } from "./api/client";
import PropertyCard from "./PropertyCard";
import PropertyFilters from "./PropertyFilters";

export default function ListingsPage() {
  const [filters, setFilters] = useState({});
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchProperties({ ...filters, limit: 20, offset: 0 })
      .then((result) => { if (!cancelled) setData(result); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [filters]);

  let content;
  if (loading) {
    content = <p className="status">Loading properties...</p>;
  } else if (error) {
    content = <p className="status error">Error: {error}</p>;
  } else if (data.results.length === 0) {
    content = (
      <p className="status">
        No properties found. Try removing a filter or widening your price range.
      </p>
    );
  } else {
    content = (
      <>
        <p>Showing {data.results.length} of {data.total} properties</p>
        <div className="grid">
          {data.results.map((p) => <PropertyCard key={p.id} property={p} />)}
        </div>
      </>
    );
  }

  return (
    <div className="listings">
      <h1>Properties</h1>
      <PropertyFilters onSearch={setFilters} onClear={() => setFilters({})} />
      {content}
    </div>
  );
}