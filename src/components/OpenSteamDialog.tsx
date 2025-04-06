export default function OpenSteamDialog() {
  return (
    <dialog id="steam-closed">
      <div class="bg-crust rounded-2xl p-8 flex flex-col gap-y-4">
        <h1 class="text-3xl font-bold">Steam is closed</h1>
        <p class="text-subtext0 text-lg">Please open Steam to play Sub Rosa.</p>
        <button
          class="bg-surface0 hover:bg-mantle transition-colors px-4 py-2 rounded-xl"
          onClick={() => {
            const dialog = document.querySelector(
              "#steam-closed"
            ) as HTMLDialogElement;
            dialog.close();
          }}
        >
          Close
        </button>
      </div>
    </dialog>
  );
}
