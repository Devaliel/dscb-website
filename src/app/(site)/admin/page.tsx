import { redirect } from "next/navigation";

/** The admin panel merged into the War Room — keep old bookmarks working. */
export default function Admin() {
  redirect("/warroom");
}
