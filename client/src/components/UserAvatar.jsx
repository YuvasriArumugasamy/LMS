import React from 'react';

export const UserAvatar = ({ user, size = 'w-10 h-10 text-sm', className = '', customBg, onClick }) => {
  const isCustomPhoto =
    user?.profileImage &&
    !user.profileImage.includes('unsplash.com') &&
    !user.profileImage.includes('default');

  const getInitials = () => {
    if (!user) return 'EM';
    const first = (user.firstName || '').trim();
    const last = (user.lastName || '').trim();
    if (first && first !== 'User' && first !== 'Employee') {
      return `${first.charAt(0).toUpperCase()}${last ? last.charAt(0).toUpperCase() : ''}`;
    }
    if (user.email) {
      const parts = user.email.split('@')[0].split(/[\._-]/);
      if (parts.length >= 2) {
        return `${parts[0].charAt(0).toUpperCase()}${parts[1].charAt(0).toUpperCase()}`;
      }
      return user.email.substring(0, 2).toUpperCase();
    }
    if (user.role) {
      return user.role.substring(0, 2).toUpperCase();
    }
    return 'EM';
  };

  if (isCustomPhoto) {
    return (
      <img
        src={user.profileImage}
        alt={user?.firstName || 'User'}
        onClick={onClick}
        className={`${size} rounded-full object-cover aspect-square shrink-0 shadow-sm ${className}`}
      />
    );
  }

  const bgClass = customBg || 'bg-gradient-to-tr from-blue-600 to-sky-400';

  // Enterprise Initial Gradient Badge Avatar (First Letter of First Name + Last Name)
  return (
    <div
      onClick={onClick}
      className={`${size} rounded-full ${bgClass} text-white font-black tracking-wider flex items-center justify-center aspect-square shrink-0 shadow-md select-none ${className}`}
    >
      {getInitials()}
    </div>
  );
};
