import Sidebar from "../components/Sidebar";
import { InstanceManager } from "../InstanceManager";

export default function () {
  return (
    <>
      <Sidebar />
      <section class="flex flex-row ml-64">
        <div class="bg-surface0 w-[2px] h-72 my-16"></div>
        <div class="my-16">
          <h1 class="text-3xl font-bold pb-4 mx-4">Welcome</h1>
          <h3 class="text-left pt-1 mx-4">You last played...</h3>
          <div class="mt-8 ml-4 px-12 py-10 bg-surface0 rounded-xl">
            placeholder for instance here
          </div>
          <p class="ml-8 mt-4 font-light text-subtext0 text-sm">
            Why not play some more?
          </p>
          <button
            onClick={() => {
              InstanceManager.addInstance({
                name: "balls",
                version: 38,
                isFreeWeekend: true,
              });
            }}
          >
            {" "}
            make instance lol{" "}
          </button>
        </div>
      </section>
    </>
  );
}
