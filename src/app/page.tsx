// 路径: src/app/page.tsx
import { Metadata } from 'next';
import Home from '@/components/Home'; // 引用刚才新建的组件

// 这里是服务端特有的功能，放在 page.tsx 里才不会报错
export const metadata: Metadata = {
  title: 'Focus App', // 你的应用名称
  description: 'Gamified Focus Timer',
};

export default function Page() {
  return (
    <main className="min-h-screen w-full bg-background">
      <Home />
    </main>
  );
}