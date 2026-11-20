const STORAGE_KEY = "quicktask.tasks";
const form = document.querySelector("#task-form");
const input = document.querySelector("#task-input");
const list = document.querySelector("#task-list");
const count = document.querySelector("#task-count");
const empty = document.querySelector("#empty-state");
const filters = document.querySelector(".filters");

let tasks = loadTasks();
let currentFilter = "all";

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved.filter(task =>
      task && typeof task.id === "string" &&
      typeof task.text === "string" &&
      typeof task.done === "boolean"
    ) : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function render() {
  list.replaceChildren();
  const visible = tasks.filter(task =>
    currentFilter === "all" ||
    (currentFilter === "active" && !task.done) ||
    (currentFilter === "completed" && task.done)
  );

  visible.forEach(task => {
    const item = document.createElement("li");
    item.className = `task${task.done ? " done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", `Mark ${task.text} as complete`);
    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      saveTasks();
      render();
    });

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const remove = document.createElement("button");
    remove.className = "delete";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Delete ${task.text}`);
    remove.addEventListener("click", () => {
      tasks = tasks.filter(entry => entry.id !== task.id);
      saveTasks();
      render();
    });

    item.append(checkbox, text, remove);
    list.append(item);
  });

  const remaining = tasks.filter(task => !task.done).length;
  count.textContent = `${remaining} task${remaining === 1 ? "" : "s"} left`;
  empty.hidden = visible.length > 0;
  empty.textContent = tasks.length === 0
    ? "Nothing here yet. Add your first task above."
    : "No tasks match this filter.";
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  tasks.unshift({ id: crypto.randomUUID(), text, done: false });
  saveTasks();
  input.value = "";
  currentFilter = "all";
  updateFilters();
  render();
  input.focus();
});

function updateFilters() {
  filters.querySelectorAll("button").forEach(button => {
    const selected = button.dataset.filter === currentFilter;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

filters.addEventListener("click", event => {
  const button = event.target.closest("button[data-filter]");
  if (!button) return;
  currentFilter = button.dataset.filter;
  updateFilters();
  render();
});

updateFilters();
render();
