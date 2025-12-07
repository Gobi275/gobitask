// DOM Elements
const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task");
const todosList = document.getElementById("todos-list");
const itemsLeft = document.getElementById("items-left");
const clearCompletedBtn = document.getElementById("clear-completed");
const emptyState = document.querySelector(".empty-state");
const dateElement = document.getElementById("date");
const filters = document.querySelectorAll(".filter");

let todos = [];
let currentFilter = "all";

addTaskBtn.addEventListener("click", () => {
    addTodo(taskInput.value);  // To-do hinzufügen
    resetPriorityDropdown()
});

taskInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTodo(taskInput.value);
});

clearCompletedBtn.addEventListener("click", clearCompleted);

function resetPriorityDropdown() {
    label.textContent = "Priorität";    // UI zurücksetzen
    hiddenInput.value = "";             // Wert zurücksetzen

    menu.querySelectorAll("li").forEach(li =>
        li.classList.remove("selected")
    );                                  // Auswahl entfernen
}

function addTodo(text) {
    if (text.trim() === "") return;

    const todo = {
        id: Date.now(),
        text,
        completed: false,
        priority: hiddenInput.value || "",
        justAdded: true
    };

    todos.push(todo);

    saveTodos();
    renderTodos();
    taskInput.value = "";
}


function saveTodos() {
    localStorage.setItem("todos", JSON.stringify(todos));
    updateItemsCount();
    checkEmptyState();
}

function updateItemsCount() {
    const uncompletedTodos = todos.filter((todo) => !todo.completed);
    itemsLeft.textContent = `${uncompletedTodos?.length} item${
        uncompletedTodos?.length !== 1 ? "s" : ""
    } left`;
}

function checkEmptyState() {
    const filteredTodos = filterTodos(currentFilter);
    if (filteredTodos?.length === 0) emptyState.classList.remove("hidden");
    else emptyState.classList.add("hidden");
}

function filterTodos(filter) {
    switch (filter) {
        case "active":
            return todos.filter((todo) => !todo.completed);
        case "completed":
            return todos.filter((todo) => todo.completed);
        default:
            return todos;
    }
}

function renderTodos() {
    todosList.innerHTML = "";

    const filteredTodos = filterTodos(currentFilter);

    filteredTodos.forEach((todo) => {
        const todoItem = document.createElement("li");
        todoItem.classList.add("todo-item");
        if (todo.justAdded) {
            todoItem.classList.add("enter");

            // Beim nächsten Speichern wird es dauerhaft gelöscht
            todo.justAdded = false;
        }
        if (todo.priority) {
            todoItem.classList.add(`priority-${todo.priority}`);
        }
        if (todo.completed) todoItem.classList.add("completed");


        // UIVERSE Checkbox Wrapper
        const checkboxWrapper = document.createElement("div");
        checkboxWrapper.classList.add("checkbox-wrapper");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = "todo-" + todo.id;
        checkbox.checked = todo.completed;
        checkbox.addEventListener("change", () => toggleTodo(todo.id));

        const label = document.createElement("label");
        label.setAttribute("for", "todo-" + todo.id);

        const tick = document.createElement("div");
        tick.classList.add("tick_mark");

        label.appendChild(tick);

        checkboxWrapper.appendChild(checkbox);
        checkboxWrapper.appendChild(label);

        todoItem.appendChild(checkboxWrapper);


        const todoText = document.createElement("span");
        todoText.classList.add("todo-item-text");
        todoText.textContent = todo.text;

        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("delete-btn");
        deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
        deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

        todoItem.appendChild(todoText);
        todoItem.appendChild(deleteBtn);

        todosList.appendChild(todoItem);
    });
}

function clearCompleted() {
    todos = todos.filter((todo) => !todo.completed);
    saveTodos();
    renderTodos();
}

function toggleTodo(id) {
    todos = todos.map((todo) => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }

        return todo;
    });
    saveTodos();
    renderTodos();
}

function deleteTodo(id) {
    todos = todos.filter((todo) => todo.id !== id);
    saveTodos();
    renderTodos();
}

function loadTodos() {
    const storedTodos = localStorage.getItem("todos");
    if (storedTodos) todos = JSON.parse(storedTodos);
    renderTodos();
}

filters.forEach((filter) => {
    filter.addEventListener("click", () => {
        setActiveFilter(filter.getAttribute("data-filter"));
    });
});

function setActiveFilter(filter) {
    currentFilter = filter;

    filters.forEach((item) => {
        if (item.getAttribute("data-filter") === filter) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
        checkEmptyState();
    });

    renderTodos();
}

function setDate() {
    const options = { weekday: "long", month: "short", day: "numeric" };
    const today = new Date();
    dateElement.textContent = today.toLocaleDateString("en-US", options);
}

window.addEventListener("DOMContentLoaded", () => {
    loadTodos();
    updateItemsCount();
    setDate();
    checkEmptyState();
});




const dropdown = document.getElementById('priority-dropdown');
const trigger = dropdown.querySelector('.dropdown-trigger');
const menu = dropdown.querySelector('.dropdown-menu');
const label = dropdown.querySelector('.dropdown-label');
const hiddenInput = document.getElementById('priority-value');

// Dropdown öffnen/schließen
trigger.addEventListener('click', () => {
    const isOpen = menu.style.display === 'block';
    menu.style.display = isOpen ? 'none' : 'block';
});

// Auswahl treffen
menu.querySelectorAll('li').forEach(item => {
    item.addEventListener('click', () => {
        // Text übernehmen
        label.textContent = item.textContent;

        // Hidden Input aktualisieren
        hiddenInput.value = item.dataset.value;

        // Selected Style setzen
        menu.querySelectorAll('li').forEach(li => li.classList.remove('selected'));
        item.classList.add('selected');

        // Menü schließen
        menu.style.display = 'none';
    });
});

// Klick außerhalb schließt Dropdown
document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
        menu.style.display = 'none';
    }
});
