import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "../../config/app";
import { useUser } from "../(extraScreens)/UserContext";

type Category = {
  _id: string;
  name: string;
};

type CategoryContextType = {
  categories: Category[];
  categoryDict: { [label: string]: string }; // name => _id (for dropdown)
  idToCategoryDict: { [id: string]: string }; // _id => name (for bills)
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  setCategoryDict: React.Dispatch<
    React.SetStateAction<{ [label: string]: string }>
  >;
  setIdToCategoryDict: React.Dispatch<
    React.SetStateAction<{ [id: string]: string }>
  >;
};

const CategoryContext = createContext<CategoryContextType | undefined>(
  undefined,
);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useUser();
  const userId = user?.uid;

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryDict, setCategoryDict] = useState<{ [label: string]: string }>(
    {},
  );
  const [idToCategoryDict, setIdToCategoryDict] = useState<{
    [id: string]: string;
  }>({});

  // Fetch categories from DB and initialize dictionaries
  useEffect(() => {
    if (!userId) return;

    fetch(`${API_BASE_URL}/api/categories?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        const cats: Category[] = data.categories || [];
        setCategories(cats);

        const nameToId: { [label: string]: string } = {};
        const idToName: { [id: string]: string } = {};

        cats.forEach((cat) => {
          nameToId[cat.name] = cat._id;
          idToName[cat._id] = cat.name;
        });

        setCategoryDict(nameToId);
        setIdToCategoryDict(idToName);
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, [userId]);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        categoryDict,
        idToCategoryDict,
        setCategories,
        setCategoryDict,
        setIdToCategoryDict,
      }}
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
