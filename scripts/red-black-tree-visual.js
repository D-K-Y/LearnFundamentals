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
            if (value === curr.value) return curr; // Value already exists
            if (value < curr.value) curr = curr.left;
            else curr = curr.right;
        }
        newNode.parent = parent;
        if (value < parent.value) parent.left = newNode;
        else parent.right = newNode;
        this.fixInsert(newNode);
        return newNode;
    }

    fixInsert(node) {
        while (node !== this.root && node.parent.color === 'R') {
            let parent = node.parent;
            let grandparent = parent.parent;
            
            if (!grandparent) { // Parent is root, but root should be black. This case implies an issue if parent is R.
                parent.color = 'B'; // Ensure root's child (if root was temp R) is handled.
                break; 
            }

            if (parent === grandparent.left) {
                let uncle = grandparent.right;
                if (uncle && uncle.color === 'R') {
                    parent.color = 'B';
                    uncle.color = 'B';
                    grandparent.color = 'R';
                    node = grandparent;
                } else {
                    if (node === parent.right) {
                        node = parent;
                        this.rotateLeft(node);
                        parent = node.parent; // Update parent after rotation
                        grandparent = parent.parent; // Grandparent also changes
                    }
                    if(parent) parent.color = 'B'; // Check parent exists
                    if(grandparent) grandparent.color = 'R'; // Check grandparent exists
                    if(grandparent) this.rotateRight(grandparent);
                }
            } else {
                let uncle = grandparent.left;
                if (uncle && uncle.color === 'R') {
                    parent.color = 'B';
                    uncle.color = 'B';
                    grandparent.color = 'R';
                    node = grandparent;
                } else {
                    if (node === parent.left) {
                        node = parent;
                        this.rotateRight(node);
                        parent = node.parent; // Update parent
                        grandparent = parent.parent; // Update grandparent
                    }
                    if(parent) parent.color = 'B';
                    if(grandparent) grandparent.color = 'R';
                    if(grandparent) this.rotateLeft(grandparent);
                }
            }
        }
        if (this.root) this.root.color = 'B';
    }

    rotateLeft(x) {
        let y = x.right;
        if (!y) return;
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
        if (!y) return;
        x.left = y.right;
        if (y.right) y.right.parent = x;
        y.parent = x.parent;
        if (!x.parent) this.root = y;
        else if (x === x.parent.right) x.parent.right = y;
        else x.parent.left = y;
        y.right = x;
        x.parent = y;
    }

    getTreeLayout() {
        if (!this.root) return [];
    
        const layout = [];
        const nodeRadius = 20;
        const levelHeight = 70; // Increased vertical spacing
        const svgWidth = parseFloat(svg.getAttribute('viewBox').split(' ')[2]) || 600;
    
        // Assign depth and initial y
        const nodesWithDepth = [];
        let queue = [{ node: this.root, depth: 0 }];
        let visited = new Set();
        let maxDepth = 0;
    
        while (queue.length > 0) {
            const { node, depth } = queue.shift();
            if (visited.has(node)) continue;
            visited.add(node);
    
            maxDepth = Math.max(maxDepth, depth);
            nodesWithDepth.push({ node, depth, y: 30 + depth * levelHeight, x: 0 });
    
            if (node.left) queue.push({ node: node.left, depth: depth + 1 });
            if (node.right) queue.push({ node: node.right, depth: depth + 1 });
        }
    
        // Assign x based on in-order traversal count for each level
        const nodesByLevel = Array(maxDepth + 1).fill(null).map(() => []);
        nodesWithDepth.forEach(item => {
            if(item.node) nodesByLevel[item.depth].push(item.node);
        });
    
        const xPositions = new Map();
        let currentX = 0;
        const horizontalGap = nodeRadius * 2.5; // Gap between nodes
    
        function assignXRecursive(node) {
            if (!node) return;
            assignXRecursive(node.left);
            xPositions.set(node, currentX);
            currentX += horizontalGap;
            assignXRecursive(node.right);
        }
    
        assignXRecursive(this.root);
    
        // Center the tree
        const treeWidth = currentX - horizontalGap;
        const xOffset = (svgWidth - treeWidth) / 2;
    
        nodesWithDepth.forEach(item => {
            item.x = (xPositions.get(item.node) || 0) + xOffset;
            layout.push(item);
        });
        
        if (layout.length === 1 && layout[0].node === this.root) { // Center single node
            layout[0].x = svgWidth / 2;
        }
        return layout;
    }
}

const svg = document.getElementById('tree-svg');
const tree = new RedBlackTree();

function drawTree() {
    if (!svg) {
        console.error("SVG element not found!");
        return;
    }
    svg.innerHTML = ''; 
    const layout = tree.getTreeLayout();
    const nodeRadius = 20;

    layout.forEach(({node, x, y}) => {
        if (node.parent) {
            let parentLayout = layout.find(l => l.node === node.parent);
            if (parentLayout) {
                let edge = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                edge.setAttribute('x1', parentLayout.x);
                edge.setAttribute('y1', parentLayout.y + nodeRadius * 0.8); // Connect from bottom of parent
                edge.setAttribute('x2', x);
                edge.setAttribute('y2', y - nodeRadius * 0.8); // Connect to top of child
                edge.setAttribute('class', 'edge');
                svg.appendChild(edge);
            }
        }
    });

    layout.forEach(({node, x, y}) => {
        let circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', nodeRadius);
        circle.setAttribute('class', node.color === 'R' ? 'node node-red' : 'node node-black');
        svg.appendChild(circle);

        let label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', x);
        label.setAttribute('y', y + (nodeRadius / 4)); // Adjust for better vertical centering
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('class', 'node-label');
        label.textContent = node.value;
        svg.appendChild(label);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const insertBtn = document.getElementById('insert-btn');
    const insertValueInput = document.getElementById('insert-value');
    const resetBtn = document.getElementById('reset-btn');

    if (insertBtn && insertValueInput && resetBtn && svg) {
        insertBtn.onclick = function() {
            const valStr = insertValueInput.value;
            if (valStr.trim() === '') return;
            const val = parseInt(valStr, 10);
            if (!isNaN(val)) {
                tree.insert(val);
                drawTree();
                insertValueInput.value = '';
                insertValueInput.focus();
            } else {
                alert("Please enter a valid number.");
            }
        };
        resetBtn.onclick = function() {
            tree.root = null;
            drawTree();
            insertValueInput.value = '';
        };
        drawTree(); // Initial draw
    } else {
        console.error("One or more essential page elements (SVG, buttons, input) were not found.");
    }
});