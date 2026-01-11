import { defineStore } from "pinia";

export const useFlashStore = defineStore("flash", {
    state: () => ({
        message: null as string | null,
        type: "success" as "success" | "info" | "error",
        visible: false,
        timeoutId: null as any,
        welcomeShown: false,
    }),
    actions: {
        show(message: string, type: "success" | "info" | "error" = "info", ms = 5000) {
            this.message = message;
            this.type = type;
            this.visible = true;
            if (this.timeoutId) clearTimeout(this.timeoutId);
            this.timeoutId = setTimeout(() => {
                this.visible = false;
            }, ms);
        },
        hide() {
            this.visible = false;
        },
        showWelcome(isGuest: boolean) {
            if (this.welcomeShown) return;
            this.welcomeShown = true;
            this.show(isGuest ? "Bienvenue 👋" : "Content de te revoir 👋", "info", 3000);
        },
        resetWelcome() {
            this.welcomeShown = false;
        },
    },
});
