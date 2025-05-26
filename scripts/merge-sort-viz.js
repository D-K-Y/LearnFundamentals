document.addEventListener('DOMContentLoaded', () => {
    const arrayInput = document.getElementById('array-input-merge');
    const sortButton = document.getElementById('sort-button-merge');
    const resetButton = document.getElementById('reset-button-merge');
    const speedControl = document.getElementById('speed-control-merge');
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
        return inputText.split(',').map(numStr => parseInt(numStr.trim(), 10)).filter(num => !isNaN(num));
    }

    function logStep(message) {
        const stepDiv = document.createElement('div');
        stepDiv.innerHTML = message; // Allow basic HTML for emphasis if needed
        stepsLog.appendChild(stepDiv);
        stepsLog.scrollTop = stepsLog.scrollHeight; 
    }

    function updateAuxiliaryDisplay(message, leftArr = null, rightArr = null) {
        let content = `<p>${message}</p>`;
        if (leftArr) {
            content += `<div><span class="sub-array-label">Left Sub-array:</span> [${leftArr.join(', ')}]</div>`;
        }
        if (rightArr) {
            content += `<div><span class="sub-array-label">Right Sub-array:</span> [${rightArr.join(', ')}]</div>`;
        }
        auxVisualizationArea.innerHTML = content;
    }
    
    // renderArray function with enhanced highlighting capabilities
    function renderArray(arrToRender, highlights = {}) {
        mainVisualizationArea.innerHTML = '';
        const maxValue = Math.max(...arrToRender, 0) || 1;

        arrToRender.forEach((value, index) => {
            const bar = document.createElement('div');
            bar.classList.add('bar');
            const barHeight = Math.max(10, (value / maxValue) * 85 + 5); // Ensure min height, use up to 90% of area
            bar.style.height = `${barHeight}%`;
            bar.textContent = value;
            bar.dataset.value = value;

            // Apply highlight classes - order can matter for overrides
            if (highlights.dividingSegment && highlights.dividingSegment.includes(index)) bar.classList.add('dividing-segment', 'active');
            if (highlights.mergingSourceLeft && highlights.mergingSourceLeft.includes(index)) bar.classList.add('merging-source-left', 'active');
            if (highlights.mergingSourceRight && highlights.mergingSourceRight.includes(index)) bar.classList.add('merging-source-right', 'active');
            if (highlights.justPlaced && highlights.justPlaced.includes(index)) bar.classList.add('just-placed', 'active');
            if (highlights.sortedInSegment && highlights.sortedInSegment.includes(index)) bar.classList.add('sorted-in-segment');
            if (highlights.finalSorted && highlights.finalSorted.includes(index)) bar.classList.add('final-sorted', 'active');
            
            mainVisualizationArea.appendChild(bar);
        });
    }
    
    async function mergeSortRecursive(arr, left, right, displayOffset = 0) {
        if (left >= right) {
            if (left === right) { // Single element is "sorted" in its segment
                 renderArray(originalArrayState, { sortedInSegment: [left + displayOffset] });
                 await sleep(animationDelay / 2); // Brief pause to show it
            }
            return; 
        }

        const mid = Math.floor(left + (right - left) / 2);
        logStep(`<b>Splitting segment</b> (indices ${left + displayOffset} to ${right + displayOffset}) into (indices ${left + displayOffset} to ${mid + displayOffset}) and (${mid + 1 + displayOffset} to ${right + displayOffset})`);
        updateAuxiliaryDisplay(`Dividing segment: [${originalArrayState.slice(left + displayOffset, right + 1 + displayOffset).join(', ')}]`);
        
        const currentDivideSegmentIndices = Array.from({length: right - left + 1}, (_, i) => left + i + displayOffset);
        renderArray(originalArrayState, { dividingSegment: currentDivideSegmentIndices });
        await sleep(animationDelay);

        await mergeSortRecursive(arr, left, mid, displayOffset);
        await mergeSortRecursive(arr, mid + 1, right, displayOffset);

        await merge(arr, left, mid, right, displayOffset);
    }

    async function merge(arr, left, mid, right, displayOffset = 0) {
        const leftSubArrayContent = originalArrayState.slice(left + displayOffset, mid + 1 + displayOffset);
        const rightSubArrayContent = originalArrayState.slice(mid + 1 + displayOffset, right + 1 + displayOffset);

        logStep(`<b>Merging segments:</b> [${leftSubArrayContent.join(', ')}] and [${rightSubArrayContent.join(', ')}] into original positions ${left+displayOffset}-${right+displayOffset}`);
        updateAuxiliaryDisplay(
            `Merging...`,
            leftSubArrayContent,
            rightSubArrayContent
        );

        const n1 = mid - left + 1;
        const n2 = right - mid;

        let L = new Array(n1);
        let R = new Array(n2);

        for (let i = 0; i < n1; i++) L[i] = arr[left + i]; // arr here is the working copy
        for (let j = 0; j < n2; j++) R[j] = arr[mid + 1 + j];

        let i = 0, j = 0, k = left; // k is index for arr (working copy)

        // Highlight the sub-arrays being merged in the main display
        const leftHighlightIndices = Array.from({length: n1}, (_, idx) => left + idx + displayOffset);
        const rightHighlightIndices = Array.from({length: n2}, (_, idx) => mid + 1 + idx + displayOffset);
        
        renderArray(originalArrayState, { 
            mergingSourceLeft: leftHighlightIndices, 
            mergingSourceRight: rightHighlightIndices 
        });
        await sleep(animationDelay);


        while (i < n1 && j < n2) {
            // Show which elements from L and R are being compared by highlighting their original positions
             renderArray(originalArrayState, { 
                mergingSourceLeft: [left + i + displayOffset], // Current element from L
                mergingSourceRight: [mid + 1 + j + displayOffset] // Current element from R
            });
            await sleep(animationDelay);

            if (L[i] <= R[j]) {
                arr[k] = L[i];
                originalArrayState[k + displayOffset] = L[i]; 
                i++;
            } else {
                arr[k] = R[j];
                originalArrayState[k + displayOffset] = R[j]; 
                j++;
            }
            logStep(`Placed ${arr[k]} at index ${k + displayOffset}.`);
            renderArray(originalArrayState, { justPlaced: [k + displayOffset] }); 
            await sleep(animationDelay);
            // After "justPlaced" highlight, revert to showing the merging segments
            renderArray(originalArrayState, { 
                mergingSourceLeft: leftHighlightIndices, 
                mergingSourceRight: rightHighlightIndices,
                sortedInSegment: Array.from({length: k - left +1}, (_,idx) => left + idx + displayOffset) // show already placed in this merge
            });
            k++;
        }

        while (i < n1) {
            arr[k] = L[i];
            originalArrayState[k + displayOffset] = L[i];
            renderArray(originalArrayState, { justPlaced: [k + displayOffset] });
            await sleep(animationDelay);
            renderArray(originalArrayState, { 
                mergingSourceLeft: leftHighlightIndices, 
                mergingSourceRight: rightHighlightIndices,
                sortedInSegment: Array.from({length: k - left +1}, (_,idx) => left + idx + displayOffset)
            });
            i++;
            k++;
        }

        while (j < n2) {
            arr[k] = R[j];
            originalArrayState[k + displayOffset] = R[j];
            renderArray(originalArrayState, { justPlaced: [k + displayOffset] });
            await sleep(animationDelay);
            renderArray(originalArrayState, { 
                mergingSourceLeft: leftHighlightIndices, 
                mergingSourceRight: rightHighlightIndices,
                sortedInSegment: Array.from({length: k - left +1}, (_,idx) => left + idx + displayOffset)
            });
            j++;
            k++;
        }
        
        const mergedSegmentIndices = Array.from({length: right - left + 1}, (_, idx) => left + idx + displayOffset);
        renderArray(originalArrayState, { sortedInSegment: mergedSegmentIndices });
        logStep(`Segment from index ${left + displayOffset} to ${right + displayOffset} now merged: [${originalArrayState.slice(left + displayOffset, right + 1 + displayOffset).join(', ')}]`);
        await sleep(animationDelay);
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function startSort() {
        arrayToSort = parseInput();
        if (arrayToSort.length === 0) {
            mainVisualizationArea.innerHTML = '<p style="color: red;">Please enter valid numbers.</p>';
            return;
        }
        originalArrayState = [...arrayToSort]; 
        
        stepsLog.innerHTML = ''; 
        logStep(`<b>Initial array:</b> [${originalArrayState.join(', ')}]`);
        renderArray(originalArrayState);
        updateAuxiliaryDisplay("Starting Merge Sort...");
        
        sortButton.disabled = true;
        resetButton.disabled = true;
        arrayInput.disabled = true;

        let workArray = [...originalArrayState]; 
        await mergeSortRecursive(workArray, 0, workArray.length - 1, 0);

        renderArray(originalArrayState, { finalSorted: Array.from(originalArrayState.keys()) }); 
        logStep(`<b>Sorting complete. Final array:</b> [${originalArrayState.join(', ')}]`);
        updateAuxiliaryDisplay("Sorting complete!");

        sortButton.disabled = false;
        resetButton.disabled = false;
        arrayInput.disabled = false;
    }

    function resetVisualization() {
        if (arrayInput.value.trim() === "") arrayInput.value = "38,27,43,3,9,82,10";
        arrayToSort = parseInput();
        originalArrayState = [...arrayToSort];

        renderArray(originalArrayState);
        stepsLog.innerHTML = '';
        auxVisualizationArea.innerHTML = '<p>Ready to sort.</p>';
        sortButton.disabled = false;
        arrayInput.disabled = false;
    }
    
    sortButton.addEventListener('click', startSort);
    resetButton.addEventListener('click', resetVisualization);

    resetVisualization();
});