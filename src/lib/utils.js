import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDateToLocal(dateString) {
  if (!dateString) return "";
  // Handle ISO strings by taking the date part only
  const cleanDate = dateString.split("T")[0];
  const [year, month, day] = cleanDate.split("-");
  return `${day}/${month}/${year}`;
}

export function getCurrentLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
