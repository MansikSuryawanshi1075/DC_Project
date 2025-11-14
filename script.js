// script.js

// Simulation
let topology = 'bus';
let numNodes = 5;
let nodes = [];
let connections = [];
let packets = [];
let canvas;

function setup() {
    canvas = createCanvas(800, 600);
    canvas.parent('canvas-container');
    updateTopology();
    // Animate nodes appearing one by one
let delay = 0;
nodes.forEach(node => {
    gsap.fromTo(node, 
        { alpha: 0 }, 
        { alpha: 1, duration: 0.3, delay: delay }
    );
    delay += 0.15;
});

}

function draw() {
    background(255);
    drawConnections();
    drawNodes();
    updatePackets();
    drawPackets();
}

function updateTopology() {
    nodes = [];
    connections = [];
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = min(width, height) / 3;

    for (let i = 0; i < numNodes; i++) {
        let x, y;
        switch (topology) {
            case 'bus':
                x = (width / (numNodes + 1)) * (i + 1);
                y = height / 2;
                break;
            case 'star':
                if (i === 0) {
                    x = centerX;
                    y = centerY;
                } else {
                    const angle = TWO_PI / (numNodes - 1) * (i - 1);
                    x = centerX + cos(angle) * radius;
                    y = centerY + sin(angle) * radius;
                }
                break;
            case 'ring':
                const angle = TWO_PI / numNodes * i;
                x = centerX + cos(angle) * radius;
                y = centerY + sin(angle) * radius;
                break;
            case 'mesh':
                const meshAngle = TWO_PI / numNodes * i;
                x = centerX + cos(meshAngle) * radius;
                y = centerY + sin(meshAngle) * radius;
                break;
            case 'hybrid':
                if (i < numNodes / 2) {
                    x = centerX / 2 + (centerX / (numNodes / 2 + 1)) * (i + 1);
                    y = centerY / 2;
                } else {
                    const hybridAngle = TWO_PI / (numNodes / 2) * (i - numNodes / 2);
                    x = centerX + cos(hybridAngle) * (radius / 2);
                    y = centerY + sin(hybridAngle) * (radius / 2) + centerY / 2;
                }
                break;
        }
        nodes.push({ x, y, label: `Node ${i + 1}`, active: false });
    }

    switch (topology) {
        case 'bus':
            for (let i = 0; i < numNodes - 1; i++) {
                connections.push({ from: i, to: i + 1 });
            }
            break;
        case 'star':
            for (let i = 1; i < numNodes; i++) {
                connections.push({ from: 0, to: i });
            }
            break;
        case 'ring':
            for (let i = 0; i < numNodes; i++) {
                connections.push({ from: i, to: (i + 1) % numNodes });
            }
            break;
        case 'mesh':
            for (let i = 0; i < numNodes; i++) {
                for (let j = i + 1; j < numNodes; j++) {
                    connections.push({ from: i, to: j });
                }
            }
            break;
        case 'hybrid':
            const half = Math.floor(numNodes / 2);
            for (let i = 0; i < half - 1; i++) {
                connections.push({ from: i, to: i + 1 });
            }
            for (let i = half; i < numNodes; i++) {
                connections.push({ from: i, to: (i + 1 === numNodes ? half : i + 1) });
            }
            connections.push({ from: half - 1, to: half });
            break;
    }
}

function drawNodes() {
    nodes.forEach(node => {
        push();
        if (node.alpha !== undefined) tint(255, node.alpha * 255);
        fill(node.active ? '#00ff88' : 200);
        stroke(0);
        ellipse(node.x, node.y, 40, 40);
        textAlign(CENTER);
        text(node.label, node.x, node.y + 50);
        if (node.active) {
            noFill();
            stroke(0, 255, 0);
            ellipse(node.x, node.y, 50, 50);
        }
        pop();
    });
}


function drawConnections() {
    stroke(0);
    connections.forEach(conn => {
        const from = nodes[conn.from];
        const to = nodes[conn.to];
        line(from.x, from.y, to.x, to.y);
    });
}

function sendData() {
    const source = Math.floor(Math.random() * numNodes);
    let dest = Math.floor(Math.random() * numNodes);
    while (dest === source) dest = Math.floor(Math.random() * numNodes);
    
    packets.push({
        x: nodes[source].x,
        y: nodes[source].y,
        targetX: nodes[dest].x,
        targetY: nodes[dest].y,
        speed: 2,
        sourceLabel: nodes[source].label,
        destLabel: nodes[dest].label,
        progress: 0
    });
    nodes[source].active = true;
    nodes[dest].active = true;
    setTimeout(() => {
        nodes[source].active = false;
        nodes[dest].active = false;
    }, 2000);
}

function updatePackets() {
    packets = packets.filter(packet => {
        const dx = packet.targetX - packet.x;
        const dy = packet.targetY - packet.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < packet.speed) return false;
        packet.x += (dx / dist) * packet.speed;
        packet.y += (dy / dist) * packet.speed;
        return true;
    });
}

function drawPackets() {
    fill(255, 0, 0);
    noStroke();
    packets.forEach(packet => {
        ellipse(packet.x, packet.y, 10, 10);
    });
}

document.getElementById('update').addEventListener('click', () => {
    topology = document.getElementById('topology').value;
    numNodes = parseInt(document.getElementById('nodes').value);
    updateTopology();
});

document.getElementById('send').addEventListener('click', sendData);

// Learn icons
function createIconSketch(id, drawFunc) {
    new p5((p) => {
        p.setup = () => {
            p.createCanvas(150, 150).parent(id);
        };
        p.draw = () => {
            p.background(255);
            drawFunc(p);
        };
    });
}

createIconSketch('bus-icon', (p) => {
    p.line(20, 75, 130, 75);
    for (let i = 0; i < 4; i++) {
        p.ellipse(20 + i * 35, 75, 20);
    }
});

createIconSketch('star-icon', (p) => {
    p.ellipse(75, 75, 20);
    for (let i = 0; i < 4; i++) {
        const angle = p.TWO_PI / 4 * i;
        const x = 75 + p.cos(angle) * 50;
        const y = 75 + p.sin(angle) * 50;
        p.ellipse(x, y, 20);
        p.line(75, 75, x, y);
    }
});

createIconSketch('ring-icon', (p) => {
    for (let i = 0; i < 5; i++) {
        const angle = p.TWO_PI / 5 * i;
        const x = 75 + p.cos(angle) * 50;
        const y = 75 + p.sin(angle) * 50;
        p.ellipse(x, y, 20);
        const nextX = 75 + p.cos(p.TWO_PI / 5 * (i + 1)) * 50;
        const nextY = 75 + p.sin(p.TWO_PI / 5 * (i + 1)) * 50;
        p.line(x, y, nextX, nextY);
    }
});

createIconSketch('mesh-icon', (p) => {
    let nodes = [];
    for (let i = 0; i < 4; i++) {
        const angle = p.TWO_PI / 4 * i;
        const x = 75 + p.cos(angle) * 50;
        const y = 75 + p.sin(angle) * 50;
        nodes.push({x, y});
        p.ellipse(x, y, 20);
    }
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            p.line(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
        }
    }
});

createIconSketch('hybrid-icon', (p) => {
    p.line(20, 50, 130, 50);
    for (let i = 0; i < 3; i++) {
        p.ellipse(20 + i * 55, 50, 20);
    }
    for (let i = 0; i < 3; i++) {
        const angle = p.TWO_PI / 3 * i + p.PI;
        const x = 75 + p.cos(angle) * 30;
        const y = 100 + p.sin(angle) * 30;
        p.ellipse(x, y, 20);
        const nextX = 75 + p.cos(p.TWO_PI / 3 * (i + 1) + p.PI) * 30;
        const nextY = 100 + p.sin(p.TWO_PI / 3 * (i + 1) + p.PI) * 30;
        p.line(x, y, nextX, nextY);
    }
    p.line(75, 50, 75, 100);
});

// Comparison animation
document.querySelectorAll('.bar').forEach(bar => {
    const fill = bar.querySelector('.bar-fill');
    const value = bar.dataset.value;
    gsap.to(fill, { width: `${value * 10}%`, duration: 1, ease: 'power2.out', delay: 0.5 });
});

function setup() {
    canvas = createCanvas(windowWidth * 0.8, windowHeight * 0.6);
    canvas.parent('canvas-container');
    updateTopology();
}

function windowResized() {
    resizeCanvas(windowWidth * 0.8, windowHeight * 0.6);
    updateTopology();
}

function mousePressed() {
    nodes.forEach(node => {
        if (dist(mouseX, mouseY, node.x, node.y) < 20) {
            alert(`${node.label} selected`);
        }
    });
}

document.getElementById('update').addEventListener('click', () => {
    topology = document.getElementById('topology').value;
    numNodes = parseInt(document.getElementById('nodes').value);
    updateTopology();
    
    const descriptions = {
        bus: 'Bus Topology: All nodes share a single communication line.',
        star: 'Star Topology: All nodes connect through a central hub.',
        ring: 'Ring Topology: Nodes form a closed loop.',
        mesh: 'Mesh Topology: Every node connects to all others.',
        hybrid: 'Hybrid Topology: Mix of multiple topologies.'
    };
    alert(descriptions[topology]);
});


function drawPackets() {
    packets.forEach(packet => {
        fill(255, 100, 0);
        ellipse(packet.x, packet.y, 12, 12);
        gsap.to(packet, { scale: 1.2, yoyo: true, repeat: 1, duration: 0.1 });
    });
}

document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark');
});

document.getElementById('update').addEventListener('click', () => {
    gsap.to('#canvas-container', { opacity: 0, duration: 0.3, onComplete: () => {
        topology = document.getElementById('topology').value;
        numNodes = parseInt(document.getElementById('nodes').value);
        updateTopology();
        gsap.to('#canvas-container', { opacity: 1, duration: 0.3 });
    }});
});

document.getElementById('topology').addEventListener('change', (e) => {
    const info = {
        bus: "Bus topology uses a single central cable for data transmission.",
        star: "Star topology connects all devices to a central hub.",
        ring: "Ring topology passes data in a circular loop.",
        mesh: "Mesh topology connects every node to every other node.",
        hybrid: "Hybrid combines multiple topologies for flexibility."
    };
    alert(info[e.target.value]);
});

// 🌙 Dark Mode Toggle
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    themeToggle.textContent = 
        document.body.classList.contains('dark-mode') ? '☀️ Light Mode' : '🌙 Dark Mode';
});



document.getElementById('topology').addEventListener('change', (e) => {
    const info = {
        bus: "Bus topology uses a single central cable for data transmission.",
        star: "Star topology connects all devices to a central hub.",
        ring: "Ring topology passes data in a circular loop.",
        mesh: "Mesh topology connects every node to every other node.",
        hybrid: "Hybrid combines multiple topologies for flexibility."
    };
    alert(info[e.target.value]);
});

// 🪄 Page entry animation
gsap.from("header", { y: -100, opacity: 0, duration: 1, ease: "power2.out" });
gsap.from(".section", { opacity: 0, y: 50, duration: 0.6, stagger: 0.3 });








