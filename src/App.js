import { useEffect, useState } from "react";
import Header from "./components/Header";
import Gallery from "./Gallery";

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

function App() {
  const [photos, setPhotos] = useState([]);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  // 🔽 Fetch images
  const fetchPhotos = async () => {
    const q = query(collection(db, "photos"));
    const snapshot = await getDocs(q);

    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Sort by 'order' ascending, then by 'createdAt' descending (for new items with order 0)
    items.sort((a, b) => {
      const orderDiff = (a.order ?? 0) - (b.order ?? 0);
      if (orderDiff !== 0) return orderDiff;
      return (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0);
    });

    setPhotos(items);
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  // 🔼 Upload with progress
  const handleUpload = async (files) => {
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
            createdAt: serverTimestamp(),
            order: 0 // New images appear at the top (sharing order 0 until reordered)
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
      <p style={{ textAlign: "center", margin: "15px", fontFamily: "sans-serif"}}>Upload your beautiful photos!</p>
      {/* <PhotoGrid photos={photos} /> */}
      <Gallery images={photos} setImages={setPhotos} />
    </>
  );
}

export default App;
