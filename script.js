let tasks = JSON.parse(localStorage.getItem("kanban_tasks")) || [
  { id: 1, title: "Revisar Fórmulas de Física (MECÂNICA)", priority: "high", status: "todo" },
  { id: 2, title: "Redação Modelo Enem (Tema Semana 3)", priority: "medium", status: "in-progress" },
  { id: 3, title: "Resolver lista de História do Brasil", priority: "low", status: "done" }
];

const columnOrder = ["todo", "in-progress", "done"];

document.addEventListener("DOMContentLoaded", renderTasks);

function saveTasks() {
  localStorage.setItem("kanban_tasks", JSON.stringify(tasks));
}

function addTask(event) {
  event.preventDefault();
  
  const input = document.getElementById("task-input");
  const priorityInput = document.getElementById("priority-input");
  
  const text = input.value.trim();
  if (!text) return;

  const newTask = {
    id: Date.now(),
    title: text,
    priority: priorityInput.value,
    status: "todo"
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();
  
  input.value = "";
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

function moveTask(id, direction) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const currentIndex = columnOrder.indexOf(task.status);
  const newIndex = currentIndex + direction;

  if (newIndex >= 0 && newIndex < columnOrder.length) {
    task.status = columnOrder[newIndex];
    saveTasks();
    renderTasks();
  }
}

function drag(event, id) {
  event.dataTransfer.setData("text/plain", id);
}

function allowDrop(event) {
  event.preventDefault();
}

function drop(event) {
  event.preventDefault();
  const id = Number(event.dataTransfer.getData("text/plain"));
  
  let targetElement = event.target;
  while (targetElement && !targetElement.classList.contains("kanban-column")) {
    targetElement = targetElement.parentElement;
  }

  if (targetElement) {
    const newStatus = targetElement.id;
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.status = newStatus;
      saveTasks();
      renderTasks();
    }
  }
}

function renderTasks() {
  columnOrder.forEach(col => {
    document.getElementById(`list-${col}`).innerHTML = "";
  });

  const counts = { todo: 0, "in-progress": 0, done: 0 };

  tasks.forEach(task => {
    counts[task.status]++;
    
    const card = document.createElement("div");
    card.className = "task-card";
    card.draggable = true;
    card.ondragstart = (e) => drag(e, task.id);

    const priorityLabels = { low: "Baixa", medium: "Média", high: "High/Enem" };

    const currentIndex = columnOrder.indexOf(task.status);
    const canMoveLeft = currentIndex > 0;
    const canMoveRight = currentIndex < columnOrder.length - 1;

    card.innerHTML = `
      <div class="task-header">
        <span class="badge ${task.priority}">${priorityLabels[task.priority]}</span>
        <button class="btn-delete" onclick="deleteTask(${task.id})" title="Apagar">✕</button>
      </div>
      <div class="task-text">${escapeHtml(task.title)}</div>
      <div class="task-actions">
        ${canMoveLeft ? `<button onclick="moveTask(${task.id}, -1)">← Move</button>` : ""}
        ${canMoveRight ? `<button onclick="moveTask(${task.id}, 1)">Move →</button>` : ""}
      </div>
    `;

    document.getElementById(`list-${task.status}`).appendChild(card);
  });

  columnOrder.forEach(col => {
    document.getElementById(`count-${col}`).textContent = counts[col];
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}