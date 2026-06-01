import express from 'express';

const router = express.Router();

export interface SystemExam {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  date: string;
  type: 'exam' | 'registration' | 'competition';
  category: 'language' | 'skill' | 'competition';
  isEnabled: boolean;
  description?: string;
  registrationUrl?: string;
}

const systemExams: SystemExam[] = [
  {
    id: 'sys-1',
    title: '英语四级考试',
    subtitle: 'CET-4 · 语言类',
    tag: 'CET-4',
    date: '2026-06-13',
    type: 'exam',
    category: 'language',
    isEnabled: true,
    description: '大学英语四级考试，是由国家教育部高等教育司主持的全国性英语考试，主要测试学生的英语综合应用能力，包括听力、阅读、写作和翻译。',
    registrationUrl: 'https://cet.neea.edu.cn/',
  },
  {
    id: 'sys-2',
    title: '英语六级考试',
    subtitle: 'CET-6 · 语言类',
    tag: 'CET-6',
    date: '2026-06-13',
    type: 'exam',
    category: 'language',
    isEnabled: true,
    description: '大学英语六级考试，是由国家教育部高等教育司主持的全国性英语考试，难度高于四级，主要测试学生的英语综合应用能力，包括听力、阅读、写作和翻译。',
    registrationUrl: 'https://cet.neea.edu.cn/',
  },
  {
    id: 'sys-3',
    title: '计算机二级报名截止',
    subtitle: 'NCRE · 技能类',
    tag: 'NCRE',
    date: '2026-03-16',
    type: 'registration',
    category: 'skill',
    isEnabled: true,
    description: '全国计算机等级考试二级报名截止日期，二级考试主要考查计算机基础知识和使用一种高级计算机语言编写程序以及上机调试的基本技能。',
    registrationUrl: 'https://ncre.neea.edu.cn/',
  },
  {
    id: 'sys-4',
    title: '计算机二级考试',
    subtitle: 'NCRE · 技能类',
    tag: 'NCRE',
    date: '2026-05-09',
    type: 'exam',
    category: 'skill',
    isEnabled: true,
    description: '全国计算机等级考试二级，主要考查计算机基础知识和使用一种高级计算机语言编写程序以及上机调试的基本技能，包括C语言、Java、Python等多个科目。',
    registrationUrl: 'https://ncre.neea.edu.cn/',
  },
  {
    id: 'sys-5',
    title: '软考（中级）报名',
    subtitle: '软件水平考试 · 技能类',
    tag: '软考',
    date: '2026-04-11',
    type: 'registration',
    category: 'skill',
    isEnabled: true,
    description: '全国计算机技术与软件专业技术资格（水平）考试中级报名截止日期，中级考试包括软件设计师、网络工程师、数据库系统工程师等多个专业。',
    registrationUrl: 'https://www.ruankao.org.cn/',
  },
  {
    id: 'sys-6',
    title: '软考（中级）考试',
    subtitle: '软件水平考试 · 技能类',
    tag: '软考',
    date: '2026-05-23',
    type: 'exam',
    category: 'skill',
    isEnabled: true,
    description: '全国计算机技术与软件专业技术资格（水平）考试中级，是由国家人力资源和社会保障部、工业和信息化部领导下的国家级考试，是对计算机与软件专业技术人员职业资格的认定。',
    registrationUrl: 'https://www.ruankao.org.cn/',
  },
  {
    id: 'sys-7',
    title: '英语四级报名',
    subtitle: 'CET-4 · 语言类',
    tag: 'CET-4',
    date: '2026-03-25',
    type: 'registration',
    category: 'language',
    isEnabled: true,
    description: '大学英语四级考试报名截止日期，四级考试是由国家教育部高等教育司主持的全国性英语考试，主要测试学生的英语综合应用能力。',
    registrationUrl: 'https://cet.neea.edu.cn/',
  },
  {
    id: 'sys-8',
    title: '英语六级报名',
    subtitle: 'CET-6 · 语言类',
    tag: 'CET-6',
    date: '2026-03-25',
    type: 'registration',
    category: 'language',
    isEnabled: true,
    description: '大学英语六级考试报名截止日期，六级考试是由国家教育部高等教育司主持的全国性英语考试，难度高于四级，主要测试学生的英语综合应用能力。',
    registrationUrl: 'https://cet.neea.edu.cn/',
  },
  {
    id: 'sys-9',
    title: '计算机三级考试',
    subtitle: 'NCRE · 技能类',
    tag: 'NCRE三级',
    date: '2026-05-09',
    type: 'exam',
    category: 'skill',
    isEnabled: true,
    description: '全国计算机等级考试三级，主要考查计算机应用能力，包括网络技术、数据库技术、软件测试技术、信息安全技术、嵌入式系统开发技术等多个方向。',
    registrationUrl: 'https://ncre.neea.edu.cn/',
  },
  {
    id: 'sys-10',
    title: '软考（高级）报名',
    subtitle: '软件水平考试 · 技能类',
    tag: '软考高级',
    date: '2026-04-11',
    type: 'registration',
    category: 'skill',
    isEnabled: true,
    description: '全国计算机技术与软件专业技术资格（水平）考试高级报名截止日期，高级考试包括信息系统项目管理师、系统分析师、系统架构设计师等多个专业。',
    registrationUrl: 'https://www.ruankao.org.cn/',
  },
  {
    id: 'sys-11',
    title: '软考（高级）考试',
    subtitle: '软件水平考试 · 技能类',
    tag: '软考高级',
    date: '2026-05-23',
    type: 'exam',
    category: 'skill',
    isEnabled: true,
    description: '全国计算机技术与软件专业技术资格（水平）考试高级，是由国家人力资源和社会保障部、工业和信息化部领导下的国家级考试，是对计算机与软件专业技术人员职业资格的认定，属于高级职称。',
    registrationUrl: 'https://www.ruankao.org.cn/',
  },
  {
    id: 'sys-12',
    title: '普通话水平测试',
    subtitle: 'PSC · 语言类',
    tag: 'PSC',
    date: '2026-04-18',
    type: 'exam',
    category: 'language',
    isEnabled: true,
    description: '普通话水平测试，是由国家语言文字工作委员会主持的全国性语言考试，主要测试应试人的普通话规范程度、熟练程度和应用能力。',
    registrationUrl: 'https://www.cltt.org/',
  },
  {
    id: 'sys-13',
    title: '高等数学期末考试',
    subtitle: '数学类 · 必修',
    tag: '高数',
    date: '2026-06-20',
    type: 'exam',
    category: 'skill',
    isEnabled: true,
    description: '高等数学期末考试，涵盖微积分、极限、级数等核心内容，是理工科学生的重要必修课程。',
    registrationUrl: '',
  },
  {
    id: 'sys-14',
    title: '线性代数期末考',
    subtitle: '数学类 · 必修',
    tag: '线代',
    date: '2026-06-22',
    type: 'exam',
    category: 'skill',
    isEnabled: true,
    description: '线性代数期末考试，涵盖矩阵、行列式、向量空间等核心内容。',
    registrationUrl: '',
  },
  {
    id: 'sys-15',
    title: '大学物理期末考',
    subtitle: '物理类 · 必修',
    tag: '物理',
    date: '2026-06-25',
    type: 'exam',
    category: 'skill',
    isEnabled: true,
    description: '大学物理期末考试，涵盖力学、热学、电磁学等核心内容。',
    registrationUrl: '',
  },
  {
    id: 'sys-16',
    title: '程序设计基础期末考',
    subtitle: '计算机类 · 必修',
    tag: '程序设计',
    date: '2026-06-28',
    type: 'exam',
    category: 'skill',
    isEnabled: true,
    description: '程序设计基础期末考试，涵盖C语言编程、算法基础等核心内容。',
    registrationUrl: '',
  },
  {
    id: 'sys-17',
    title: '离散数学期末考',
    subtitle: '数学类 · 必修',
    tag: '离散数学',
    date: '2026-06-28',
    type: 'exam',
    category: 'skill',
    isEnabled: true,
    description: '离散数学期末考试，涵盖集合论、图论、数理逻辑等核心内容。',
    registrationUrl: '',
  },
  {
    id: 'sys-18',
    title: '概率论与数理统计期末考',
    subtitle: '数学类 · 必修',
    tag: '概率论',
    date: '2026-07-01',
    type: 'exam',
    category: 'skill',
    isEnabled: true,
    description: '概率论与数理统计期末考试，涵盖概率分布、假设检验、回归分析等核心内容。',
    registrationUrl: '',
  },
  {
    id: 'sys-19',
    title: '数字电路与逻辑设计考试',
    subtitle: '电子类 · 必修',
    tag: '数电',
    date: '2026-07-02',
    type: 'exam',
    category: 'skill',
    isEnabled: true,
    description: '数字电路与逻辑设计期末考试，涵盖组合逻辑电路、时序逻辑电路等核心内容。',
    registrationUrl: '',
  },
  {
    id: 'sys-20',
    title: '数据库系统原理考试',
    subtitle: '计算机类 · 必修',
    tag: '数据库',
    date: '2026-07-03',
    type: 'exam',
    category: 'skill',
    isEnabled: true,
    description: '数据库系统原理期末考试，涵盖SQL查询、数据库设计、事务管理等核心内容。',
    registrationUrl: '',
  },
  {
    id: 'sys-21',
    title: '计算机组成原理考试',
    subtitle: '计算机类 · 必修',
    tag: '计组',
    date: '2026-07-05',
    type: 'exam',
    category: 'skill',
    isEnabled: true,
    description: '计算机组成原理期末考试，涵盖指令系统、存储器层次结构、CPU结构等核心内容。',
    registrationUrl: '',
  },
  {
    id: 'sys-22',
    title: '编译原理期末考试',
    subtitle: '计算机类 · 选修',
    tag: '编译原理',
    date: '2026-07-06',
    type: 'exam',
    category: 'skill',
    isEnabled: true,
    description: '编译原理期末考试，涵盖词法分析、语法分析、语义分析等核心内容。',
    registrationUrl: '',
  },
  {
    id: 'sys-23',
    title: '人工智能导论期末考',
    subtitle: '计算机类 · 选修',
    tag: 'AI',
    date: '2026-07-08',
    type: 'exam',
    category: 'skill',
    isEnabled: true,
    description: '人工智能导论期末考试，涵盖机器学习、神经网络、自然语言处理等核心内容。',
    registrationUrl: '',
  },
  {
    id: 'sys-24',
    title: '软件工程导论考试',
    subtitle: '计算机类 · 必修',
    tag: '软件工程',
    date: '2026-07-10',
    type: 'exam',
    category: 'skill',
    isEnabled: true,
    description: '软件工程导论期末考试，涵盖软件生命周期、需求分析、设计模式等核心内容。',
    registrationUrl: '',
  },
  {
    id: 'sys-25',
    title: '计算机图形学期末考',
    subtitle: '计算机类 · 选修',
    tag: '图形学',
    date: '2026-07-12',
    type: 'exam',
    category: 'skill',
    isEnabled: true,
    description: '计算机图形学期末考试，涵盖几何变换、渲染技术、GPU编程等核心内容。',
    registrationUrl: '',
  },
  {
    id: 'comp-1',
    title: 'ACM-ICPC亚洲区域赛报名',
    subtitle: '国际大学生程序设计竞赛 · 竞赛类',
    tag: 'ACM-ICPC',
    date: '2026-09-15',
    type: 'registration',
    category: 'competition',
    isEnabled: true,
    description: 'ACM-ICPC国际大学生程序设计竞赛亚洲区域赛报名截止日期，这是全球最具影响力的大学生程序设计竞赛之一。',
    registrationUrl: 'https://icpc.global/',
  },
  {
    id: 'comp-2',
    title: 'ACM-ICPC亚洲区域赛',
    subtitle: '国际大学生程序设计竞赛 · 竞赛类',
    tag: 'ACM-ICPC',
    date: '2026-10-18',
    type: 'competition',
    category: 'competition',
    isEnabled: true,
    description: 'ACM-ICPC国际大学生程序设计竞赛亚洲区域赛正式比赛日，来自亚洲各高校的程序设计高手将在赛场上展开激烈角逐，争夺晋级全球总决赛的名额。',
    registrationUrl: 'https://icpc.global/',
  },
  {
    id: 'comp-3',
    title: '蓝桥杯大赛报名截止',
    subtitle: '全国软件和信息技术专业人才大赛 · 竞赛类',
    tag: '蓝桥杯',
    date: '2026-03-20',
    type: 'registration',
    category: 'competition',
    isEnabled: true,
    description: '蓝桥杯全国软件和信息技术专业人才大赛是由工业和信息化部人才交流中心主办的全国性IT类学科竞赛，包括软件类、电子类、艺术设计类等多个组别，是计算机专业最具影响力的赛事之一。',
    registrationUrl: 'https://dasai.lanqiao.cn/',
  },
  {
    id: 'comp-4',
    title: '蓝桥杯省赛/国赛',
    subtitle: '全国软件和信息技术专业人才大赛 · 竞赛类',
    tag: '蓝桥杯',
    date: '2026-05-25',
    type: 'competition',
    category: 'competition',
    isEnabled: true,
    description: '蓝桥杯全国软件和信息技术专业人才大赛省赛/国赛阶段，参赛选手将在C/C++、Java、Python等语言环境中完成算法设计与编程题目，争夺个人奖项和团队荣誉。',
    registrationUrl: 'https://dasai.lanqiao.cn/',
  },
  {
    id: 'comp-5',
    title: '中国大学生计算机设计大赛报名',
    subtitle: '计算机设计大赛 · 竞赛类',
    tag: '计算机设计大赛',
    date: '2026-03-01',
    type: 'registration',
    category: 'competition',
    isEnabled: true,
    description: '中国大学生计算机设计大赛是由教育部大学计算机课程教学指导委员会主办，面向在校大学生的全国性赛事，涵盖软件应用与开发、微课与教学辅助、人工智能等领域。',
    registrationUrl: 'http://jsjdstds.ruc.edu.cn/',
  },
  {
    id: 'comp-6',
    title: '中国大学生计算机设计大赛决赛',
    subtitle: '计算机设计大赛 · 竞赛类',
    tag: '计算机设计大赛',
    date: '2026-07-20',
    type: 'competition',
    category: 'competition',
    isEnabled: true,
    description: '中国大学生计算机设计大赛全国总决赛，参赛队伍将通过作品展示和答辩环节，争夺各类别奖项。',
    registrationUrl: 'http://jsjdstds.ruc.edu.cn/',
  },
  {
    id: 'comp-7',
    title: 'CCF CSP认证报名',
    subtitle: '计算机软件能力认证 · 竞赛类',
    tag: 'CCF CSP',
    date: '2026-04-10',
    type: 'registration',
    category: 'competition',
    isEnabled: true,
    description: 'CCF计算机软件能力认证报名截止日期，该认证是中国计算机学会推出的专业技术能力认证，对求职和考研具有重要参考价值。',
    registrationUrl: 'https://cspro.org/',
  },
  {
    id: 'comp-8',
    title: 'CCF CSP认证考试',
    subtitle: '计算机软件能力认证 · 竞赛类',
    tag: 'CCF CSP',
    date: '2026-05-17',
    type: 'competition',
    category: 'competition',
    isEnabled: true,
    description: 'CCF计算机软件能力认证考试，主要考查算法设计和编程能力，采用在线编程方式进行。',
    registrationUrl: 'https://cspro.org/',
  },
  {
    id: 'comp-9',
    title: '全国大学生数学建模竞赛报名',
    subtitle: '数学建模竞赛 · 竞赛类',
    tag: '数学建模',
    date: '2026-05-10',
    type: 'registration',
    category: 'competition',
    isEnabled: true,
    description: '全国大学生数学建模竞赛报名截止日期，这是全国高校规模最大的课外科技活动之一，三人组队参赛。',
    registrationUrl: 'https://www.mcm.edu.cn/',
  },
  {
    id: 'comp-10',
    title: '全国大学生数学建模竞赛',
    subtitle: '数学建模竞赛 · 竞赛类',
    tag: '数学建模',
    date: '2026-09-12',
    type: 'competition',
    category: 'competition',
    isEnabled: true,
    description: '全国大学生数学建模竞赛正式比赛日，参赛队伍需要在三天内完成模型建立、算法设计和论文撰写。',
    registrationUrl: 'https://www.mcm.edu.cn/',
  },
  {
    id: 'comp-11',
    title: '浙江省大学生程序设计竞赛报名',
    subtitle: '省级竞赛 · 竞赛类',
    tag: '省赛',
    date: '2026-04-25',
    type: 'registration',
    category: 'competition',
    isEnabled: true,
    description: '浙江省大学生程序设计竞赛报名截止日期，省内各高校的程序设计精英将在此赛场上一较高下。',
    registrationUrl: 'https://acm.zju.edu.cn/',
  },
  {
    id: 'comp-12',
    title: '浙江省大学生程序设计竞赛',
    subtitle: '省级竞赛 · 竞赛类',
    tag: '省赛',
    date: '2026-05-16',
    type: 'competition',
    category: 'competition',
    isEnabled: true,
    description: '浙江省大学生程序设计竞赛正式比赛日，采用ACM赛制，考验选手的算法设计和编程能力。',
    registrationUrl: 'https://acm.zju.edu.cn/',
  },
  {
    id: 'comp-13',
    title: '百度之星程序设计大赛报名',
    subtitle: 'AI编程竞赛 · 竞赛类',
    tag: '百度之星',
    date: '2026-06-01',
    type: 'registration',
    category: 'competition',
    isEnabled: true,
    description: '百度之星程序设计大赛是由百度公司主办的高水平程序设计竞赛，优秀选手可获得百度实习或工作机会。',
    registrationUrl: 'https://star.baidu.com/',
  },
  {
    id: 'comp-14',
    title: '阿里天池竞赛报名',
    subtitle: '数据智能竞赛 · 竞赛类',
    tag: '天池',
    date: '2026-06-15',
    type: 'registration',
    category: 'competition',
    isEnabled: true,
    description: '阿里天池数据智能竞赛是由阿里巴巴主办的数据科学和机器学习竞赛平台，涉及图像识别、NLP、推荐系统等多个领域。',
    registrationUrl: 'https://tianchi.aliyun.com/',
  },
  {
    id: 'comp-15',
    title: 'Kaggle竞赛集训营',
    subtitle: '数据科学竞赛 · 竞赛类',
    tag: 'Kaggle',
    date: '2026-06-20',
    type: 'registration',
    category: 'competition',
    isEnabled: true,
    description: 'Kaggle数据科学竞赛平台集训营报名，学习数据清洗、特征工程、模型调参等技能，为参加正式竞赛做准备。',
    registrationUrl: 'https://www.kaggle.com/',
  },
  {
    id: 'comp-16',
    title: '字节跳动ByteDance竞赛报名',
    subtitle: '算法竞赛 · 竞赛类',
    tag: '字节跳动',
    date: '2026-07-01',
    type: 'registration',
    category: 'competition',
    isEnabled: true,
    description: '字节跳动ByteDance算法竞赛是由字节跳动主办的编程竞赛，涵盖算法、大数据、AI等领域，优秀选手可获得面试直通卡。',
    registrationUrl: 'https://bytedance.com/',
  },
];

router.get('/', (_req, res) => {
  return res.json({ success: true, data: systemExams });
});

router.post('/', (req, res) => {
  const { title, subtitle, tag, date, type, category, description, registrationUrl } = req.body as {
    title: string;
    subtitle: string;
    tag: string;
    date: string;
    type: 'exam' | 'registration' | 'competition';
    category: 'language' | 'skill' | 'competition';
    description?: string;
    registrationUrl?: string;
  };

  if (!title || !subtitle || !tag || !date || !type || !category) {
    return res.status(400).json({ success: false, message: '请填写所有必填字段' });
  }

  const newExam: SystemExam = {
    id: `sys-${Date.now()}`,
    title,
    subtitle,
    tag,
    date,
    type,
    category,
    isEnabled: true,
    description,
    registrationUrl,
  };

  systemExams.push(newExam);
  return res.json({ success: true, data: newExam });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const index = systemExams.findIndex((e) => e.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: '考试不存在' });
  }

  const { title, subtitle, tag, date, type, category, isEnabled, description, registrationUrl } = req.body;

  systemExams[index] = {
    ...systemExams[index],
    ...(title && { title }),
    ...(subtitle && { subtitle }),
    ...(tag && { tag }),
    ...(date && { date }),
    ...(type && { type }),
    ...(category && { category }),
    ...(isEnabled !== undefined && { isEnabled }),
    ...(description !== undefined && { description }),
    ...(registrationUrl !== undefined && { registrationUrl }),
  };

  return res.json({ success: true, data: systemExams[index] });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const index = systemExams.findIndex((e) => e.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: '考试不存在' });
  }

  systemExams.splice(index, 1);
  return res.json({ success: true, message: '考试已删除' });
});

export default router;