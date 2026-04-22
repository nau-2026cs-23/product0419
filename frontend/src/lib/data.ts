import type { SystemExam, Task } from '../types';

export const SYSTEM_EXAMS: SystemExam[] = [
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
];

export const ARCHIVED_EXAMS: SystemExam[] = [
  {
    id: 'arch-1',
    title: '计算机二级考试（2025年下半年）',
    subtitle: 'NCRE · 技能类',
    tag: 'NCRE',
    date: '2025-11-08',
    type: 'exam',
    category: 'skill',
    isEnabled: false,
  },
  {
    id: 'arch-2',
    title: '英语四级考试（2025年下半年）',
    subtitle: 'CET-4 · 语言类',
    tag: 'CET-4',
    date: '2025-12-13',
    type: 'exam',
    category: 'language',
    isEnabled: false,
  },
  {
    id: 'arch-3',
    title: '软考（中级）考试（2025年下半年）',
    subtitle: '软件水平考试 · 技能类',
    tag: '软考',
    date: '2025-11-08',
    type: 'exam',
    category: 'skill',
    isEnabled: false,
  },
];

export const INITIAL_MANUAL_TASKS: Task[] = [
  {
    id: 'manual-1',
    title: '数据库课程作业提交',
    deadline: '2026-03-18T23:00:00',
    source: 'manual',
    category: 'homework',
    status: 'pending',
    tag: '作业',
    isArchived: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'manual-2',
    title: '操作系统实验报告',
    deadline: '2026-03-13T23:59:00',
    source: 'manual',
    category: 'homework',
    status: 'completed',
    tag: '作业',
    isArchived: false,
    createdAt: new Date().toISOString(),
  },
];

export function getDaysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  const hours = d.getHours().toString().padStart(2, '0');
  const mins = d.getMinutes().toString().padStart(2, '0');
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${hours}:${mins}`;
}

export function isExpired(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}

export function isWithinDays(dateStr: string, days: number): boolean {
  const diff = getDaysUntil(dateStr);
  return diff >= 0 && diff <= days;
}
