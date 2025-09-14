// CategoryContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "D:/coding/Major_Projects/SaveMyBill/frontend/config/app";
import { useUser } from "src/(extraScreens)/UserContext";

type Category = {
  _id: string;
  name: string;
};

type CategoryContextType = {
  categories: Category[];
  categoryDict: { [label: string]: string }; // label => _id
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  setCategoryDict: React.Dispatch<
    React.SetStateAction<{ [label: string]: string }>
  >;
};

const CategoryContext = createContext<CategoryContextType | undefined>(
  undefined
);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useUser();
  const userId = user?.uid;
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryDict, setCategoryDict] = useState<{ [label: string]: string }>(
    {}
  );

  // Fetch categories from DB and initialize dictionary
  useEffect(() => {
    if (!userId) return;

    fetch(`${API_BASE_URL}/api/categories?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        const cats: Category[] = data.categories || [];
        setCategories(cats);

        const dict: { [label: string]: string } = {};
        cats.forEach((cat) => {
          dict[cat.name] = cat._id;
        });
        setCategoryDict(dict);
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, [userId]);

  return (
    <CategoryContext.Provider
      value={{ categories, categoryDict, setCategories, setCategoryDict }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

// Custom hook to use category context
export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategory must be used within a CategoryProvider");
  }
  return context;
};
