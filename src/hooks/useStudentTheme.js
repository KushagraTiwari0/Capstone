import { useEffect } from "react";
import { useUser } from "../context/UserContext";

/**
 * Applies / removes the student-theme body class.
 * Call this once in App.jsx.
 */
export default function useStudentTheme() {
  const { user } = useUser();
  useEffect(() => {
    if (user?.role === "student") {
      document.body.classList.add("student-theme");
    } else {
      document.body.classList.remove("student-theme");
    }
    return () => document.body.classList.remove("student-theme");
  }, [user?.role]);
}