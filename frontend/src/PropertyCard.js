function getFirstPhoto(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && typeof parsed[0] === "string" && parsed[0]) {
      return parsed[0];
    }
  } catch (e) {
    // not valid JSON; fall through
  }
  return null;
}

export default function PropertyCard({ property }) {
  const photo = getFirstPhoto(property.L_Photos);

  return (
    <div className="card">
      {photo ? (
        <img src={photo} alt={property.L_Address} className="card-img" />
      ) : (
        <div className="card-img no-photo">No photo</div>
      )}
      <div className="card-body">
        <h2>${Number(property.L_SystemPrice).toLocaleString()}</h2>
        <p>{property.L_Address}</p>
        <p>{property.L_City}, {property.L_State}</p>
        <p>
          {property.beds ?? "-"} bd | {property.baths ?? "-"} ba |{" "}
          {property.sqft ? Number(property.sqft).toLocaleString() : "-"} sqft
        </p>
      </div>
    </div>
  );
}