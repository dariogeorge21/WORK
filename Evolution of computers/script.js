document.addEventListener('DOMContentLoaded', () => {
    // Auto refresh every 2 minutes
    setInterval(() => {
        window.location.reload();
    }, 120000);

    const timelineContents = document.querySelectorAll('.timeline-content');
    
    const sectionProperties = {
        'Computer Evolution': {
            speed: 50,
            itemsToClone: 8, // Clone all items
            spacerWidth: 1000,
            startDelay: 0
        },
        'Windows Evolution': {
            speed: 45,
            itemsToClone: 7, // Clone all items
            spacerWidth: 900,
            startDelay: 2000
        },
        'Network Evolution': {
            speed: 40,
            itemsToClone: 7, // Clone all items
            spacerWidth: 800,
            startDelay: 4000
        },
        'Programming Evolution': {
            speed: 55,
            itemsToClone: 8, // Clone all items
            spacerWidth: 1100,
            startDelay: 6000
        }
    };

    timelineContents.forEach(timeline => {
        const inner = timeline.querySelector('.timeline-content-inner');
        const sectionTitle = timeline.parentNode.querySelector('.timeline-title').textContent;
        const props = sectionProperties[sectionTitle];
        let items = Array.from(inner.querySelectorAll('.timeline-item'));
        
        // Sort items by year
        items.sort((a, b) => {
            const yearA = parseInt(a.querySelector('.year').textContent);
            const yearB = parseInt(b.querySelector('.year').textContent);
            return yearA - yearB;
        });
        
        // Clear and reappend sorted items
        inner.innerHTML = '';
        items.forEach(item => inner.appendChild(item));
        
        // Add spacer at the end
        const spacer = document.createElement('div');
        spacer.className = 'spacer';
        spacer.style.minWidth = `${props.spacerWidth}px`;
        inner.appendChild(spacer);
        
        // Clone ALL items and add them after spacer
        items.forEach(item => {
            const clone = item.cloneNode(true);
            inner.appendChild(clone);
        });

        // Calculate dimensions
        const itemWidth = items[0].offsetWidth + 30; // Including gap
        const totalWidth = (items.length * itemWidth) + props.spacerWidth;
        
        function resetPosition() {
            inner.style.transition = 'none';
            inner.style.transform = 'translateX(0)';
            void inner.offsetWidth; // Force reflow
            inner.style.transition = `transform ${props.speed}s linear`;
            inner.style.transform = `translateX(-${totalWidth}px)`;
        }

        // Start animation with section-specific delay
        setTimeout(() => {
            resetPosition();
            
            // Reset animation when it completes
            inner.addEventListener('transitionend', () => {
                // Small delay before resetting to ensure smooth transition
                setTimeout(resetPosition, 100);
            });
        }, props.startDelay);
    });
});
