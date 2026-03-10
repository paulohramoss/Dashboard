import { renderHook, waitFor } from "@testing-library/react";
import { useTransactions } from "../useTransactions";
import { onSnapshot } from "firebase/firestore";

// Mock Firebase
vi.mock("@/lib/firebase", () => ({
  db: {},
}));

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  onSnapshot: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  deleteDoc: vi.fn(),
  updateDoc: vi.fn(),
  writeBatch: vi.fn(() => ({
    set: vi.fn(),
    commit: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  })),
}));

// Mock Auth
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "test-user-id" },
  }),
}));

// Mock usePartners
vi.mock("@/hooks/usePartners", () => ({
  usePartners: () => [],
}));

// Mock usePremium
vi.mock("@/hooks/usePremium", () => ({
  usePremium: () => ({ isPremium: true, loading: false }),
  FREE_LIMITS: {
    transactionsPerMonth: 50,
    accounts: 2,
    goals: 2,
    customCategories: 5,
    recurringTransactions: 2,
  },
}));

describe("useTransactions Hook", () => {
  let mockUnsubscribe;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUnsubscribe = vi.fn();
    onSnapshot.mockImplementation((query, callback) => {
      // Execute callback immediately
      callback({
        docs: [
          {
            id: "1",
            data: () => ({
              description: "Salary",
              amount: 100,
              type: "income",
              date: "2023-01-01",
            }),
          },
          {
            id: "2",
            data: () => ({
              description: "Food",
              amount: 40,
              type: "expense",
              date: "2023-01-02",
            }),
          },
        ],
      });
      return mockUnsubscribe;
    });
  });

  it("calculates balance correctly from transactions", async () => {
    const { result } = renderHook(() => useTransactions());

    // Wait for loading to finish
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Check transactions
    expect(result.current.transactions).toHaveLength(2);

    // Check stats (100 income - 40 expense = 60 balance)
    expect(result.current.stats).toEqual({
      income: 100,
      expense: 40,
      balance: 60,
    });
  });
});
