document.addEventListener('DOMContentLoaded', () => {
    const arrayInput = document.getElementById('array-input');
    const sortButton = document.getElementById('sort-button');
    const resetButton = document.getElementById('reset-button');
    const visualizationArea = document.getElementById('visualization-area');
    const stepsLog = document.getElementById('steps-log');
    let arrayToSort = [];

    function parseInput() {
        const inputText = arrayInput.value.trim();
        if (!inputText) return [];
        return inputText.split(',').map(num => parseInt(num.trim(), 10)).filter(num => !isNaN(num));
    }

    function renderArray(arr, swappingIndices = [], sortedIndex = -1) {
        visualizationArea.innerHTML = '';
        stepsLog.innerHTML = ''; // Clear previous logs for simplicity, or append
        const maxValue = Math.max(...arr, 0); // Ensure maxValue is not -Infinity for empty array

        arr.forEach((value, index) => {
            const bar = document.createElement('div');
            bar.classList.add('bar');
            const barHeight = maxValue > 0 ? (value / maxValue) * 90 + 10 : 10; // Min height 10%, max 100%
            bar.style.height = `${Math.max(barHeight, 5)}%`; // Ensure a minimum visible height
            bar.textContent = value;

            if (swappingIndices.includes(index)) {
                bar.classList.add('swapping');
            }
            if (index >= sortedIndex && sortedIndex !== -1) {
                 bar.classList.add('sorted');
            }
            visualizationArea.appendChild(bar);
        });
    }

    async function bubbleSortVisualize() {
        sortButton.disabled = true;
        resetButton.disabled = true;
        stepsLog.innerHTML = '<strong>Sorting Steps:</strong><br>';
        let arr = [...arrayToSort];
        const n = arr.length;
        let swapped;

        for (let i = 0; i < n - 1; i++) {
            swapped = false;
            for (let j = 0; j < n - 1 - i; j++) {
                renderArray(arr, [j, j + 1]);
                await sleep(500); // Delay for visualization

                if (arr[j] > arr[j + 1]) {
                    stepsLog.innerHTML += `Swapping ${arr[j]} and ${arr[j+1]}. Array: [${arr.join(', ')}]<br>`;
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                    swapped = true;
                    renderArray(arr, [j, j + 1]); // Show swapped state
                    await sleep(500);
                }
            }
            renderArray(arr, [], n - 1 - i); // Mark the end part as sorted-ish
            await sleep(300);
            if (!swapped) {
                stepsLog.innerHTML += 'No swaps in this pass. Array is sorted.<br>';
                break;
            }
        }
        renderArray(arr, [], 0); // Final sorted state, mark all as sorted
        stepsLog.innerHTML += `<strong>Final Sorted Array: [${arr.join(', ')}]</strong>`;
        sortButton.disabled = false;
        resetButton.disabled = false;
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    sortButton.addEventListener('click', () => {
        arrayToSort = parseInput();
        if (arrayToSort.length > 0) {
            renderArray(arrayToSort); // Initial render
            bubbleSortVisualize();
        } else {
            visualizationArea.innerHTML = '<p style="color: red;">Please enter valid numbers.</p>';
        }
    });

    resetButton.addEventListener('click', () => {
        arrayInput.value = "5,1,4,2,8";
        arrayToSort = parseInput();
        renderArray(arrayToSort);
        stepsLog.innerHTML = '';
        sortButton.disabled = false;
    });

    // Initial render on load
    arrayToSort = parseInput();
    if (arrayToSort.length > 0) {
        renderArray(arrayToSort);
    }
});