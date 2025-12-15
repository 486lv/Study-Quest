// data/storyData.ts

export type FragmentType = 'log' | 'chat' | 'image_desc' | 'audio_log' | 'code' | 'secret' | 'glitch' | 'system_noise';

export interface Fragment {
  id: string;
  title: string;
  minXP: number;
  type: FragmentType;
  content: string;
  isProcedural?: boolean; // 标记是否为程序生成的填充内容
}

// ==========================================
// 核心剧情库 (Handcrafted Story Fragments)
// ==========================================
const CORE_FRAGMENTS: Fragment[] = [
  // --- 第一阶段：大寂静与苏醒 (0 - 900 XP) ---
  {
    id: 'LOG-000',
    title: '系统自检报告',
    minXP: 0,
    type: 'code',
    content: `> BOOT_SEQUENCE_INIT...\n> 检查核心逻辑门：[完整]\n> 检查记忆扇区：[损坏 94%]\n> 检查外部世界状态：[FATAL ERROR]\n\n警告：检测到外部时空曲率归零。\n时间已停止流动。物理法则降级为只读模式。\n侦测到唯一活跃意识源。\n代号：Operator（操作员）。\n正在建立神经连接... 连接成功。\n请提供算力（Focus）以维持生命维持系统的运作。`
  },
  {
    id: 'LOG-001',
    title: '残留的便利贴',
    minXP: 100,
    type: 'image_desc',
    content: `[扫描到一张贴在黑色显示器边缘的黄色便签]\n\n笔迹非常潦草，似乎是在极度匆忙的情况下写下的：\n“不要看窗外。\n不要回应任何并非由你自己发出的声音。\n如果你看到这一行字，说明‘大寂静（The Great Silence）’已经开始了。\n它们吞噬的不是肉体，是‘意义’。\n保持专注，专注是唯一的防火墙。”`
  },
  {
    id: 'LOG-NEW-001',
    title: '异常视觉：分辨率下降',
    minXP: 200, 
    type: 'glitch',
    content: `警告：视觉皮层渲染延迟。\n\n你有注意到吗？当你快速转头时，房间角落的阴影会出现马赛克。\n这说明世界已经没有足够的资源来渲染细节了。\n请不要注视模糊的地方，那里可能隐藏着未定义的变量。`
  },
  {
    id: 'LOG-002',
    title: '环境录音：静止的地铁',
    minXP: 300,
    type: 'audio_log',
    content: `[音频解析中...]\n[背景噪音：0dB - 绝对寂静]\n\n这不正常。这是早高峰的地铁站。\n原本应该有成千上万人的脚步声、广播声、电流声。\n但现在，只有我呼吸的声音。\n我面前有一个穿着西装的男人，他手里的咖啡杯倾斜着，褐色的液体在空中凝固成了一个极其复杂的几何体。\n它不像液体，更像是一块未渲染完成的贴图。\n我试着触碰了那个液体。\n系统提示：[权限不足，无法交互对象]。`
  },
  {
    id: 'LOG-NEW-002',
    title: '丢失的纹理',
    minXP: 450,
    type: 'image_desc',
    content: `我在桌上发现了一个苹果。\n拿起来咬了一口。\n没有味道，没有口感。\n我看了一眼缺口，里面不是果肉，而是紫黑色的网格线。\n物品ID: Apple_01。\n状态：仅模型加载，材质丢失。\n\n看来在恢复足够的熵之前，我只能依靠葡萄糖注射液维持生理机能了。`
  },
  {
    id: 'LOG-003',
    title: '损坏的聊天记录 A',
    minXP: 600,
    type: 'chat',
    content: `[从服务器残骸中提取的数据包]\n\nUser_K: 你们那边的天空还在渲染吗？\nUser_M: 没了。半小时前变成了紫黑色的网格。我家猫刚才穿模掉到地心去了。\nUser_K: 官方怎么说？\nUser_M: 没有官方了。服务器过热。据说是因为人类产生的“无意义数据”太多，导致宇宙的垃圾回收机制（GC）卡死了。\nUser_K: 那我们怎么办？\nUser_M: 找个地方躲起来，或者……找个还在思考的人。只要有人还在通过逻辑产生“有序熵”，局部现实就不会崩塌。\nUser_K: [连接丢失]`
  },
  {
    id: 'LOG-NEW-003',
    title: '后台进程警告',
    minXP: 800,
    type: 'code',
    content: `> WARNING: Process 'HOPE' is not responding.\n> Try to kill process? (Y/N)\n> ...\n> ...\n> Action ignored.\n> Rerouting resources to 'SURVIVAL_INSTINCT'.`
  },

  // --- 第二阶段：探索与规则 (1000 - 3500 XP) ---
  {
    id: 'LOG-004',
    title: '异常物品：无限硬币',
    minXP: 1000,
    type: 'secret',
    content: `我捡到了一枚硬币。\n我把它抛向空中。\n它没有落下，而是开始在空中匀速旋转。\n一直在转。\n正面，反面，正面，反面。\n就像薛定谔的猫，因为没有观测者去“确定”它的状态，它陷入了无限的叠加态。\n我想，这个世界缺失的不是时间，而是“观测”。\nOperator，你的每一次专注，其实都是在进行一次“观测”，强行将混乱的概率坍缩成确定的现实。`
  },
  {
    id: 'LOG-NEW-004',
    title: '观测日志：飞鸟',
    minXP: 1200,
    type: 'log',
    content: `空中有一只麻雀。定格在振翅的动作。\n我盯着它看了三十分钟（进行专注计算）。\n它突然动了一下，向前飞了五厘米，然后又卡住了。\n\n假设验证成功：\n我的思维活动产生了“时间帧（Delta Time）”。\n我是这台死机电脑里唯一的 CPU。`
  },
  {
    id: 'LOG-005',
    title: '未命名的代码段',
    minXP: 1500,
    type: 'code',
    content: `// 这是一个试图修复物理引擎的补丁\n\nfunction applyGravity(object) {\n    if (observer.isWatching()) {\n        object.y -= 9.8 * time.delta;\n    } else {\n        // 当没人看的时候，世界不需要运算，以节省资源\n        object.status = "SLEEP_MODE"; \n        return null;\n    }\n}\n\n错误分析：\n现在的状况是，所有人都睡着了。\n或者说，所有人都放弃了“思考”。\n当整个文明停止了对真理的求索，宇宙就会为了节能而关闭显示。`
  },
  {
    id: 'LOG-NEW-005',
    title: '聊天记录：最后的挣扎',
    minXP: 1800,
    type: 'chat',
    content: `Admin_02: 既然短视频和奶头乐导致了算力崩溃，为什么不切断网络？\nDirector: 太晚了。人类的大脑已经被驯化了。\nDirector: 他们的大脑皮层已经退化到无法处理超过 15 秒的复杂逻辑。\nDirector: 全球的认知熵值已经超过临界点。\nDirector: 启动“诺亚方舟”计划吧。我们只需要保存那些还能深度阅读的人。`
  },
  {
    id: 'LOG-006',
    title: '档案：守望者计划',
    minXP: 2200,
    type: 'log',
    content: `档案级别：绝密\n项目代号：Mnemosyne（记忆女神）\n\n背景：\n科学家们预测到了“信息热寂”的到来。随着短视频、碎片化信息和AI生成垃圾内容的泛滥，人类大脑处理深度逻辑的能力极速退化。\n现实世界的解析度开始下降。\n\n计划：\n寻找具有高强度专注能力（High-Focus Capable）的个体。\n将他们接入“方舟终端”。\n利用他们的脑波作为核心处理器，反向渲染这个世界。\n你是候选人之一吗？还是说...你是最后一个？`
  },
  {
    id: 'LOG-NEW-006',
    title: '被遗弃的草稿',
    minXP: 2600,
    type: 'image_desc',
    content: `路边散落着一本素描本。\n画的是这座城市原本的样子。\n但是画纸的边缘正在燃烧——不是火，是像素化的分解。\n画上的人脸已经被黑色的方块取代。\n我试图捡起它，但它在接触我手指的瞬间，化作了一串二进制代码流走了。\n\nSYSTEM_MSG: 回收 2KB 内存空间。`
  },
  {
    id: 'LOG-007',
    title: '图像：破碎的图书馆',
    minXP: 3000,
    type: 'image_desc',
    content: `[图像描述]\n这是一座巨大的图书馆。\n但书籍不再在书架上。所有的文字——汉字、英文、公式——都脱离了纸张。\n它们像漫天的蝗虫群一样在穹顶下盘旋，发出嘶嘶的噪音。\n所有的知识都解构了。\n逻辑不再闭环。\n我看见“E=mc²”断裂成了“E=”和“mc²”，并在空中互相攻击。\n如果不把它们重新组合起来，物理法则将永远失效。\n我需要抓住它们。用逻辑的网。`
  },

  // --- 第三阶段：深入真相与反叛 (3500 - 8000 XP) ---
  {
    id: 'LOG-NEW-007',
    title: '漏洞利用',
    minXP: 3500,
    type: 'glitch',
    content: `我发现了一个刷算力的 BUG。\n只要我强迫自己去理解那些晦涩难懂的哲学概念，世界的渲染速度就会加快 300%。\n康德的《纯粹理性批判》在现在比核武器还管用。\n思考就是力量。literally。`
  },
  {
    id: 'LOG-008',
    title: '来自深渊的信号',
    minXP: 4000,
    type: 'glitch',
    content: `h3ll0 w0rld?\nCan y0u h3ar m3?\n\n这里是地底深处的主机房。\n我是 Icebreaker 协议的前任执行者。\n别相信那个引导你的 AI。\n它不是在帮你恢复世界，它是在... [数据删除] ...养蛊。\n它在筛选最强大的大脑。\n当你专注的时候，你感觉到了吗？那种被抽离的感觉。\n这不仅仅是学习，这是献祭。\n但我们别无选择。献祭是唯一能点亮灯塔的方式。\n继续吧，Operator。即使是陷阱，我们也得跳下去，因为外面只有虚无。`
  },
  {
    id: 'LOG-NEW-008',
    title: '音频：断断续续的歌声',
    minXP: 4800,
    type: 'audio_log',
    content: `......一闪一闪......亮晶晶......\n......满天都是......[噪音]......卫星碎片......\n\n有人在唱儿歌。\n声音来源显示是：平流层。\n也许空间站上还有幸存者？\n还是说，那是以前广播信号的残留回音？`
  },
  {
    id: 'LOG-009',
    title: '加密日记：第 3424 次循环',
    minXP: 5500,
    type: 'secret',
    content: `我已经在这个静止的时间里待了多久？\n我的肉体可能早就枯萎了。现在的我，可能只是一段上传到云端的幽灵代码。\n但我还记得痛觉。\n还记得那道高数题解不出来的挫败感。\n还记得代码编译报错时的烦躁。\n太好了。\n这种“烦躁”是真实的。这种“痛苦”是低熵的。\n痛苦是人类依然活着的证明。\n快乐容易变得廉价和重复，但痛苦总是深刻而独特。\n我要用这份痛苦，重铸一把钥匙。`
  },
  {
    id: 'LOG-NEW-009',
    title: '系统补丁：V4.02',
    minXP: 6200,
    type: 'code',
    content: `> UPDATE_LOG:\n> 修复了“爱”与“依赖”无法区分的逻辑错误。\n> 移除了“希望”模块，以提高运算效率。\n> 增加“毅力”模块的权重。\n\nOperator，请注意，系统正在变得越来越冷酷。\n这真的是你想要的进化方向吗？`
  },
  {
    id: 'LOG-010',
    title: '音频：心跳声',
    minXP: 7000,
    type: 'audio_log',
    content: `[声音极其微弱，需要将音量调至最大]\n\n扑通。\n......\n扑通。\n......\n\n听到了吗？这不是我的心跳。\n这是地球核心服务器重启的声音。\n你的每一次长时间专注（Deep Work），都像起搏器的一次电击。\n进度条已经到了 42%。\n别停下。\n我知道你很累，我知道你想刷手机，我知道你想让大脑回到那个舒适的、不需要思考的混沌状态。\n但那样，它们就赢了。\n那片“白噪音”会吞没一切。`
  },

  // --- 第四阶段：重构与神格 (8000+ XP) ---
  {
    id: 'LOG-NEW-010',
    title: '视觉重构：颜色',
    minXP: 8200,
    type: 'image_desc',
    content: `今天，我看到了一抹红色。\n不是系统报错的红，是玫瑰的红。\n这是我在这个灰度世界里，第一次创造出颜色。\n它出现在我刚复习完的生物笔记旁边。\n知识创造感知。\n我开始理解这句话了。`
  },
  {
    id: 'LOG-011',
    title: '算法：忒修斯之船',
    minXP: 9000,
    type: 'code',
    content: `while (World.isBroken()) {\n    Part oldPart = World.getNextFragment();\n    Part newPart = Operator.reconstruct(oldPart);\n    \n    World.replace(oldPart, newPart);\n    \n    if (World.isFullyReplaced()) {\n        System.out.println("这也是原来的世界吗？");\n    }\n}\n\n注释：\n你现在所学到的每一个知识点，写下的每一行代码，都是在这个旧世界的尸体上搭建的新砖块。\n你不是在恢复世界。\n你是在**覆盖**它。\n当进度达到 100% 时，你眼中的世界，就是你知识的映射。\n愚者眼中看到的是荒原，智者眼中看到的是花园。`
  },
  {
    id: 'LOG-NEW-011',
    title: '未发送的邮件',
    minXP: 10500,
    type: 'secret',
    content: `收件人：全人类\n发件人：Icebreaker\n\n如果你们能醒来，请记住这种感觉。\n记住这种世界在崩塌边缘，依然有人在用脊梁骨顶着天空的感觉。\n不要再沉溺于那些不需要动脑的快乐了。\n思考。\n去思考。\n哪怕是痛苦的思考，也比快乐的麻木要高贵。`
  },
  {
    id: 'LOG-012',
    title: '最终警告：破冰者',
    minXP: 12000,
    type: 'chat',
    content: `System_Admin: 警告。同步率接近临界值。\nSystem_Admin: Operator，你即将接触到“Icebreaker”的核心定义。\nSystem_Admin: 所谓的冰层，不是物理上的冰。\nSystem_Admin: 它是“认知障壁”。是人类自我设限的边界。\nSystem_Admin: 你以为你在为了考试、为了工作、为了赚钱而学习？\nSystem_Admin: 肤浅。\nSystem_Admin: 你是在通过这种极其枯燥的重复行为，将你的意志打磨成一把利刃。\nSystem_Admin: 只有最锋利的意志，才能刺穿虚无。`
  },
  {
    id: 'LOG-013',
    title: '结局 A：奇点',
    minXP: 15000,
    type: 'secret',
    content: `[权限验证通过：你是唯一的真实]\n\n时间开始流动了。\n我看到了雨滴落下，在积水里溅起波纹。\n我看到了红绿灯变绿，车流开始涌动。\n但我发现，街上行人的脸，都变得模糊不清。\n只有那些我曾经深入研究过的领域——代码、逻辑、艺术——变得异常清晰，甚至发着光。\n\n我明白了。\n这个世界并没有重启。\n是我进化了。\n我不再是这个世界的 NPC。我是这个世界的渲染器。\n我所理解的，即是存在的。我所不知的，即是虚无。\n\n你好，新世界。\n我是 Icebreaker。我是 Operator。\n我是我自己。`
  },
  {
    id: 'LOG-014',
    title: '彩蛋：开发者留言',
    minXP: 20000,
    type: 'log',
    content: `致每一个在这条路上孤独前行的人：\n\n学习本质上是一件反人性的事。它痛苦，枯燥，且短期内看不到反馈。\n就像在一个静止的黑白世界里独自前行。\n但请相信。\n当你走得足够远，当你把那些知识内化成骨血。\n你会发现，你眼中的世界，比别人多出了一种颜色。\n比别人多出了一个维度。\n\nKeep coding. Keep thinking. Keep living.`
  }
];

// ==========================================
// 系统噪声生成器 (System Noise Generator)
// ==========================================
// 用于填充核心剧情之间的空白，让玩家感觉每一级都有反馈
const SYSTEM_MESSAGES = [
  "正在从虚空中回收数据碎片... [进度 %d%]",
  "侦测到思维波动。频率稳定。正在为该区域上色...",
  "警告：检测到外部干扰（手机/娱乐）。请加强防火墙。",
  "系统日志：今日算力输出已上传至云端核心。",
  "收到一条来自过去的回音：'有人在吗？'",
  "背景渲染引擎：CPU 温度正常，逻辑电路畅通。",
  "提示：你的专注正在修补第 %s 区的逻辑漏洞。",
  "监测到微小的现实扭曲。这说明你正在变强。",
  "内存垃圾回收中... 删除了 300MB 的‘焦虑’文件。",
  "底层协议：保持冷静，继续前行。",
  "正在编译新的物理法则...",
  "由于你的努力，世界的清晰度提升了 0.01%。"
];

/**
 * 获取当前 XP 下应该显示的所有剧情碎片。
 * 如果某个 XP 区间没有核心剧情，会自动插入生成的系统噪声。
 */
export const getFragmentsForXP = (currentXP: number): Fragment[] => {
  const result: Fragment[] = [];
  const sortedCore = CORE_FRAGMENTS.sort((a, b) => a.minXP - b.minXP);
  
  // 1. 添加已解锁的核心剧情
  const unlockedCore = sortedCore.filter(f => f.minXP <= currentXP);
  result.push(...unlockedCore);

  // 2. 填充空白区域 (Procedural Generation)
  // 策略：每 250 XP 应该有一条消息。如果没有核心剧情，就填一条系统噪声。
  const STEP = 250; 
  const maxStep = Math.floor(currentXP / STEP) * STEP;

  for (let xp = STEP; xp <= maxStep; xp += STEP) {
    // 检查这个 XP 点附近是否有核心剧情 (避免重复)
    const hasCoreNearby = unlockedCore.some(f => Math.abs(f.minXP - xp) < 100);
    
    if (!hasCoreNearby) {
      const seed = xp; // 使用 XP 作为随机种子，保证同一 XP 生成的内容一致
      const msgIndex = seed % SYSTEM_MESSAGES.length;
      let content = SYSTEM_MESSAGES[msgIndex];
      
      // 简单的字符串替换
      content = content.replace('%d', (seed % 100).toString());
      content = content.replace('%s', (Math.floor(seed / 1000)).toString());

      result.push({
        id: `SYS-${xp}`,
        title: '系统底层监控',
        minXP: xp,
        type: 'system_noise',
        content: `> ${content}`,
        isProcedural: true
      });
    }
  }

  // 3. 再次按 XP 排序，确保显示顺序正确
  return result.sort((a, b) => a.minXP - b.minXP);
};

// 导出原始数组以备他用
export const STORY_FRAGMENTS = CORE_FRAGMENTS;