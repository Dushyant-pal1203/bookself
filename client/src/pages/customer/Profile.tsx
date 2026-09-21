// client/src/pages/customer/Profile.tsx
import { useState, useEffect, useRef } from "react";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { Button } from "@/components/common/Button";
import {
  User,
  Mail,
  Phone,
  Lock,
  Save,
  Edit2,
  Camera,
  Trash2,
  Upload,
  X,
  Loader,
} from "lucide-react";
import toast from "react-hot-toast";

export const CustomerProfile = () => {
  const {
    user,
    updateProfile,
    changePassword,
    uploadAvatar,
    deleteAvatar,
    loading: authLoading,
  } = useCustomerAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Populate form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
      });
      setLoading(false);
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    const success = await updateProfile(formData);
    if (success) {
      setIsEditing(false);
      // Refresh form data with updated user info
      if (user) {
        setFormData({
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          email: user.email || "",
          phone_number: user.phone_number || "",
        });
      }
    }
  };

  const handleChangePassword = async () => {
    // Check if current password is provided or use default "123456"
    const currentPassword = passwordData.current_password || "123456";

    // Validate new password length
    if (passwordData.new_password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    // Check if new password matches confirm password
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("New passwords do not match");
      // Clear the confirm password field
      setPasswordData((prev) => ({
        ...prev,
        confirm_password: "",
      }));
      return;
    }

    // Check if new password is same as current password
    if (currentPassword === passwordData.new_password) {
      toast.error("New password cannot be the same as current password");
      return;
    }

    const success = await changePassword(
      currentPassword,
      passwordData.new_password,
    );

    if (success) {
      setIsChangingPassword(false);
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      toast.success("Password changed successfully!");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPEG, PNG, GIF, and WEBP images are allowed");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploadingAvatar(true);
    const success = await uploadAvatar(file);
    setUploadingAvatar(false);

    if (success && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteAvatar = async () => {
    if (
      window.confirm("Are you sure you want to remove your profile picture?")
    ) {
      const success = await deleteAvatar();
      if (success) {
        // Refresh the page to show updated avatar
        window.location.reload();
      }
    }
  };

  const getInitials = () => {
    const first = user?.first_name?.charAt(0) || "";
    const last = user?.last_name?.charAt(0) || "";
    return `${first}${last}`.toUpperCase() || "U";
  };

  // Show loading state
  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  // If no user, show message
  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please login to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your account information</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Profile Header with Avatar */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-8">
          <div className="flex items-center gap-6">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="h-24 w-24 border-2 border-gray-50 rounded-full bg-white/20 flex items-center justify-center backdrop-blur overflow-hidden">
                {user?.profile_image_url ? (
                  <img
                    src={user.profile_image_url}
                    alt={`${user.first_name} ${user.last_name}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "";
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <span className="text-4xl font-bold text-white">
                    {getInitials()}
                  </span>
                )}
              </div>

              {/* Upload Button Overlay */}
              <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition"
                  disabled={uploadingAvatar}
                >
                  <Camera className="h-5 w-5" />
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-blue-100 text-sm">
                Member since{" "}
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "recently"}
              </p>

              {/* Delete Avatar Button */}
              {user?.profile_image_url && (
                <button
                  onClick={handleDeleteAvatar}
                  className="mt-2 text-xs text-blue-200 hover:text-white transition flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Remove Photo
                </button>
              )}

              {uploadingAvatar && (
                <p className="mt-2 text-xs text-blue-200">Uploading...</p>
              )}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Personal Information
            </h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form data to original user data
                    if (user) {
                      setFormData({
                        first_name: user.first_name || "",
                        last_name: user.last_name || "",
                        email: user.email || "",
                        phone_number: user.phone_number || "",
                      });
                    }
                  }}
                  variant="secondary"
                  size="sm"
                  className="transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter your first name"
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isEditing
                        ? "border-gray-300 bg-white"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter your last name"
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isEditing
                        ? "border-gray-300 bg-white"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Enter your email address"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isEditing
                      ? "border-gray-300 bg-white"
                      : "border-gray-200 bg-gray-50"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Enter your phone number"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isEditing
                      ? "border-gray-300 bg-white"
                      : "border-gray-200 bg-gray-50"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Section */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Change Password
            </h3>
            {!isChangingPassword && (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <Lock className="h-4 w-4" />
                Change Password
              </button>
            )}
          </div>

          {isChangingPassword && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  name="current_password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  If you haven't set a password before, use default: 123456
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password (min 6 characters)"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    passwordData.new_password &&
                    passwordData.new_password.length < 6
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                />
                {passwordData.new_password &&
                  passwordData.new_password.length < 6 && (
                    <p className="text-xs text-red-500 mt-1">
                      Password must be at least 6 characters long
                    </p>
                  )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    passwordData.confirm_password &&
                    passwordData.new_password !== passwordData.confirm_password
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                />
                {passwordData.confirm_password &&
                  passwordData.new_password !==
                    passwordData.confirm_password && (
                    <p className="text-xs text-red-500 mt-1">
                      Passwords do not match
                    </p>
                  )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({
                      current_password: "",
                      new_password: "",
                      confirm_password: "",
                    });
                  }}
                  variant="secondary"
                  className="transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  Cancel
                </Button>
                <Button onClick={handleChangePassword}>Update Password</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
