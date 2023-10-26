import React, { useState } from "react";

const ImageUpload: React.FC<{
  onImageUpload: (base64Image: string) => void;
}> = ({ onImageUpload }) => {
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target?.result as string;
        onImageUpload(base64Image);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="mt-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="block w-full py-2 px-4 rounded-lg text-black bg-gray-100 cursor-pointer hover:bg-gray-200"
      />
    </div>
  );
};

export default ImageUpload;
