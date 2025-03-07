document.addEventListener('DOMContentLoaded', function () {
    const todoForm = document.getElementById('todo-form');
    const addBtn = document.getElementById('add-btn');
    const todoInput = document.getElementById('sample3');
    const todoList = document.getElementById('todo-list');
    const resetBtn = document.querySelector('.reset-button');

    let db;
    const stats = {
        high: 0,
        medium: 0,
        low: 0,
        total: 0
    };

    function loadStats() {
        const savedStats = JSON.parse(localStorage.getItem('taskStats'));
        if (savedStats) {
            Object.assign(stats, savedStats);
            updateStatsUI();
        }
    }

    function saveStats() {
        localStorage.setItem('taskStats', JSON.stringify(stats));
    }

    function resetStats() {
        stats.high = 0;
        stats.medium = 0;
        stats.low = 0;
        stats.total = 0;
        saveStats();
        updateStatsUI();
        showPopup("Statistiken erfolgreich zurückgesetzt!");
    }

    function showPopup(message) {
        const popup = document.createElement('div');
        popup.textContent = message;
        popup.style.position = 'fixed';
        popup.style.top = '20px';
        popup.style.left = '50%';
        popup.style.transform = 'translateX(-50%)';
        popup.style.backgroundColor = '#a9a30e';
        popup.style.color = 'white';
        popup.style.padding = '10px 20px';
        popup.style.borderRadius = '100px';
        popup.style.boxShadow = '0 5px 8px -5px #000000';
        popup.style.zIndex = '1000';
        document.body.appendChild(popup);

        setTimeout(() => {
            popup.remove();
        }, 3000);
    }

    function updateStatsUI() {
        document.querySelector(".stats p:nth-child(2)").textContent = `🔴 Hohe Priorität: ${stats.high}`;
        document.querySelector(".stats p:nth-child(3)").textContent = `🟠 Mittlere Priorität: ${stats.medium}`;
        document.querySelector(".stats p:nth-child(4)").textContent = `🟢 Niedrige Priorität: ${stats.low}`;
        document.querySelector(".stats p.bold").textContent = `🔴🟠🟢 Gesamt: ${stats.total}`;
    }

    function markTaskAsDone(todoItem, priority) {
        if (priority === 'high') stats.high++;
        if (priority === 'medium') stats.medium++;
        if (priority === 'low') stats.low++;
        stats.total++;

        saveStats();
        updateStatsUI();
    }

    function initDB() {
        const request = indexedDB.open('todoDB', 1);

        request.onupgradeneeded = function (event) {
            db = event.target.result;
            if (!db.objectStoreNames.contains('todos')) {
                db.createObjectStore('todos', { keyPath: 'id', autoIncrement: true });
            }
        };

        request.onsuccess = function (event) {
            db = event.target.result;
            loadTodosIndexedDB();
        };

        request.onerror = function (event) {
            console.error('IndexedDB Fehler:', event.target.errorCode);
        };
    }

    function createTodoItem(todoText, day, priority, id, playSound = false) {
        const todoItem = document.createElement('div');
        todoItem.classList.add('todo-item');

        if (priority === 'high') todoItem.classList.add('priority-high');
        if (priority === 'medium') todoItem.classList.add('priority-medium');
        if (priority === 'low') todoItem.classList.add('priority-low');

        if (playSound) {
            const addSound = new Audio('sounds/add.wav');
            addSound.play().catch(err => console.warn("Sound konnte nicht abgespielt werden:", err));
        }

        const todoContent = document.createElement('span');
        todoContent.textContent = todoText;

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('todo-buttons');

        const statusBtn = document.createElement('button');
        statusBtn.classList.add('status-btn');
        statusBtn.innerHTML = '<img src="img/unchecked.png" alt="unchecked">';

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.innerHTML = '<img src="img/delete.png" alt="delete">';

        deleteBtn.addEventListener('click', () => {
            const deleteSound = new Audio('sounds/delete.wav');
            deleteSound.play().catch(err => console.warn("Sound konnte nicht abgespielt werden:", err));
            todoItem.remove();
            if (id) deleteTodoIndexedDB(id);
        });

        statusBtn.addEventListener('click', function () {
            const checkSound = new Audio('sounds/check.wav');
            checkSound.play().catch(err => console.warn("Sound konnte nicht abgespielt werden:", err));
            statusBtn.innerHTML = '<img src="img/checked.png" alt="checked">';

            let priority = '';
            if (todoItem.classList.contains('priority-high')) priority = 'high';
            if (todoItem.classList.contains('priority-medium')) priority = 'medium';
            if (todoItem.classList.contains('priority-low')) priority = 'low';

            markTaskAsDone(todoItem, priority);

            setTimeout(() => {
                todoItem.remove();
                if (id) deleteTodoIndexedDB(id);
            }, 350);
        });

        buttonContainer.appendChild(statusBtn);
        buttonContainer.appendChild(deleteBtn);

        todoItem.appendChild(todoContent);
        todoItem.appendChild(buttonContainer);

        document.querySelector(`.calendar-box:nth-child(${day + 4})`).appendChild(todoItem);
    }

    function saveTodosIndexedDB(todoText, day, priority) {
        if (!db) {
            console.error("Fehler: IndexedDB ist nicht verfügbar!");
            return;
        }

        const transaction = db.transaction(['todos'], 'readwrite');
        const store = transaction.objectStore('todos');

        const todo = { text: todoText, day, priority };
        const request = store.add(todo);

        request.onsuccess = function (event) {
            const id = event.target.result;
            createTodoItem(todoText, day, priority, id, true);
        };

        request.onerror = function () {
            console.error("Fehler beim Speichern des To-Dos");
        };
    }

    function loadTodosIndexedDB() {
        const transaction = db.transaction(['todos'], 'readonly');
        const store = transaction.objectStore('todos');

        const request = store.getAll();
        request.onsuccess = function () {
            request.result.forEach(todo => {
                createTodoItem(todo.text, todo.day, todo.priority, todo.id);
            });
        };
    }

    function deleteTodoIndexedDB(id) {
        const transaction = db.transaction(['todos'], 'readwrite');
        const store = transaction.objectStore('todos');
        store.delete(id);
    }

    addBtn.addEventListener('click', function () {
        const todoText = todoInput.value.trim();
        const selectedDay = document.getElementById('day-select').value;
        const selectedPriority = document.getElementById('priority-select').value;

        if (todoText !== '' && selectedDay !== '' && selectedPriority !== '') {
            saveTodosIndexedDB(todoText, parseInt(selectedDay), selectedPriority);
            todoInput.value = '';
            document.getElementById('priority-select').value = '';
        }
    });

    resetBtn.addEventListener('click', resetStats);

    initDB();
    loadStats();
});
