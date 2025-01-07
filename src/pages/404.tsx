import { A } from "@solidjs/router";
import Sidebar from "../components/Sidebar";

export default function () {
  return (
    <>
      <Sidebar />
      <section class="text-center mx-64">
        <h1 class="font-bold text-4xl text-red-500 my-8">Error</h1>
        <p class="text-2xl mb-8">We couldn't find what you were looking for!</p>
        <A
          href="/"
          class="transition-colors duration-100 px-4 py-2 bg-surface0 hover:bg-crust rounded-xl"
        >
          Go Back Home
        </A>
      </section>
    </>
  );
}
