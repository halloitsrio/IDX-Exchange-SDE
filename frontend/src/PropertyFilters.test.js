import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PropertyFilters from "./PropertyFilters";

test("renders all six inputs", () => {
  render(<PropertyFilters onSearch={jest.fn()} onClear={jest.fn()} />);
  expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/zip/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/min price/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/max price/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/beds/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/baths/i)).toBeInTheDocument();
});

test("submitting sends only the filled-in values", async () => {
  const onSearch = jest.fn();
  render(<PropertyFilters onSearch={onSearch} onClear={jest.fn()} />);

  await userEvent.type(screen.getByLabelText(/city/i), "Irvine");
  await userEvent.selectOptions(screen.getByLabelText(/beds/i), "3");
  await userEvent.click(screen.getByRole("button", { name: /search/i }));

  expect(onSearch).toHaveBeenCalledWith({ city: "Irvine", beds: "3" });
});

test("Clear Filters resets the form and calls onClear", async () => {
  const onClear = jest.fn();
  render(<PropertyFilters onSearch={jest.fn()} onClear={onClear} />);

  const city = screen.getByLabelText(/city/i);
  await userEvent.type(city, "Irvine");
  await userEvent.click(screen.getByRole("button", { name: /clear filters/i }));

  expect(city).toHaveValue("");
  expect(onClear).toHaveBeenCalled();
});