import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TransactionForm from "../TransactionForm";
import { vi } from "vitest";

// Mock hooks
vi.mock("@/hooks/useCategories", () => ({
  useCategories: () => ({
    categories: [
      { id: "1", name: "Food", type: "expense", isDefault: true },
      { id: "2", name: "Salary", type: "income", isDefault: true },
    ],
  }),
}));

vi.mock("@/hooks/useAccounts", () => ({
  useAccounts: () => ({
    accounts: [{ id: "acc1", name: "Bank", type: "checking" }],
  }),
}));

vi.mock("@/hooks/useTransactions", () => ({
  useTransactions: () => ({
    transactions: [],
  }),
}));

vi.mock("@/hooks/useRules", () => ({
  useRules: () => ({
    rules: [],
    addRule: vi.fn(),
  }),
}));

// Mock Translations
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: "en" },
  }),
}));

describe("TransactionForm Component", () => {
  it("prevents submission with empty fields", async () => {
    const user = userEvent.setup();
    const handleAddTransaction = vi.fn();

    render(<TransactionForm onAddTransaction={handleAddTransaction} />);

    // Attempt to submit without filling fields
    // Button text is "transactions.form.add" effectively because of the mock
    const submitButton = screen.getByRole("button", {
      name: /transactions.form.add/i,
    }); // Or look for the Plus icon

    // Using userEvent to click
    await user.click(submitButton);

    // Verify submit handler was NOT called
    expect(handleAddTransaction).not.toHaveBeenCalled();

    // Check if browser native validation prevented submission (Input required attribute)
    // Testing native form validation is tricky in jsdom without full implementation,
    // but checking called status is a good proxy for integration test of "not submitting invalid data".

    const descriptionInput = screen.getByLabelText(
      /transactions.form.description/i
    );
    expect(descriptionInput).toBeRequired();
  });
});
