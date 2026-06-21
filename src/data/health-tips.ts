export interface HealthTip {
  id: string
  icon: string
  title: string
  body: string
  source: string
  color: string
}

export const HEALTH_TIPS: HealthTip[] = [
  {
    id: 't1', icon: '🥬', color: 'green',
    title: '每天吃够 5 种蔬菜',
    body: '不同颜色的蔬菜提供不同营养素：深绿色（菠菜/西蓝花）富含叶酸和维K；橙色（胡萝卜/南瓜）富含β-胡萝卜素。建议每日至少摄入 300-500g 蔬菜。',
    source: '中国居民膳食指南 (2023)'
  },
  {
    id: 't2', icon: '🐟', color: 'blue',
    title: '每周吃 2 次深海鱼',
    body: '三文鱼、鲭鱼、沙丁鱼富含 Omega-3 脂肪酸（EPA/DHA），有助于降低心血管疾病风险，改善大脑功能。每次约 100-150g。',
    source: 'American Heart Association'
  },
  {
    id: 't3', icon: '💧', color: 'teal',
    title: '每日饮水 1.5-2L',
    body: '充足饮水有助于新陈代谢和体温调节。建议少量多次，每次 200-300ml。早晨起床后先喝一杯温水最有益。',
    source: '中国居民膳食指南 (2023)'
  },
  {
    id: 't4', icon: '🌰', color: 'orange',
    title: '坚果每天一小把',
    body: '核桃、杏仁、腰果等坚果富含不饱和脂肪酸、维E和膳食纤维。每天摄入约 30g（单手抓一把），原味最佳，避免油炸/加盐。',
    source: 'WHO Nutrition Guidelines'
  },
  {
    id: 't5', icon: '🏃', color: 'purple',
    title: '餐后散步 15 分钟',
    body: '饭后轻微活动有助于控制血糖峰值。研究表明餐后散步比餐前效果更好，15-20 分钟即可显著改善餐后血糖反应。',
    source: 'Diabetes Care Journal'
  },
  {
    id: 't6', icon: '🧂', color: 'red',
    title: '每日盐摄入 < 5g',
    body: '高盐饮食是高血压的重要风险因素。建议使用限盐勺，多用香草/香料代替盐调味。注意酱油、蚝油等隐形盐来源。',
    source: 'WHO Guideline: Sodium Intake'
  },
  {
    id: 't7', icon: '🥛', color: 'blue',
    title: '每日 300ml 奶制品',
    body: '牛奶和酸奶富含钙质和优质蛋白，有助于骨骼健康和肌肉维护。乳糖不耐者可选择酸奶或低乳糖奶。',
    source: '中国居民膳食指南 (2023)'
  },
  {
    id: 't8', icon: '🥚', color: 'green',
    title: '早餐保证优质蛋白',
    body: '早餐摄入 20-30g 蛋白质（约等于 2 个鸡蛋或 1 杯牛奶+1 份燕麦）有助于维持上午的饱腹感和精力水平。',
    source: 'Journal of Nutrition (2022)'
  },
]
