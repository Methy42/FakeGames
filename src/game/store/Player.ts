import { EventDispatcher } from "three";

class PlayerStore extends EventDispatcher<{
    change: unknown;
}> {
    public avatarUrl?: string;
    public language?: string;
    public name?: string;
    public token?: string;
}

export const playerStore = new Proxy(new PlayerStore(), {
    set(target, p, value) {
        target[p as keyof PlayerStore] = value;
        target.dispatchEvent({ type: "change" });
        return true;
    }
});
