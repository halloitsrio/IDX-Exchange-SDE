import { useState } from "react";

const EMPTY = { city: "", zipcode: "", minPrice: "", maxPrice: "", beds: "", baths: "" };

export default function PropertyFilters({ onSearch, onClear }) {
  const [values, setValues] = useState(EMPTY);

  function handleChange(e) {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const cleaned = Object.fromEntries(
      Object.entries(values).filter(([, v]) => v.trim() !== "")
    );
    onSearch(cleaned);
  }

  function handleClear() {
    setValues(EMPTY);
    onClear();
  }

  return (
    <form className="filters" onSubmit={handleSubmit}>
      <label htmlFor="city">City</label>
      <input id="city" name="city" value={values.city} onChange={handleChange} />

      <label htmlFor="zipcode">ZIP code</label>
      <input id="zipcode" name="zipcode" maxLength={5} value={values.zipcode} onChange={handleChange} />

      <label htmlFor="minPrice">Min price</label>
      <input id="minPrice" name="minPrice" type="number" min="0" value={values.minPrice} onChange={handleChange} />

      <label htmlFor="maxPrice">Max price</label>
      <input id="maxPrice" name="maxPrice" type="number" min="0" value={values.maxPrice} onChange={handleChange} />

      <label htmlFor="beds">Beds</label>
      <select id="beds" name="beds" value={values.beds} onChange={handleChange}>
        <option value="">Any</option>
        {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
      </select>

      <label htmlFor="baths">Baths</label>
      <select id="baths" name="baths" value={values.baths} onChange={handleChange}>
        <option value="">Any</option>
        {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+</option>)}
      </select>

      <button type="submit">Search</button>
      <button type="button" onClick={handleClear}>Clear Filters</button>
    </form>
  );
}