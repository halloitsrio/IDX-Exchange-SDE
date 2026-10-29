import { fetchProperties, fetchPropertyDetail } from "./client";

beforeEach(() => {
  global.fetch = jest.fn();
});

test("fetchProperties builds the query string and skips empty values", async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    json: async () => ({ total: 0, results: [] }),
  });

  await fetchProperties({ city: "Irvine", beds: "", minPrice: 300000 });

  expect(global.fetch).toHaveBeenCalledWith("/api/properties?city=Irvine&minPrice=300000");
});

test("throws the backend's error message on an HTTP error", async () => {
  global.fetch.mockResolvedValue({
    ok: false,
    status: 400,
    json: async () => ({ error: "Invalid query parameters", details: ["limit must be 1-100"] }),
  });

  await expect(fetchProperties({ limit: 0 })).rejects.toThrow("Invalid query parameters");
});

test("throws a friendly message when the network fails", async () => {
  global.fetch.mockRejectedValue(new TypeError("Failed to fetch"));

  await expect(fetchProperties()).rejects.toThrow("Cannot reach the server");
});

test("fetchPropertyDetail encodes the id in the URL", async () => {
  global.fetch.mockResolvedValue({ ok: true, json: async () => ({ id: 1 }) });

  await fetchPropertyDetail("abc 123");

  expect(global.fetch).toHaveBeenCalledWith("/api/properties/abc%20123");
});