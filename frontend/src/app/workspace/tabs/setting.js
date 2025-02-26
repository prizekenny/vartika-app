import React, { useState } from 'react';
//import axios from 'axios';

const SettingTab = () => {
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [userDetails, setUserDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePhoto(URL.createObjectURL(file));
    }
  };

  const handlePhotoRemove = () => {
    if (window.confirm('Are you sure you want to remove the photo?')) {
      setProfilePhoto(null);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserDetails({ ...userDetails, [name]: value });
  };

  const handleSave = async () => {
    try {
      const response = await axios.post('/api/saveUserDetails', userDetails);
      if (response.status === 200) {
        alert('Successfully saved!');
      }
    } catch (error) {
      console.error('Error saving user details:', error);
      alert('Failed to save user details.');
    }
  };

  return (
    <div className="flex">
      {/* 左側導航欄 */}
      <div className="w-1/4 p-4 border-r">
        <h2 className="text-xl font-bold mb-4">Settings</h2>
        <ul>
          <li className="mb-2">Edit Profile</li>
          <li className="mb-2">Account</li>
          <li className="mb-2">Billing</li>
          <li className="mb-2">Subscriptions</li>
          <li className="mb-2">Notifications</li>
        </ul>
      </div>

      {/* 右側內容區域 */}
      <div className="w-3/4 p-4">
        <div className="mb-4">
          <h3 className="text-lg font-bold">Profile Photo</h3>
          <div className="flex items-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full mr-4" style={{ backgroundImage: `url(${profilePhoto})`, backgroundSize: 'cover' }}></div>
            <input type="file" onChange={handlePhotoUpload} className="hidden" id="photo-upload" />
            <label htmlFor="photo-upload" className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer">Upload Photo</label>
            <button onClick={handlePhotoRemove} className="text-red-500 ml-2">remove</button>
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
              <label className="block text-sm font-semibold mb-1">First Name</label>
              <input type="text" name="firstName" value={userDetails.firstName} onChange={handleInputChange} className="w-full border p-3 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="First Name" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Last Name</label>
              <input type="text" name="lastName" value={userDetails.lastName} onChange={handleInputChange} className="w-full border p-3 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Last Name" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Email</label>
              <input type="email" name="email" value={userDetails.email} onChange={handleInputChange} className="w-full border p-3 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Email" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Phone</label>
              <input type="text" name="phone" value={userDetails.phone} onChange={handleInputChange} className="w-full border p-3 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Phone" />
            </div>
          </div>
          <button onClick={handleSave} className="bg-blue-500 text-white px-6 py-3 mt-6 rounded shadow hover:bg-blue-600 transition duration-200">Save</button>
        </div>
      </div>
    </div>
  );
};

export default SettingTab;