const Header = ({ onUpload }) => {
  const handleChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      onUpload(files);
    }
    // Reset input so same file can be uploaded again
    e.target.value = "";
  };

  return (
    <header className="header">
      <h1 style={{textAlign: "center"}}>Hello, Bubba! 🫀</h1>
      <label className="upload-btn">
        Upload
        <input
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handleChange}
        />
      </label>
    </header>
  );
};

export default Header;
