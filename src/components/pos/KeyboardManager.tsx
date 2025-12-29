'use client';

import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useCartStore } from '@/store/cartStore';

interface KeyboardManagerProps {
    children: React.ReactNode;
}

export function KeyboardManager({ children }: KeyboardManagerProps) {
    const { items, checkout } = useCartStore();

    // 1. SPACE: Trigger Checkout
    useHotkeys('space', (e) => {
        e.preventDefault(); // Prevent scrolling
        if (items.length > 0) {
            // We can trigger the button click or call checkout directly
            // Calling logic directly is cleaner but we lose the "Loading" state of the UI if handled locally in component.
            // For now, let's trigger the checkout action.
            // Ideal: Global UI State for "Processing".
            checkout();
        }
    }, {
        enabled: items.length > 0,
        preventDefault: true,
        enableOnFormTags: false // Don't trigger inside inputs
    }, [items, checkout]);

    // 2. F1: Focus Search (We'll implement an event bus or useRef later, for now placeholder)
    useHotkeys('f1', (e) => {
        e.preventDefault();
        const searchInput = document.getElementById('omni-search-input');
        if (searchInput) searchInput.focus();
    });

    return <>{children}</>;
}
