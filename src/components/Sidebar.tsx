import { A } from "@solidjs/router";

function Button(props: { class?: string; name: string; href: string }) {
  return (
    <A
      href={props.href}
      class={`transition-colors duration-100 hover:bg-crust py-2 rounded-xl mx-8 ${props.class}`}
      activeClass="bg-surface0"
      inactiveClass="bg-mantle"
      end
    >
      {props.name}
    </A>
  );
}
export default function Sidebar() {
  return (
    <section class="transition-[width] duration-300 w-48 hover:w-64 bg-mantle h-screen text-center flex flex-col gap-y-4 fixed">
      <h1 class="text-xl my-4 font-medium tracking-wide">
        <span class="text-orange-400 font-bold">JPXS</span> Launcher
      </h1>
      <Button href="/" name="Home" />
      <Button href="/live" name="Server List" />
    </section>
  );
}
