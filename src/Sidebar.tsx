import { A } from "@solidjs/router";

function Button(props: { class?: string; name: string; href: string }) {
  return (
    <A
      href={props.href}
      class={`hover:bg-crust max-w-[10rem] py-2 rounded-xl mx-12 ${props.class}`}
      activeClass="bg-surface0"
    >
      {props.name}
    </A>
  );
}
export default function Sidebar() {
  return (
    <section class="transition-[width] duration-300 w-48 hover:w-64 bg-mantle h-screen text-center flex flex-col gap-y-4">
      <h1 class="text-xl my-4 font-medium tracking-wide">
        <span class="text-orange-400 font-bold">JPXS</span> Launcher
      </h1>
      <Button href="/" name="Home" />
      <Button href="/e" name="e" />
    </section>
  );
}
