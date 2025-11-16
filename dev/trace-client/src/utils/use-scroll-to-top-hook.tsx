import { useCallback } from "react";

export function useScrollToTop() {
    const scrollToTop = useCallback(() => {
        const container = document.getElementById('main-scroll-container');
        if (container) {
            setTimeout(() => container.scrollTo({ top: 0, behavior: 'smooth' }), 100);
        }
    }, []);

    return { scrollToTop };
}
