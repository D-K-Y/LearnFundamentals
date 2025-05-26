// Dijkstra Visualization Script

const nodes = [
    { id: 'A', x: 60,  y: 180 },
    { id: 'B', x: 200, y: 40  },
    { id: 'C', x: 370, y: 100 },
    { id: 'D', x: 340, y: 260 }
];

const edges = [
    { from: 'A', to: 'B', weight: 2 },
    { from: 'A', to: 'C', weight: 5 },
    { from: 'A', to: 'D', weight: 4 },
    { from: 'B', to: 'C', weight: 1 },
    { from: 'C', to: 'D', weight: 1 }
];

// Build adjacency list for algorithm
const graph = {};
nodes.forEach(n => graph[n.id] = []);
edges.forEach(e => {
    graph[e.from].push({ node: e.to, weight: e.weight });
    graph[e.to].push({ node: e.from, weight: e.weight }); // undirected
});

const svg = document.getElementById('graph');
const nodeMap = {};
const edgeMap = {};

// Set a larger viewBox and SVG height for better visibility
svg.setAttribute('viewBox', '0 0 440 320');
svg.style.height = '360px';

function drawGraph(highlightedPath = []) {
    svg.innerHTML = '';

    // Draw edges
    edges.forEach((e, i) => {
        const n1 = nodes.find(n => n.id === e.from);
        const n2 = nodes.find(n => n.id === e.to);
        const isPath = isEdgeInPath(e.from, e.to, highlightedPath);

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', n1.x);
        line.setAttribute('y1', n1.y);
        line.setAttribute('x2', n2.x);
        line.setAttribute('y2', n2.y);
        line.setAttribute('class', isPath ? 'edge-path' : 'edge');
        svg.appendChild(line);

        // Edge label
        const lx = (n1.x + n2.x) / 2;
        const ly = (n1.y + n2.y) / 2 - 10;
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', lx);
        label.setAttribute('y', ly);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('class', 'edge-label');
        label.textContent = e.weight;
        svg.appendChild(label);

        edgeMap[`${e.from}-${e.to}`] = line;
        edgeMap[`${e.to}-${e.from}`] = line;
    });

    // Draw nodes
    nodes.forEach(n => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', n.x);
        circle.setAttribute('cy', n.y);
        circle.setAttribute('r', 28);
        circle.setAttribute('fill', '#fff');
        circle.setAttribute('class', 'node');
        svg.appendChild(circle);

        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', n.x);
        label.setAttribute('y', n.y + 6);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('class', 'node-label');
        label.textContent = n.id;
        svg.appendChild(label);

        nodeMap[n.id] = circle;
    });
}

function isEdgeInPath(from, to, path) {
    for (let i = 0; i < path.length - 1; i++) {
        if ((path[i] === from && path[i+1] === to) || (path[i] === to && path[i+1] === from)) {
            return true;
        }
    }
    return false;
}

// --- Dijkstra Step-by-Step ---
let dijkstraState = null;

function startDijkstra() {
    dijkstraState = {
        distances: { A: 0, B: Infinity, C: Infinity, D: Infinity },
        prev: {},
        visited: new Set(),
        queue: [{ node: 'A', dist: 0 }],
        path: [],
        finished: false,
        current: null
    };
    drawGraph();
    updateStatus('Started. Source: A');
    updateNodes();
    document.getElementById('nextBtn').disabled = false;
}

function nextStep() {
    if (!dijkstraState || dijkstraState.finished) return;

    // Find node with smallest distance in queue
    dijkstraState.queue.sort((a, b) => a.dist - b.dist);
    const curr = dijkstraState.queue.shift();
    if (!curr) {
        dijkstraState.finished = true;
        showFinalPath();
        updateStatus('Done! Shortest path: A → B → C → D');
        document.getElementById('nextBtn').disabled = true;
        return;
    }
    const { node } = curr;
    if (dijkstraState.visited.has(node)) {
        nextStep();
        return;
    }
    dijkstraState.current = node;
    dijkstraState.visited.add(node);

    // Update neighbors
    for (const neighbor of graph[node]) {
        if (dijkstraState.visited.has(neighbor.node)) continue;
        const newDist = dijkstraState.distances[node] + neighbor.weight;
        if (newDist < dijkstraState.distances[neighbor.node]) {
            dijkstraState.distances[neighbor.node] = newDist;
            dijkstraState.prev[neighbor.node] = node;
            dijkstraState.queue.push({ node: neighbor.node, dist: newDist });
        }
    }
    updateNodes();
    updateStatus(`Visited: ${node}. Queue: [${dijkstraState.queue.map(q => q.node).join(', ')}]`);
}

function updateNodes() {
    drawGraph(getCurrentPath());
    // Highlight visited nodes
    dijkstraState.visited.forEach(n => {
        nodeMap[n].setAttribute('fill', '#b2f2ff');
    });
    // Highlight current node
    if (dijkstraState.current) {
        nodeMap[dijkstraState.current].setAttribute('stroke', '#ffc107');
        nodeMap[dijkstraState.current].setAttribute('stroke-width', 4);
    }
}

function getCurrentPath() {
    // Build path from A to D using prev
    let path = [];
    let curr = 'D';
    while (curr && dijkstraState.prev[curr]) {
        path.unshift(curr);
        curr = dijkstraState.prev[curr];
    }
    if (curr === 'A') path.unshift('A');
    return path;
}

function showFinalPath() {
    const path = getCurrentPath();
    drawGraph(path);
    path.forEach(n => {
        nodeMap[n].setAttribute('fill', '#fff3cd');
        nodeMap[n].setAttribute('stroke', '#ffc107');
        nodeMap[n].setAttribute('stroke-width', 4);
    });
}

function updateStatus(msg) {
    document.getElementById('status').textContent = msg;
}

// --- Controls ---
document.getElementById('startBtn').onclick = () => {
    startDijkstra();
};
document.getElementById('nextBtn').onclick = () => {
    nextStep();
};

// Draw initial static graph
drawGraph();
updateStatus('Click Start to begin Dijkstra\'s Algorithm.');