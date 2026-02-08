const canvas = document.getElementById('treeCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 1200;
canvas.height = 600;

let tree = null;
let animationSpeed = 500;
let isAnimating = false;
let traversalPath = [];

// Tree node class
class TreeNode {
    constructor(value, x, y) {
        this.value = value;
        this.x = x;
        this.y = y;
        this.left = null;
        this.right = null;
        this.visited = false;
        this.found = false;
    }
}

// Generate a random tree
function generateRandomTree(depth, x, y, level, maxLevel, horizontalSpacing) {
    if (level > maxLevel) return null;
    
    const value = Math.floor(Math.random() * 99) + 1;
    const node = new TreeNode(value, x, y);
    
    const spacing = horizontalSpacing / (level + 1);
    
    if (level < maxLevel) {
        node.left = generateRandomTree(depth, x - spacing, y + 100, level + 1, maxLevel, horizontalSpacing);
        node.right = generateRandomTree(depth, x + spacing, y + 100, level + 1, maxLevel, horizontalSpacing);
    }
    
    return node;
}

// Draw the tree
function drawTree(node, parentX = null, parentY = null) {
    if (!node) return;
    
    // Draw edges first
    if (parentX !== null && parentY !== null) {
        ctx.beginPath();
        ctx.moveTo(parentX, parentY);
        ctx.lineTo(node.x, node.y);
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // Draw children
    if (node.left) drawTree(node.left, node.x, node.y);
    if (node.right) drawTree(node.right, node.x, node.y);
    
    // Draw node
    ctx.beginPath();
    ctx.arc(node.x, node.y, 25, 0, 2 * Math.PI);
    
    if (node.found) {
        ctx.fillStyle = '#4CAF50'; // Green for found
    } else if (node.visited) {
        ctx.fillStyle = '#FF9800'; // Orange for visited
    } else {
        ctx.fillStyle = '#2196F3'; // Blue for unvisited
    }
    
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw value
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.value, node.x, node.y);
}

// Clear canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// DFS traversal with animation
async function dfs(node, target, path) {
    if (!node || isAnimating === false) return null;
    
    // Visit the node
    node.visited = true;
    path.push(node.value);
    
    // Redraw tree
    clearCanvas();
    drawTree(tree);
    
    // Update traversal order display
    document.getElementById('traversal_order').innerHTML = 
        `<strong>Traversal Order:</strong> ${path.join(' → ')}`;
    
    // Wait for animation
    await sleep(animationSpeed);
    
    // Check if found
    if (node.value === target) {
        node.found = true;
        clearCanvas();
        drawTree(tree);
        return node;
    }
    
    // Search left subtree
    const leftResult = await dfs(node.left, target, path);
    if (leftResult) return leftResult;
    
    // Search right subtree
    const rightResult = await dfs(node.right, target, path);
    if (rightResult) return rightResult;
    
    return null;
}

// Sleep function for animation delay
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Reset tree visited status
function resetTree(node) {
    if (!node) return;
    node.visited = false;
    node.found = false;
    resetTree(node.left);
    resetTree(node.right);
}

// Initialize new tree
function initializeTree() {
    const depth = parseInt(document.getElementById('tree_depth').value);
    tree = generateRandomTree(depth, canvas.width / 2, 50, 1, depth, 400);
    traversalPath = [];
    clearCanvas();
    drawTree(tree);
    document.getElementById('output_text').textContent = '';
    document.getElementById('traversal_order').textContent = '';
}

// Event listeners
document.getElementById('search_btn').addEventListener('click', async () => {
    if (isAnimating) return;
    
    const searchValue = parseInt(document.getElementById('searchValue').value);
    if (isNaN(searchValue)) {
        document.getElementById('output_text').textContent = 'Please enter a valid number';
        return;
    }
    
    resetTree(tree);
    traversalPath = [];
    isAnimating = true;
    document.getElementById('output_text').textContent = 'Searching...';
    
    const result = await dfs(tree, searchValue, traversalPath);
    
    isAnimating = false;
    
    if (result) {
        document.getElementById('output_text').innerHTML = 
            `<span style="color: #4CAF50;">✓ Value ${searchValue} found!</span>`;
    } else {
        document.getElementById('output_text').innerHTML = 
            `<span style="color: #f44336;">✗ Value ${searchValue} not found</span>`;
    }
});

document.getElementById('new_tree_btn').addEventListener('click', () => {
    if (!isAnimating) {
        initializeTree();
    }
});

document.getElementById('speed_input').addEventListener('input', (e) => {
    animationSpeed = parseInt(e.target.value);
});

document.getElementById('tree_depth').addEventListener('change', () => {
    if (!isAnimating) {
        initializeTree();
    }
});

// Initialize on load
initializeTree();
