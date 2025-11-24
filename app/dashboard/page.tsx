import { redirect } from "next/navigation";
import { getUserFamily } from "../actions";
import { auth } from "@clerk/nextjs/server";

export default async function DashboardRootPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/");
    }

    // Try to get the user's family (this gets the first active one)
    const userFamily = await getUserFamily();

    if (userFamily) {
        redirect(`/dashboard/${userFamily.family.id}`);
    } else {
        redirect("/families");
    }
}
