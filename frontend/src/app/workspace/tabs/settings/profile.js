"use client"; // 确保这是一个客户端组件

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext"; // 导入 UserContext
import { updateUser } from "@/api/users"; // Import updateUser API

const ProfileTab = () => {
  const { user } = useUser(); // Get user from context
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [userDetails, setUserDetails] = useState({
    username: user?.username || "", // Get the username from the user context
    email: user?.email || "", // Assuming email is available in user context
    phone: user?.phone || "", // Assuming phone is available in user context
  });

  // Update the userDetails state when the user context is updated
  useEffect(() => {
    if (user) {
      setUserDetails({
        ...userDetails,
        username: user.username,
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePhoto(URL.createObjectURL(file));
    }
  };

  const handlePhotoRemove = () => {
    if (window.confirm("Are you sure you want to remove the photo?")) {
      setProfilePhoto(null);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserDetails({ ...userDetails, [name]: value });
  };

  const handleSave = async () => {
    try {
      // Call the updateUser API with the current userDetails
      const response = await updateUser(user.user_id, userDetails);
      if (response.status === 200) {
        alert("Successfully saved!");
      }
    } catch (error) {
      console.error("Error saving user details:", error);
      alert("Failed to save user details.");
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-bold">Profile Photo</h3>
        <div className="flex items-center">
          <div
            className="w-16 h-16 bg-gray-200 rounded-full mr-4"
            style={{
              backgroundImage: `url(${profilePhoto || "/avatar.jpg"})`, // Default to /avatar.jpg
              backgroundSize: "cover",
            }}
          ></div>
          <input
            type="file"
            onChange={handlePhotoUpload}
            className="hidden"
            id="photo-upload"
          />
          <label
            htmlFor="photo-upload"
            className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
          >
            Upload Photo
          </label>
          <button onClick={handlePhotoRemove} className="text-red-500 ml-2">
            remove
          </button>
        </div>
        <p className="text-sm mt-2">Image requirements:</p>
        <ul className="text-sm list-disc list-inside">
          <li>Min. 400 x 400px</li>
          <li>Max. 2MB</li>
          <li>Your face or company logo</li>
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">User Details</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={userDetails.username}
              onChange={handleInputChange}
              className="w-full border p-3 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Username"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={userDetails.email}
              onChange={handleInputChange}
              className="w-full border p-3 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Email"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Phone</label>
            <input
              type="text"
              name="phone"
              value={userDetails.phone}
              onChange={handleInputChange}
              className="w-full border p-3 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Phone"
            />
          </div>
        </div>
        <button
          onClick={handleSave}
          className="bg-blue-500 text-white px-6 py-3 mt-6 rounded shadow hover:bg-blue-600 transition duration-200"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default ProfileTab;
