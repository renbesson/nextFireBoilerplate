import { auth, firestore } from "../lib/firebase";
import { doc, onSnapshot, getFirestore } from "firebase/firestore";
import { useState, useEffect, createContext, useContext } from "react";
export const UserContext = createContext();

export default function UserContextComp({ children }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true); // Helpful, to update the UI accordingly.

  useEffect(() => {
    // Listen authenticated user
    const unsubscriber = auth.onAuthStateChanged(async (authUser) => {
      try {
        if (authUser) {
          // User is signed in.
          const docRef = doc(getFirestore(), "users", authUser.uid);

          onSnapshot(docRef, (doc) => {
            // Gets the info in the firestore doc for this specific UID
            setUser((prevUser) => {
              return { ...prevUser, ...doc.data() };
            });
          });
        } else setUser(null);
      } catch (error) {
        // Most probably a connection error. Handle appropriately.
        console.error(error);
      } finally {
        setLoadingUser(false);
      }
    });

    // Unsubscribe auth listener on unmount
    return () => unsubscriber();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loadingUser }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook that shorhands the context!
export const useUser = () => useContext(UserContext);
