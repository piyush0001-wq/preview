import { useEffect, useState } from "react";
import Header from "./components/Header";
import PhotoGrid from "./components/PhotoGrid";

import { db, storage } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL
} from "firebase/storage";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from "firebase/auth";

// 🔐 Initialize Firebase Auth
const auth = getAuth();

function App() {
  const [photos, setPhotos] = useState([]);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  // 🔐 Ensure user is authenticated (anonymous)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        signInAnonymously(auth)
          .then(() => setAuthReady(true))
          .catch((err) => console.error("Auth error:", err));
      } else {
        setAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // 🔽 Fetch images
  const fetchPhotos = async () => {
    const q = query(collection(db, "photos"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    setPhotos(
      snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    );
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  // 🔼 Upload with progress
  const handleUpload = async (files) => {
    if (!authReady) {
      console.log("Auth not ready yet");
      return;
    }

    for (const file of files) {
      setUploading(true);
      setProgress(0);

      const storageRef = ref(
        storage,
        `photos/${Date.now()}-${file.name}`
      );

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const percent =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(Math.round(percent));
        },
        (error) => {
          console.error("Upload error:", error);
          setUploading(false);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);

          await addDoc(collection(db, "photos"), {
            name: file.name,
            size: file.size,
            type: file.type,
            url,
            createdAt: serverTimestamp()
          });

          setUploading(false);
          setProgress(0);
          fetchPhotos();
        }
      );
    }
  };

  return (
    <>
      <Header onUpload={handleUpload} />

      {uploading && (
        <div style={{ padding: "10px", width: "300px", margin: "auto" }}>
          <div
            style={{
              height: "8px",
              background: "#ddd",
              borderRadius: "4px",
              overflow: "hidden"
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "#4caf50",
                transition: "width 0.2s"
              }}
            />
          </div>
          <p style={{ textAlign: "center", marginTop: "5px" }}>
            Uploading… {progress}%
          </p>
        </div>
      )}

      <p style={{ textAlign: "center", marginTop: "10px" }}>
        Upload your beautiful photos!
      </p>

      <PhotoGrid photos={photos} />
    </>
  );
}

export default App;
