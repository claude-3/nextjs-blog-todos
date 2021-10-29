import { useEffect } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";

import Link from "next/link";
import Layout from "../../components/Layout";
import { getAllTaskIds, getTaskData } from "../../lib/tasks";

const fetcher = (url) => fetch(url).then((res) => res.json());

// getStaticPropsからpropsを受け取る
export default function Post({ staticTask, id }) {
  const router = useRouter();
  const { data: task, mutate } = useSWR(
    // 第一引数：エンドポイント
    `${process.env.NEXT_PUBLIC_RESTAPI_URL}api/detail-task/${id}`,
    // 第二引数：
    fetcher,
    // 第三引数：
    {
      fallbackData: staticTask,
    }
  );
  useEffect(() => {
    mutate();
  }, []);
  if (router.isFallback || !task) {
    return <div>Loading...</div>;
  }

  return (
    <Layout title={task.title}>
      <span className="mb-4">
        {"ID : "}
        {task.id}
      </span>
      <p className="mb-4 text-xl font-bold">{task.title}</p>
      <p className="mb-12">{task.created_at}</p>
      <Link href="/task-page">
        <div className="flex cursor-pointer mt-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
          <span>Back to task-page</span>
        </div>
      </Link>
    </Layout>
  );
}

// ①ビルド時にサーバーサイドで実行されるもの
export async function getStaticPaths() {
  // ページ生成に必要なすべてのIDを取得
  const paths = await getAllTaskIds();

  return {
    paths,
    fallback: true,
  };
}

// ②ビルド時にIDに紐付いた情報を取得し、生成されるページコンポーネントにpropsで渡す
export async function getStaticProps({ params }) {
  const { task: staticTask } = await getTaskData(params.id);

  return {
    props: {
      id: staticTask.id,
      staticTask,
    },
    revalidate: 3,
  };
}
