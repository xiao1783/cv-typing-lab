export interface NavItem {
  name: string
  route: string
  icon: string
  desc: string
}

export const NAV_ITEMS: NavItem[] = [
  { name: '学习首页', route: '/home', icon: 'HomeFilled', desc: '学习概览与继续学习' },
  { name: '课程中心', route: '/courses', icon: 'Reading', desc: '六章 CV 系统课程' },
  { name: '代码练习', route: '/practice', icon: 'Keyboard', desc: '跟打 / 填空 / 实战' },
  { name: '算法实验室', route: '/lab', icon: 'MagicStick', desc: '真实浏览器端图像处理' },
  { name: '知识测验', route: '/quiz', icon: 'EditPen', desc: '六类题型巩固检验' },
  { name: '学习分析', route: '/analytics', icon: 'DataAnalysis', desc: '数据可视化仪表盘' },
  { name: '错题与复习', route: '/mistakes', icon: 'Collection', desc: '错题本与间隔复习' },
  { name: '成就中心', route: '/achievements', icon: 'Trophy', desc: '徽章与里程碑' },
  { name: '系统设置', route: '/settings', icon: 'Setting', desc: '主题与数据管理' }
]
