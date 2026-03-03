/*
 * 友链配置
 */

export type Friend = {
  id: string;
  name: string;
  description: string;
  href: string;
  avatar?: string;
  tags?: string[];
};

export type FriendsConfig = {
  title: string;
  description: string;
  applyGuide?: {
    title: string;
    requirements: string[];
    contact: {
      email?: string;
      github?: string;
      description: string;
    };
  };
  friends: Friend[];
};

export const friendsConfig: FriendsConfig = {
  title: "友情链接",
  description: "这里是我的朋友们，他们都是优秀的开发者和创作者。",
  applyGuide: {
    title: "申请友链",
    requirements: [
      "网站内容积极向上，无违法违规信息",
      "网站可以正常访问，有一定的更新频率",
      "优先考虑技术博客、开源项目等",
    ],
    contact: {
      email: "refinexcn@gmail.com",
      github: "https://github.com/refinex-lab/Refinex-Blog/issues/new",
      description: "请通过邮件或 GitHub Issue 联系我申请友链",
    },
  },
  friends: [
    // 示例友链，可以根据实际情况修改
    // {
    //   id: "example",
    //   name: "示例博客",
    //   description: "这是一个示例友链描述",
    //   href: "https://example.com",
    //   avatar: "https://example.com/avatar.png",
    //   tags: ["技术", "博客"],
    // },
  ],
};
