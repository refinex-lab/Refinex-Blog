/**
 * 目录树图标映射配置
 *
 * key 为节点的 clean id（即去掉 XX_ 排序前缀后的路径）：
 *   - 顶层文件夹：直接使用文件夹名，如 "Spring 生态"
 *   - 嵌套文件夹：父/子，如 "Spring 生态/Spring AI"
 *   - 文档/自定义页面：使用 slug，如 "overview"
 *
 * value 为 iconfont Symbol 图标 ID（无需 # 前缀），如 "icon-spring"
 *
 * 文档也可通过 frontmatter icon 字段单独配置，优先级高于此处。
 *
 * 示例：
 * export const docsIconMap: Record<string, string> = {
 *   "Spring 生态":           "icon-spring",
 *   "Spring 生态/Spring AI": "icon-ai",
 *   "软件手册":               "icon-book",
 *   "overview":              "icon-home",
 * };
 */
export const docsIconMap: Record<string, string> = {
  // 在此添加你的图标映射
  "overview": "icon-fenzhongxin",

  "软件手册/Github Copilot": "icon-github",
  "软件手册/Claude Code": "icon-Claude",
  "Spring 生态/Spring AI": "icon-spring",

  "搭建本站/快速上手": "icon-kuaisushangshou",
  "搭建本站/配置手册": "icon-peizhi",
  "搭建本站/站点部署": "icon-bushu",
};
