document.addEventListener('DOMContentLoaded', () => {
    const arrayInput = document.getElementById('array-input-quick');
    const sortButton = document.getElementById('sort-button-quick');
    const resetButton = document.getElementById('reset-button-quick');
    const randomizeButton = document.getElementById('randomize-button-quick');
    const speedControl = document.getElementById('speed-control-quick');
    const mainVisualizationArea = document.getElementById('main-visualization-area');
    const auxVisualizationArea = document.getElementById('aux-visualization-area');
    const stepsLog = document.getElementById('steps-log');

    let animationDelay = parseInt(speedControl.value, 10);
    let arrayToSort = [];
    let originalArrayState = [];

    speedControl.addEventListener('input', (e) => {
        animationDelay = 2100 - parseInt(e.target.value, 10);
    });

    function parseInput() {
        const inputText = arrayInput.value.trim();
        if (!inputText) return [];
        return inputText.split(',').map(numStr => parseInt(numStr.trim(), 10)).filter(num => !isNaN(num) && num > 0);
    }

    function logStep(message) {
        const stepDiv = document.createElement('div');
        stepDiv.innerHTML = message;
        stepsLog.appendChild(stepDiv);
        stepsLog.scrollTop = stepsLog.scrollHeight;
    }

    function updateAuxiliaryDisplay(message) {
        auxVisualizationArea.innerHTML = `<p>${message}</p>`;
    }

    function renderArray(arrToRender, highlights = {}) {
        mainVisualizationArea.innerHTML = '';
        const maxValue = Math.max(...arrToRender, 1);

        arrToRender.forEach((value, index) => {
            const bar = document.createElement('div');
            bar.classList.add('bar');
            const barHeightPercentage = (value / maxValue) * 90;
            bar.style.height = `${Math.max(5, barHeightPercentage)}%`;
            bar.textContent = value;
            bar.dataset.value = value;

            // Clear previous specific highlights before applying new ones
            bar.className = 'bar';

            // Apply highlights based on the current operation
            if (highlights.pivot && highlights.pivot.includes(index)) bar.classList.add('pivot', 'active');
            if (highlights.comparing && highlights.comparing.includes(index)) bar.classList.add('comparing', 'active');
            if (highlights.swapping && highlights.swapping.includes(index)) bar.classList.add('swapping', 'active');
            if (highlights.sorted && highlights.sorted.includes(index)) bar.classList.add('sorted');
            if (highlights.leftBoundary === index) bar.classList.add('left-boundary'); // Add left boundary class
            if (highlights.rightBoundary === index) bar.classList.add('right-boundary'); // Add right boundary class

            mainVisualizationArea.appendChild(bar);
        });
    }

    async function quickSortRecursive(arr, low, high) {
        // Base case: If the sub-array has one or zero elements, it's already sorted
        if (low < high) {
            // Partition the array and get the pivot index
            const pi = await partition(arr, low, high);

            // Recursively sort the sub-arrays before and after the pivot
            await quickSortRecursive(arr, low, pi - 1);
            await quickSortRecursive(arr, pi + 1, high);
        } else if (low === high) {
            // Single element is sorted
            renderArray(originalArrayState, { sorted: [low] });
            await sleep(animationDelay / 2);
        }
    }

    async function partition(arr, low, high) {
        // Choose the rightmost element as the pivot
        const pivot = arr[high];
        let i = low - 1; // Index of the smaller element

        // Log the partitioning step and highlight the pivot
        logStep(`Partitioning: Pivot is ${pivot} (index ${high})`);
        renderArray(originalArrayState, { pivot: [high], leftBoundary: low, rightBoundary: high - 1 }); // Added boundaries
        updateAuxiliaryDisplay(`Pivot: ${pivot}`); // Display pivot in auxiliary area
        await sleep(animationDelay * 1.5);

        // Iterate through the array from low to high-1
        for (let j = low; j <= high - 1; j++) {
            // Log the comparison step and highlight the comparing elements
            logStep(`Comparing: arr[${j}] (${arr[j]}) <= pivot (${pivot})`);
            renderArray(originalArrayState, { pivot: [high], comparing: [j], leftBoundary: low, rightBoundary: high - 1 }); // Added boundaries
            updateAuxiliaryDisplay(`Comparing arr[${j}] (${arr[j]}) with pivot (${pivot})`); // Display comparison info
            await sleep(animationDelay);

            // If the current element is smaller than or equal to the pivot
            if (arr[j] <= pivot) {
                i++; // Increment index of smaller element

                // Log the swapping step and highlight the swapping elements
                logStep(`Swapping: arr[${i}] (${arr[i]}) with arr[${j}] (${arr[j]})`);
                renderArray(originalArrayState, { pivot: [high], swapping: [i, j], leftBoundary: low, rightBoundary: high - 1 }); // Added boundaries
                await sleep(animationDelay * 2);

                // Swap arr[i] and arr[j]
                [arr[i], arr[j]] = [arr[j], arr[i]];
                [originalArrayState[i], originalArrayState[j]] = [originalArrayState[j], originalArrayState[i]];

                // Highlight the sorted elements up to index i
                renderArray(originalArrayState, { pivot: [high], sorted: Array.from({ length: i + 1 }, (_, k) => k), leftBoundary: low, rightBoundary: high - 1 }); // Added boundaries
                await sleep(animationDelay);
            }
        }

        // Log the final swap and highlight the swapping elements
        logStep(`Final swap: arr[${i + 1}] (${arr[i + 1]}) with pivot arr[${high}] (${pivot})`);
        renderArray(originalArrayState, { pivot: [high], swapping: [i + 1, high], leftBoundary: low, rightBoundary: high - 1 }); // Added boundaries
        await sleep(animationDelay * 2);

        // Swap arr[i+1] and arr[high] (pivot)
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        [originalArrayState[i + 1], originalArrayState[high]] = [originalArrayState[high], originalArrayState[i + 1]];

        // Log the completion of the partition and highlight the sorted elements
        logStep(`Partition complete: Pivot ${pivot} placed at index ${i + 1}`);
        renderArray(originalArrayState, { sorted: Array.from({ length: i + 2 }, (_, k) => k), leftBoundary: low, rightBoundary: high - 1 }); // Added boundaries
        await sleep(animationDelay * 1.5);

        // Return the partition index
        return i + 1;
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function startSort() {
        arrayToSort = parseInput();
        if (arrayToSort.length === 0) {
            mainVisualizationArea.innerHTML = '<p style="color: red;">Please enter valid, positive numbers.</p>';
            return;
        }
        if (arrayToSort.length > 30) {
            mainVisualizationArea.innerHTML = '<p style="color: orange;">Array too large for smooth animation. Please use 30 elements or fewer.</p>';
            return;
        }
        originalArrayState = [...arrayToSort];

        stepsLog.innerHTML = '';
        logStep(`<b>Initial array:</b> [${originalArrayState.join(', ')}]`);
        renderArray(originalArrayState);
        updateAuxiliaryDisplay("Starting Quick Sort...");

        setControlsDisabled(true);

        let workArray = [...originalArrayState];
        await quickSortRecursive(workArray, 0, workArray.length - 1);

        renderArray(originalArrayState, { sorted: Array.from(originalArrayState.keys()) });
        logStep(`<b>Sorting complete. Final array:</b> [${originalArrayState.join(', ')}]`);
        updateAuxiliaryDisplay("Sorting complete!");

        setControlsDisabled(false);
    }

    function setControlsDisabled(disabled) {
        sortButton.disabled = disabled;
        resetButton.disabled = disabled;
        randomizeButton.disabled = disabled;
        arrayInput.disabled = disabled;
        speedControl.disabled = disabled;
    }

    function generateRandomArray() {
        const count = Math.floor(Math.random() * 11) + 5;
        const randomArr = [];
        for (let i = 0; i < count; i++) {
            randomArr.push(Math.floor(Math.random() * 99) + 1);
        }
        arrayInput.value = randomArr.join(',');
        resetVisualization();
    }

    function resetVisualization() {
        if (arrayInput.value.trim() === "") arrayInput.value = "10,7,8,9,1,5";
        arrayToSort = parseInput();
        if (arrayToSort.length === 0 && arrayInput.value.trim() !== "") {
            arrayInput.value = "10,7,8,9,1,5";
            arrayToSort = parseInput();
        }
        originalArrayState = [...arrayToSort];

        renderArray(originalArrayState);
        stepsLog.innerHTML = '';
        auxVisualizationArea.innerHTML = '<p>Ready to sort.</p>';
        setControlsDisabled(false);
    }

    sortButton.addEventListener('click', startSort);
    resetButton.addEventListener('click', resetVisualization);
    randomizeButton.addEventListener('click', generateRandomArray);

    resetVisualization();
});