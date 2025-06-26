// Demo data for testing purposes
export const demoAListStorages = [
  {
    id: 1,
    name: "阿里云盘",
    driver: "AliyunDrive",
    mount_path: "/阿里云盘",
    status: "work",
    modified: "2025-06-26T02:00:00Z"
  },
  {
    id: 2,
    name: "本地存储",
    driver: "Local",
    mount_path: "/local",
    status: "work", 
    modified: "2025-06-26T02:00:00Z"
  },
  {
    id: 3,
    name: "OneDrive",
    driver: "OneDrive",
    mount_path: "/onedrive",
    status: "error",
    modified: "2025-06-26T02:00:00Z"
  },
  {
    id: 4,
    name: "百度网盘",
    driver: "BaiduNetdisk",
    mount_path: "/baidu",
    status: "disabled",
    modified: "2025-06-26T02:00:00Z"
  }
];

export const isDemoMode = (token: string): boolean => {
  return token === "demo-token" || token.includes("demo");
};