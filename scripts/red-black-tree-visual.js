// Minimal dynamic Red-Black Tree visualization (insert only, with color rules)

class RBNode {
    constructor(value, color = 'R', parent = null) {
        this.value = value;
        this.color = color; // "R" or "B"
        this.left = null;
        this.right = null;
        this.parent = parent;
    }
}

class RedBlackTree {
    constructor() {
        this.root = null;
    }

    insert(value) {
        let newNode = new RBNode(value, 'R');
        if (!this.root) {
            newNode.color = 'B';
            this.root = newNode;
            return newNode;
        }
        let parent = null, curr = this.root;
        while (curr) {
            parent = curr;
            if (value < curr.value) curr = curr.left;
            else curr = curr.right;
        }
        newNode.parent = parent;
        if (value < parent.value) parent.left = newNode;
        else parent.right = newNode;
        this.fixInsert(newNode);
        return newNode;
    }

    // Fix-up to maintain Red-Black properties after insert
    fixInsert(node) {
        while (node !== this.root && node.parent.color === 'R') {
            let parent = node.parent;
            let grandparent = parent.parent;
            if (!grandparent) break;
            if (parent === grandparent.left) {
                let uncle = grandparent.right;
                if (uncle && uncle.color === 'R') {
                    parent.color = uncle.color = 'B';
                    grandparent.color = 'R';
                    node = grandparent;
                } else {
                    if (node === parent.right) {
                        node = parent;
                        this.rotateLeft(node);
                    }
                    parent.color = 'B';
                    grandparent.color = 'R';
                    this.rotateRight(grandparent);
                }
            } else {
                let uncle = grandparent.left;
                if (uncle && uncle.color === 'R') {
                    parent.color = uncle.color = 'B';
                    grandparent.color = 'R';
                    node = grandparent;
                } else {
                    if (node === parent.left) {
                        node = parent;
                        this.rotateRight(node);
                    }
                    parent.color = 'B';
                    grandparent.color = 'R';
                    this.rotateLeft(grandparent);
                }
            }
        }
        this.root.color = 'B';
    }

    rotateLeft(x) {
        let y = x.right;
        x.right = y.left;
        if (y.left) y.left.parent = x;
        y.parent = x.parent;
        if (!x.parent) this.root = y;
        else if (x === x.parent.left) x.parent.left = y;
        else x.parent.right = y;
        y.left = x;
        x.parent = y;
    }

    rotateRight(x) {
        let y = x.left;
        x.left = y.right;
        if (y.right) y.right.parent = x;
        y.parent = x.parent;
        if (!x.parent) this.root = y;
        else if (x === x.parent.right) x.parent.right = y;
        else x.parent.left = y;
        y.right = x;
        x.parent = y;
    }

    // For visualization: BFS traversal to get nodes with coordinates
    getTreeLayout() {
        if (!this.root) return [];
        let levels = [], queue = [{node: this.root, depth: 0, pos: 0.5}];
        let maxDepth = 0;
        while (queue.length) {
            let {node, depth, pos} = queue.shift();
            if (!levels[depth]) levels[depth] = [];
            levels[depth].push({node, pos});
            maxDepth = Math.max(maxDepth, depth);
            if (node.left) queue.push({node: node.left, depth: depth+1, pos: pos-1/(2**(depth+2))});
            if (node.right) queue.push({node: node.right, depth: depth+1, pos: pos+1/(2**(depth+2))});
        }
        // Assign coordinates
        let layout = [];
        for (let d = 0; d <= maxDepth; d++) {
            let y = 60 + d * 80;
            for (let i = 0; i < levels[d].length; i++) {
                let {node, pos} = levels[d][i];
                let x = 600 * pos;
                layout.push({node, x, y});
            }
        }
        return layout;
    }
}

// --- Visualization ---
const svg = document.getElementById('tree-svg');
const tree = new RedBlackTree();

function drawTree() {
    svg.innerHTML = '';
    const layout = tree.getTreeLayout();
    // Draw edges
    layout.forEach(({node, x, y}) => {
        if (node.parent) {
            let parentLayout = layout.find(l => l.node === node.parent);
            if (parentLayout) {
                let px = parentLayout.x, py = parentLayout.y;
                let edge = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                edge.setAttribute('x1', px);
                edge.setAttribute('y1', py+2);
                edge.setAttribute('x2', x);
                edge.setAttribute('y2', y-28);
                edge.setAttribute('class', 'edge');
                svg.appendChild(edge);
            }
        }
    });
    // Draw nodes
    layout.forEach(({node, x, y}) => {
        let circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', 28);
        circle.setAttribute('class', node.color === 'R' ? 'node node-red' : 'node node-black');
        svg.appendChild(circle);

        let label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', x);
        label.setAttribute('y', y+6);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('class', 'node-label');
        label.textContent = node.value;
        svg.appendChild(label);
    });
}

document.getElementById('insert-btn').onclick = function() {
    const val = parseInt(document.getElementById('insert-value').value, 10);
    if (!isNaN(val)) {
        tree.insert(val);
        drawTree();
        document.getElementById('insert-value').value = '';
    }
};
document.getElementById('reset-btn').onclick = function() {
    tree.root = null;
    drawTree();
};
drawTree();