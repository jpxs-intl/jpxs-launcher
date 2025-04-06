import { A } from "@solidjs/router";
import { Icon } from "solid-heroicons";
import { cog_6Tooth } from "solid-heroicons/outline";
import { createResource, JSXElement } from "solid-js";
import { invoke } from "@tauri-apps/api/core";

function Button(props: {
  class?: string;
  name?: string;
  href: string;
  children?: JSXElement;
}) {
  return (
    <A
      href={props.href}
      class={`transition-colors duration-100 hover:bg-crust py-2 rounded-xl mx-8 ${props.class}`}
      activeClass="bg-surface0"
      inactiveClass="bg-mantle"
      end
    >
      {props.name}
      {props.children}
    </A>
  );
}

export default function Sidebar() {
  const [version] = createResource(async () => {
    return await invoke<string>("get_version");
  });
  return (
    <section class="transition-[width] duration-300 w-48 hover:w-64 bg-mantle h-screen text-center flex flex-col gap-y-4 fixed">
      <h1 class="text-xl my-4 font-medium tracking-wide">
        <span class="text-orange-400 font-bold">JPXS</span> Launcher
      </h1>
      <Button href="/" name="Home" />
      <Button href="/instances" name="Instances" />
      <Button href="/live" name="Server List" />
      <Button href="/playersearch" name="Player Search" />
      <div class="fixed bottom-0 left-0 mx-4">
        <Button href="/settings">
          <Icon path={cog_6Tooth} class="w-8 h-8 shake"></Icon>
        </Button>
      </div>
      <p class="fixed bottom-0 left-0 mx-2 text-sm text-subtext0">
        v{version()}
      </p>
    </section>
  );
}
