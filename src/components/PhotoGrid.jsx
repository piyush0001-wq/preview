const PhotoGrid = ({ photos }) => {
  return (
    <div className="center">
      <main className="grid">
        {photos.length === 0 && (
          <p className="empty">No photos yet. Upload something ✨</p>
        )}

        {photos.map(photo => (
          <div
            key={photo.id}
            style={{
              width: "200px",
              height: "200px",
              overflow: "hidden",
              flexShrink: 0
            }}
          >
            <img
              src={photo.url}
              alt={photo.name || "uploaded"}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover" // keeps aspect ratio, fills square
              }}
            />
          </div>
        ))}
      </main>
    </div>
  );
};

export default PhotoGrid;
