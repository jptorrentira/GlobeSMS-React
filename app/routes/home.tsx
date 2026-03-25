import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { Dashboard } from "~/routes/dashboard/dashboard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "SMS App" },
    { name: "description", content: "Welcome to SMS!" },
  ];
}

export default function Home() {
  return <Dashboard />;
}
