import React, { useState } from 'react';
//import axios from 'axios';

const SettingTab = () => {
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [userDetails, setUserDetails] = useState({
    userId: '', // Read-only
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordError, setPasswordError] = useState('');

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

  const validatePassword = () => {
    const { currentPassword, newPassword, confirmPassword } = userDetails;
    
    if (!currentPassword) {
      setPasswordError('Current password is required');
      return false;
    }

    if (!newPassword) {
      setPasswordError('New password is required');
      return false;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return false;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError('Password must contain at least one uppercase letter');
      return false;
    }

    if (!/[a-z]/.test(newPassword)) {
      setPasswordError('Password must contain at least one lowercase letter');
      return false;
    }

    if (!/[0-9]/.test(newPassword)) {
      setPasswordError('Password must contain at least one number');
      return false;
    }

    if (!/[!@#$%^&*]/.test(newPassword)) {
      setPasswordError('Password must contain at least one special character (!@#$%^&*)');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return false;
    }

    setPasswordError('');
    return true;
  };

  const handleSave = async () => {
    try {
      if (!validatePassword()) {
        return;
      }

      const response = await axios.post('/api/saveUserDetails', userDetails);
      if (response.status === 200) {
        alert('Successfully saved!');
        // Clear password fields after successful save
        setUserDetails(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }
    } catch (error) {
      console.error('Error saving user details:', error);
      alert('Failed to save user details.');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4">Profile Photo</h3>
        <div className="flex items-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mr-4" style={{ backgroundImage: `url(${profilePhoto})`, backgroundSize: 'cover' }}></div>
          <input type="file" onChange={handlePhotoUpload} className="hidden" id="photo-upload" />
          <label htmlFor="photo-upload" className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer">Upload Photo</label>
          <button onClick={handlePhotoRemove} className="text-red-500 ml-2">Remove</button>
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
            <label className="block text-sm font-semibold mb-1">User ID</label>
            <input type="text" value={userDetails.userId} disabled className="w-full border p-3 rounded shadow-sm bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Username</label>
            <input type="text" name="username" value={userDetails.username} onChange={handleInputChange} className="w-full border p-3 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Username" />
          </div>
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
          <div className="col-span-2 border-t pt-6">
            <h4 className="text-md font-semibold mb-4">Change Password</h4>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-1">Current Password</label>
                <input 
                  type="password" 
                  name="currentPassword" 
                  value={userDetails.currentPassword} 
                  onChange={handleInputChange} 
                  className="w-full border p-3 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Enter current password" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">New Password</label>
                <input 
                  type="password" 
                  name="newPassword" 
                  value={userDetails.newPassword} 
                  onChange={handleInputChange} 
                  className="w-full border p-3 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Enter new password" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Confirm New Password</label>
                <input 
                  type="password" 
                  name="confirmPassword" 
                  value={userDetails.confirmPassword} 
                  onChange={handleInputChange} 
                  className="w-full border p-3 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Confirm new password" 
                />
              </div>
            </div>
            {passwordError && (
              <p className="text-red-500 text-sm mt-2">{passwordError}</p>
            )}
            <div className="mt-2">
              <p className="text-sm text-gray-600">Password requirements:</p>
              <ul className="text-sm list-disc list-inside text-gray-600">
                <li>Minimum 8 characters long</li>
                <li>At least one uppercase letter</li>
                <li>At least one lowercase letter</li>
                <li>At least one number</li>
                <li>At least one special character (!@#$%^&*)</li>
              </ul>
            </div>
          </div>
        </div>
        <button onClick={handleSave} className="bg-blue-500 text-white px-6 py-3 mt-6 rounded shadow hover:bg-blue-600 transition duration-200">Save</button>
      </div>
    </div>
  );
};

export default SettingTab;