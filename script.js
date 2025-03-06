document.addEventListener('DOMContentLoaded', function () {
    const todoForm = document.getElementById('todo-form');
    const addBtn = document.getElementById('add-btn');
    const todoInput = document.getElementById('sample3');
    const todoList = document.getElementById('todo-list');

    let db;

    // IndexedDB initialisieren
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
            loadTodosIndexedDB(); // Lade alle To-Dos aus der IndexedDB
        };

        request.onerror = function (event) {
            console.error('IndexedDB Fehler:', event.target.errorCode);
        };
    }

    function createTodoItem(todoText, day, priority, id, playSound = false) {
        const todoItem = document.createElement('div');
        todoItem.classList.add('todo-item');

        if (priority === 'high') {
            todoItem.classList.add('priority-high');
        } else if (priority === 'medium') {
            todoItem.classList.add('priority-medium');
        } else if (priority === 'low') {
            todoItem.classList.add('priority-low');
        }

        // Nur Sound abspielen, wenn To-Do manuell hinzugefügt wurde
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
            createTodoItem(todoText, day, priority, id, true); // Sound nur beim manuellen Hinzufügen!
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

    initDB();
});
