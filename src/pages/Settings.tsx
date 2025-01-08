import Sidebar from "../components/Sidebar";
import { SettingsManager } from "../SettingsManager";

export default function () {
  console.log(SettingsManager.getSettings());
  return (
    <>
      <Sidebar />
      <section class="flex flex-row-reverse mr-16">
        <div class="bg-surface0 w-[2px] h-72 my-16"></div>
        <div class="my-16">
          <h1 class="text-3xl font-bold pb-4 mx-4">Settings</h1>
        </div>
      </section>
    </>
  );
}
