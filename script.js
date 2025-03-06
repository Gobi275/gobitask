document.addEventListener('DOMContentLoaded', function () {
    const todoForm = document.getElementById('todo-form');
    const addBtn = document.getElementById('add-btn');
    const todoInput = document.getElementById('sample3');
    const todoList = document.getElementById('todo-list');

    todoForm.insertAdjacentHTML('beforeend', `
        <select id="day-select" class="mdl-textfield__input">
            <option value="">Tag auswählen</option>
            <option value="1">Montag</option>
            <option value="2">Dienstag</option>
            <option value="3">Mittwoch</option>
            <option value="4">Donnerstag</option>
            <option value="5">Freitag</option>
            <option value="6">Samstag</option>
            <option value="7">Sonntag</option>
        </select>
    `);

    function createTodoItem(todoText, day) {
        const todoItem = document.createElement('div');
        todoItem.classList.add('todo-item');


        const addSound = new Audio('sounds/add.wav');
        addSound.play();


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
            deleteSound.play();

            todoItem.remove();
            saveTodos();
        });

        statusBtn.addEventListener('click', function () {

            const checkSound = new Audio('sounds/check.wav');
            checkSound.play();

            statusBtn.innerHTML = '<img src="img/checked.png" alt="checked">';

            setTimeout(() => {
                todoItem.remove();
                saveTodos();
            }, 350);
        });

        buttonContainer.appendChild(statusBtn);
        buttonContainer.appendChild(deleteBtn);

        todoItem.appendChild(todoContent);
        todoItem.appendChild(buttonContainer);

        document.querySelector(`.calendar-box:nth-child(${day + 3})`).appendChild(todoItem);
        saveTodos();
    }

    function saveTodos() {
        const todos = [];
        document.querySelectorAll('.calendar-box').forEach((box, index) => {
            const dayTodos = [];
            box.querySelectorAll('.todo-item span').forEach(todo => {
                dayTodos.push(todo.textContent);
            });
            todos.push(dayTodos);
        });
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    function loadTodos() {
        const todos = JSON.parse(localStorage.getItem('todos')) || [];
        todos.forEach((dayTodos, index) => {
            dayTodos.forEach(todo => {
                createTodoItem(todo, index + 1);
            });
        });
    }

    addBtn.addEventListener('click', function () {
        const todoText = todoInput.value.trim();
        const selectedDay = document.getElementById('day-select').value;
        if (todoText !== '' && selectedDay !== '') {
            createTodoItem(todoText, parseInt(selectedDay));
            todoInput.value = '';
        }
    });

    loadTodos();
});