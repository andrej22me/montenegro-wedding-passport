import { redirect } from "next/navigation";

export default async function DetailsRedirect({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  redirect(`/flights/${token}`);
}
