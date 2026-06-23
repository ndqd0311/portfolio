import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public', // Nơi lưu file sw.js sau khi build
  register: true, // Tự động đăng ký service worker
  skipWaiting: true, // Buộc service worker mới kích hoạt ngay khi có bản cập nhật
  disable: process.env.NODE_ENV === 'development', // Tắt PWA ở môi trường dev để tránh bị cache khó sửa code
});

/** @type {import('next').NextConfig} */
const nextConfig = {
};

export default withPWA(nextConfig);