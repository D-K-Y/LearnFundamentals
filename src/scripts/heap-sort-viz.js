document.addEventListener('DOMContentLoaded', () => {
    const arrayInput = document.getElementById('array-input-heap');
    const sortButton = document.getElementById('sort-button-heap');
    const resetButton = document.getElementById('reset-button-heap');
    const randomizeButton = document.getElementById('randomize-button-heap');
    const speedControl = document.getElementById('speed-control-heap');
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

            if (highlights.heapifying && highlights.heapifying.includes(index)) bar.classList.add('heapifying', 'active');
            else if (highlights.comparing && highlights.comparing.includes(index)) bar.classList.add('comparing', 'active');
            else if (highlights.swapping && highlights.swapping.includes(index)) bar.classList.add('swapping', 'active');
            else if (highlights.sorted && highlights.sorted.includes(index)) bar.classList.add('sorted');

            mainVisualizationArea.appendChild(bar);
        });
    }

    async function heapSortAlgorithm(arr) {
        let n = arr.length;

        // Build max heap
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            await heapify(arr, n, i);
        }

        // Extract elements one by one
        for (let i = n - 1; i > 0; i--) {
            logStep(`Swapping root (max element) with last element: arr[0] (${arr[0]}) & arr[${i}] (${arr[i]})`);
            renderArray(originalArrayState, { swapping: [0, i] });
            await sleep(animationDelay * 2);

            [arr[0], arr[i]] = [arr[i], arr[0]];
            [originalArrayState[0], originalArrayState[i]] = [originalArrayState[i], originalArrayState[0]];

            renderArray(originalArrayState, { sorted: [i], heapifying: [0] });
            await sleep(animationDelay);

            await heapify(arr, i, 0);
        }
    }

    async function heapify(arr, n, i) {
        let largest = i;
        let left = 2 * i + 1;
        let right = 2 * i + 2;

        logStep(`Heapifying: Root index ${i}, Left child index ${left}, Right child index ${right}`);
        renderArray(originalArrayState, { heapifying: [i, left, right].filter(idx => idx < n) });
        await sleep(animationDelay);

        if (left < n && arr[left] > arr[largest]) {
            largest = left;
        }

        if (right < n && arr[right] > arr[largest]) {
            largest = right;
        }

        if (largest !== i) {
            logStep(`Swapping: arr[${i}] (${arr[i]}) with arr[${largest}] (${arr[largest]})`);
            renderArray(originalArrayState, { swapping: [i, largest] });
            await sleep(animationDelay * 2);

            [arr[i], arr[largest]] = [arr[largest], arr[i]];
            [originalArrayState[i], originalArrayState[largest]] = [originalArrayState[largest], originalArrayState[i]];

            renderArray(originalArrayState, { heapifying: [largest] });
            await sleep(animationDelay);

            await heapify(arr, n, largest);
        }
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
        updateAuxiliaryDisplay("Starting Heap Sort...");

        setControlsDisabled(true);

        let workArray = [...originalArrayState];
        await heapSortAlgorithm(workArray);

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
        if (arrayInput.value.trim() === "") arrayInput.value = "12,11,13,5,6,7";
        arrayToSort = parseInput();
        if (arrayToSort.length === 0 && arrayInput.value.trim() !== "") {
            arrayInput.value = "12,11,13,5,6,7";
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