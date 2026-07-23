import type { AnnouncementConfig } from "../types/announcementConfig";

export const announcementConfig: AnnouncementConfig = {
  // 公告标题
  title: "欢迎",
  // 公告内容
  content: "文章会根据准则组合呈现不同的墨水颜色。",
  // 是否允许用户关闭公告
  closable: true,
  link: {
    // 启用链接
    enable: true,
    // 链接文本
		text: "查看准则",
    // 链接 URL
    url: "/aspects/",
    // 内部链接
    external: false,
  },
};
