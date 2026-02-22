const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 1200;
canvas.height = 600;

let graph = null;
let animationSpeed = 500;
let isAnimating = false;
let traversalPath = [];
let currentNodeId = null;

class GraphNode {
  constructor(id, value, x, y) {
    this.id = id;
    this.value = value;
    this.x = x;
    this.y = y;
    this.visited = false;
    this.found = false;
  }
}

function generateGraph(nodeCount) {
  const nodes = [];
  const edges = Array.from({ length: nodeCount }, () => new Set());
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(canvas.width, canvas.height) * 0.32;

  for (let i = 0; i < nodeCount; i++) {
    const angle = (2 * Math.PI * i) / nodeCount;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    nodes.push(new GraphNode(i, i + 1, x, y));
  }

  for (let i = 0; i < nodeCount - 1; i++) {
    edges[i].add(i + 1);
    edges[i + 1].add(i);
  }

  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 2; j < nodeCount; j++) {
      if (Math.random() < 0.25) {
        edges[i].add(j);
        edges[j].add(i);
      }
    }
  }

  return { nodes, edges };
}

function drawGraph() {
  if (!graph) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#555';
  ctx.lineWidth = 2;
  for (let i = 0; i < graph.nodes.length; i++) {
    for (const neighbor of graph.edges[i]) {
      if (neighbor > i) {
        ctx.beginPath();
        ctx.moveTo(graph.nodes[i].x, graph.nodes[i].y);
        ctx.lineTo(graph.nodes[neighbor].x, graph.nodes[neighbor].y);
        ctx.stroke();
      }
    }
  }

  for (const node of graph.nodes) {
    ctx.beginPath();
    ctx.arc(node.x, node.y, 22, 0, 2 * Math.PI);

    if (node.found) {
      ctx.fillStyle = '#4CAF50';
    } else if (node.id === currentNodeId) {
      ctx.fillStyle = '#FFEB3B';
    } else if (node.visited) {
      ctx.fillStyle = '#FF9800';
    } else {
      ctx.fillStyle = '#9C27B0';
    }

    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.value, node.x, node.y);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function resetGraph() {
  if (!graph) return;
  for (const node of graph.nodes) {
    node.visited = false;
    node.found = false;
  }
  currentNodeId = null;
}

function initializeGraph() {
  const nodeCount = parseInt(document.getElementById('node_count').value);
  graph = generateGraph(nodeCount);
  traversalPath = [];
  resetGraph();
  drawGraph();
  document.getElementById('output_text').textContent = '';
  document.getElementById('traversal_order').textContent = '';
}

async function bfs(startId, targetValue) {
  if (!graph) return null;

  const queue = [startId];
  const visited = new Set([startId]);

  while (queue.length > 0 && isAnimating) {
    const nodeId = queue.shift();
    const node = graph.nodes[nodeId];

    node.visited = true;
    currentNodeId = nodeId;
    traversalPath.push(node.value);

    drawGraph();
    document.getElementById('traversal_order').innerHTML =
      '<strong>Traversal Order:</strong> ' + traversalPath.join(' -> ');

    await sleep(animationSpeed);

    if (node.value === targetValue) {
      node.found = true;
      drawGraph();
      return node;
    }

    const neighbors = Array.from(graph.edges[nodeId]).sort((a, b) => a - b);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return null;
}

document.getElementById('search_btn').addEventListener('click', async () => {
  if (isAnimating) return;

  const searchValue = parseInt(document.getElementById('searchValue').value);
  if (isNaN(searchValue)) {
    document.getElementById('output_text').textContent = 'Please enter a valid number';
    return;
  }

  resetGraph();
  traversalPath = [];
  isAnimating = true;
  document.getElementById('output_text').textContent = 'Searching...';

  const result = await bfs(0, searchValue);

  isAnimating = false;
  currentNodeId = null;

  if (result) {
    document.getElementById('output_text').innerHTML =
      `<span style="color: #4CAF50;">✓ Value ${searchValue} found!</span>`;
  } else {
    document.getElementById('output_text').innerHTML =
      `<span style="color: #f44336;">✗ Value ${searchValue} not found</span>`;
  }
});

document.getElementById('new_graph_btn').addEventListener('click', () => {
  if (!isAnimating) {
    initializeGraph();
  }
});

document.getElementById('speed_input').addEventListener('input', (e) => {
  animationSpeed = parseInt(e.target.value);
});

document.getElementById('node_count').addEventListener('input', () => {
  if (!isAnimating) {
    initializeGraph();
  }
});

initializeGraph();
