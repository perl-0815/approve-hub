import { CreateGroupForm } from "@/app/components/create-group-form";
import { deleteInactiveGroups } from "@/app/lib/group-lifecycle";

export default async function Home() {
  await deleteInactiveGroups();

  return (
    <main className="page">
      <section className="hero card">
        <h1 className="hero-title">APPROVE HUB</h1>
        <p className="subtext">
          複数人で承認フローを進めるためのシンプルな承認ボード。グループを作ると専用URLが発行されます。URLを共有するだけで、メンバー全員が同じ承認タイムラインを確認できます。
        </p>
      </section>

      <section className="card">
        <h2>グループを追加</h2>
        <CreateGroupForm />
      </section>
    </main>
  );
}
